import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isExpired = searchParams.get("expired") === "true";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        "Failed to log in. Please check your credentials."
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
        <h2 className="text-xl font-bold tracking-tight text-foreground font-outfit">Welcome back</h2>
        <p className="text-sm text-muted-foreground">
          Enter your email to sign in to your account
        </p>
      </div>

      {isExpired && (
        <div className="flex items-center gap-2.5 p-3.5 text-xs bg-primary/10 border border-primary/20 rounded-xl text-primary font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Your session has expired. Please sign in again.</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 text-xs bg-destructive/10 border border-destructive/20 rounded-xl text-destructive font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              <LogIn className="h-4 w-4" />
              Sign In
            </>
          )}
        </button>
      </form>

      <div className="text-center text-sm text-muted-foreground mt-2">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="text-primary hover:text-primary/80 font-bold transition-colors">
          Sign up
        </Link>
      </div>
    </motion.div>
  );
};
export default Login;
