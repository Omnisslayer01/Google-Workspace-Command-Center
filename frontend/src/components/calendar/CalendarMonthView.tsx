import React from 'react';
import { CalendarEvent } from '../../types';
import { AlertTriangle, Plus } from 'lucide-react';

interface CalendarMonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onCreateAtDate: (date: Date) => void;
}

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  currentDate,
  events,
  onSelectEvent,
  onCreateAtDate,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in current month
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  const isToday = (d: number, m: number, y: number) => {
    return (
      today.getDate() === d &&
      today.getMonth() === m &&
      today.getFullYear() === y
    );
  };

  // Helper to test if two events conflict
  const isConflicted = (ev: CalendarEvent, dayEvents: CalendarEvent[]) => {
    const startA = new Date(ev.start.dateTime || ev.start.date || '').getTime();
    const endA = new Date(ev.end.dateTime || ev.end.date || '').getTime();
    if (!startA || !endA) return false;

    return dayEvents.some((other) => {
      if (other.id === ev.id) return false;
      const startB = new Date(other.start.dateTime || other.start.date || '').getTime();
      const endB = new Date(other.end.dateTime || other.end.date || '').getTime();
      if (!startB || !endB) return false;
      return startA < endB && endA > startB;
    });
  };

  // Format event start time (e.g. "9:30 AM")
  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Map events by day string "YYYY-MM-DD"
  const eventsByDate = React.useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const dateStr = ev.start.dateTime || ev.start.date;
      if (!dateStr) continue;
      const key = dateStr.slice(0, 10);
      const list = map.get(key) || [];
      list.push(ev);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Build grid calendar cells (42 cells: 6 weeks of 7 days)
  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const prevDay = daysInPrevMonth - i;
    const prevDate = new Date(year, month - 1, prevDay);
    const dateKey = prevDate.toISOString().slice(0, 10);
    calendarCells.push({
      date: prevDate,
      dayNumber: prevDay,
      isCurrentMonth: false,
      dateKey,
      isTodayDate: false,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const thisDate = new Date(year, month, day);
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push({
      date: thisDate,
      dayNumber: day,
      isCurrentMonth: true,
      dateKey,
      isTodayDate: isToday(day, month, year),
    });
  }

  // Next month leading days to complete 35 or 42 grid cells
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let day = 1; day <= remainingCells; day++) {
    const nextDate = new Date(year, month + 1, day);
    const dateKey = nextDate.toISOString().slice(0, 10);
    calendarCells.push({
      date: nextDate,
      dayNumber: day,
      isCurrentMonth: false,
      dateKey,
      isTodayDate: false,
    });
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
      {/* 7-column Day Headers */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center">
        {daysOfWeek.map((day, idx) => (
          <div
            key={day}
            className={`py-3 text-xs font-semibold uppercase tracking-wider ${
              idx === 0 || idx === 6 ? 'text-slate-400' : 'text-slate-700'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
        {calendarCells.map((cell, idx) => {
          const dayEvents = eventsByDate.get(cell.dateKey) || [];
          const visibleEvents = dayEvents.slice(0, 3);
          const hiddenCount = dayEvents.length - visibleEvents.length;

          return (
            <div
              key={idx}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  onCreateAtDate(cell.date);
                }
              }}
              className={`min-h-[110px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors group relative ${
                !cell.isCurrentMonth
                  ? 'bg-slate-50/50 text-slate-300'
                  : cell.isTodayDate
                  ? 'bg-blue-50/20'
                  : 'bg-white hover:bg-slate-50/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-semibold flex items-center justify-center rounded-full ${
                    cell.isTodayDate
                      ? 'w-6 h-6 bg-[#4285F4] text-white font-bold'
                      : !cell.isCurrentMonth
                      ? 'text-slate-400'
                      : 'text-slate-700'
                  }`}
                >
                  {cell.dayNumber}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateAtDate(cell.date);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200/60 rounded text-slate-500 transition-opacity"
                  title="Add event on this day"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Event chips */}
              <div className="space-y-1 flex-1">
                {visibleEvents.map((ev) => {
                  const conflicted = isConflicted(ev, dayEvents);
                  const time = formatTime(ev.start.dateTime || ev.start.date);

                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(ev);
                      }}
                      className={`w-full text-left px-1.5 py-0.5 rounded text-[11px] font-medium truncate flex items-center gap-1 border transition-all ${
                        conflicted
                          ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                          : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      {conflicted && (
                        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                      )}
                      <span className="font-mono text-[10px] text-slate-500 shrink-0">
                        {time}
                      </span>
                      <span className="truncate">{ev.summary}</span>
                    </button>
                  );
                })}

                {hiddenCount > 0 && (
                  <div className="text-[10px] font-semibold text-slate-500 px-1 pt-0.5">
                    +{hiddenCount} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
