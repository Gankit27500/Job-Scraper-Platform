import os
from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, BeforeValidator, HttpUrl, PostgresDsn, ValidationInfo, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_ignore_empty=True, extra="ignore"
    )
    
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Job Scraper Platform"
    
    # JWT & Security
    SECRET_KEY: str = "change_me_to_a_secure_random_string_32_chars_or_more"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # PostgreSQL Configuration
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "job_scraper_db"
    
    DATABASE_URL: Optional[str] = None

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: Optional[str], info: ValidationInfo) -> Any:
        if isinstance(v, str) and v:
            return v
        
        values = info.data
        return f"postgresql://{values.get('POSTGRES_USER')}:{values.get('POSTGRES_PASSWORD')}@{values.get('POSTGRES_SERVER')}:{values.get('POSTGRES_PORT')}/{values.get('POSTGRES_DB')}"

    # Scraper Configuration
    SCRAPE_INTERVAL_MINUTES: int = 60
    
    # Email SMTP configuration (Optional, fallback to logs in development)
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = 587
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = "noreply@jobscraper.com"
    EMAILS_FROM_NAME: Optional[str] = "Job Scraper Platform"

    # AI Configuration
    # Fallback to local TF-IDF if API Key not provided
    GEMINI_API_KEY: Optional[str] = None

settings = Settings()
