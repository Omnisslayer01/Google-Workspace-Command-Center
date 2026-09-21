import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { Concept5Workspace } from "./pages/Concept5Workspace";

/**
 * Handles the redirect from the Django Google OAuth callback.
 *
 * Backend redirects to:
 *
 * http://localhost:5173/?access=<token>&refresh=<token>
 *
 * We store those tokens and then clean the URL.
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

    /*
     * OAuth completed successfully.
     * Remove tokens from the browser URL after storing them.
     */
    if (accessToken || refreshToken) {
      navigate("/", { replace: true });
      return;
    }

    /*
     * If the backend sends an OAuth error, remove it from the URL.
     */
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
        <Route
          path="/"
          element={<Concept5Workspace />}
        />

        <Route
          path="/concept-1"
          element={<Navigate to="/" replace />}
        />

        <Route
          path="/concept-2"
          element={<Navigate to="/" replace />}
        />

        <Route
          path="/concept-3"
          element={<Navigate to="/" replace />}
        />

        <Route
          path="/concept-4"
          element={<Navigate to="/" replace />}
        />

        <Route
          path="/concept-5"
          element={<Navigate to="/" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;