import React, { useEffect, useState, useCallback } from 'react';
import {
  Mail,
  CalendarDays,
  HardDrive,
  RefreshCw,
  Plus,
  X,
  AlertTriangle,
  Table,
} from 'lucide-react';

import { Header } from '../components/common/Header';
import { MetricCard } from '../components/common/MetricCard';
import { WorkspaceStatusBanner } from '../components/dashboard/WorkspaceStatusBanner';
import { TodayScheduleCard } from '../components/dashboard/TodayScheduleCard';
import { RecentDriveFilesCard } from '../components/dashboard/RecentDriveFilesCard';
import { PendingTasksCard } from '../components/dashboard/PendingTasksCard';
import { SheetsSummaryCard } from '../components/dashboard/SheetsSummaryCard';
import { AutomationActivityCard } from '../components/dashboard/AutomationActivityCard';
import { RecentEmailsCard } from '../components/dashboard/RecentEmailsCard';

import { calendarApi } from '../lib/calendarApi';
import { tasksApi } from '../lib/tasksApi';
import { sheetsApi } from '../lib/sheetsApi';
import { listDriveFiles } from '../lib/driveApi';
import { listGmailMessages } from '../lib/gmailApi';

import {
  CalendarEvent,
  WorkspaceTask,
  SpreadsheetItem,
  DriveFileItem,
} from '../types';
import type { GmailMessageStub } from '../types/gmail';

import { ApiAuthError } from '../lib/apiClient';

/* ─────────────────────────────────────────────
   Widget management – persisted in localStorage
   ───────────────────────────────────────────── */

type WidgetId =
  | 'schedule'
  | 'tasks'
  | 'drive'
  | 'sheets'
  | 'gmail'
  | 'automation';

const ALL_WIDGETS: { id: WidgetId; label: string }[] = [
  { id: 'schedule', label: "Today's Schedule" },
  { id: 'tasks', label: 'Pending Tasks' },
  { id: 'drive', label: 'Recent Drive Files' },
  { id: 'sheets', label: 'Sheets Summary' },
  { id: 'gmail', label: 'Recent Emails' },
  { id: 'automation', label: 'Automation Workflows' },
];

const WIDGET_STORAGE_KEY = 'gwcc_dashboard_widgets_v2';

function loadWidgetPrefs(): WidgetId[] {
  try {
    const stored = localStorage.getItem(WIDGET_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // filter out any old removed widgets (like 'audit')
        const valid = parsed.filter((id) =>
          ALL_WIDGETS.some((w) => w.id === id)
        ) as WidgetId[];
        if (valid.length > 0) return valid;
      }
    }
  } catch {
    /* use default */
  }
  return ALL_WIDGETS.map((w) => w.id);
}

function saveWidgetPrefs(widgets: WidgetId[]) {
  localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(widgets));
}

