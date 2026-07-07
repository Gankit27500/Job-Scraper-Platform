import xml.etree.ElementTree as ET
import httpx
import uuid
import logging
from sqlalchemy.orm import Session
from app.models.job import Job, JobType, JobStatus

# Setup logger
logger = logging.getLogger("scraper")
logging.basicConfig(level=logging.INFO)

WWR_RSS_URL = "https://weworkremotely.com/categories/remote-programming-jobs.rss"

def parse_wwr_rss(xml_content: str) -> list:
    """
    Parses WeWorkRemotely RSS feed content and extracts structured job listings.
    """
    jobs = []
    try:
        root = ET.fromstring(xml_content)
        channel = root.find("channel")
        if channel is None:
            return jobs
            
        for item in channel.findall("item"):
            # Extract fields
            title_node = item.find("title")
            link_node = item.find("link")
            desc_node = item.find("description")
            pub_date_node = item.find("pubDate")
            
            # WWR uses custom namespace tags for company, location etc.
            # Usually company name is inside title: "Company Name: Job Title"
            raw_title = title_node.text if title_node is not None else ""
            source_url = link_node.text if link_node is not None else ""
            description = desc_node.text if desc_node is not None else ""
            
            # Default values
            company = "Remote Company"
            title = raw_title
            
            if ":" in raw_title:
                parts = raw_title.split(":", 1)
                company = parts[0].strip()
                title = parts[1].strip()
                
            location = "Remote"
            job_type = JobType.FULL_TIME
            
            # Basic heuristic mapping for requirements based on text
            requirements = []
            lower_desc = description.lower()
            keywords = ["python", "javascript", "react", "fastapi", "typescript", "postgres", "node", "django", "aws", "docker", "sql", "git"]
            for kw in keywords:
                if kw in lower_desc:
                    # capitalize nicely
                    requirements.append(kw.upper() if kw in ["aws", "sql", "git"] else kw.capitalize())
            
            # Experience level heuristic
            experience_level = "Mid-Level"
            if "senior" in title.lower() or "lead" in title.lower():
                experience_level = "Senior-Level"
            elif "junior" in title.lower() or "entry" in title.lower() or "intern" in title.lower():
                experience_level = "Junior-Level"
                
            jobs.append({
                "title": title,
                "company": company,
                "location": location,
                "salary_range": "Competitive",
                "job_type": job_type,
                "experience_level": experience_level,
                "description": description,
                "requirements": ", ".join(requirements) if requirements else "Software Engineering, Git",
                "source_url": source_url
            })
    except Exception as e:
        logger.error(f"Error parsing WeWorkRemotely RSS feed: {str(e)}")
        
    return jobs

def scrape_remote_jobs(db: Session) -> int:
    """
    Background worker function that scrapes target job site feeds and inserts them into PostgreSQL.
    Returns the count of new jobs loaded.
    """
    logger.info("Starting background scrape of remote jobs...")
    
    try:
        # Use httpx with a reasonable timeout and headers
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        response = httpx.get(WWR_RSS_URL, headers=headers, timeout=15.0)
        if response.status_code != 200:
            logger.error(f"Failed to fetch feed: HTTP {response.status_code}")
            return 0
            
        jobs_list = parse_wwr_rss(response.text)
        logger.info(f"Parsed {len(jobs_list)} jobs from WeWorkRemotely feed.")
        
        new_jobs_count = 0
        for job_data in jobs_list:
            # Check if source_url is already imported to avoid duplicate entries
            existing_job = db.query(Job).filter(Job.source_url == job_data["source_url"]).first()
            if existing_job:
                continue
                
            # Insert new job
            db_job = Job(
                id=str(uuid.uuid4()),
                posted_by=None,  # Null indicates it was imported by scraper
                title=job_data["title"],
                company=job_data["company"],
                location=job_data["location"],
                salary_range=job_data["salary_range"],
                job_type=job_data["job_type"],
                experience_level=job_data["experience_level"],
                description=job_data["description"],
                requirements=job_data["requirements"],
                is_scraped=True,
                source_url=job_data["source_url"],
                status=JobStatus.ACTIVE
            )
            db.add(db_job)
            new_jobs_count += 1
            
        db.commit()
        logger.info(f"Database sync completed. Added {new_jobs_count} new job listings.")
        return new_jobs_count
        
    except Exception as e:
        logger.error(f"Error executing remote scrape: {str(e)}")
        return 0
