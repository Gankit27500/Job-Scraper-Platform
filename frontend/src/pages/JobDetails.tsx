import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import jobsService from "../services/jobs";
import type { Job } from "../services/jobs";
import api from "../services/api";
import { 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  Building, 
  Calendar, 
  ExternalLink,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Trophy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Student Profile Context for client-side matching percentage
  const [studentSkills, setStudentSkills] = useState<string[]>([]);
  
  // Application modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobAndProfile = async () => {
      if (!id) return;
      try {
        const jobData = await jobsService.getJobById(id);
        setJob(jobData);

        if (user && user.role === "STUDENT") {
          const profileRes = await api.get<{ skills?: string }>("/profiles/me");
          if (profileRes.data.skills) {
            setStudentSkills(
              profileRes.data.skills.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
            );
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobAndProfile();
  }, [id, user]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    
    setApplying(true);
    setApplyError(null);
    
    try {
      const profileRes = await api.get<{ resume_url?: string }>("/profiles/me");
      const resumeUrl = profileRes.data.resume_url;
      
      if (!resumeUrl) {
        setApplyError("You must upload a PDF resume in your profile page before applying to internal openings.");
        setApplying(false);
        return;
      }

      await api.post("/applications", {
        job_id: job.id,
        cover_letter: coverLetter,
        resume_url: resumeUrl
      });

      setApplySuccess(true);
      setCoverLetter("");
      setTimeout(() => {
        setApplyModalOpen(false);
        setApplySuccess(false);
        navigate("/student/applications");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setApplyError(
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
      <div className="glass-card p-12 text-center rounded-2xl max-w-2xl mx-auto space-y-4 border border-border bg-card/65">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold text-foreground font-outfit">Job post not found</h2>
        <p className="text-sm text-muted-foreground">The job listing you are looking for may have been archived or removed.</p>
        <Link to="/jobs" className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to job search
        </Link>
      </div>
    );
  }

  // Calculate Match Score
  const jobRequirements = job.requirements
    ? job.requirements.split(",").map((r) => r.trim().toLowerCase()).filter(Boolean)
    : [];

  const matchedSkills = jobRequirements.filter((req) => studentSkills.includes(req));
  const matchPercentage = jobRequirements.length > 0 
    ? Math.round((matchedSkills.length / jobRequirements.length) * 100) 
    : 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-6 pb-12"
    >
      {/* Back button */}
      <div>
        <Link to="/jobs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" /> Back to Jobs Board
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Details description */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 md:p-8 rounded-2xl space-y-6 border border-border/80 bg-card/65 shadow-sm">
            {/* Title / Company Card header */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {job.is_scraped ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400">
                    Scraped remote opportunity
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 border border-primary/20 text-primary">
                    Internal posting
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-outfit leading-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-x-6 gap-y-2 border-b border-border/60 pb-4 font-medium">
                <span className="flex items-center gap-1.5 text-foreground/80 font-semibold">
                  <Building className="h-4 w-4 text-primary" />
                  {job.company}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5 capitalize">
                  <Briefcase className="h-4 w-4" />
                  {job.job_type.replace("_", " ").toLowerCase()}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Posted {new Date(job.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground font-outfit">Position Overview</h2>
              <div 
                className="text-sm text-muted-foreground leading-relaxed space-y-4 max-w-none prose dark:prose-invert prose-sm"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </div>
          </div>
        </div>

        {/* Right Col: Smart widget sidebar */}
        <div className="space-y-6 lg:sticky lg:top-[90px]">
          {/* Apply Card */}
          <div className="glass-card p-6 rounded-2xl flex flex-col gap-6 border border-border/80 bg-card/65 shadow-sm">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Salary compensation</span>
              <h3 className="text-xl font-extrabold text-foreground font-outfit">{job.salary_range || "Competitive"}</h3>
            </div>

            {user?.role === "STUDENT" && (
              <div className="p-4 rounded-xl bg-secondary border border-border flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-semibold uppercase">AI Resume Match</span>
                  <span className="text-xs font-bold text-primary">{matchPercentage}% Match</span>
                </div>
                {/* Math Bar */}
                <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full" 
                    style={{ width: `${matchPercentage}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Compared against skills registered in your active profile.
                </p>
              </div>
            )}

            {job.is_scraped ? (
              <a
                href={job.source_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-md shadow-purple-600/20 cursor-pointer"
              >
                <span>Apply on Remote Board</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : user?.role === "STUDENT" ? (
              <Link
                to={`/jobs/${job.id}/apply`}
                className="w-full text-center py-3 px-4 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-sm transition-all shadow-md shadow-primary/20 cursor-pointer block"
              >
                Apply to Opening
              </Link>
            ) : user?.role === "HIRING_MANAGER" ? (
              <Link
                to={`/manager/jobs/${job.id}/applicants`}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-sm transition-all shadow-md shadow-primary/20 cursor-pointer text-center"
              >
                <span>Inspect Applicants</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="w-full text-center py-3 px-4 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-sm transition-all shadow-md shadow-primary/20 cursor-pointer"
              >
                Login to Apply
              </Link>
            )}
          </div>

          {/* Requirements checklist widget */}
          <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 border border-border/80 bg-card/65 shadow-sm">
            <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2 border-b border-border pb-3">
              <Trophy className="h-4.5 w-4.5 text-primary" />
              Role Requirements
            </h3>
            {job.requirements ? (
              <div className="flex flex-col gap-2">
                {job.requirements.split(",").map((req, idx) => {
                  const cleanedReq = req.trim();
                  const matchesUser = studentSkills.includes(cleanedReq.toLowerCase());
                  return (
                    <div key={idx} className="flex items-center justify-between text-sm py-1.5 border-b border-border/40 last:border-0">
                      <span className="text-foreground/80 font-medium">{cleanedReq}</span>
                      {user?.role === "STUDENT" && (
                        <span>
                          {matchesUser ? (
                            <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">Matched</span>
                          ) : (
                            <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border border-border">Missing</span>
                          )}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No specific skills listed.</p>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <AnimatePresence>
        {applyModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-xl p-8 rounded-2xl space-y-6 text-left border border-border bg-card shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-xl font-bold text-foreground font-outfit">Submit Job Application</h2>
                <button 
                  onClick={() => setApplyModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>

              {applyError && (
                <div className="flex items-center gap-2.5 p-3.5 text-xs bg-destructive/10 border border-destructive/20 rounded-xl text-destructive font-semibold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{applyError}</span>
                </div>
              )}

              {applySuccess ? (
                <div className="text-center py-8 space-y-3">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto animate-bounce" />
                  <h3 className="text-lg font-bold text-foreground">Application Sent!</h3>
                  <p className="text-sm text-muted-foreground">Redirecting to your applications history...</p>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-4">
                  <div className="p-4 rounded-xl bg-secondary border border-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground uppercase font-bold tracking-wider">Resume Reference</span>
                      <span className="text-primary font-bold">Linked to Profile Resume</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your profile resume will be submitted to the hiring manager. Ensure it contains your latest contact info and projects.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      Cover Letter (Optional)
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Introduce yourself and explain why you're a great fit for this position..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={applying}
                    className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-sm transition-all shadow-md shadow-primary/25 disabled:opacity-50 cursor-pointer"
                  >
                    {applying ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mx-auto" />
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
export default JobDetails;
