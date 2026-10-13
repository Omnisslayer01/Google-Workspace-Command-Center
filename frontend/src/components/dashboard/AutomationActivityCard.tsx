import React, { useEffect, useState } from 'react';
import { Zap, Loader2 } from 'lucide-react';
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
        // The automation API may not have a list endpoint; try it
        const response = await apiFetch<any>('/api/automations/');
        const items = Array.isArray(response)
          ? response
          : Array.isArray(response?.results)
          ? response.results
          : [];
        setAutomations(items);
      } catch (err: any) {
        // If there's no list endpoint or auth error, show empty
        setError(err?.message || 'Could not load automations');
        setAutomations([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs relative overflow-hidden flex flex-col justify-between">
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
              <p className="text-xs text-slate-500">Cross-service event pipeline status</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-slate-400 text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading automations...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-sm text-amber-600">
            {error}
          </div>
        ) : automations.length === 0 ? (
          <div className="text-center py-8">
            <Zap className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">No automation workflows yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Create an automation to see it here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {automations.map((wf) => (
              <div
                key={wf.id}
                className="p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{wf.name}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.2 rounded border ${
                          wf.is_active
                            ? 'bg-emerald-50 text-[#0f9d58] border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {wf.is_active ? 'ACTIVE' : 'PAUSED'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 font-mono">
                  Created: {new Date(wf.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>{automations.length} workflow{automations.length !== 1 ? 's' : ''}</span>
        <span className="font-mono text-[11px] text-slate-600">Automation Engine</span>
      </div>
    </div>
  );
};
