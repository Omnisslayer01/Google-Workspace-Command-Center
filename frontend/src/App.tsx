import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { CalendarPage } from './pages/CalendarPage';
import { TasksPage } from './pages/TasksPage';
import { SheetsPage } from './pages/SheetsPage';
import { ConceptIndex } from './pages/ConceptIndex';
import { Concept1Editorial } from './pages/Concept1Editorial';
import { Concept2Visual } from './pages/Concept2Visual';
import { Concept3Warm } from './pages/Concept3Warm';
import { Concept4Colorful } from './pages/Concept4Colorful';
import { Concept5Workspace } from './pages/Concept5Workspace';
import { ConceptDock } from './components/common/ConceptDock';

/**
 * Handles the redirect from the Django Google OAuth callback.
 *
 * Backend redirects to:
 * http://localhost:5173/?access=<token>&refresh=<token>
 *
 * The tokens are stored locally and then removed from the URL.
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
      navigate("/", { replace: true });
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
        {/* Core FS2 Production Routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/sheets" element={<SheetsPage />} />

        {/* Preserved Design Concepts 1–5 & Index for Reviewability */}
        <Route path="/concepts" element={<ConceptIndex />} />
        <Route path="/concept-1" element={<Concept1Editorial />} />
        <Route path="/concept-2" element={<Concept2Visual />} />
        <Route path="/concept-3" element={<Concept3Warm />} />
        <Route path="/concept-4" element={<Concept4Colorful />} />
        <Route path="/concept-5" element={<Concept5Workspace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Concept dock switcher (renders only on concept routes) */}
      <ConceptDock />
    </BrowserRouter>
  );
};

export default App;