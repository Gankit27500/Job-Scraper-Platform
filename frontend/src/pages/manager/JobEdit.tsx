import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import jobsService from "../../services/jobs";
import type { JobCreateParams } from "../../services/jobs";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Edit3, Save, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export const JobEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<JobCreateParams>({
    title: "",
    company: "",
    location: "",
    salary_range: "",
    job_type: "FULL_TIME",
    experience_level: "Mid-Level",
    description: "",
    requirements: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id) return;
      try {
        const job = await jobsService.getJobById(id);
        setFormData({
          title: job.title,
          company: job.company,
          location: job.location,
          salary_range: job.salary_range || "",
          job_type: job.job_type,
          experience_level: job.experience_level || "Mid-Level",
          description: job.description,
          requirements: job.requirements || ""
        });
      } catch (err) {
        console.error(err);
        showToast("Failed to load job listing details.", "error");
        navigate("/manager/jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);

    try {
      await api.put(`/jobs/${id}`, formData);
      showToast("Job opening details updated successfully!", "success");
      navigate("/manager/jobs");
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.detail || "Failed to update job details.", "error");
    } finally {
      setSaving(false);
    }
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
      className="max-w-3xl mx-auto space-y-6 pb-12"
    >
      <div>
        <Link to="/manager/jobs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" /> Back to Manage Jobs
        </Link>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-outfit">Edit Job Opening</h1>
        <p className="text-sm text-muted-foreground font-medium">
          Modify position requirements, specifications, and details.
        </p>
      </div>

      <div className="glass-card p-6 md:p-8 rounded-2xl border border-border/80 bg-card/65 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-3 font-outfit">
            <Edit3 className="h-5 w-5 text-primary" />
            Update Position Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Job Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Lead React Developer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
              />
            </div>

            {/* Company */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Company Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Antigravity Corp"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
              />
            </div>

            {/* Location */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Work Location
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Remote / New York"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
              />
            </div>

            {/* Salary Range */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Salary Range
              </label>
              <input
                type="text"
                placeholder="e.g. $100k - $120k"
                value={formData.salary_range}
                onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
              />
            </div>

            {/* Job Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Employment Type
              </label>
              <select
                value={formData.job_type}
                onChange={(e) => setFormData({ ...formData, job_type: e.target.value as any })}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>

            {/* Experience Level */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Experience Level
              </label>
              <input
                type="text"
                placeholder="e.g. Mid-Level / Senior"
                value={formData.experience_level}
                onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
              />
            </div>
          </div>

          {/* Requirements / Tags */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Required Skills (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. React, Node.js, TypeScript, PostgreSQL"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Comma-separated skills list used directly by the AI model for resume parsing similarity calculations.
            </p>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Job Description
            </label>
            <textarea
              rows={8}
              required
              placeholder="Provide a detailed description of role tasks, benefits, and expectations..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
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
    </motion.div>
  );
};
export default JobEdit;
