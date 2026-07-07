import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Calendar, ChevronRight, FileText, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Job {
  title: string;
  company: string;
  location: string;
}

interface Application {
  id: string;
  job_id: string;
  student_id: string;
  resume_url: string;
  cover_letter: string | null;
  ai_match_score: number | null;
  status: "PENDING" | "REVIEWING" | "SHORTLISTED" | "REJECTED";
  applied_at: string;
  job?: Job;
}

export const Applications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await api.get<Application[]>("/applications/my-history");
      setApplications(res.data);
      if (res.data.length > 0) {
        setSelectedApp(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to load application history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getStatusBadge = (status: Application["status"]) => {
    const config = {
      PENDING: "bg-yellow-500/10 border-yellow-500/30 text-yellow-500 dark:text-yellow-400",
      REVIEWING: "bg-blue-500/10 border-blue-500/30 text-blue-500 dark:text-blue-400",
      SHORTLISTED: "bg-green-500/10 border-green-500/30 text-green-500 dark:text-green-400",
      REJECTED: "bg-red-500/10 border-red-500/30 text-red-500 dark:text-red-400",
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config[status]} capitalize`}>
        {status.toLowerCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-12"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-outfit">Application History</h1>
        <p className="text-sm text-muted-foreground font-medium">
          Track and review the status of your submitted job applications.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl max-w-xl mx-auto space-y-4 border border-border bg-card/65">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-bold text-foreground font-outfit">No submissions yet</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">Applications you submit to internal job postings will display here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Applications list */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="lg:col-span-2 space-y-3"
          >
            {applications.map((app) => (
              <motion.button
                variants={itemVariants}
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className={`w-full text-left glass-card p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer group ${
                  selectedApp?.id === app.id 
                    ? "border-primary/40 bg-primary/5 shadow-sm" 
                    : "border-border/60 bg-card/65 hover:border-border"
                }`}
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-foreground font-outfit truncate group-hover:text-primary transition-colors">
                      {app.job?.title || "Software Engineer"}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center text-xs text-muted-foreground gap-x-4 gap-y-1 font-medium">
                    <span className="text-foreground/80 font-bold">{app.job?.company}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(app.applied_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {app.ai_match_score !== null && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                      <TrendingUp className="h-3 w-3" />
                      {Math.round(app.ai_match_score)}%
                    </div>
                  )}
                  {getStatusBadge(app.status)}
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* Right Column: Detailed review pane (Notion style drawer) */}
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
                  <div className="border-b border-border/60 pb-4 space-y-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Detail view</span>
                    <h2 className="text-xl font-bold text-foreground font-outfit leading-tight">
                      {selectedApp.job?.title}
                    </h2>
                    <p className="text-sm text-primary font-semibold">{selectedApp.job?.company}</p>
                  </div>

                  {/* AI Score panel */}
                  {selectedApp.ai_match_score !== null && (
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-bold uppercase tracking-wider">AI Match Analysis</span>
                        <span className="font-bold text-primary">{Math.round(selectedApp.ai_match_score)}% Match</span>
                      </div>
                      <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full" 
                          style={{ width: `${selectedApp.ai_match_score}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Details list */}
                  <div className="space-y-4 text-sm font-medium">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Submission Status:</span>
                      {getStatusBadge(selectedApp.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Applied On:</span>
                      <span className="text-foreground font-semibold">{new Date(selectedApp.applied_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-col gap-1.5 border-t border-border/60 pt-4">
                      <span className="text-muted-foreground">Submitted Resume:</span>
                      <a 
                        href={`http://localhost:8000${selectedApp.resume_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 font-bold underline truncate flex items-center gap-1.5"
                      >
                        <FileText className="h-4 w-4 shrink-0" />
                        <span>View Submitted CV.pdf</span>
                      </a>
                    </div>
                    {selectedApp.cover_letter && (
                      <div className="flex flex-col gap-1.5 border-t border-border/60 pt-4">
                        <span className="text-muted-foreground">Cover Letter:</span>
                        <p className="text-xs text-muted-foreground bg-card border border-border p-3.5 rounded-xl leading-relaxed whitespace-pre-wrap font-normal">
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
export default Applications;
