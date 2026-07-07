import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.job import Job, JobType, JobStatus
from app.schemas.job import JobCreate, JobResponse, JobUpdate
from app.services.scraper import scrape_remote_jobs

router = APIRouter()

@router.get("/", response_model=List[JobResponse])
def read_jobs(
    db: Session = Depends(deps.get_db),
    search: Optional[str] = Query(None, description="Search by title, company, or description"),
    location: Optional[str] = Query(None, description="Filter by location"),
    job_type: Optional[JobType] = Query(None, description="Filter by job type"),
    is_scraped: Optional[bool] = Query(None, description="Filter by scraped vs posted jobs"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    query = db.query(Job).filter(Job.status == JobStatus.ACTIVE)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Job.title.ilike(search_pattern),
                Job.company.ilike(search_pattern),
                Job.description.ilike(search_pattern)
            )
        )
        
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
        
    if job_type:
        query = query.filter(Job.job_type == job_type)
        
    if is_scraped is not None:
        query = query.filter(Job.is_scraped == is_scraped)
        
    # Order by creation date descending
    query = query.order_by(Job.created_at.desc())
    
    return query.offset(offset).limit(limit).all()

@router.get("/{id}", response_model=JobResponse)
def read_job(
    id: str,
    db: Session = Depends(deps.get_db)
):
    job = db.query(Job).filter(Job.id == id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    return job

@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job_in: JobCreate,
    current_user: User = Depends(deps.get_current_manager),
    db: Session = Depends(deps.get_db)
):
    job_id = str(uuid.uuid4())
    db_job = Job(
        id=job_id,
        posted_by=current_user.id,
        title=job_in.title,
        company=job_in.company,
        location=job_in.location,
        salary_range=job_in.salary_range,
        job_type=job_in.job_type,
        experience_level=job_in.experience_level,
        description=job_in.description,
        requirements=job_in.requirements,
        is_scraped=False,
        source_url=job_in.source_url,
        status=JobStatus.ACTIVE
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@router.put("/{id}", response_model=JobResponse)
def update_job(
    id: str,
    job_in: JobUpdate,
    current_user: User = Depends(deps.get_current_manager),
    db: Session = Depends(deps.get_db)
):
    job = db.query(Job).filter(Job.id == id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
        
    # Check authorization - only posting manager can edit
    if job.posted_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this job listing"
        )
        
    update_data = job_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)
        
    db.commit()
    db.refresh(job)
    return job

@router.delete("/{id}", response_model=JobResponse)
def delete_job(
    id: str,
    current_user: User = Depends(deps.get_current_manager),
    db: Session = Depends(deps.get_db)
):
    job = db.query(Job).filter(Job.id == id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
        
    if job.posted_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this job listing"
        )
        
    # Archive the job rather than deleting entirely
    job.status = JobStatus.ARCHIVED
    db.commit()
    db.refresh(job)
    return job

@router.post("/trigger-scrape", status_code=status.HTTP_202_ACCEPTED)
def trigger_scraper(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """
    Triggers job scraper run in the background. Available to hiring managers.
    """
    background_tasks.add_task(scrape_remote_jobs, db)
    return {"message": "Job scraper triggered successfully in the background."}
