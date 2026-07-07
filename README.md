# Job Scraper & Applicant Tracking System (ATS) Platform

A production-ready Full Stack take-home assessment built for **Kalpana Software Solution Pvt. Ltd.** SDE-1 hiring process.

---

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Lucide Icons, Axios.
- **Backend**: FastAPI (Python 3.10+), SQLAlchemy ORM, SQLite (local database engine for instant sandbox testing), Alembic (migrations), JWT Security, Jose.
- **AI Integration**: Google Gemini API (`gemini-1.5-flash`) for parsed CV keyword-overlap matching calculations.

---

## 🛠️ Features Implemented (According to Assignment PDF)

### Core Features
1. **Authentication (JWT, role-based protected routes)**: Sign up, log in, roles selection (`STUDENT` vs `HIRING_MANAGER`), session persistence, Axios interceptors, route guards.
2. **Job Scraper Module**: Decoupled scraping engine connecting to remote developer boards (WeWorkRemotely RSS feed) to crawl programming postings in the background. Runnable by both Managers and Students directly from the explorer dashboard.
3. **Job Posting & Management**: Form parameters to create, edit/update, and soft-delete/archive active job listings ( Hring Manager access).
4. **Job Results Table**: Batch grid board with keywords filters, salary ranges, location states, origin indicators, and pagination.
5. **Apply to Job**: Connects Cover Letter text submissions with candidate profile CV references.
6. **Application History**: Candidate timeline lists detailing statuses and AI compatibility rankings.
7. **Applicant Tracking System (ATS)**: Hiring managers can transition applicant cards across stages (Applied, Reviewing, Shortlisted, Rejected).
8. **Profile CRUD**: Full Name and Bio updates, plus PDF CV drag-and-drop file uploaders parsing skills.

### Bonus Features
- **AI Career Recommendations**: Suggests matching careers sorted by compatibility score percentages.
- **Resume Matching**: Employs keyword overlap comparisons (and Gemini API semantic models when `GEMINI_API_KEY` is present) to compare CV skills against job requirements in real-time.
- **Smart Filters**: Search by typing keywords, location text fields, job type filters, and listing origin pills.
- **Pagination**:Batches jobs results in batches of 10 with Previous / Next navigation controls.
- **Email Notifications**: Triggers transactional status change emails to candidates.
- **Toast Notifications**: Interactive floating notifications.

---

## 🔑 Demo Login Credentials

You can register your own accounts, or use the following pre-configured database credentials:

### 1. Student Role
- **Email**: `student@kalpana.com`
- **Password**: `password123`

### 2. Hiring Manager Role
- **Email**: `manager@kalpana.com`
- **Password**: `password123`

---

## 💻 How to Run Locally

### Prerequisites
- Python 3.10+ installed.
- Node.js 18+ installed.

### Step 1: Set up the FastAPI Backend

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables in `.env`:
   ```env
   DATABASE_URL=sqlite:///./job_scraper.db
   SECRET_KEY=yoursecretkeyhere
   # Optional: Add Gemini API key for advanced semantic matching
   GEMINI_API_KEY=your_gemini_api_key_here
   # Optional: Add SMTP credentials for candidate email notifications
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_smtp_app_password
   EMAILS_FROM_EMAIL=no-reply@kalpanajobs.com
   ```
5. Run database migrations:
   ```bash
   alembic upgrade head
   ```
6. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *The API documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs).*

---

### Step 2: Set up the Vite Frontend

1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The web application is accessible at [http://localhost:5173](http://localhost:5173).*