export const Dashboard: React.FC = () => {
  /* ── data state ── */
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  const [sheets, setSheets] = useState<SpreadsheetItem[]>([]);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [gmailMessages, setGmailMessages] = useState<GmailMessageStub[]>([]);
  const [gmailEstimate, setGmailEstimate] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'live' | 'error'>('live');

  /* ── per-widget error tracking ── */
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [sheetsError, setSheetsError] = useState<string | null>(null);
  const [gmailError, setGmailError] = useState<string | null>(null);

  /* ── widget management ── */
  const [activeWidgets, setActiveWidgets] = useState<WidgetId[]>(loadWidgetPrefs);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);

  const toggleWidget = (id: WidgetId) => {
    setActiveWidgets((prev) => {
      const next = prev.includes(id)
        ? prev.filter((w) => w !== id)
        : [...prev, id];
      saveWidgetPrefs(next);
      return next;
    });
  };

  const removeWidget = (id: WidgetId) => {
    setActiveWidgets((prev) => {
      const next = prev.filter((w) => w !== id);
      saveWidgetPrefs(next);
      return next;
    });
  };

  const normalizeArray = <T,>(value: any): T[] => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.results)) return value.results;
    if (Array.isArray(value?.data)) return value.data;
    return [];
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setAuthError(null);
    setCalendarError(null);
    setTasksError(null);
    setDriveError(null);
    setSheetsError(null);
    setGmailError(null);

    // 1. CALENDAR
    try {
      const result = await calendarApi.listEvents();
      setEvents(normalizeArray<CalendarEvent>(result?.data));
      if (result?.source) setDataSource(result.source);
    } catch (err: any) {
      if (err instanceof ApiAuthError) setAuthError(err.message);
      setCalendarError(err?.message || 'Calendar unavailable');
      setEvents([]);
    }

    // 2. TASKS
    try {
      await tasksApi.syncTasks();

      const result = await tasksApi.listTasks();
      setTasks(normalizeArray<WorkspaceTask>(result?.data));
    } catch (err: any) {
      setTasksError(err?.message || 'Tasks unavailable');
      setTasks([]);
    }

    // 3. GOOGLE SHEETS
    try {
      const result = await sheetsApi.getSpreadsheets();
      setSheets(normalizeArray<SpreadsheetItem>(result?.data));
    } catch (err: any) {
      setSheetsError(err?.message || 'Sheets unavailable');
      setSheets([]);
    }

    // 4. DRIVE
    try {
      const result = await listDriveFiles();
      setDriveFiles(Array.isArray(result) ? result : []);
    } catch (err: any) {
      setDriveError(err?.message || 'Drive unavailable');
      setDriveFiles([]);
    }

    // 5. GMAIL
    try {
      const result = await listGmailMessages({ max_results: 10 });
      setGmailMessages(result?.messages || []);
      setGmailEstimate(result?.result_size_estimate ?? null);
    } catch (err: any) {
      setGmailError(err?.message || 'Gmail unavailable');
      setGmailMessages([]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleTask = async (id: string) => {
    try {
      const updated = await tasksApi.toggleComplete(id);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? updated : t))
      );
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const isWidgetActive = (id: WidgetId) => activeWidgets.includes(id);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-[#4285F4] selection:text-white">
      <Header />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#4285F4] font-mono">
                Command Center Overview
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-mono">
                Real-time Workspace Orchestration
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Your workspace at a glance.
            </h1>

            <p className="mt-1 text-sm text-slate-500 max-w-3xl">
              Unified operational control for Gmail ingestion,
              Calendar schedules, Drive governance, and Sheets ledgers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Add Widget */}
            <button
              type="button"
              onClick={() => setShowWidgetPicker(!showWidgetPicker)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Customize Widgets</span>
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
              />
              <span>
                {loading ? 'Syncing...' : 'Sync Workspace'}
              </span>
            </button>

            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[#0f9d58] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse" />
              <span>System Operational</span>
            </div>
          </div>
        </div>

        {/* Widget Picker Dropdown */}
        {showWidgetPicker && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Dashboard Widgets</h3>
              <button
                type="button"
                onClick={() => setShowWidgetPicker(false)}
                className="p-1 rounded hover:bg-slate-100"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_WIDGETS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => toggleWidget(w.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    isWidgetActive(w.id)
                      ? 'bg-[#4285F4] text-white border-[#4285F4]'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* WORKSPACE STATUS */}
        <section aria-label="Workspace Status">
          <WorkspaceStatusBanner
            authError={authError}
            dataSource={dataSource}
          />
        </section>

        {/* METRICS - Real live data including Gmail */}
        {/* METRICS - 4 Core Google Workspace Services in Perfect 4-Column Symmetry */}
        <section
          aria-label="Command Center Metrics"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Gmail */}
          <MetricCard
            label="Gmail Inbox"
            value={
              loading
                ? '...'
                : gmailEstimate !== null
                ? `${gmailEstimate} Emails`
                : `${gmailMessages.length} Emails`
            }
            change={gmailError ? 'Unavailable' : 'Live'}
            changeType={gmailError ? 'negative' : 'positive'}
            subtext={gmailError || 'From Gmail Inbox'}
            icon={Mail}
            topColor="#EA4335"
          />

          {/* Calendar */}
          <MetricCard
            label="Calendar Events"
            value={loading ? '...' : `${events.length} Events`}
            change={calendarError ? 'Unavailable' : 'Live'}
            changeType={calendarError ? 'negative' : 'positive'}
            subtext={calendarError || 'From Google Calendar'}
            icon={CalendarDays}
            topColor="#4285F4"
          />

          {/* Drive Files */}
          <MetricCard
            label="Drive Files"
            value={loading ? '...' : `${driveFiles.length} Files`}
            change={driveError ? 'Unavailable' : 'Live'}
            changeType={driveError ? 'negative' : 'positive'}
            subtext={driveError || 'From Google Drive'}
            icon={HardDrive}
            topColor="#FBBC04"
          />

          {/* Sheets */}
          <MetricCard
            label="Spreadsheets"
            value={loading ? '...' : `${sheets.length} Sheets`}
            change={sheetsError ? 'Unavailable' : 'Live'}
            changeType={sheetsError ? 'negative' : 'positive'}
            subtext={sheetsError || 'From Google Sheets'}
            icon={Table}
            topColor="#34A853"
          />
        </section>

        {/* ROW 1: SCHEDULE + TASKS (Perfect 2-column alignment) */}
        {(isWidgetActive('schedule') || isWidgetActive('tasks')) && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {isWidgetActive('schedule') && (
              <div className={`${isWidgetActive('tasks') ? 'col-span-1' : 'lg:col-span-2'} relative group flex flex-col h-full`}>
                <button
                  type="button"
                  onClick={() => removeWidget('schedule')}
                  className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                  title="Remove widget"
                >
                  <X className="w-3 h-3 text-slate-400" />
                </button>
                {calendarError ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs h-full flex items-center">
                    <div className="flex items-center gap-2 text-amber-600 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{calendarError}</span>
                    </div>
                  </div>
                ) : (
                  <TodayScheduleCard events={events} />
                )}
              </div>
            )}

            {isWidgetActive('tasks') && (
              <div className={`${isWidgetActive('schedule') ? 'col-span-1' : 'lg:col-span-2'} relative group flex flex-col h-full`}>
                <button
                  type="button"
                  onClick={() => removeWidget('tasks')}
                  className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                  title="Remove widget"
                >
                  <X className="w-3 h-3 text-slate-400" />
                </button>
                {tasksError ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs h-full flex items-center">
                    <div className="flex items-center gap-2 text-amber-600 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{tasksError}</span>
                    </div>
                  </div>
                ) : (
                  <PendingTasksCard
                    tasks={tasks}
                    onToggleTask={handleToggleTask}
                  />
                )}
              </div>
            )}
          </section>
        )}

        {/* ROW 2: DRIVE + SHEETS (Perfect 2-column alignment) */}
        {(isWidgetActive('drive') || isWidgetActive('sheets')) && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {isWidgetActive('drive') && (
              <div className={`${isWidgetActive('sheets') ? 'col-span-1' : 'lg:col-span-2'} relative group flex flex-col h-full`}>
                <button
                  type="button"
                  onClick={() => removeWidget('drive')}
                  className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                  title="Remove widget"
                >
                  <X className="w-3 h-3 text-slate-400" />
                </button>
                {driveError ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs h-full flex items-center">
                    <div className="flex items-center gap-2 text-amber-600 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{driveError}</span>
                    </div>
                  </div>
                ) : (
                  <RecentDriveFilesCard files={driveFiles} />
                )}
              </div>
            )}

            {isWidgetActive('sheets') && (
              <div className={`${isWidgetActive('drive') ? 'col-span-1' : 'lg:col-span-2'} relative group flex flex-col h-full`}>
                <button
                  type="button"
                  onClick={() => removeWidget('sheets')}
                  className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                  title="Remove widget"
                >
                  <X className="w-3 h-3 text-slate-400" />
                </button>
                <SheetsSummaryCard sheets={sheets} />
              </div>
            )}
          </section>
        )}

        {/* ROW 3: GMAIL + AUTOMATION (Replaces audit log, perfect 2-column alignment) */}
        {(isWidgetActive('gmail') || isWidgetActive('automation')) && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {isWidgetActive('gmail') && (
              <div className={`${isWidgetActive('automation') ? 'col-span-1' : 'lg:col-span-2'} relative group flex flex-col h-full`}>
                <button
                  type="button"
                  onClick={() => removeWidget('gmail')}
                  className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                  title="Remove widget"
                >
                  <X className="w-3 h-3 text-slate-400" />
                </button>
                <RecentEmailsCard
                  messages={gmailMessages}
                  loading={loading}
                  error={gmailError}
                  totalEstimate={gmailEstimate}
                />
              </div>
            )}

            {isWidgetActive('automation') && (
              <div className={`${isWidgetActive('gmail') ? 'col-span-1' : 'lg:col-span-2'} relative group flex flex-col h-full`}>
                <button
                  type="button"
                  onClick={() => removeWidget('automation')}
                  className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                  title="Remove widget"
                >
                  <X className="w-3 h-3 text-slate-400" />
                </button>
                <AutomationActivityCard />
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">GWCC</span>
            <span>—</span>
            <span>Google Workspace Command Center</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>OAuth 2.0 Scopes Active</span>
            <span>•</span>
            <span>Gmail • Calendar • Drive • Sheets</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;