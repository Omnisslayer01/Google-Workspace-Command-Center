import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Loader2, ArrowRight } from 'lucide-react';
import { apiFetch } from '../../lib/apiClient';

interface AutomationItem {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
}

export const AutomationActivityCard: React.FC = () => {
  const [automations, setAutomations] = useState<AutomationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFetch<any>('/api/automations/');
        const items = Array.isArray(response)
          ? response
          : Array.isArray(response?.results)
          ? response.results
          : [];
        setAutomations(items);
      } catch (err: any) {
        setError(err?.message || 'Could not load automations');
        setAutomations([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs relative overflow-hidden flex flex-col justify-between h-full">
      {/* Top Red hairline (Gmail/Ingestion accent) */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#EA4335]" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-[#EA4335]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Automation Workflows</h3>
              <p className="text-xs text-slate-500">Continuous background pipelines</p>
            </div>
          </div>
          <Link
            to="/automations"
            className="text-xs font-semibold text-[#EA4335] hover:text-[#d93025] flex items-center gap-1 transition-colors group"
          >
            <span>All Workflows</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-slate-400 text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#EA4335]" />
            <span className="text-xs">Loading background workflows...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-xs text-amber-600">
            {error}
          </div>
        ) : automations.length === 0 ? (
          <div className="text-center py-8">
            <Zap className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">No automation workflows yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Create an automation to run tasks in the background.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {automations.slice(0, 4).map((wf) => (
              <div
                key={wf.id}
                className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition-all flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 truncate">{wf.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    Created {new Date(wf.created_at).toLocaleDateString()}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border shrink-0 flex items-center gap-1.5 ${
                    wf.is_active
                      ? 'bg-emerald-50 text-[#0f9d58] border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      wf.is_active ? 'bg-[#34A853] animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  <span>{wf.is_active ? 'RUNNING' : 'PAUSED'}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>{automations.length} active background task{automations.length !== 1 ? 's' : ''}</span>
        <Link to="/automations" className="text-[11px] text-[#EA4335] font-medium hover:underline">
          Manage pipelines →
        </Link>
      </div>
    </div>
  );
};

export default AutomationActivityCard;
