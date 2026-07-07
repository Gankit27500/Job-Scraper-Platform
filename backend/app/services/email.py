import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("email")
logging.basicConfig(level=logging.INFO)

def send_email_notification(
    to_email: str,
    subject: str,
    body: str
) -> bool:
    """
    Sends an email notification via SMTP or prints to standard output in sandbox development mode.
    """
    logger.info(f"Preparing email to: {to_email}")
    logger.info(f"Subject: {subject}")
    logger.info(f"Body: {body}")
    
    # Check if SMTP configuration is set up
    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.info("SMTP Credentials not detected. Logging email dispatch details to local console.")
        return True
        
    try:
        # Create message container
        message = MIMEMultipart()
        message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
        message["To"] = to_email
        message["Subject"] = subject
        
        # Attach the body text
        message.attach(MIMEText(body, "html"))
        
        # Connect to SMTP server
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        if settings.SMTP_TLS:
            server.starttls()
            
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.EMAILS_FROM_EMAIL, to_email, message.as_string())
        server.close()
        
        logger.info(f"Email successfully dispatched to {to_email} via SMTP.")
        return True
    except Exception as e:
        logger.error(f"Error occurred during email dispatch: {str(e)}")
        return False
