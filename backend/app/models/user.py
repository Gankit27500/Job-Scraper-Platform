import enum
from sqlalchemy import Column, String, DateTime, Enum, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserRole(str, enum.Enum):
    STUDENT = "STUDENT"
    HIRING_MANAGER = "HIRING_MANAGER"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True) # UUID representation
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.STUDENT)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # One-to-one relationship with Profile
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    
    # One-to-many relationship with Jobs (jobs posted by this user)
    jobs = relationship("Job", back_populates="posted_by_user", cascade="all, delete-orphan")
    
    # One-to-many relationship with Applications (submitted by this user)
    applications = relationship("Application", back_populates="student", cascade="all, delete-orphan")
