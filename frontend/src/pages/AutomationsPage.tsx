import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Zap,
  Plus,
  History,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Pause,
  Play,
} from 'lucide-react';

import { Header } from '../components/common/Header';
import {
  getAutomations,
  toggleAutomation,
  deleteAutomation,
  type AutomationItem,
} from '../lib/automationApi';

const TRIGGER_NAMES: Record<string, string> = {
  gmail_new: 'New Gmail Message',
  gmail_search: 'Gmail Search Match',
  calendar_new: 'New Calendar Event',
  calendar_upcoming: 'Upcoming Calendar Event',
  drive_new: 'New Drive File',
  scheduled: 'Scheduled Interval',
  manual: 'Background Workflow',
};

const ACTION_NAMES: Record<string, string> = {
  gmail_send: 'Gmail — Send email',
  calendar_create: 'Calendar — Create event',
  calendar_update: 'Calendar — Update event',
  drive_folder: 'Drive — Create folder',
  drive_save: 'Drive — Save file',
  sheets_write: 'Sheets — Write to sheet',
  task_create: 'Tasks — Create task',
  notify: 'Notification — Send alert',
};

export const AutomationsPage: React.FC = () => {
  const navigate = useNavigate();

  const [automations, setAutomations] = useState<AutomationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fetchAutomations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAutomations();
      setAutomations(data);
    } catch (err: any) {
      console.error('Failed to load automations:', err);
      setError(err?.message || 'Failed to load automations.');
      setAutomations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAutomations();
  }, [fetchAutomations]);

  const handleToggle = async (id: number, currentStatus: boolean, name: string) => {
    setTogglingId(id);
    try {
      const updated = await toggleAutomation(id, !currentStatus);
      setAutomations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_active: updated.is_active } : a))
      );
      setActionMessage({
        type: 'success',
        text: updated.is_active
          ? `Automation "${name}" resumed and running in background.`
          : `Automation "${name}" paused.`,
      });
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err?.message || 'Failed to update automation status.',
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }
    try {
      await deleteAutomation(id);
      setAutomations((prev) => prev.filter((a) => a.id !== id));
      setActionMessage({
        type: 'success',
        text: `Automation "${name}" deleted.`,
      });
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err?.message || `Failed to delete automation "${name}".`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-[#EA4335] selection:text-white">
      <Header />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#EA4335] font-mono">
                Continuous Background Orchestration
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-mono">
                Real-time Event Engine
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Automations
            </h1>
            <p className="mt-1 text-sm text-slate-500 max-w-2xl">
              Workflows run continuously in the background without manual intervention. Trigger on incoming emails, calendar updates, drive uploads, and scheduled checks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchAutomations}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <Link
              to="/automations/history"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              <span>Execution History</span>
            </Link>

            <button
              type="button"
              onClick={() => navigate('/automations/new')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#EA4335] hover:bg-[#d93025] rounded-lg shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Automation</span>
            </button>
          </div>
        </div>

        {/* Notifications / Feedback */}
        {actionMessage && (
          <div
            className={`rounded-xl border p-4 text-sm flex items-start gap-3 ${
              actionMessage.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 font-medium">{actionMessage.text}</div>
            <button
              type="button"
              onClick={() => setActionMessage(null)}
              className="text-xs opacity-70 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#EA4335] animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Loading background automations...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
            <h3 className="text-base font-semibold text-red-900">Failed to Load Automations</h3>
            <p className="text-sm text-red-700 max-w-md mx-auto">{error}</p>
            <button
              type="button"
              onClick={fetchAutomations}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && automations.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-50 text-[#EA4335] flex items-center justify-center shadow-2xs">
              <Zap className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">No Background Automations Yet</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Create background workflows that continuously monitor Gmail, Calendar, Drive, and Sheets to run actions automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/automations/new')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#EA4335] hover:bg-[#d93025] rounded-xl shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Automation</span>
            </button>
          </div>
        )}

        {/* Automations List */}
        {!loading && !error && automations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {automations.map((auto) => {
              const triggerLabel =
                TRIGGER_NAMES[auto.trigger?.type] || auto.trigger?.type || 'Trigger';
              const isToggling = togglingId === auto.id;

              return (
                <div
                  key={auto.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#EA4335]" />

                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-slate-900 truncate">
                          {auto.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Created {new Date(auto.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Status indicator */}
                      {auto.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#0f9d58] border border-emerald-200 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#34A853] animate-pulse" />
                          <span>RUNNING</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span>PAUSED</span>
                        </span>
                      )}
                    </div>

                    {/* Trigger */}
                    <div className="mb-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Active Trigger
                      </div>
                      <div className="font-medium text-slate-800 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-[#EA4335]" />
                        <span>{triggerLabel}</span>
                      </div>
                    </div>

                    {/* Conditions */}
                    {auto.conditions && auto.conditions.length > 0 && (
                      <div className="mb-3 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">Conditions:</span>{' '}
                        {auto.conditions.map((c, i) => (
                          <span key={i} className="inline-block bg-slate-100 px-2 py-0.5 rounded text-[11px] mr-1 mb-1 font-mono">
                            {c.field} {c.operator} &quot;{c.value}&quot;
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mb-4">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Actions ({auto.actions?.length || 0})
                      </div>
                      <div className="space-y-1.5">
                        {auto.actions?.map((act, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50/70 border border-slate-100 px-2.5 py-1.5 rounded-lg"
                          >
                            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {index + 1}
                            </span>
                            <span className="font-medium truncate">
                              {ACTION_NAMES[act.type] || act.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer controls: Pause / Resume + History + Delete */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {auto.is_active ? (
                        <button
                          type="button"
                          onClick={() => handleToggle(auto.id, auto.is_active, auto.name)}
                          disabled={isToggling}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-800 rounded-lg transition-colors shadow-2xs disabled:opacity-50"
                          title="Pause background execution"
                        >
                          {isToggling ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Pause className="w-3.5 h-3.5 text-amber-600" />
                          )}
                          <span>Pause</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggle(auto.id, auto.is_active, auto.name)}
                          disabled={isToggling}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs disabled:opacity-50"
                          title="Resume background execution"
                        >
                          {isToggling ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5 text-white" />
                          )}
                          <span>Resume</span>
                        </button>
                      )}

                      <Link
                        to="/automations/history"
                        className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-0.5 px-2 py-1"
                      >
                        <span>History</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(auto.id, auto.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete automation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default AutomationsPage;
