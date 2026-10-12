import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Clock3,
  History,
  RefreshCw,
  CheckCircle2,
  XCircle,
  LoaderCircle,
  CircleDashed,
} from 'lucide-react';

import {
  getAutomationExecutionHistory,
  type AutomationExecution,
  type AutomationStepResult,
} from '../lib/automationApi';

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    className: string;
    icon: React.ReactNode;
  }
> = {
  queued: {
    label: 'Queued',
    className: 'bg-slate-100 text-slate-700',
    icon: <CircleDashed size={14} />,
  },
  running: {
    label: 'Running',
    className: 'bg-blue-100 text-blue-700',
    icon: <LoaderCircle size={14} />,
  },
  succeeded: {
    label: 'Succeeded',
    className: 'bg-emerald-100 text-emerald-700',
    icon: <CheckCircle2 size={14} />,
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-100 text-red-700',
    icon: <XCircle size={14} />,
  },
  partially_succeeded: {
    label: 'Partially Succeeded',
    className: 'bg-amber-100 text-amber-700',
    icon: <AlertCircle size={14} />,
  },
};

const ACTION_LABELS: Record<string, string> = {
  gmail_send: 'Send Gmail',
  calendar_create: 'Create Calendar Event',
  calendar_update: 'Update Calendar Event',
  drive_folder: 'Create Drive Folder',
  drive_save: 'Save to Drive',
  sheets_write: 'Write to Sheets',
  task_create: 'Create Task',
  notify: 'Send Notification',
};

const formatDateTime = (value: string | null): string => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

const getDuration = (
  startedAt: string | null,
  finishedAt: string | null
): string => {
  if (!startedAt || !finishedAt) return '—';

  const start = new Date(startedAt).getTime();
  const finish = new Date(finishedAt).getTime();

  if (Number.isNaN(start) || Number.isNaN(finish)) {
    return '—';
  }

  const durationMs = Math.max(0, finish - start);

  if (durationMs < 1000) {
    return '<1s';
  }

  const seconds = Math.round(durationMs / 1000);

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: 'bg-slate-100 text-slate-700',
    icon: <CircleDashed size={14} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

const StepResultRow: React.FC<{ result: AutomationStepResult }> = ({
  result,
}) => {
  const succeeded = result.status === 'succeeded';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              succeeded
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {succeeded ? (
              <CheckCircle2 size={18} />
            ) : (
              <XCircle size={18} />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              {ACTION_LABELS[result.action] || result.action}
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              Executed {formatDateTime(result.executed_at)}
            </p>
          </div>
        </div>

        <StatusBadge status={result.status} />
      </div>

      {result.error && (
        <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
          <p className="text-xs font-semibold text-red-700">Error</p>
          <p className="mt-1 break-words text-sm text-red-700">
            {result.error}
          </p>
        </div>
      )}
    </div>
  );
};

const ExecutionRow: React.FC<{
  execution: AutomationExecution;
  expanded: boolean;
  onToggle: () => void;
}> = ({ execution, expanded, onToggle }) => {
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-4 text-left transition hover:bg-slate-50"
      >
        <div className="grid items-center gap-4 md:grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_auto]">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              {expanded ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                {execution.automation_name}
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                Execution #{execution.id}
              </p>
            </div>
          </div>

          <div>
            <StatusBadge status={execution.status} />
          </div>

          <div className="text-sm text-slate-600">
            {formatDateTime(execution.started_at)}
          </div>

          <div className="text-sm text-slate-600">
            {formatDateTime(execution.finished_at)}
          </div>

          <div className="text-sm font-medium text-slate-700">
            {getDuration(execution.started_at, execution.finished_at)}
          </div>

          <div className="text-xs text-slate-500">
            {execution.step_results.length}{' '}
            {execution.step_results.length === 1 ? 'step' : 'steps'}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="bg-slate-50 px-5 pb-5 pt-1">
          <div className="ml-12">
            <div className="mb-3 flex items-center gap-2">
              <History size={16} className="text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-700">
                Step Results
              </h3>
            </div>

            {execution.step_results.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center">
                <p className="text-sm text-slate-500">
                  No step results were recorded for this execution.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {execution.step_results.map((result) => (
                  <StepResultRow key={result.id} result={result} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const AutomationExecutionHistoryPage: React.FC = () => {
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadHistory = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setErrorMessage('');

    try {
      const data = await getAutomationExecutionHistory();
      setExecutions(data);
    } catch (error: any) {
      setErrorMessage(
        error?.message || 'Failed to load automation execution history.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const toggleExecution = (executionId: number) => {
    setExpandedIds((current) => {
      const next = new Set(current);

      if (next.has(executionId)) {
        next.delete(executionId);
      } else {
        next.add(executionId);
      }

      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <History size={18} className="text-indigo-600" />

              <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                Automation
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              Execution History
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review previous automation runs, step results, and errors.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadHistory(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? 'animate-spin' : ''}
            />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />

            <div>
              <p className="text-sm font-semibold">
                Unable to load execution history
              </p>

              <p className="mt-1 text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Main card */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Table heading */}
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <Clock3 size={17} className="text-slate-500" />

              <h2 className="text-sm font-semibold text-slate-800">
                Recent Executions
              </h2>

              {!isLoading && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                  {executions.length}
                </span>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <LoaderCircle size={20} className="animate-spin" />
                Loading execution history...
              </div>
            </div>
          ) : executions.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <History size={22} />
              </div>

              <h3 className="text-sm font-semibold text-slate-800">
                No executions yet
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                Once an automation is executed, its status and step results
                will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table header */}
              <div className="hidden border-b border-slate-200 bg-slate-50 px-5 py-3 md:block">
                <div className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_auto] gap-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <div>Automation</div>
                  <div>Status</div>
                  <div>Started</div>
                  <div>Finished</div>
                  <div>Duration</div>
                  <div>Steps</div>
                </div>
              </div>

              <div>
                {executions.map((execution) => (
                  <ExecutionRow
                    key={execution.id}
                    execution={execution}
                    expanded={expandedIds.has(execution.id)}
                    onToggle={() => toggleExecution(execution.id)}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default AutomationExecutionHistoryPage;