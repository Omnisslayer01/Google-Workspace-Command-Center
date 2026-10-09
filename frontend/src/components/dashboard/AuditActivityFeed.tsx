import React, { useEffect, useState } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { getAuditLogs, AuditLog } from '../../lib/auditApi';

export const AuditActivityFeed: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getAuditLogs();
        setLogs(Array.isArray(result) ? result : []);
      } catch (err: any) {
        setError(err?.message || 'Could not load audit logs');
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
              <p className="text-xs text-slate-500">Security & workflow event trail</p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
            Audit Ledger
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-slate-400 text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading audit logs...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-sm text-amber-600">
            {error}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">No recent activity</p>
            <p className="text-xs text-slate-400 mt-1">
              Audit events will appear here as actions are performed.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-white transition-all text-xs"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800">{log.action}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="text-slate-700 font-medium truncate">
                  {log.target_type}{log.target_id ? ` #${log.target_id}` : ''}
                </div>

                {log.username && (
                  <div className="mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                    Actor: {log.username}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>{logs.length} event{logs.length !== 1 ? 's' : ''}</span>
        <span className="font-mono text-[11px] text-slate-600">Tamper-evident logs</span>
      </div>
    </div>
  );
};
