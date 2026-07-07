from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    resume_url: Optional[str] = None
    skills: Optional[str] = None  # Comma-separated or JSON list
    experience: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: str
    user_id: str
    updated_at: datetime

    class Config:
        from_attributes = True
