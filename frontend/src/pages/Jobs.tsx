import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import jobsService from "../services/jobs";
import type { Job, FilterParams } from "../services/jobs";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  RefreshCw, 
  Globe, 
  CheckCircle, 
  AlertCircle,
  Building
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Jobs: React.FC = () => {
  const { user } = useAuth();
  
  // Filters State
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState<string>("");
  const [origin, setOrigin] = useState<string>(""); // "", "posted", "scraped"
  
  // Data State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const limit = 10;

  // Debounced load jobs callback
  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const filters: FilterParams = {
        limit,
        offset: (page - 1) * limit
      };
      if (search) filters.search = search;
      if (location) filters.location = location;
      if (jobType) filters.job_type = jobType;
      if (origin === "scraped") filters.is_scraped = true;
      if (origin === "posted") filters.is_scraped = false;

      const data = await jobsService.getJobs(filters);
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, location, jobType, origin, page]);

  // Reset to first page on filter change
  useEffect(() => {
    setPage(1);
  }, [search, location, jobType, origin]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadJobs();
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [loadJobs]);

  const handleTriggerScrape = async () => {
    setScraping(true);
    setMsg(null);
    try {
      await jobsService.triggerScrape();
      setMsg({ 
        type: "success", 
        text: "Background job scraper started! Refresh in a few seconds to see new listings." 
      });
      setTimeout(() => {
        loadJobs();
      }, 3000);
    } catch (err) {
      console.error(err);
      setMsg({ type: "error", text: "Failed to trigger remote scraper." });
    } finally {
      setScraping(false);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setLocation("");
    setJobType("");
    setOrigin("");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-12"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-outfit">Explore Careers</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Search and filter live listings or run the background scraper to ingest remote developer roles.
          </p>
        </div>

        {/* Scraper Control (All Roles) */}
        {user && (
          <button
            onClick={handleTriggerScrape}
            disabled={scraping}
            className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-sm transition-all shadow-md shadow-primary/25 disabled:opacity-50 cursor-pointer shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${scraping ? "animate-spin" : ""}`} />
            <span>{scraping ? "Scraping..." : "Trigger Live Scraper"}</span>
          </button>
        )}
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

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Smart Filters Card */}
        <div className="glass-card p-6 rounded-2xl flex flex-col gap-5 border border-border/80 bg-card/65 lg:sticky lg:top-[90px]">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Smart Filters</h2>
            <button 
              onClick={handleClearFilters}
              className="text-xs text-primary hover:text-primary/80 font-bold transition-colors cursor-pointer"
            >
              Clear All
            </button>
          </div>

          {/* Search Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground/80">Search keywords</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Python, React, Remote..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
              />
            </div>
          </div>

          {/* Location filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground/80">Work Location</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="e.g. Remote, US, London..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
              />
            </div>
          </div>

          {/* Job Type Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground/80">Employment Type</label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="FULL_TIME">Full-time</option>
              <option value="PART_TIME">Part-time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>

          {/* Posting Origin Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground/80">Listing Origin</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "", label: "All" },
                { id: "posted", label: "Posted" },
                { id: "scraped", label: "Scraped" }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setOrigin(opt.id)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    origin === opt.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card/50 text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Jobs Listing Feed */}
        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 h-64 gap-3 bg-card/65 rounded-2xl border border-border">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground animate-pulse font-medium">Loading jobs feed...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="glass-card p-12 text-center rounded-2xl border border-border bg-card/65 flex flex-col items-center gap-4">
              <Briefcase className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-foreground font-outfit">No jobs matches found</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Try clearing filters or running the live web scraper to fetch remote developer listings.
                </p>
              </div>
            </div>
          ) : (
            <>
              <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {jobs.map((job) => (
                  <motion.div 
                    variants={itemVariants}
                    layout
                    key={job.id} 
                    className="glass-card p-6 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 border border-border/80 bg-card/65 relative group overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold text-lg text-foreground font-outfit truncate max-w-[80%] group-hover:text-primary transition-colors">
                          {job.title}
                        </h3>
                        {job.is_scraped ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400">
                            <Globe className="h-2.5 w-2.5" />
                            Scraped Remote
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 border border-primary/20 text-primary">
                            <Building className="h-2.5 w-2.5" />
                            Internal Post
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-x-4 gap-y-1 font-medium">
                        <span className="flex items-center gap-1.5 text-foreground/80 font-semibold">
                          <Building className="h-4 w-4 text-primary" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1 capitalize">
                          <Briefcase className="h-4 w-4" />
                          {job.job_type.replace("_", " ").toLowerCase()}
                        </span>
                      </div>

                      {/* Requirements / Tags Cloud */}
                      {job.requirements && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {job.requirements.split(",").map((req, idx) => (
                            <span 
                              key={idx} 
                              className="px-2.5 py-0.5 text-[10px] font-semibold bg-secondary text-secondary-foreground border border-border rounded-md"
                            >
                              {req.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col justify-between sm:justify-end items-end gap-3 shrink-0 border-t border-border/40 sm:border-0 pt-3 sm:pt-0">
                      <span className="text-sm font-bold text-foreground/90">
                        {job.salary_range || "Competitive"}
                      </span>
                      <Link
                        to={`/jobs/${job.id}`}
                        className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/20 cursor-pointer"
                      >
                        View Position
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-border/40 mt-4 select-none">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="px-4 py-2 border border-border bg-card hover:bg-muted text-foreground rounded-xl text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                Previous
              </button>
              <span className="text-xs text-muted-foreground font-semibold">
                Page {page}
              </span>
              <button
                disabled={jobs.length < limit}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border border-border bg-card hover:bg-muted text-foreground rounded-xl text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                Next
              </button>
            </div>
          </>
        )}
        </div>
      </div>
    </motion.div>
  );
};
export default Jobs;
