import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { ProtectedRoute, GuestRoute } from "./components/common/RouteGuards";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { AuthLayout } from "./layouts/AuthLayout";

// Page Components
import { Home } from "./pages/Home";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { Jobs } from "./pages/Jobs";
import { JobDetails } from "./pages/JobDetails";
import { Apply } from "./pages/Apply";

// Student Pages
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { Profile } from "./pages/student/Profile";
import { Applications } from "./pages/student/Applications";

// Manager Pages
import { ManagerDashboard } from "./pages/manager/ManagerDashboard";
import { JobPost } from "./pages/manager/JobPost";
import { Applicants } from "./pages/manager/Applicants";
import { Scraper } from "./pages/manager/Scraper";
import { ManageJobs } from "./pages/manager/ManageJobs";
import { Analytics } from "./pages/manager/Analytics";
import { JobEdit } from "./pages/manager/JobEdit";
import { Settings } from "./pages/Settings";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
        <Routes>
          {/* Public Home Landing Route */}
          <Route path="/" element={<Home />} />

          {/* Guest Only Auth Routes */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <AuthLayout>
                  <Login />
                </AuthLayout>
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <AuthLayout>
                  <Register />
                </AuthLayout>
              </GuestRoute>
            }
          />

          {/* Job Listings Routes (Partially Public/Shared layout) */}
          <Route
            path="/jobs"
            element={
              <DashboardLayout>
                <Jobs />
              </DashboardLayout>
            }
          />
          <Route
            path="/jobs/:id"
            element={
              <DashboardLayout>
                <JobDetails />
              </DashboardLayout>
            }
          />

          {/* Student Dedicated Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <DashboardLayout>
                  <StudentDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/applications"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <DashboardLayout>
                  <Applications />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:id/apply"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <DashboardLayout>
                  <Apply />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Hiring Manager Dedicated Routes */}
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute allowedRoles={["HIRING_MANAGER"]}>
                <DashboardLayout>
                  <ManagerDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/jobs"
            element={
              <ProtectedRoute allowedRoles={["HIRING_MANAGER"]}>
                <DashboardLayout>
                  <ManageJobs />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/analytics"
            element={
              <ProtectedRoute allowedRoles={["HIRING_MANAGER"]}>
                <DashboardLayout>
                  <Analytics />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/post-job"
            element={
              <ProtectedRoute allowedRoles={["HIRING_MANAGER"]}>
                <DashboardLayout>
                  <JobPost />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/jobs/:id/applicants"
            element={
              <ProtectedRoute allowedRoles={["HIRING_MANAGER"]}>
                <DashboardLayout>
                  <Applicants />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/jobs/:id/edit"
            element={
              <ProtectedRoute allowedRoles={["HIRING_MANAGER"]}>
                <DashboardLayout>
                  <JobEdit />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/scraper"
            element={
              <ProtectedRoute allowedRoles={["HIRING_MANAGER"]}>
                <DashboardLayout>
                  <Scraper />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
