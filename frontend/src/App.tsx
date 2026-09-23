import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { Dashboard } from "./pages/Dashboard";
import { CalendarPage } from "./pages/CalendarPage";
import { TasksPage } from "./pages/TasksPage";
import { SheetsPage } from "./pages/SheetsPage";
import { Concept5Workspace } from "./pages/Concept5Workspace";
import { DrivePage } from "./pages/DrivePage";
import { AutomationBuilderPage } from "./pages/AutomationBuilderPage";


/**
 * Handles the Google OAuth callback.
 *
 * Google redirects back to the frontend with:
 * ?access=...
 * ?refresh=...
 */
const OAuthCallbackHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const accessToken = params.get("access");
    const refreshToken = params.get("refresh");
    const oauthError = params.get("error");

    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
    }

    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }

    if (accessToken || refreshToken) {
      navigate("/dashboard", { replace: true });
      return;
    }

    if (oauthError) {
      console.error("Google OAuth error:", oauthError);
      navigate("/", { replace: true });
    }
  }, [location.search, navigate]);

  return null;
};

/**
 * Protects pages that require authentication.
 *
 * If there is no access token, the user is sent back
 * to the public landing page.
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const accessToken = localStorage.getItem("access_token");

  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

/**
 * Scroll to the top whenever the route changes.
 */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <OAuthCallbackHandler />
      <ScrollToTop />

      <Routes>
        {/* ================= PUBLIC ================= */}

        {/* Landing page */}
        <Route path="/" element={<Concept5Workspace />} />

        {/* ================= PROTECTED ================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />

        <Route path="/drive" element={<DrivePage />} />

        <Route
          path="/automations/new"
          element={<AutomationBuilderPage />}
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sheets"
          element={
            <ProtectedRoute>
              <SheetsPage />
            </ProtectedRoute>
          }
        />

        {/* Old concept route → public landing page */}
        <Route
          path="/concept-5"
          element={<Navigate to="/" replace />}
        />

        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;