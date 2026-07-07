import React, { useState, useEffect } from "react";
import jobsService from "../../services/jobs";
import type { Job } from "../../services/jobs";
import { useToast } from "../../context/ToastContext";
import { 
  RefreshCw, 
  Globe, 
  Database, 
  Layers, 
  Activity,
  ArrowRight,
  Link as LinkIcon
} from "lucide-react";
import { motion } from "framer-motion";

export const Scraper: React.FC = () => {
  const { showToast } = useToast();
  
  const [scrapedJobs, setScrapedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);

  const fetchScrapedJobs = async () => {
    try {
      const data = await jobsService.getJobs({ is_scraped: true });
      setScrapedJobs(data);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch scraped jobs history.", "error");
    } {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScrapedJobs();
  }, []);

  const handleStartCrawl = async () => {
    setScraping(true);
    showToast("Background web scraper crawl started...", "info");
    try {
      await jobsService.triggerScrape();
      showToast("Scraper crawl completed! Remote jobs successfully synced.", "success");
      // reload after 2.5s
      setTimeout(() => {
        fetchScrapedJobs();
      }, 2500);
    } catch (err) {
      console.error(err);
      showToast("Failed to connect to crawling engine.", "error");
    } finally {
      setScraping(false);
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
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-outfit">Job Scraper Control</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Trigger, monitor, and synchronize live external listings from remote software boards.
          </p>
        </div>

        <button
          onClick={handleStartCrawl}
          disabled={scraping}
          className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-sm transition-all shadow-lg shadow-primary/25 disabled:opacity-50 cursor-pointer shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${scraping ? "animate-spin" : ""}`} />
          <span>{scraping ? "Crawling Remote Feeds..." : "Run Scraper Crawl"}</span>
        </button>
      </div>

      {/* Metrics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          variants={itemVariants}
          className="glass-card p-6 rounded-2xl flex items-center justify-between border border-border/80 bg-card/65"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Scraped</span>
            <h2 className="text-3xl font-extrabold text-foreground font-outfit">{scrapedJobs.length}</h2>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Database className="h-5 w-5" />
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="glass-card p-6 rounded-2xl flex items-center justify-between border border-border/80 bg-card/65"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Engines</span>
            <h2 className="text-3xl font-extrabold text-foreground font-outfit">1</h2>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Layers className="h-5 w-5" />
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="glass-card p-6 rounded-2xl flex items-center justify-between border border-border/80 bg-card/65"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Crawler Status</span>
            <h2 className="text-3xl font-extrabold text-foreground font-outfit flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${scraping ? "bg-green-500 animate-ping" : "bg-blue-500"}`} />
              <span className="text-lg font-bold">{scraping ? "Active" : "Idle"}</span>
            </h2>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Activity className="h-5 w-5" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Crawler configuration */}
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-border bg-card/65 space-y-6">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-widest border-b border-border pb-3">Scraper Configurations</h2>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-secondary border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-primary" />
                  WeWorkRemotely
                </span>
                <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-bold border border-green-500/25">Enabled</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Fetches active programming roles from WWR's RSS XML feeds. Handles category filters and custom tags.
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
                <LinkIcon className="h-3.5 w-3.5" />
                <span className="truncate">weworkremotely.com/categories/remote-programming-jobs.rss</span>
              </div>
            </div>
            
            <p className="text-xs text-primary bg-primary/10 border border-primary/20 p-3 rounded-xl">
              💡 Running a crawl triggers a background parsing worker. Newly scraped postings are checked against existing links to prevent duplicates and are automatically calculated for student resume compatibility scores.
            </p>
          </div>
        </div>

        {/* Right Side: Scraped Jobs Table List */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-border bg-card/65 space-y-4">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">Parsed Feed Log</h2>

          {scrapedJobs.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No scraped postings cataloged. Trigger a crawl to populate.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border/80 text-muted-foreground font-semibold">
                    <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider">Role Title</th>
                    <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider">Company</th>
                    <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider">Parsed Skills</th>
                    <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {scrapedJobs.slice(0, 8).map((job) => (
                    <tr key={job.id} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-foreground truncate max-w-[150px]">{job.title}</td>
                      <td className="py-3 px-4 text-muted-foreground font-medium">{job.company}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          {job.requirements?.split(",").slice(0, 2).map((req, idx) => (
                            <span 
                              key={idx} 
                              className="px-1.5 py-0.5 text-[9px] bg-secondary text-secondary-foreground rounded border border-border font-semibold"
                            >
                              {req.trim()}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a
                          href={job.source_url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                        >
                          Open Link
                          <ArrowRight className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
export default Scraper;
