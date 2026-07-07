import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import jobsService from "../services/jobs";
import type { Job } from "../services/jobs";
import api from "../services/api";
import { ArrowLeft, Building, FileText, CheckCircle, AlertCircle, Send } from "lucide-react";
import { motion } from "framer-motion";

export const Apply: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        const jobData = await jobsService.getJobById(id);
        setJob(jobData);

        // Fetch student profile to get resume URL
        const profileRes = await api.get<{ resume_url?: string }>("/profiles/me");
        if (profileRes.data.resume_url) {
          setResumeUrl(profileRes.data.resume_url);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    if (!resumeUrl) {
      setError("You must upload a PDF resume in your profile page before submitting applications.");
      return;
    }

    setApplying(true);
    setError(null);

    try {
      await api.post("/applications", {
        job_id: job.id,
        cover_letter: coverLetter,
        resume_url: resumeUrl
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/student/applications");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        "Failed to submit application. You may have already applied to this opening."
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="glass-card p-12 text-center rounded-2xl max-w-xl mx-auto space-y-4 border border-border bg-card/65">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold text-foreground font-outfit">Position not found</h2>
        <Link to="/jobs" className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to job search
        </Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6 pb-12"
    >
      <div>
        <Link to={`/jobs/${job.id}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" /> Back to Position Details
        </Link>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-outfit">Submit Application</h1>
        <p className="text-sm text-muted-foreground font-medium">
          Complete the form below to apply for the position of <strong>{job.title}</strong>.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 text-sm bg-destructive/10 border border-destructive/20 rounded-xl text-destructive font-semibold">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="glass-card p-8 text-center rounded-2xl border border-border bg-card/65 space-y-4 py-16">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto animate-bounce" />
          <h2 className="text-2xl font-bold text-foreground font-outfit">Application Submitted!</h2>
          <p className="text-sm text-muted-foreground">Your profile details and cover letter have been sent. Redirecting...</p>
        </div>
      ) : (
        <div className="glass-card p-6 md:p-8 rounded-2xl border border-border/80 bg-card/65 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Position Summary */}
            <div className="p-4 rounded-xl bg-secondary border border-border space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Position Summary</span>
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-foreground font-outfit">{job.title}</h3>
                <span className="text-xs font-semibold text-foreground/80">{job.salary_range || "Competitive"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Building className="h-4 w-4 text-primary" />
                <span>{job.company}</span>
              </div>
            </div>

            {/* Profile Resume Status */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Attached Resume
              </label>
              {resumeUrl ? (
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card text-sm text-foreground">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-5 w-5 text-primary shrink-0" />
                    <span className="truncate font-medium">Active Resume: PDF document linked</span>
                  </div>
                  <a 
                    href={`http://localhost:8000${resumeUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    View
                  </a>
                </div>
              ) : (
                <div className="flex flex-col gap-2 p-4 rounded-xl border border-dashed border-destructive/30 bg-destructive/5 text-center">
                  <p className="text-xs text-destructive font-semibold">No active resume linked to your profile.</p>
                  <Link 
                    to="/student/profile" 
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Upload Resume PDF
                  </Link>
                </div>
              )}
            </div>

            {/* Cover Letter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Cover Letter (Optional)
              </label>
              <textarea
                rows={8}
                placeholder="Introduce yourself and explain why you're a great fit for this position..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={applying || !resumeUrl}
                className="flex items-center gap-2 py-2.5 px-6 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-sm transition-all shadow-md shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {applying ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </motion.div>
  );
};
export default Apply;
