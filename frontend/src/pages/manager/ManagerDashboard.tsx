import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import jobsService from "../../services/jobs";
import type { Job } from "../../services/jobs";
import { Briefcase, Users, PlusCircle, ArrowRight, Building, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export const ManagerDashboard: React.FC = () => {
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCandidates, setTotalCandidates] = useState(0);

  const fetchDashboardData = async () => {
    try {
      const allJobs = await jobsService.getJobs();
      const resProfile = await api.get<{ user_id?: string }>("/profiles/me");
      const userId = resProfile.data.user_id;
      
      const filteredJobs = allJobs.filter(job => job.posted_by === userId);
      setMyJobs(filteredJobs);

      // Fetch candidates totals for all manager's jobs
      let candidateCount = 0;
      for (const job of filteredJobs) {
        try {
          const appsRes = await api.get<any[]>(`/applications/job/${job.id}`);
          candidateCount += appsRes.data.length;
        } catch (e) {
          console.error(`Error loading applicants for job ${job.id}:`, e);
        }
      }
      setTotalCandidates(candidateCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      transition: {
        staggerChildren: 0.05
      }
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
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-outfit">Hiring Manager Portal</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Manage your active career listings and monitor recruitment stages.
          </p>
        </div>

        <Link 
          to="/manager/post-job" 
          className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-sm transition-all shadow-lg shadow-primary/25 cursor-pointer shrink-0"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          Post New Opening
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          variants={itemVariants}
          className="glass-card p-6 rounded-2xl flex items-center justify-between border border-border/80 bg-card/65"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Posted jobs</span>
            <h2 className="text-3xl font-extrabold text-foreground font-outfit">{myJobs.length}</h2>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Briefcase className="h-5 w-5" />
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="glass-card p-6 rounded-2xl flex items-center justify-between border border-border/80 bg-card/65"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Candidates</span>
            <h2 className="text-3xl font-extrabold text-foreground font-outfit">{totalCandidates}</h2>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Users className="h-5 w-5" />
          </div>
        </motion.div>
      </div>

      {/* Posted Jobs Feed */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground font-outfit">My Active Listings</h2>
        
        {myJobs.length === 0 ? (
          <motion.div 
            variants={itemVariants}
            className="glass-card p-12 text-center rounded-2xl border border-border bg-card/65 flex flex-col items-center gap-4 max-w-2xl mx-auto"
          >
            <Briefcase className="h-12 w-12 text-muted-foreground" />
            <div className="space-y-1">
              <h3 className="font-bold text-foreground">No active postings</h3>
              <p className="text-sm text-muted-foreground">
                You haven&apos;t created any internal job listings yet. Get started by creating your first post.
              </p>
            </div>
            <Link 
              to="/manager/post-job" 
              className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border text-foreground hover:bg-secondary/80 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Post Job Opening
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {myJobs.map((job) => (
              <motion.div 
                variants={itemVariants}
                key={job.id} 
                className="glass-card p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-border/80 bg-card/65 group hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="space-y-2">
                  <h3 className="font-extrabold text-lg text-foreground font-outfit group-hover:text-primary transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap items-center text-xs text-muted-foreground gap-4 font-medium">
                    <span className="flex items-center gap-1.5 text-foreground/80">
                      <Building className="h-3.5 w-3.5 text-primary" />
                      {job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t border-border/60 sm:border-0 pt-3 sm:pt-0">
                  <span className="text-sm text-foreground/85 font-semibold">
                    {job.salary_range || "Competitive"}
                  </span>
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
export default ManagerDashboard;
