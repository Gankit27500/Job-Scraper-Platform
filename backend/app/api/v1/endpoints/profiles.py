import os
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.profile import Profile
from app.schemas.profile import ProfileResponse, ProfileUpdate

router = APIRouter()

# Directory for file uploads - within workspace
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/me", response_model=ProfileResponse)
def get_my_profile(
    current_user: User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    return profile

@router.put("/me", response_model=ProfileResponse)
def update_my_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
        
    # Update fields
    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
        
    db.commit()
    db.refresh(profile)
    return profile

@router.post("/resume", response_model=ProfileResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db)
):
    # Ensure it's a PDF
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF resume uploads are supported."
        )
        
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
        
    # Generate a unique file name
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{current_user.id}_{uuid.uuid4().hex}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save the file locally
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save file: {str(e)}"
        )
        
    # Relative path or URL for access
    # We will serve this folder statically from FastAPI
    resume_url = f"/uploads/{unique_filename}"
    profile.resume_url = resume_url
    
    # Basic Parsing Scaffold: Extract text/skills
    # In Phase 4, we will enhance this. For now, let's extract some plain text if possible.
    # To avoid external heavy PDF dependencies, we can read basic strings,
    # or just use a mock parser for initial Phase 1/2.
    # Let's extract mock data or do basic ASCII read for now.
    try:
        # Mock resume skills parse for setup verification
        # (This will be replaced by robust parser in Phase 4)
        mock_skills = "Python, JavaScript, React, FastAPI, SQL, TypeScript, Git"
        profile.skills = mock_skills
        profile.experience = "Software Developer Intern at TechCorp. Built responsive web pages using React and styling tools."
    except Exception:
        pass

    db.commit()
    db.refresh(profile)
    return profile
