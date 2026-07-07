from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.job import JobType, JobStatus

class JobBase(BaseModel):
    title: str
    company: str
    location: str
    salary_range: Optional[str] = None
    job_type: JobType = JobType.FULL_TIME
    experience_level: Optional[str] = None
    description: str
    requirements: Optional[str] = None
    is_scraped: bool = False
    source_url: Optional[str] = None
    status: JobStatus = JobStatus.ACTIVE

class JobCreate(BaseModel):
    title: str
    company: str
    location: str
    salary_range: Optional[str] = None
    job_type: JobType = JobType.FULL_TIME
    experience_level: Optional[str] = None
    description: str
    requirements: Optional[str] = None
    source_url: Optional[str] = None

class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    job_type: Optional[JobType] = None
    experience_level: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    source_url: Optional[str] = None
    status: Optional[JobStatus] = None

class JobResponse(JobBase):
    id: str
    posted_by: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
