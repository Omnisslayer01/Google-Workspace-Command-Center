import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Clock,
  List,
  BarChart3,
  CalendarDays,
} from 'lucide-react';

export type CalendarViewMode = 'month' | 'week' | 'agenda';

interface CalendarControlsProps {
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  currentDate: Date;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  onNewEvent: () => void;
  meetingsPerWeek?: number;
  totalMeetings?: number;
  dataSource?: 'live' | 'mock';
  onToggleAnalytics?: () => void;
  showAnalytics?: boolean;
}

export const CalendarControls: React.FC<CalendarControlsProps> = ({
  viewMode,
  onViewModeChange,
  currentDate,
  onNavigate,
  onNewEvent,
  meetingsPerWeek = 7,
  totalMeetings = 7,
  dataSource = 'mock',
  onToggleAnalytics,
  showAnalytics = false,
}) => {
  // Format current date display
  const formatHeaderDate = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' });
    }
    if (viewMode === 'week') {
      const d = new Date(currentDate);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);

      const monMonth = monday.toLocaleDateString([], { month: 'short', day: 'numeric' });
      const sunMonth = sunday.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      return `${monMonth} – ${sunMonth}`;
    }
    return currentDate.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Date navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 shadow-2xs">
            <button
              type="button"
              onClick={() => onNavigate('prev')}
              className="p-1.5 rounded-md hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
              aria-label="Previous period"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('today')}
              className="px-2.5 py-1 text-xs font-semibold hover:bg-white text-slate-700 hover:text-slate-900 rounded-md transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => onNavigate('next')}
              className="p-1.5 rounded-md hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
              aria-label="Next period"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{formatHeaderDate()}</span>
          </h2>
        </div>

        {/* Center: Meetings-per-week KPI chip */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs">
            <CalendarDays className="w-3.5 h-3.5 text-[#4285F4]" />
            <span className="font-semibold text-slate-700">Meetings/Week:</span>
            <span className="font-bold text-[#4285F4] font-mono">{meetingsPerWeek}</span>
          </div>

          <div className="hidden lg:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
            <span>Total: {totalMeetings}</span>
          </div>

          {onToggleAnalytics && (
            <button
              type="button"
              onClick={onToggleAnalytics}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                showAnalytics
                  ? 'bg-[#4285F4] text-white border-[#4285F4]'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
          )}
        </div>

        {/* Right: View mode switcher & New Event CTA */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            <button
              type="button"
              onClick={() => onViewModeChange('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === 'month'
                  ? 'bg-white text-[#4285F4] shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Month</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === 'week'
                  ? 'bg-white text-[#4285F4] shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Week</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('agenda')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === 'agenda'
                  ? 'bg-white text-[#4285F4] shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Agenda</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onNewEvent}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#4285F4] hover:bg-[#1a73e8] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {/* Sub-bar: Status note */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
          <span>Primary Google Calendar (Active)</span>
        </div>
        <div>
          {dataSource === 'live' ? (
            <span className="text-emerald-600 font-semibold">● Synchronized with Django Backend</span>
          ) : (
            <span className="text-slate-500">Local Calendar Adapter (Offline Fallback)</span>
          )}
        </div>
      </div>
    </div>
  );
};
