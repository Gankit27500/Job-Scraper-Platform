import logging
import httpx
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("ai")

def calculate_match_score(student_skills: Optional[str], job_requirements: Optional[str]) -> float:
    """
    Computes a percentage match score (0.0 to 100.0) comparing student skills with job requirements.
    Falls back to a keyword-overlap similarity model if Gemini API is not configured.
    """
    if not student_skills or not job_requirements:
        return 0.0
        
    # Standard keyword match logic
    student_list = [s.strip().lower() for s in student_skills.split(",") if s.strip()]
    job_list = [r.strip().lower() for r in job_requirements.split(",") if r.strip()]
    
    if not job_list:
        return 100.0  # No requirements listed, default to full match
        
    matched_skills = [skill for skill in job_list if skill in student_list]
    base_score = (len(matched_skills) / len(job_list)) * 100.0
    
    # Optional Semantic matching using Gemini API if KEY is available
    if settings.GEMINI_API_KEY:
        try:
            # We can invoke Gemini API via HTTP POST
            # https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
            # To keep execution lightweight and synchronous, we'll try to run it.
            # However, to avoid slowing down request-response cycles, we use a basic try-except,
            # or we can do it in background tasks.
            # Let's write the API request wrapper:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [{
                    "parts": [{
                        "text": f"Compare these student skills: '{student_skills}' with these job requirements: '{job_requirements}'. "
                               f"Provide a match score between 0.0 and 100.0 as a single float number. Do not return any other text, only the number."
                    }]
                }]
            }
            res = httpx.post(url, json=payload, timeout=8.0)
            if res.status_code == 200:
                text_out = res.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                # Parse float
                score = float(text_out)
                logger.info(f"Gemini AI Semantic similarity matching computed score: {score}%")
                return min(max(score, 0.0), 100.0)
        except Exception as e:
            logger.warning(f"Failed to fetch semantic match from Gemini API, falling back to base keyword overlap: {str(e)}")
            
    return round(base_score, 1)
