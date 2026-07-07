import React, { useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { motion } from "framer-motion";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex font-inter">
      {/* Background radial highlights */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      {/* Sidebar Component (Desktop and Mobile) */}
      <Sidebar 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        isMobile={true} 
      />
      <Sidebar 
        isOpen={true} 
        isMobile={false} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Navbar */}
        <Navbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* Dynamic Route Content (Animated page transitions) */}
        <motion.main 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto flex flex-col"
        >
          {children}
        </motion.main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};
export default DashboardLayout;
