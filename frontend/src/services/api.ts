import axios from "axios";

// Configured backend host url
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to automatically add JWT access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle JWT token expiration (401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear credentials and force login if token is invalid/expired
      localStorage.removeItem("token");
      if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register") && window.location.pathname !== "/") {
        window.location.href = "/login?expired=true";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
