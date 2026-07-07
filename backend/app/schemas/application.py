from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.application import ApplicationStatus
from app.schemas.job import JobResponse

class ApplicationBase(BaseModel):
    cover_letter: Optional[str] = None
    resume_url: str

class ApplicationCreate(BaseModel):
    job_id: str
    cover_letter: Optional[str] = None
    resume_url: str

class ApplicationUpdateStatus(BaseModel):
    status: ApplicationStatus

class ApplicationResponse(ApplicationBase):
    id: str
    job_id: str
    student_id: str
    ai_match_score: Optional[float] = None
    status: ApplicationStatus
    applied_at: datetime
    job: Optional[JobResponse] = None

    class Config:
        from_attributes = True
