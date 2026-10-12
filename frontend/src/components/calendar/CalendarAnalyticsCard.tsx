import React from 'react';
import { CalendarAnalytics } from '../../types';
import { BarChart3, TrendingUp, CheckCircle } from 'lucide-react';

interface CalendarAnalyticsCardProps {
  analytics: CalendarAnalytics | null;
  loading?: boolean;
}

export const CalendarAnalyticsCard: React.FC<CalendarAnalyticsCardProps> = ({
  analytics,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-20 bg-slate-100 rounded"></div>
          <div className="h-20 bg-slate-100 rounded"></div>
          <div className="h-20 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const dayEntries: [string, number][] = Object.entries(analytics.meetings_by_day || {}).sort((a, b) =>
    a[0].localeCompare(b[0])
  ) as [string, number][];
  const weekEntries: [string, number][] = Object.entries(analytics.meetings_by_week || {}).sort((a, b) =>
    a[0].localeCompare(b[0])
  ) as [string, number][];

  const maxDayCount = Math.max(...dayEntries.map((e) => e[1]), 1);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#4285F4]">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Calendar Analytics</h3>
            <p className="text-xs text-slate-500">Google Calendar meeting frequency & distribution metrics</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <CheckCircle className="w-3.5 h-3.5 text-[#34A853]" />
          <span>Endpoint: /api/calendar/analytics/</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
            Total Scheduled Meetings
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-1 font-mono">
            {analytics.total_meetings}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Primary Workspace Calendar
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
            Active Weeks Tracked
          </div>
          <div className="text-3xl font-bold text-[#4285F4] mt-1 font-mono">
            {weekEntries.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Monday-aligned reporting cycles
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
            Peak Day Frequency
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-1 font-mono">
            {maxDayCount} <span className="text-sm font-normal text-slate-500">mtgs/day</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Optimal workload balance</span>
          </div>
        </div>
      </div>

      {/* Daily Breakdown Visualizer */}
      {dayEntries.length > 0 && (
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-3">
            Meetings By Day Distribution
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {dayEntries.map(([dayStr, count]) => {
              const d = new Date(`${dayStr}T00:00:00`);
              const percentage = Math.round((count / maxDayCount) * 100);

              return (
                <div
                  key={dayStr}
                  className="p-3 rounded-lg border border-slate-100 bg-white hover:border-slate-200 transition-all text-center"
                >
                  <div className="text-[10px] font-semibold uppercase text-slate-400 font-mono">
                    {d.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' })}
                  </div>
                  <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                    {count}
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-[#4285F4] h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
