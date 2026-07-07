import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import jobsService from "../../services/jobs";
import { 
  BarChart2, 
  TrendingUp, 
  Users, 
  Briefcase, 
  Globe, 
  PieChart, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

export const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    scrapedJobs: 0,
    postedJobs: 0,
    totalApplicants: 0,
    avgMatchScore: 0,
    funnel: {
      applied: 0,
      reviewing: 0,
      shortlisted: 0,
      rejected: 0
    }
  });

  const loadStats = async () => {
    try {
      const allJobs = await jobsService.getJobs();
      const resProfile = await api.get<{ user_id?: string }>("/profiles/me");
      const userId = resProfile.data.user_id;

      // Filter jobs posted by this manager
      const myPostedJobs = allJobs.filter(j => j.posted_by === userId);
      const scraped = allJobs.filter(j => j.is_scraped);

      // Fetch all applicants for manager's jobs
      let applicantTotal = 0;
      let matchScoreSum = 0;
      let scoreCount = 0;
      const funnelCounts = { applied: 0, reviewing: 0, shortlisted: 0, rejected: 0 };

      for (const job of myPostedJobs) {
        try {
          const appsRes = await api.get<any[]>(`/applications/job/${job.id}`);
          applicantTotal += appsRes.data.length;
          
          appsRes.data.forEach(app => {
            if (app.ai_match_score !== null) {
              matchScoreSum += app.ai_match_score;
              scoreCount++;
            }
            // Count funnel stages
            if (app.status === "PENDING") funnelCounts.applied++;
            else if (app.status === "REVIEWING") funnelCounts.reviewing++;
            else if (app.status === "SHORTLISTED") funnelCounts.shortlisted++;
            else if (app.status === "REJECTED") funnelCounts.rejected++;
          });
        } catch (e) {
          console.error(e);
        }
      }

      setStats({
        totalJobs: allJobs.length,
        scrapedJobs: scraped.length,
        postedJobs: allJobs.length - scraped.length,
        totalApplicants: applicantTotal,
        avgMatchScore: scoreCount > 0 ? Math.round(matchScoreSum / scoreCount) : 0,
        funnel: funnelCounts
      });
    } catch (err) {
      console.error("Failed to load analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Calculate percentages for custom SVG visual chart
  const scrapedRatio = stats.totalJobs > 0 ? (stats.scrapedJobs / stats.totalJobs) * 100 : 0;
  const postedRatio = stats.totalJobs > 0 ? (stats.postedJobs / stats.totalJobs) * 100 : 0;

  const funnelMax = Math.max(stats.funnel.applied, stats.funnel.reviewing, stats.funnel.shortlisted, stats.funnel.rejected, 1);

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
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-outfit">Recruitment Analytics</h1>
        <p className="text-sm text-muted-foreground font-medium">
          Real-time metrics, pipeline conversion funnels, and AI matching score averages.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          variants={itemVariants}
          className="glass-card p-6 rounded-2xl border border-border bg-card/65 flex items-center justify-between"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Board Jobs</span>
            <h2 className="text-3xl font-extrabold text-foreground font-outfit">{stats.totalJobs}</h2>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Briefcase className="h-5 w-5" />
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="glass-card p-6 rounded-2xl border border-border bg-card/65 flex items-center justify-between"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Applicants</span>
            <h2 className="text-3xl font-extrabold text-foreground font-outfit">{stats.totalApplicants}</h2>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Users className="h-5 w-5" />
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="glass-card p-6 rounded-2xl border border-border bg-card/65 flex items-center justify-between"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Average AI Match</span>
            <h2 className="text-3xl font-extrabold text-foreground font-outfit">{stats.avgMatchScore}%</h2>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <TrendingUp className="h-5 w-5" />
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="glass-card p-6 rounded-2xl border border-border bg-card/65 flex items-center justify-between"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Scraped Listings</span>
            <h2 className="text-3xl font-extrabold text-foreground font-outfit">{stats.scrapedJobs}</h2>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Globe className="h-5 w-5" />
          </div>
        </motion.div>
      </div>

      {/* Visual Graphs Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Widget: Pipeline conversion funnel */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 glass-card p-6 rounded-2xl border border-border bg-card/65 space-y-6"
        >
          <h3 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2 border-b border-border/60 pb-3">
            <BarChart2 className="h-4.5 w-4.5 text-primary" />
            Recruitment Funnel Conversion
          </h3>

          <div className="space-y-4 pt-2">
            {[
              { label: "Applied / Pending", count: stats.funnel.applied, color: "bg-yellow-500" },
              { label: "Reviewing Profiles", count: stats.funnel.reviewing, color: "bg-blue-500" },
              { label: "Shortlisted Candidates", count: stats.funnel.shortlisted, color: "bg-green-500" },
              { label: "Archived / Rejected", count: stats.funnel.rejected, color: "bg-red-500" }
            ].map((stage, idx) => {
              const pct = (stage.count / funnelMax) * 100;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-foreground/80">{stage.label}</span>
                    <span className="text-foreground font-bold">{stage.count} candidates</span>
                  </div>
                  <div className="h-7 w-full bg-secondary rounded-lg overflow-hidden border border-border/50 flex">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={`h-full ${stage.color} flex items-center pl-3 text-[10px] font-bold text-white`}
                    >
                      {stage.count > 0 && `${Math.round(pct)}%`}
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Right Widget: Listings Origin distribution pie */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-1 glass-card p-6 rounded-2xl border border-border bg-card/65 space-y-6"
        >
          <h3 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2 border-b border-border/60 pb-3">
            <PieChart className="h-4.5 w-4.5 text-primary" />
            Database Listings Ratio
          </h3>

          <div className="flex flex-col items-center justify-center pt-4 space-y-6">
            {/* SVG custom donut chart */}
            <div className="relative h-32 w-32 flex items-center justify-center">
              <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border)" strokeWidth="3" />
                {/* Segment 1: Scraped Ratio */}
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.915" 
                  fill="none" 
                  stroke="var(--color-primary)" 
                  strokeWidth="3.5" 
                  strokeDasharray={`${scrapedRatio} ${100 - scrapedRatio}`} 
                  strokeDashoffset="0" 
                />
              </svg>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xl font-extrabold text-foreground font-outfit">{stats.totalJobs}</span>
                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Jobs Total</span>
              </div>
            </div>

            {/* Legends */}
            <div className="w-full space-y-3 pt-2 text-xs font-medium border-t border-border/40">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-foreground/80">
                  <span className="h-3 w-3 rounded bg-primary" />
                  Scraped Feeds
                </span>
                <span className="text-foreground font-bold">{stats.scrapedJobs} ({Math.round(scrapedRatio)}%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-foreground/80">
                  <span className="h-3 w-3 rounded bg-border border border-muted-foreground/30" />
                  Internal Posted
                </span>
                <span className="text-foreground font-bold">{stats.postedJobs} ({Math.round(postedRatio)}%)</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Extra helper message */}
      <motion.div 
        variants={itemVariants}
        className="glass-card p-6 rounded-2xl border border-border/80 bg-card/65 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-foreground">Want to increase candidate match averages?</h4>
            <p className="text-xs text-muted-foreground">Post detailed requirements tags when publishing career openings.</p>
          </div>
        </div>
        <Link 
          to="/manager/post-job" 
          className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 shrink-0"
        >
          Post New Position
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </motion.div>
    </motion.div>
  );
};
export default Analytics;
