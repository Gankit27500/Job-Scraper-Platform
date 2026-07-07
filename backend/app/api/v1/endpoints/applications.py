import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User, UserRole
from app.models.job import Job
from app.models.profile import Profile
from app.models.application import Application, ApplicationStatus
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationUpdateStatus
from app.services.ai_service import calculate_match_score
from app.services.email import send_email_notification

router = APIRouter()

@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def submit_application(
    application_in: ApplicationCreate,
    current_user: User = Depends(deps.get_current_student),
    db: Session = Depends(deps.get_db)
):
    # Check if job exists
    job = db.query(Job).filter(Job.id == application_in.job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job opening not found."
        )
        
    # Check if already applied
    existing_app = db.query(Application).filter(
        Application.job_id == application_in.job_id,
        Application.student_id == current_user.id
    ).first()
    
    if existing_app:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted an application for this job opening."
        )

    # Fetch student profile to compute AI match score
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    student_skills = profile.skills if profile else ""
    
    # Calculate similarity score
    ai_score = calculate_match_score(student_skills, job.requirements)

    app_id = str(uuid.uuid4())
    db_application = Application(
        id=app_id,
        job_id=application_in.job_id,
        student_id=current_user.id,
        resume_url=application_in.resume_url,
        cover_letter=application_in.cover_letter,
        ai_match_score=ai_score,
        status=ApplicationStatus.PENDING
    )
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    
    # Pre-load job relationship for serializer
    db_application.job = job
    return db_application

@router.get("/my-history", response_model=List[ApplicationResponse])
def get_my_applications(
    current_user: User = Depends(deps.get_current_student),
    db: Session = Depends(deps.get_db)
):
    return db.query(Application).filter(Application.student_id == current_user.id).all()

@router.get("/job/{job_id}", response_model=List[ApplicationResponse])
def get_job_applicants(
    job_id: str,
    current_user: User = Depends(deps.get_current_manager),
    db: Session = Depends(deps.get_db)
):
    # Verify manager owns this job
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job post not found."
        )
    if job.posted_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view candidates for this job opening."
        )
        
    return db.query(Application).filter(Application.job_id == job_id).all()

@router.patch("/{id}/status", response_model=ApplicationResponse)
def update_application_status(
    id: str,
    status_in: ApplicationUpdateStatus,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(deps.get_current_manager),
    db: Session = Depends(deps.get_db)
):
    application = db.query(Application).filter(Application.id == id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application record not found."
        )
        
    # Verify manager owns the associated job
    job = db.query(Job).filter(Job.id == application.job_id).first()
    if not job or job.posted_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to manage this candidate profile."
        )
        
    old_status = application.status
    application.status = status_in.status
    db.commit()
    db.refresh(application)
    
    # Trigger email notification if status changed
    if old_status != application.status:
        # Fetch candidate details
        candidate = db.query(User).filter(User.id == application.student_id).first()
        if candidate:
            subject = f"Update on your application: {job.title} at {job.company}"
            body = f"""
            <h3>Hello,</h3>
            <p>Your application status for the position of <strong>{job.title}</strong> at <strong>{job.company}</strong> has been updated.</p>
            <p>New Status: <strong>{application.status.value}</strong></p>
            <p>Log in to your account dashboard to check details.</p>
            <br/>
            <p>Best regards,<br/>{job.company} Recruitment Team</p>
            """
            background_tasks.add_task(send_email_notification, candidate.email, subject, body)
            
    # Include pre-loaded job relation
    application.job = job
    return application
