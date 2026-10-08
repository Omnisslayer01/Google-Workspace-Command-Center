import { Zap } from 'lucide-react';
import { MOCK_AUTOMATION_WORKFLOWS } from '../../data/mockData';

export const AutomationActivityCard: React.FC = () => {
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
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded font-medium">
            <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse" />
            <span>Celery Queue Active</span>
          </span>
        </div>

        <div className="space-y-3">
          {MOCK_AUTOMATION_WORKFLOWS.map((wf) => (
            <div
              key={wf.id}
              className="p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{wf.title}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.2 rounded border ${
                        wf.status === 'active'
                          ? 'bg-emerald-50 text-[#0f9d58] border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {wf.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-mono">{wf.trigger}</div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-slate-800 font-mono">{wf.latency}</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">{wf.successRate} OK</div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Runs: {wf.runsCount.toLocaleString()}</span>
                <span>Last executed: {wf.lastRun}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Zero-polling webhooks</span>
        <span className="font-mono text-[11px] text-slate-600">Avg pipeline latency: 780ms</span>
      </div>
    </div>
  );
};
