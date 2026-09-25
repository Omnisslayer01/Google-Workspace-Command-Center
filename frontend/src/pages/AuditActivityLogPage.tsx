import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Filter,
  RefreshCw,
  Search,
  User,
  X,
} from 'lucide-react';

import {
  getAuditLogs,
  type AuditLog,
  type AuditLogFilters,
} from '../lib/auditApi';

const formatDateTime = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

const formatAction = (action: string): string => {
  return action
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatTarget = (log: AuditLog): string => {
  if (!log.target_type && !log.target_id) {
    return '—';
  }

  if (log.target_type && log.target_id) {
    return `${log.target_type} #${log.target_id}`;
  }

  return log.target_type || log.target_id || '—';
};

const formatMetadata = (
  metadata: Record<string, unknown>
): string => {
  if (!metadata || Object.keys(metadata).length === 0) {
    return 'No additional details';
  }

  try {
    return JSON.stringify(metadata, null, 2);
  } catch {
    return 'Unable to display metadata';
  }
};

const getActionBadgeClasses = (action: string): string => {
  const normalized = action.toLowerCase();

  if (
    normalized.includes('delete') ||
    normalized.includes('disconnect') ||
    normalized.includes('remove')
  ) {
    return 'bg-red-50 text-red-700 border-red-200';
  }

  if (
    normalized.includes('create') ||
    normalized.includes('add') ||
    normalized.includes('connect')
  ) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  if (
    normalized.includes('update') ||
    normalized.includes('change') ||
    normalized.includes('edit')
  ) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return 'bg-slate-50 text-slate-700 border-slate-200';
};

export const AuditActivityLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [appliedFilters, setAppliedFilters] =
    useState<AuditLogFilters>({});

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const loadLogs = useCallback(
    async (filters: AuditLogFilters = {}, refreshing = false) => {
      try {
        setError(null);

        if (refreshing) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const data = await getAuditLogs(filters);
        setLogs(data);
      } catch (err: any) {
        setError(
          err?.message ||
            'Failed to load audit activity. Please try again.'
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleApplyFilters = () => {
    const filters: AuditLogFilters = {};

    if (userFilter.trim()) {
      filters.user = userFilter.trim();
    }

    if (actionFilter.trim()) {
      filters.action = actionFilter.trim();
    }

    if (dateFrom) {
      filters.date_from = dateFrom;
    }

    if (dateTo) {
      filters.date_to = dateTo;
    }

    setAppliedFilters(filters);
    setExpandedId(null);
    loadLogs(filters);
  };

  const handleClearFilters = () => {
    setUserFilter('');
    setActionFilter('');
    setDateFrom('');
    setDateTo('');

    setAppliedFilters({});
    setExpandedId(null);

    loadLogs({});
  };

  const handleRefresh = () => {
    loadLogs(appliedFilters, true);
  };

  const activeFilterCount = useMemo(
    () => Object.keys(appliedFilters).length,
    [appliedFilters]
  );

  const hasLogs = logs.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Activity size={21} />
              </div>

              <span className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                Workspace Activity
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Audit Activity Log
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Read-only history of important workspace actions.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={isRefreshing ? 'animate-spin' : ''}
            />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-slate-500" />

              <h2 className="font-semibold text-slate-900">
                Filters
              </h2>

              {activeFilterCount > 0 && (
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                  {activeFilterCount} active
                </span>
              )}
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                <X size={15} />
                Clear filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* User */}
            <div>
              <label
                htmlFor="audit-user"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                User ID
              </label>

              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="audit-user"
                  type="text"
                  value={userFilter}
                  onChange={(event) =>
                    setUserFilter(event.target.value)
                  }
                  placeholder="e.g. 1"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Action */}
            <div>
              <label
                htmlFor="audit-action"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Action
              </label>

              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="audit-action"
                  type="text"
                  value={actionFilter}
                  onChange={(event) =>
                    setActionFilter(event.target.value)
                  }
                  placeholder="e.g. role_changed"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* From */}
            <div>
              <label
                htmlFor="audit-date-from"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                From date
              </label>

              <div className="relative">
                <CalendarDays
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="audit-date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(event) =>
                    setDateFrom(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* To */}
            <div>
              <label
                htmlFor="audit-date-to"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                To date
              </label>

              <div className="relative">
                <CalendarDays
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="audit-date-to"
                  type="date"
                  value={dateTo}
                  onChange={(event) =>
                    setDateTo(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleApplyFilters}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Filter size={16} />
              Apply filters
            </button>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{error}</span>

              <button
                type="button"
                onClick={handleRefresh}
                className="font-semibold underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Audit table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Activity
              </h2>

              {!isLoading && (
                <p className="mt-0.5 text-xs text-slate-500">
                  {logs.length} {logs.length === 1 ? 'record' : 'records'}
                </p>
              )}
            </div>

            <Activity size={19} className="text-slate-400" />
          </div>

          {isLoading ? (
            <div className="space-y-4 p-5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : !hasLogs ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Activity size={25} />
              </div>

              <h3 className="font-semibold text-slate-900">
                No activity found
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                There are no audit records matching the current
                filters.
              </p>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      User
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Target
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Timestamp
                    </th>

                    <th className="w-12 px-3 py-3" />
                  </tr>
                </thead>

                <tbody>
                  {logs.map((log) => {
                    const isExpanded = expandedId === log.id;

                    return (
                      <React.Fragment key={log.id}>
                        <tr className="border-b border-slate-100 transition hover:bg-slate-50">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                <User size={16} />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {log.username || 'Unknown user'}
                                </p>

                                {log.user !== null && (
                                  <p className="text-xs text-slate-400">
                                    User #{log.user}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold ${getActionBadgeClasses(
                                log.action
                              )}`}
                            >
                              {formatAction(log.action)}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {formatTarget(log)}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {formatDateTime(log.created_at)}
                          </td>

                          <td className="px-3 py-4">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedId(
                                  isExpanded ? null : log.id
                                )
                              }
                              aria-label={
                                isExpanded
                                  ? 'Hide audit details'
                                  : 'Show audit details'
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                              {isExpanded ? (
                                <ChevronUp size={17} />
                              ) : (
                                <ChevronDown size={17} />
                              )}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="border-b border-slate-200 bg-slate-50">
                            <td
                              colSpan={5}
                              className="px-5 py-5"
                            >
                              <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Record details
                                  </p>

                                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                                    <dl className="space-y-2 text-sm">
                                      <div className="flex justify-between gap-4">
                                        <dt className="text-slate-500">
                                          Record ID
                                        </dt>
                                        <dd className="font-medium text-slate-800">
                                          #{log.id}
                                        </dd>
                                      </div>

                                      <div className="flex justify-between gap-4">
                                        <dt className="text-slate-500">
                                          User
                                        </dt>
                                        <dd className="font-medium text-slate-800">
                                          {log.username ||
                                            'Unknown'}
                                        </dd>
                                      </div>

                                      <div className="flex justify-between gap-4">
                                        <dt className="text-slate-500">
                                          Action
                                        </dt>
                                        <dd className="font-medium text-slate-800">
                                          {formatAction(
                                            log.action
                                          )}
                                        </dd>
                                      </div>

                                      <div className="flex justify-between gap-4">
                                        <dt className="text-slate-500">
                                          Target type
                                        </dt>
                                        <dd className="font-medium text-slate-800">
                                          {log.target_type ||
                                            '—'}
                                        </dd>
                                      </div>

                                      <div className="flex justify-between gap-4">
                                        <dt className="text-slate-500">
                                          Target ID
                                        </dt>
                                        <dd className="font-medium text-slate-800">
                                          {log.target_id ||
                                            '—'}
                                        </dd>
                                      </div>
                                    </dl>
                                  </div>
                                </div>

                                <div>
                                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Metadata
                                  </p>

                                  <pre className="max-h-52 overflow-auto rounded-xl border border-slate-200 bg-slate-900 p-4 text-xs leading-5 text-slate-100">
                                    {formatMetadata(
                                      log.metadata
                                    )}
                                  </pre>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};