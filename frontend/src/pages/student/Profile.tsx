import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { 
  User, 
  FileText, 
  UploadCloud, 
  Plus, 
  X, 
  Save, 
  FileCheck 
} from "lucide-react";
import { motion } from "framer-motion";

export const Profile: React.FC = () => {
  const { showToast } = useToast();

  // Form fields
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  // Status flags
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.get<{
        full_name?: string;
        bio?: string;
        skills?: string;
        resume_url?: string;
      }>("/profiles/me");

      setFullName(res.data.full_name || "");
      setBio(res.data.bio || "");
      if (res.data.skills) {
        setSkills(res.data.skills.split(",").map((s) => s.trim()).filter(Boolean));
      }
      setResumeUrl(res.data.resume_url || null);
    } catch (err) {
      console.error(err);
      showToast("Failed to load profile details.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put("/profiles/me", {
        full_name: fullName,
        bio: bio,
        skills: skills.join(", ")
      });
      showToast("Profile details updated successfully!", "success");
    } catch (err: any) {
      console.error(err);
      showToast("Failed to update profile settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showToast("Invalid file format. Please upload a PDF document.", "error");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post<{ resume_url: string; parsed_skills?: string }>("/profiles/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setResumeUrl(res.data.resume_url);
      showToast("Resume uploaded and parsed successfully!", "success");
      
      // Auto merge newly parsed skills from Gemini AI parse return
      if (res.data.parsed_skills) {
        const parsed = res.data.parsed_skills.split(",").map((s) => s.trim()).filter(Boolean);
        setSkills(prev => Array.from(new Set([...prev, ...parsed])));
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.detail || "Failed to upload and parse CV.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill) return;
    const cleaned = newSkill.trim();
    if (cleaned && !skills.includes(cleaned)) {
      setSkills([...skills, cleaned]);
    }
    setNewSkill("");
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6 pb-12"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-outfit">My Candidate Profile</h1>
        <p className="text-sm text-muted-foreground font-medium">
          Upload your PDF CV to extract coding skills, and edit your background details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Form Info */}
        <div className="lg:col-span-2 glass-card p-6 md:p-8 rounded-2xl border border-border/80 bg-card/65 shadow-sm space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-3 font-outfit">
              <User className="h-5 w-5 text-primary" />
              Personal Background
            </h2>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
              />
            </div>

            {/* Bio */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Professional Bio
              </label>
              <textarea
                rows={5}
                placeholder="Brief summary of your professional expertise, career goals..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all resize-none"
              />
            </div>

            {/* Skills manager */}
            <div className="space-y-3 pt-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Skills Catalog
              </label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Tailwind, Node.js..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-secondary text-foreground hover:bg-secondary/80 border border-border rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>

              {/* Tag Cloud */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {skills.length === 0 ? (
                  <span className="text-xs text-muted-foreground">No skills registered yet. Complete resume upload to extract.</span>
                ) : (
                  skills.map((skill) => (
                    <span 
                      key={skill} 
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-secondary text-secondary-foreground border border-border rounded-lg"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Save */}
            <div className="flex justify-end pt-2 border-t border-border/60">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 py-2.5 px-6 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-sm transition-all shadow-md shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {saving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: PDF upload details */}
        <div className="space-y-6 lg:sticky lg:top-[90px]">
          {/* Upload panel */}
          <div className="glass-card p-6 rounded-2xl border border-border bg-card/65 shadow-sm space-y-4">
            <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2 border-b border-border pb-3">
              <FileText className="h-4.5 w-4.5 text-primary" />
              CV Attachment
            </h3>

            {resumeUrl ? (
              <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-green-500 shrink-0" />
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">PDF Resume uploaded</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Hiring managers will inspect this document when checking job applications.
                </p>
                <div className="flex justify-end pt-1">
                  <a
                    href={`http://localhost:8000${resumeUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    View Uploaded Resume
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No resume uploaded. Submit your PDF resume to unlock automated AI compatibility analysis.
                </p>
              </div>
            )}

            {/* Drag Drop File Input Input */}
            <div className="relative">
              <input
                type="file"
                accept=".pdf"
                id="resume-upload"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <label
                htmlFor="resume-upload"
                className={`w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-border hover:border-primary/50 bg-card/50 rounded-2xl cursor-pointer hover:bg-card/75 transition-all text-center gap-2 ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {uploading ? (
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                ) : (
                  <>
                    <UploadCloud className="h-8 w-8 text-muted-foreground" />
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-foreground">Click to upload CV</span>
                      <p className="text-[10px] text-muted-foreground">Supported format: PDF only (Max 5MB)</p>
                    </div>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default Profile;
