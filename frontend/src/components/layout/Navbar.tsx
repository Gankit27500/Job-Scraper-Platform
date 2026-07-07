import React from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { Menu, Sun, Moon, Search, Bell } from "lucide-react";

interface NavbarProps {
  onMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();

  // Simple breadcrumb/page title resolver
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/student/dashboard")) return "Student Dashboard";
    if (path.includes("/student/profile")) return "Profile Settings";
    if (path.includes("/student/applications")) return "Applications History";
    if (path.includes("/manager/dashboard")) return "Manager Dashboard";
    if (path.includes("/manager/post-job")) return "Post a Job";
    if (path.includes("/manager/jobs") && path.includes("/applicants")) return "ATS Pipeline Board";
    if (path.includes("/jobs/")) return "Job Description";
    if (path.includes("/jobs")) return "Jobs Search Board";
    return "Home";
  };

  return (
    <header className="sticky top-0 z-30 w-full h-[72px] glass flex items-center justify-between px-6 border-b border-border/40 selection:bg-indigo-500/20">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger menu */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Page Title */}
        <h2 className="hidden sm:block text-base font-bold text-foreground font-outfit tracking-tight">
          {getPageTitle()}
        </h2>
      </div>

      {/* Center Search Spotlight Mock (Ashby / Stripe style) */}
      <div className="hidden md:flex items-center gap-2 max-w-md w-full mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-[11px] h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search dashboard, applicants, jobs... (Cmd + K)"
            disabled
            className="w-full pl-10 pr-4 py-1.5 rounded-xl border border-border/60 bg-muted/30 text-xs text-foreground placeholder-muted-foreground cursor-not-allowed"
          />
        </div>
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center gap-3">
        {/* Notifications Icon */}
        <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/65 transition-colors cursor-pointer relative">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-ping" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/65 transition-colors cursor-pointer"
          title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
        >
          {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
        </button>

        {/* User initials tag */}
        <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold uppercase select-none">
          {user?.email?.[0] || "U"}
        </div>
      </div>
    </header>
  );
};
export default Navbar;
