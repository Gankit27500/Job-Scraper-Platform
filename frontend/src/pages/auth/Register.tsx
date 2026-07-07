import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { UserRole } from "../../context/AuthContext";
import { Mail, Lock, UserPlus, AlertCircle, GraduationCap, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("STUDENT");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(email, password, role);
      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        "Failed to register. Email may already be in use."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-1 text-center sm:text-left">
        <h2 className="text-xl font-bold tracking-tight text-foreground font-outfit">Create an account</h2>
        <p className="text-sm text-muted-foreground">
          Enter your details below to set up your account
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 text-xs bg-destructive/10 border border-destructive/20 rounded-xl text-destructive font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Role Selection Tabs */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            I want to join as a
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Student Card Selector */}
            <button
              type="button"
              onClick={() => setRole("STUDENT")}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-sm font-semibold transition-all duration-200 gap-1.5 cursor-pointer relative overflow-hidden ${
                role === "STUDENT"
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border bg-card/50 text-muted-foreground hover:text-foreground hover:border-border/80"
              }`}
            >
              <GraduationCap className="h-5 w-5" />
              <span>Student</span>
            </button>
            {/* Manager Card Selector */}
            <button
              type="button"
              onClick={() => setRole("HIRING_MANAGER")}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-sm font-semibold transition-all duration-200 gap-1.5 cursor-pointer relative overflow-hidden ${
                role === "HIRING_MANAGER"
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border bg-card/50 text-muted-foreground hover:text-foreground hover:border-border/80"
              }`}
            >
              <Briefcase className="h-5 w-5" />
              <span>Hiring Manager</span>
            </button>
          </div>
        </div>

        {/* Email Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            />
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-all shadow-md shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Sign Up
            </>
          )}
        </button>
      </form>

      <div className="text-center text-sm text-muted-foreground mt-2">
        Already have an account?{" "}
        <Link to="/login" className="text-primary hover:text-primary/80 font-bold transition-colors">
          Sign in
        </Link>
      </div>
    </motion.div>
  );
};
export default Register;
