import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import jobsService from "../../services/jobs";
import type { Job } from "../../services/jobs";
import { useToast } from "../../context/ToastContext";
import { 
  ArrowLeft, 
  User, 
  FileText, 
  TrendingUp, 
  ChevronRight, 
  Mail,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Application {
  id: string;
  job_id: string;
  student_id: string;
  resume_url: string;
  cover_letter: string | null;
  ai_match_score: number | null;
  status: "PENDING" | "REVIEWING" | "SHORTLISTED" | "REJECTED";
  applied_at: string;
  student_email?: string;
  student_skills?: string;
}

export const Applicants: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchJobAndApplicants = async () => {
    if (!id) return;
    try {
      const jobData = await jobsService.getJobById(id);
      setJob(jobData);

      const appsRes = await api.get<Application[]>(`/applications/job/${id}`);
      
      // Fetch user profile details for each applicant to display email / skills
      const enrichedApps = await Promise.all(
        appsRes.data.map(async (app) => {
          try {
            const profileRes = await api.get<{ email?: string; skills?: string }>(`/profiles/user/${app.student_id}`);
            return {
              ...app,
              student_email: profileRes.data.email || "Candidate",
              student_skills: profileRes.data.skills || ""
            };
          } catch (e) {
            return {
              ...app,
              student_email: "Candidate",
              student_skills: ""
            };
          }
        })
      );

      setApplications(enrichedApps);
      if (enrichedApps.length > 0) {
        setSelectedApp(enrichedApps[0]);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to load applicants listing details.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobAndApplicants();
  }, [id]);

  const handleUpdateStatus = async (appId: string, newStatus: Application["status"]) => {
    setStatusUpdating(true);
    try {
      await api.patch(`/applications/${appId}/status`, null, {
        params: { status: newStatus }
      });

      showToast(`Candidate status updated to ${newStatus.toLowerCase()} successfully!`, "success");
      
      // Update local state
      setApplications(prev => 
        prev.map(app => app.id === appId ? { ...app, status: newStatus } : app)
      );
      
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.detail || "Failed to update applicant status.", "error");
    } finally {
      setStatusUpdating(false);
    }
  };

  const getStatusColor = (status: Application["status"]) => {
    const map = {
      PENDING: "bg-yellow-500",
      REVIEWING: "bg-blue-500",
      SHORTLISTED: "bg-green-500",
      REJECTED: "bg-red-500"
    };
    return map[status];
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
        <h2 className="text-xl font-bold text-foreground font-outfit">Position not found</h2>
        <Link to="/manager/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  // Group applications by status for Kanban preview if desired
  const categories: Application["status"][] = ["PENDING", "REVIEWING", "SHORTLISTED", "REJECTED"];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-12"
    >
      {/* Header */}
      <div>
        <Link to="/manager/jobs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" /> Back to Manage Listings
        </Link>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">ATS Tracking Pipeline</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-outfit truncate max-w-4xl">
          {job.title} Candidates
        </h1>
        <p className="text-sm text-muted-foreground font-medium">
          Inspect resume parser scores and move applicants through recruitment stages.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl max-w-2xl mx-auto space-y-4 border border-border bg-card/65">
          <User className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-bold text-foreground font-outfit">No candidates registered</h2>
          <p className="text-sm text-muted-foreground">Once students apply to this position, their credentials and matching metrics will load here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Candidates Pipeline Cards */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Candidate List</h2>
            <div className="space-y-3">
              {applications.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`w-full text-left glass-card p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer group ${
                    selectedApp?.id === app.id
                      ? "border-primary/45 bg-primary/5 shadow-sm"
                      : "border-border/60 bg-card/65 hover:border-border"
                  }`}
                >
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${getStatusColor(app.status)}`} />
                      <h3 className="font-extrabold text-base text-foreground font-outfit group-hover:text-primary transition-colors truncate">
                        {app.student_email}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium truncate max-w-md">
                      Skills: {app.student_skills || "Not specified"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {app.ai_match_score !== null && (
                      <span className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {Math.round(app.ai_match_score)}% Match
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Candidate detail review sheet */}
          <div className="lg:sticky lg:top-[90px]">
            <AnimatePresence mode="wait">
              {selectedApp && (
                <motion.div
                  key={selectedApp.id}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="glass-card p-6 rounded-2xl border border-border/80 bg-card/65 space-y-6 shadow-sm"
                >
                  {/* Title header */}
                  <div className="border-b border-border/60 pb-4 space-y-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Candidate Profile</span>
                    <h2 className="text-lg font-bold text-foreground font-outfit truncate flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${getStatusColor(selectedApp.status)}`} />
                      {selectedApp.student_email}
                    </h2>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                      <Mail className="h-4 w-4 text-primary" />
                      Applied on {new Date(selectedApp.applied_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* AI match score widget */}
                  {selectedApp.ai_match_score !== null && (
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-bold uppercase tracking-wider">AI Skill Match</span>
                        <span className="font-bold text-primary">{Math.round(selectedApp.ai_match_score)}% Similarity</span>
                      </div>
                      <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full" 
                          style={{ width: `${selectedApp.ai_match_score}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Status Dropdown Picker */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Recruitment Stage</label>
                    <select
                      value={selectedApp.status}
                      disabled={statusUpdating}
                      onChange={(e) => handleUpdateStatus(selectedApp.id, e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary transition-all duration-200 cursor-pointer appearance-none disabled:opacity-50"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.toLowerCase().replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Skills Cloud list */}
                  <div className="space-y-2.5 border-t border-border/60 pt-4">
                    <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      Parsed Resume Skills
                    </span>
                    {selectedApp.student_skills ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedApp.student_skills.split(",").map((sk, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-0.5 text-[10px] font-semibold bg-secondary text-secondary-foreground rounded border border-border"
                          >
                            {sk.trim()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No parsed profile skills listed.</p>
                    )}
                  </div>

                  {/* Cover letter & Resume download assets */}
                  <div className="space-y-4 border-t border-border/60 pt-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Candidate CV Document</span>
                      <a 
                        href={`http://localhost:8000${selectedApp.resume_url}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 font-bold underline text-sm flex items-center gap-1.5"
                      >
                        <FileText className="h-4 w-4 shrink-0" />
                        <span>Inspect Applicant Resume.pdf</span>
                      </a>
                    </div>

                    {selectedApp.cover_letter && (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Cover Letter</span>
                        <p className="text-xs text-muted-foreground bg-card border border-border p-3.5 rounded-xl leading-relaxed whitespace-pre-wrap">
                          {selectedApp.cover_letter}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  );
};
export default Applicants;
