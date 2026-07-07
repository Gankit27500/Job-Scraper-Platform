from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.job import Job, JobStatus
from app.models.profile import Profile
from app.schemas.job import JobResponse
from app.services.ai_service import calculate_match_score
from pydantic import BaseModel

router = APIRouter()

class JobRecommendation(BaseModel):
    job: JobResponse
    match_score: float

@router.get("/recommendations", response_model=List[JobRecommendation])
def get_job_recommendations(
    current_user: User = Depends(deps.get_current_student),
    db: Session = Depends(deps.get_db)
):
    # Fetch student profile
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile or not profile.skills:
        # Return empty list or basic recent jobs if no skills configured
        recent_jobs = db.query(Job).filter(Job.status == JobStatus.ACTIVE).order_by(Job.created_at.desc()).limit(5).all()
        return [{"job": JobResponse.model_validate(job), "match_score": 0.0} for job in recent_jobs]

    student_skills = profile.skills
    active_jobs = db.query(Job).filter(Job.status == JobStatus.ACTIVE).all()
    
    recommendations = []
    for job in active_jobs:
        score = calculate_match_score(student_skills, job.requirements)
        recommendations.append({
            "job": JobResponse.model_validate(job),
            "match_score": score
        })
        
    # Sort by match score descending, then by creation date
    recommendations.sort(key=lambda x: (x["match_score"], x["job"].created_at), reverse=True)
    
    # Return top 10 matches
    return recommendations[:10]
