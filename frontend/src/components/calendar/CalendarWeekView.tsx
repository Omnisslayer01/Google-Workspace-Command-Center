import React from 'react';
import { CalendarEvent } from '../../types';
import { AlertTriangle, Video, MapPin } from 'lucide-react';

interface CalendarWeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onCreateAtTime: (date: Date, hour: number) => void;
}

export const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({
  currentDate,
  events,
  onSelectEvent,
  onCreateAtTime,
}) => {
  // Compute Monday of current week
  const getWeekDays = (baseDate: Date) => {
    const d = new Date(baseDate);
    const day = d.getDay(); // 0 is Sunday
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(d.setDate(diff));

    const week = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      week.push(nextDay);
    }
    return week;
  };

  const weekDays = getWeekDays(currentDate);
  const startHour = 8;
  const endHour = 19; // up to 7 PM
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  const hourHeight = 60; // 60px per hour

  const today = new Date();
  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  // Group events by week day index (0 to 6)
  const eventsByDayIndex = React.useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    for (let i = 0; i < 7; i++) {
      map.set(i, []);
    }

    for (const ev of events) {
      const startStr = ev.start.dateTime || ev.start.date;
      if (!startStr) continue;
      const evDate = new Date(startStr);

      const dayIdx = weekDays.findIndex((wd) => isSameDay(wd, evDate));
      if (dayIdx !== -1) {
        const list = map.get(dayIdx) || [];
        list.push(ev);
        map.set(dayIdx, list);
      }
    }
    return map;
  }, [events, weekDays]);

  // Check conflict between events on the same day
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

  const formatEventTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
      {/* Header with Days */}
      <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50 text-center">
        <div className="py-3 text-xs font-semibold uppercase text-slate-400 border-r border-slate-200">
          Time (EST)
        </div>
        {weekDays.map((day) => {
          const isToday = isSameDay(day, today);
          return (
            <div
              key={day.toISOString()}
              className={`py-3 px-1 border-r border-slate-100 last:border-r-0 ${
                isToday ? 'bg-blue-50/50' : ''
              }`}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {day.toLocaleDateString([], { weekday: 'short' })}
              </div>
              <div
                className={`inline-flex items-center justify-center text-sm font-bold mt-0.5 ${
                  isToday
                    ? 'w-7 h-7 bg-[#4285F4] text-white rounded-full'
                    : 'text-slate-800'
                }`}
              >
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hourly Grid Body */}
      <div className="grid grid-cols-8 relative overflow-y-auto max-h-[720px]">
        {/* Left Time Axis */}
        <div className="border-r border-slate-200 bg-slate-50/70 text-right select-none">
          {hours.map((hour) => (
            <div
              key={hour}
              style={{ height: `${hourHeight}px` }}
              className="border-b border-slate-100 pr-2 text-xs font-mono text-slate-400 flex items-start justify-end pt-1"
            >
              {hour % 12 === 0 ? 12 : hour % 12} {hour >= 12 ? 'PM' : 'AM'}
            </div>
          ))}
        </div>

        {/* 7 Day Columns */}
        {weekDays.map((day, dayIdx) => {
          const dayEvents = eventsByDayIndex.get(dayIdx) || [];
          const isToday = isSameDay(day, today);

          return (
            <div
              key={day.toISOString()}
              className={`border-r border-slate-100 last:border-r-0 relative ${
                isToday ? 'bg-blue-50/10' : 'bg-white'
              }`}
            >
              {/* Background hour slots for clicking to add event */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  style={{ height: `${hourHeight}px` }}
                  onClick={() => onCreateAtTime(day, hour)}
                  className="border-b border-slate-100/80 hover:bg-slate-50/60 transition-colors cursor-pointer"
                  title={`Add event on ${day.toLocaleDateString()} at ${hour}:00`}
                />
              ))}

              {/* Event blocks placed absolutely */}
              {dayEvents.map((ev) => {
                const startDate = new Date(ev.start.dateTime || ev.start.date || '');
                const endDate = new Date(ev.end.dateTime || ev.end.date || '');

                const startH = startDate.getHours() + startDate.getMinutes() / 60;
                const endH = endDate.getHours() + endDate.getMinutes() / 60;

                // Restrict within grid bounds
                const top = Math.max(0, (startH - startHour) * hourHeight);
                const durationHours = Math.max(0.5, endH - startH);
                const height = Math.max(32, durationHours * hourHeight - 2);

                const conflicted = isConflicted(ev, dayEvents);

                return (
                  <div
                    key={ev.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEvent(ev);
                    }}
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      left: '3px',
                      right: '3px',
                    }}
                    className={`absolute rounded-md p-1.5 text-left border shadow-2xs cursor-pointer transition-all duration-150 overflow-hidden z-10 ${
                      conflicted
                        ? 'bg-amber-50 border-amber-300 text-amber-950 hover:border-amber-400 hover:shadow-xs ring-1 ring-amber-300'
                        : 'bg-blue-50 border-blue-200 text-blue-950 hover:border-blue-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-mono text-[10px] font-semibold text-slate-500">
                        {formatEventTime(ev.start.dateTime || ev.start.date)}
                      </span>
                      {conflicted && (
                        <span
                          className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-200/80 px-1 py-0.2 rounded"
                          title="Schedule conflict detected"
                        >
                          <AlertTriangle className="w-2.5 h-2.5 text-amber-700" />
                          <span>Overlap</span>
                        </span>
                      )}
                    </div>

                    <div className="font-semibold text-xs leading-snug line-clamp-2">
                      {ev.summary}
                    </div>

                    {height > 55 && ev.location && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{ev.location}</span>
                      </div>
                    )}

                    {height > 55 && ev.hangoutLink && (
                      <div className="flex items-center gap-1 text-[10px] text-[#4285F4] mt-0.5 font-medium">
                        <Video className="w-3 h-3 shrink-0" />
                        <span>Google Meet</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
