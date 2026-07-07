import enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Float, Text, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class ApplicationStatus(str, enum.Enum):
    PENDING = "PENDING"
    REVIEWING = "REVIEWING"
    SHORTLISTED = "SHORTLISTED"
    REJECTED = "REJECTED"

class Application(Base):
    __tablename__ = "applications"

    id = Column(String, primary_key=True, index=True)
    job_id = Column(String, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resume_url = Column(String, nullable=False)
    cover_letter = Column(Text, nullable=True)
    ai_match_score = Column(Float, nullable=True)
    status = Column(Enum(ApplicationStatus), nullable=False, default=ApplicationStatus.PENDING)
    applied_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    job = relationship("Job", back_populates="applications")
    student = relationship("User", back_populates="applications")
