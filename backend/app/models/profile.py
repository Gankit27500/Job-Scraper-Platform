from sqlalchemy import Column, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    full_name = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    resume_url = Column(String, nullable=True)
    skills = Column(String, nullable=True)  # Store as comma-separated values or JSON string
    experience = Column(String, nullable=True)  # Detailed resume experience text
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship back to User
    user = relationship("User", back_populates="profile")
