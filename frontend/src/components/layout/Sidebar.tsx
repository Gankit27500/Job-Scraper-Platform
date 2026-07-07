import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  User as UserIcon, 
  FileText, 
  LayoutDashboard, 
  PlusCircle, 
  LogOut, 
  Sparkles,
  ChevronLeft,
  RefreshCw,
  BarChart2,
  Settings as SettingsIcon
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  isMobile: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isMobile }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getNavigationLinks = () => {
    if (!user) return [];

    if (user.role === "STUDENT") {
      return [
        { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/jobs", label: "Search Jobs", icon: Briefcase },
        { to: "/student/applications", label: "My Applications", icon: FileText },
        { to: "/student/profile", label: "My Profile", icon: UserIcon },
        { to: "/settings", label: "Settings", icon: SettingsIcon },
      ];
    } else {
      return [
        { to: "/manager/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/manager/jobs", label: "Manage Jobs", icon: Briefcase },
        { to: "/manager/post-job", label: "Post a Job", icon: PlusCircle },
        { to: "/manager/scraper", label: "Job Scraper", icon: RefreshCw },
        { to: "/manager/analytics", label: "Analytics", icon: BarChart2 },
        { to: "/settings", label: "Settings", icon: SettingsIcon },
      ];
    }
  };

  const navLinks = getNavigationLinks();

  const sidebarContent = (
    <div className="h-full flex flex-col bg-card border-r border-border/60 text-foreground w-64 p-4 gap-4 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground font-outfit">
            Antigravity<span className="text-primary">Jobs</span>
          </span>
        </Link>
        {isMobile && onClose && (
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 flex flex-col gap-1.5 pt-4">
        <span className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
          Navigation
        </span>
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => isMobile && onClose && onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/65"
                }`
              }
            >
              {isActive && (
                <motion.div 
                  layoutId="activeSideIndicator"
                  className="absolute left-0 w-1 h-5 rounded-r bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-105 duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Profile & Footer */}
      <div className="pt-4 border-t border-border/60 space-y-3">
        <div className="flex items-center gap-3 px-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold uppercase shrink-0">
            {user?.email?.[0] || "U"}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-foreground truncate">{user?.email}</span>
            <span className="text-[10px] text-muted-foreground capitalize truncate">
              {user?.role?.replace("_", " ").toLowerCase()}
            </span>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Persistent) */}
      {!isMobile && (
        <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0">
          {sidebarContent}
        </aside>
      )}

      {/* Mobile Drawer (Animated Slide-in) */}
      {isMobile && (
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Overlay Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black z-40 md:hidden"
              />
              {/* Drawer Container */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                className="fixed inset-y-0 left-0 z-50 md:hidden h-full"
              >
                {sidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      )}
    </>
  );
};
export default Sidebar;
