import uuid
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.profile import Profile
from app.schemas.user import UserCreate, UserResponse, Token
from app.schemas.profile import ProfileResponse

router = APIRouter()

class JSONLoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(deps.get_db)):
    # Check if user exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists."
        )
    
    # Create user
    user_id = str(uuid.uuid4())
    db_user = User(
        id=user_id,
        email=user_in.email,
        password_hash=security.get_password_hash(user_in.password),
        role=user_in.role
    )
    db.add(db_user)
    
    # Create an associated empty profile
    profile_id = str(uuid.uuid4())
    db_profile = Profile(
        id=profile_id,
        user_id=user_id,
        full_name="",
        bio="",
        resume_url="",
        skills="",
        experience=""
    )
    db.add(db_profile)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
def login_user(login_in: JSONLoginRequest, db: Session = Depends(deps.get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not security.verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(deps.get_current_active_user)):
    return current_user
