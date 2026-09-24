import React, { useState, useEffect } from 'react';
import {
  Mail,
  CalendarDays,
  HardDrive,
  CheckSquare,
  RefreshCw,
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { MetricCard } from '../components/common/MetricCard';
import { WorkspaceStatusBanner } from '../components/dashboard/WorkspaceStatusBanner';
import { TodayScheduleCard } from '../components/dashboard/TodayScheduleCard';
import { RecentDriveFilesCard } from '../components/dashboard/RecentDriveFilesCard';
import { PendingTasksCard } from '../components/dashboard/PendingTasksCard';
import { SheetsSummaryCard } from '../components/dashboard/SheetsSummaryCard';
import { AutomationActivityCard } from '../components/dashboard/AutomationActivityCard';
import { AuditActivityFeed } from '../components/dashboard/AuditActivityFeed';
import { calendarApi } from '../lib/calendarApi';
import { tasksApi } from '../lib/tasksApi';
import { sheetsApi } from '../lib/sheetsApi';
import { CalendarEvent, WorkspaceTask, SpreadsheetItem } from '../types';
import { MOCK_DRIVE_FILES, MOCK_CALENDAR_EVENTS, MOCK_TASKS } from '../data/mockData';
import { ApiAuthError } from '../lib/apiClient';

export const Dashboard: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_CALENDAR_EVENTS);
  const [tasks, setTasks] = useState<WorkspaceTask[]>(MOCK_TASKS);
  const [sheets, setSheets] = useState<SpreadsheetItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'live' | 'mock' | 'adapter'>('mock');

  // Load calendar events & tasks on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setAuthError(null);

    // 1. Fetch Calendar
    try {
      const result = await calendarApi.listEvents();
      setEvents(result.data);
      setDataSource(result.source);
    } catch (err: any) {
      if (err instanceof ApiAuthError) {
        setAuthError(err.message);
      } else {
        console.error('Failed to load calendar events:', err);
      }
    }

    // 2. Fetch Tasks (adapter)
    try {
      const tasksResult = await tasksApi.listTasks();
      setTasks(tasksResult.data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }

    // 3. Fetch Sheets (real API)
    try {
      const sheetsResult = await sheetsApi.getSpreadsheets();
      // To show mock metrics in the dashboard, we might want to fetch full sheet data if needed,
      // but for now, we just pass the empty worksheets or fetch the first one.
      if (sheetsResult.data.length > 0) {
        const fullSheet = await sheetsApi.getSpreadsheet(sheetsResult.data[0].id);
        if (fullSheet) {
          sheetsResult.data[0] = fullSheet;
        }
      }
      setSheets(sheetsResult.data);
    } catch (err) {
      console.error('Failed to load sheets:', err);
    }

    setLoading(false);
  };

  const handleToggleTask = async (id: string) => {
    try {
      const updated = await tasksApi.toggleComplete(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-[#4285F4] selection:text-white">
      <Header unreadCount={2} />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header / Top Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#4285F4] font-mono">
                Command Center Overview
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-mono">Real-time Workspace Orchestration</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Your workspace at a glance.
            </h1>
            <p className="mt-1 text-sm text-slate-500 max-w-3xl">
              Unified operational control for Gmail ingestion, Calendar schedules, Drive governance, and Sheets ledgers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Syncing...' : 'Sync Workspace'}</span>
            </button>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[#0f9d58] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse" />
              <span>System Operational</span>
            </div>
          </div>
        </div>

        {/* 1. Workspace Connection Status Row */}
        <section aria-label="Workspace Status">
          <WorkspaceStatusBanner authError={authError} dataSource={dataSource} />
        </section>

        {/* 2. Top Metric Cards / Command KPIs */}
        <section aria-label="Command Center Metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Gmail Ingestion"
            value="8 Unread"
            change="+3 New"
            changeType="positive"
            subtext="Inbound vendor bills & receipts"
            icon={Mail}
            topColor="#EA4335"
          />

          <MetricCard
            label="Today's Meetings"
            value={`${events.length} Scheduled`}
            change="1 Conflict"
            changeType="negative"
            subtext="10:30 AM overlap flagged"
            icon={CalendarDays}
            topColor="#4285F4"
          />

          <MetricCard
            label="Active Drive Files"
            value="142 Documents"
            change="100% Scoped"
            changeType="positive"
            subtext="Zero public link violations"
            icon={HardDrive}
            topColor="#FBBC04"
          />

          <MetricCard
            label="Pending Tasks"
            value={`${pendingTasksCount} Action Items`}
            change={`${completedTasksCount} Done`}
            changeType="neutral"
            subtext="Cross-service operational queue"
            icon={CheckSquare}
            topColor="#34A853"
          />
        </section>

        {/* 3. Primary Productivity Row: Today's Schedule & Pending Tasks */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <TodayScheduleCard events={events} />
          </div>
          <div className="lg:col-span-5">
            <PendingTasksCard tasks={tasks} onToggleTask={handleToggleTask} />
          </div>
        </section>

        {/* 4. Secondary Productivity Row: Drive Files & Sheets Summary */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <RecentDriveFilesCard files={MOCK_DRIVE_FILES} />
          </div>
          <div className="lg:col-span-6">
            <SheetsSummaryCard sheets={sheets} />
          </div>
        </section>

        {/* 5. Enterprise Operational Row: Automation Workflows & Audit Log */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <AutomationActivityCard />
          </div>
          <div className="lg:col-span-6">
            <AuditActivityFeed />
          </div>
        </section>
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">GWCC</span>
            <span>—</span>
            <span>Google Workspace Command Center Enterprise Architecture</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>OAuth 2.0 Scopes Active</span>
            <span>•</span>
            <span>Branch: feature/fs2-calendar</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;