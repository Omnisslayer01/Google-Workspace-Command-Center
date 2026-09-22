import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Concept5Workspace } from './pages/Concept5Workspace';

// Scroll to top on route change helper
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
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Concept5Workspace />} />
        <Route path="/concept-1" element={<Navigate to="/" replace />} />
        <Route path="/concept-2" element={<Navigate to="/" replace />} />
        <Route path="/concept-3" element={<Navigate to="/" replace />} />
        <Route path="/concept-4" element={<Navigate to="/" replace />} />
        <Route path="/concept-5" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
