import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background text-foreground overflow-hidden px-4 transition-colors duration-300">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Floating Theme Toggle in Auth Layout */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-sm"
          title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
        >
          {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
        </button>
      </div>

      <div className="w-full max-w-[450px] z-10">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center mb-8 gap-2">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground font-outfit">
              Antigravity<span className="text-primary">Jobs</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground font-medium">AI-Powered Job Platform</p>
        </div>

        {/* Content Card (Notion/Ashby style wrapper card) */}
        <div className="glass-card p-8 rounded-2xl border border-border/80 bg-card/65 shadow-md">
          {children}
        </div>
      </div>
    </div>
  );
};
export default AuthLayout;
