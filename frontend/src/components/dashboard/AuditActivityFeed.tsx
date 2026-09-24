import { Shield } from 'lucide-react';
import { MOCK_AUDIT_LOGS } from '../../data/mockData';

export const AuditActivityFeed: React.FC = () => {
  const serviceBadges = {
    gmail: { name: 'Gmail', color: 'bg-red-50 text-red-700 border-red-200' },
    calendar: { name: 'Calendar', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    drive: { name: 'Drive', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    sheets: { name: 'Sheets', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs relative overflow-hidden flex flex-col justify-between">
      {/* Top slate hairline */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Audit Activity</h3>
              <p className="text-xs text-slate-500">Immutable security & workflow event trail</p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
            Audit Ledger
          </span>
        </div>

        <div className="space-y-3">
          {MOCK_AUDIT_LOGS.map((log) => {
            const badge = serviceBadges[log.service];
            return (
              <div
                key={log.id}
                className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-white transition-all text-xs"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${badge.color}`}
                    >
                      {badge.name}
                    </span>
                    <span className="font-mono font-bold text-slate-800">{log.action}</span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {log.timestamp}
                  </span>
                </div>

                <div className="text-slate-700 font-medium truncate">{log.resource}</div>

                {log.details && (
                  <div className="text-slate-500 text-[11px] mt-1 line-clamp-1">{log.details}</div>
                )}

                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Actor: {log.actor}</span>
                  <span
                    className={`font-semibold ${
                      log.status === 'SUCCESS'
                        ? 'text-emerald-600'
                        : log.status === 'WARNING'
                        ? 'text-amber-600'
                        : 'text-red-600'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Verified Google OAuth credentials</span>
        <span className="font-mono text-[11px] text-slate-600">Tamper-evident logs</span>
      </div>
    </div>
  );
};
