import React, { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import api from "../../services/api";
import { Briefcase, FileText, CheckCircle2, ArrowRight, TrendingUp, Sparkles, MapPin, Building } from "lucide-react";
import { motion } from "framer-motion";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  salary_range: string | null;
  requirements: string | null;
  is_scraped: boolean;
}

interface Recommendation {
  job: Job;
  match_score: number;
}

interface Application {
  id: string;
  ai_match_score: number | null;
}

export const StudentDashboard: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [skillsCount, setSkillsCount] = useState(0);
  const [hasSkills, setHasSkills] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch profile skills details
      const profileRes = await api.get<{ skills?: string }>("/profiles/me");
      if (profileRes.data.skills) {
        const list = profileRes.data.skills.split(",").map((s) => s.trim()).filter(Boolean);
        setSkillsCount(list.length);
        setHasSkills(list.length > 0);
      }

      // 2. Fetch applications history
      const appsRes = await api.get<Application[]>("/applications/my-history");
      setApplications(appsRes.data);

      // 3. Fetch recommendations
      const recsRes = await api.get<Recommendation[]>("/ai/recommendations");
      setRecommendations(recsRes.data);
    } catch (err) {
      console.error("Error fetching student dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getAverageMatchScore = () => {
    const scores = applications.map(app => app.ai_match_score).filter((s): s is number => s !== null);
    if (scores.length === 0) return "N/A";
    const sum = scores.reduce((a, b) => a + b, 0);
    return `${Math.round(sum / scores.length)}%`;
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
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-outfit">Student Dashboard</h1>
        <p className="text-sm text-muted-foreground font-medium">
          Manage your job search, view match statistics, and inspect AI-driven career matches.
        </p>
      </div>

      {/* Metrics Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <motion.div 
          variants={itemVariants}
          className="glass-card p-6 rounded-2xl flex items-center justify-between border border-border/80 bg-card/65"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Applied Openings</span>
            <h2 className="text-3xl font-extrabold text-foreground font-outfit">{applications.length}</h2>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Briefcase className="h-5 w-5" />
          </div>
        </motion.div>

        {/* Metric 2 */}
        <motion.div 
          variants={itemVariants}
          className="glass-card p-6 rounded-2xl flex items-center justify-between border border-border/80 bg-card/65"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Average match score</span>
            <h2 className="text-3xl font-extrabold text-foreground font-outfit">{getAverageMatchScore()}</h2>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </motion.div>

        {/* Metric 3 */}
        <motion.div 
          variants={itemVariants}
          className="glass-card p-6 rounded-2xl flex items-center justify-between border border-border/80 bg-card/65"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Skills cataloged</span>
            <h2 className="text-3xl font-extrabold text-foreground font-outfit">{skillsCount}</h2>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <FileText className="h-5 w-5" />
          </div>
        </motion.div>
      </div>

      {/* Profile Complete Alert */}
      {!hasSkills && (
        <motion.div 
          variants={itemVariants}
          className="glass-card p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-l-primary bg-card/65 border-border"
        >
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h3 className="text-lg font-bold text-foreground font-outfit flex items-center gap-2 justify-center md:justify-start">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              Complete your profile to get matches
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upload your PDF resume to extract your coding skills. Our Gemini AI engine compares them with scraped remote postings in real-time to compute your matching indexes!
            </p>
          </div>
          <RouterLink 
            to="/student/profile" 
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl text-sm font-semibold transition-all shadow-md shadow-primary/25 cursor-pointer shrink-0"
          >
            Setup Profile
            <ArrowRight className="h-4 w-4" />
          </RouterLink>
        </motion.div>
      )}

      {/* AI Recommendations Listings */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground font-outfit flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          AI Matches & Recommendations
        </h2>

        {recommendations.length === 0 ? (
          <motion.div 
            variants={itemVariants}
            className="glass-card p-12 text-center rounded-2xl border border-border bg-card/65 flex flex-col items-center gap-4"
          >
            <Briefcase className="h-12 w-12 text-muted-foreground" />
            <div className="space-y-1">
              <h3 className="font-bold text-foreground">No recommendations available</h3>
              <p className="text-sm text-muted-foreground">
                Register skills on your profile first, or wait for managers to post openings.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec) => (
              <motion.div 
                variants={itemVariants}
                key={rec.job.id} 
                className="glass-card p-6 rounded-2xl border border-border/80 bg-card/65 flex flex-col justify-between gap-4 group hover:border-primary/30 transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-base text-foreground truncate max-w-[70%] group-hover:text-primary transition-colors">
                      {rec.job.title}
                    </h3>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                      <TrendingUp className="h-3 w-3" />
                      {Math.round(rec.match_score)}% Match
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center text-xs text-muted-foreground gap-x-4 gap-y-1">
                    <span className="text-foreground/80 font-semibold flex items-center gap-1">
                      <Building className="h-3.5 w-3.5 text-primary" />
                      {rec.job.company}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="h-3.5 w-3.5" />
                      {rec.job.location}
                    </span>
                  </div>

                  {rec.job.requirements && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {rec.job.requirements.split(",").slice(0, 3).map((req, idx) => (
                        <span 
                          key={idx} 
                          className="px-2 py-0.5 text-[10px] font-semibold bg-secondary text-secondary-foreground rounded-md border border-border"
                        >
                          {req.trim()}
                        </span>
                      ))}
                      {rec.job.requirements.split(",").length > 3 && (
                        <span className="text-[10px] text-muted-foreground px-1 self-center font-medium">
                          +{rec.job.requirements.split(",").length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/60 mt-2">
                  <span className="text-xs font-semibold text-foreground/80">
                    {rec.job.salary_range || "Competitive"}
                  </span>
                  <RouterLink
                    to={`/jobs/${rec.job.id}`}
                    className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 group/btn"
                  >
                    View Details
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                  </RouterLink>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
export default StudentDashboard;
