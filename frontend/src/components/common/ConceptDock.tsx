import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Eye, ChevronDown, ChevronUp, Layers } from 'lucide-react';

export const ConceptDock: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Keep production dashboard visually clean: do not render dock on core production pages
  const isConceptRoute =
    location.pathname.startsWith('/concept') || location.pathname === '/concepts';
  if (!isConceptRoute) {
    return null;
  }

  const concepts = [
    { path: '/', label: '← Command Center', tag: 'Live App' },
    { path: '/concepts', label: 'Index', tag: 'All Concepts' },
    { path: '/concept-1', label: 'Concept 1', tag: 'Editorial' },
    { path: '/concept-2', label: 'Concept 2', tag: 'Visual' },
    { path: '/concept-3', label: 'Concept 3', tag: 'Warm' },
    { path: '/concept-4', label: 'Concept 4', tag: 'Colorful' },
  const concepts = [
    { path: '/', label: 'Overview', tag: 'All Concepts' },
    { path: '/concept-1', label: 'Concept 1', tag: 'Editorial / Swiss' },
    { path: '/concept-2', label: 'Concept 2', tag: 'Product / Visual' },
    { path: '/concept-3', label: 'Concept 3', tag: 'Warm / Human' },
    { path: '/concept-4', label: 'Concept 4', tag: 'Colorful / Modern' },
    { path: '/concept-5', label: 'Concept 5', tag: 'Workspace' },
  ];

  return (
    <aside aria-label="Concept Switcher" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-200">
      <div className="bg-zinc-950 text-white text-xs font-sans rounded-full shadow-2xl border border-zinc-800 p-1.5 flex items-center gap-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="px-2.5 py-1 text-zinc-400 hover:text-white flex items-center gap-1.5 rounded-full transition-colors"
          title={collapsed ? "Expand Concept Switcher" : "Collapse"}
        >
          <Layers className="w-3.5 h-3.5 text-zinc-300" />
          <span className="font-semibold uppercase tracking-wider text-[10px] text-zinc-300">Concepts</span>
          {collapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {!collapsed && (
          <div className="flex items-center gap-1 border-l border-zinc-800 pl-1">
            {concepts.map((concept) => {
              const isActive = location.pathname === concept.path;
              return (
                <Link
                  key={concept.path}
                  to={concept.path}
                  className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  {isActive && <Eye className="w-3 h-3 text-zinc-950" />}
                  <span>{concept.label}</span>
                  <span className={`text-[10px] hidden sm:inline ${isActive ? 'text-zinc-600' : 'text-zinc-500'}`}>
                    ({concept.tag})
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
