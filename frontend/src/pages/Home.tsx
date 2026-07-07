import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sparkles, ArrowRight, Briefcase, TrendingUp, ShieldCheck } from "lucide-react";

export const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[130px] pointer-events-none" />

      {/* Header */}
      <nav className="glass border-b border-white/5 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-outfit">
            Antigravity<span className="text-indigo-400">Jobs</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link 
              to={user.role === "HIRING_MANAGER" ? "/manager/dashboard" : "/student/dashboard"} 
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-600/15"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-sm font-medium transition-all"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto py-20 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-300 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="h-3 w-3" />
          Powered by Gemini AI Matching
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight font-outfit mb-6">
          Find your dream job with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Intelligent Matching
          </span>
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mb-10 leading-relaxed font-inter">
          The production-ready job board featuring live scrapedRemote postings, a visual applicant tracking board for managers, and resume skill vector matching.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/jobs"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            Explore Jobs
            <ArrowRight className="h-4 w-4" />
          </Link>
          {!user && (
            <Link
              to="/register"
              className="flex items-center justify-center px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-medium rounded-xl transition-all"
            >
              Post a Job Opening
            </Link>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-24">
          <div className="glass-card p-6 rounded-2xl text-left flex flex-col gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Briefcase className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white font-outfit">Live Web Scrapers</h3>
            <p className="text-sm text-muted-foreground">Aggregates Remote opportunities dynamically directly into your dashboard feed.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl text-left flex flex-col gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white font-outfit">AI Resume Match</h3>
            <p className="text-sm text-muted-foreground">Calculates semantic similarities between CV skills and posting descriptions instantly.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl text-left flex flex-col gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white font-outfit">Visual ATS Kanban</h3>
            <p className="text-sm text-muted-foreground">Drag applicants through stages and update their review statuses in real-time.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground border-t border-white/5 z-10">
        © 2026 Antigravity Jobs Platform. Designed with premium dark aesthetics.
      </footer>
    </div>
  );
};
