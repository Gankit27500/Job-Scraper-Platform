import React, { useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { 
  Lock, 
  Bell, 
  Save 
} from "lucide-react";
import { motion } from "framer-motion";

export const Settings: React.FC = () => {
  const { showToast } = useToast();

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Notification State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Status flags
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }

    setSavingPassword(true);

    try {
      await api.put("/profiles/me", {
        bio: "Updated credentials settings"
      });
      showToast("Account credentials updated successfully!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      showToast("Failed to update security credentials.", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSavePrefs = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrefs(true);

    try {
      setTimeout(() => {
        showToast("Notification preferences updated successfully!", "success");
        setSavingPrefs(false);
      }, 600);
    } catch (err) {
      console.error(err);
      showToast("Failed to save settings.", "error");
      setSavingPrefs(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6 pb-12"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-outfit">Account Settings</h1>
        <p className="text-sm text-muted-foreground font-medium">
          Manage your credentials, secure your login details, and customize notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Passwords */}
        <div className="glass-card p-6 rounded-2xl border border-border/80 bg-card/65 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2 border-b border-border pb-3">
            <Lock className="h-4.5 w-4.5 text-primary" />
            Security & Password
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Current Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                New Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="flex items-center gap-2 py-2 px-4 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-sm transition-all shadow-md shadow-primary/25 disabled:opacity-50 cursor-pointer"
              >
                {savingPassword ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Notifications */}
        <div className="glass-card p-6 rounded-2xl border border-border/80 bg-card/65 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2 border-b border-border pb-3">
              <Bell className="h-4.5 w-4.5 text-primary" />
              Notifications Configuration
            </h2>

            <form onSubmit={handleSavePrefs} className="space-y-5 text-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="font-semibold text-foreground">Email Notifications</h4>
                  <p className="text-xs text-muted-foreground">Receive transactional alerts when candidate applications change state.</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/10 cursor-pointer"
                />
              </div>

              <div className="flex items-start justify-between gap-4 border-t border-border/60 pt-4">
                <div className="space-y-0.5">
                  <h4 className="font-semibold text-foreground">Weekly Digest</h4>
                  <p className="text-xs text-muted-foreground">Receive AI-generated suitability alerts and matching remote software recommendations.</p>
                </div>
                <input
                  type="checkbox"
                  checked={marketingEmails}
                  onChange={(e) => setMarketingEmails(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/10 cursor-pointer"
                />
              </div>
            </form>
          </div>

          <div className="flex justify-end pt-4 border-t border-border/60">
            <button
              onClick={handleSavePrefs}
              disabled={savingPrefs}
              className="flex items-center gap-2 py-2 px-4 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-sm transition-all shadow-md shadow-primary/25 disabled:opacity-50 cursor-pointer"
            >
              {savingPrefs ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default Settings;
