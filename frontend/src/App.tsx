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
        <Route path="/" element={<Concept5Workspace />} />

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