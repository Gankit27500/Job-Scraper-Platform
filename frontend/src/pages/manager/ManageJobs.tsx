import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import jobsService from "../../services/jobs";
import type { Job } from "../../services/jobs";
import { Briefcase, Users, PlusCircle, ArrowRight, Building, MapPin, Archive, Edit2, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export const ManageJobs: React.FC = () => {
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [myJobsCounts, setMyJobsCounts] = useState<Record<string, number>>({});
  
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchDashboardData = async () => {
    try {
      const allJobs = await jobsService.getJobs();
      const resProfile = await api.get<{ user_id?: string }>("/profiles/me");
      const userId = resProfile.data.user_id;
      
      const filteredJobs = allJobs.filter(job => job.posted_by === userId);
      setMyJobs(filteredJobs);

      // Fetch candidates totals for each job
      const counts: Record<string, number> = {};
      for (const job of filteredJobs) {
        try {
          const appsRes = await api.get<any[]>(`/applications/job/${job.id}`);
          counts[job.id] = appsRes.data.length;
        } catch (e) {
          console.error(`Error loading applicants for job ${job.id}:`, e);
          counts[job.id] = 0;
        }
      }
      setMyJobsCounts(counts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleArchiveJob = async (jobId: string) => {
    if (!window.confirm("Are you sure you want to archive this job opening? Candidates will no longer be able to apply.")) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      setMsg({ type: "success", text: "Job listing successfully archived." });
      setMyJobs(prev => prev.filter(j => j.id !== jobId));
    } catch (err) {
      console.error(err);
      setMsg({ type: "error", text: "Failed to archive job listing." });
    }
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
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-12"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-outfit">Manage Listings</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Monitor applicant traffic, edit descriptions, or archive active job openings.
          </p>
        </div>

        <Link 
          to="/manager/post-job" 
          className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-sm transition-all shadow-lg shadow-primary/25 cursor-pointer shrink-0"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          Post New Job
        </Link>
      </div>

      {msg && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm max-w-4xl ${
          msg.type === "success" 
            ? "bg-green-500/10 border-green-500/25 text-green-500" 
            : "bg-red-500/10 border-red-500/25 text-red-500"
        }`}>
          {msg.type === "success" ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Posted Jobs Grid/List */}
      <div className="space-y-4">
        {myJobs.length === 0 ? (
          <motion.div 
            variants={itemVariants}
            className="glass-card p-12 text-center rounded-2xl border border-border bg-card/65 flex flex-col items-center gap-4 max-w-2xl mx-auto"
          >
            <Briefcase className="h-12 w-12 text-muted-foreground" />
            <div className="space-y-1">
              <h3 className="font-bold text-foreground">No jobs posted yet</h3>
              <p className="text-sm text-muted-foreground">
                You haven&apos;t created any job openings. Once you post them, they will appear here.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {myJobs.map((job) => (
              <motion.div 
                variants={itemVariants}
                key={job.id} 
                className="glass-card p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-border/80 bg-card/65 group hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-extrabold text-lg text-foreground font-outfit group-hover:text-primary transition-colors truncate">
                      {job.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 border border-primary/20 text-primary uppercase">
                      {job.job_type.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center text-xs text-muted-foreground gap-4 font-medium">
                    <span className="flex items-center gap-1.5 text-foreground/80">
                      <Building className="h-3.5 w-3.5 text-primary" />
                      {job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1.5 text-primary">
                      <Users className="h-3.5 w-3.5" />
                      {myJobsCounts[job.id] ?? 0} Applicants
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t border-border/60 sm:border-0 pt-3 sm:pt-0">
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleArchiveJob(job.id)}
                      className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/25 transition-all cursor-pointer"
                      title="Archive job"
                    >
                      <Archive className="h-4.5 w-4.5" />
                    </button>
                    <Link
                      to={`/manager/jobs/${job.id}/edit`}
                      className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/25 transition-all cursor-pointer"
                      title="Edit job details"
                    >
                      <Edit2 className="h-4.5 w-4.5" />
                    </Link>
                  </div>
                  <Link
                    to={`/manager/jobs/${job.id}/applicants`}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/20 cursor-pointer"
                  >
                    Manage Candidates
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
export default ManageJobs;
