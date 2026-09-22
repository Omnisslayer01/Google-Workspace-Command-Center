import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
