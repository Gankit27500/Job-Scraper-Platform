import api from "./api";

export interface Job {
  id: string;
  posted_by: string | null;
  title: string;
  company: string;
  location: string;
  salary_range: string | null;
  job_type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
  experience_level: string | null;
  description: string;
  requirements: string | null;
  is_scraped: boolean;
  source_url: string | null;
  status: "ACTIVE" | "ARCHIVED";
  created_at: string;
}

export interface JobCreateParams {
  title: string;
  company: string;
  location: string;
  salary_range?: string;
  job_type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
  experience_level?: string;
  description: string;
  requirements?: string;
  source_url?: string;
}

export interface FilterParams {
  search?: string;
  location?: string;
  job_type?: string;
  is_scraped?: boolean;
  limit?: number;
  offset?: number;
}

export const jobsService = {
  getJobs: async (filters: FilterParams = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.location) params.append("location", filters.location);
    if (filters.job_type) params.append("job_type", filters.job_type);
    if (filters.is_scraped !== undefined) params.append("is_scraped", String(filters.is_scraped));
    if (filters.limit !== undefined) params.append("limit", String(filters.limit));
    if (filters.offset !== undefined) params.append("offset", String(filters.offset));

    const response = await api.get<Job[]>(`/jobs?${params.toString()}`);
    return response.data;
  },

  getJobById: async (id: string) => {
    const response = await api.get<Job>(`/jobs/${id}`);
    return response.data;
  },

  createJob: async (jobData: JobCreateParams) => {
    const response = await api.post<Job>("/jobs", jobData);
    return response.data;
  },

  triggerScrape: async () => {
    const response = await api.post("/jobs/trigger-scrape");
    return response.data;
  },
};
export default jobsService;
