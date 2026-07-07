import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-card/45 border-t border-border/40 py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground mt-auto select-none">
      <div>
        <span>© 2026 Antigravity Jobs Platform. Modern SaaS ATS.</span>
      </div>
      <div className="flex items-center gap-4">
        <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
        <div className="flex items-center gap-1.5 pl-2 border-l border-border/60">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span>System Online</span>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
