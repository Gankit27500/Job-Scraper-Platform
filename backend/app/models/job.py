import enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Boolean, Text, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class JobType(str, enum.Enum):
    FULL_TIME = "FULL_TIME"
    PART_TIME = "PART_TIME"
    CONTRACT = "CONTRACT"
    INTERNSHIP = "INTERNSHIP"

class JobStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    ARCHIVED = "ARCHIVED"

class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, index=True)
    posted_by = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False, index=True)
    company = Column(String, nullable=False, index=True)
    location = Column(String, nullable=False, index=True)
    salary_range = Column(String, nullable=True)
    job_type = Column(Enum(JobType), nullable=False, default=JobType.FULL_TIME)
    experience_level = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=True)  # Store as a JSON string or comma-separated values
    is_scraped = Column(Boolean, default=False, nullable=False)
    source_url = Column(String, nullable=True)
    status = Column(Enum(JobStatus), nullable=False, default=JobStatus.ACTIVE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    posted_by_user = relationship("User", back_populates="jobs")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")
