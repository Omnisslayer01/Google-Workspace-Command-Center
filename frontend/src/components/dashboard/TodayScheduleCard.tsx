import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Video, Users, AlertTriangle, ArrowRight, MapPin } from 'lucide-react';
import { CalendarEvent } from '../../types';

interface TodayScheduleCardProps {
  events: CalendarEvent[];
}

export const TodayScheduleCard: React.FC<TodayScheduleCardProps> = ({ events }) => {
  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Check if an event overlaps with any other event
  const hasConflict = (ev: CalendarEvent, all: CalendarEvent[]) => {
    const startA = new Date(ev.start.dateTime || ev.start.date || '').getTime();
    const endA = new Date(ev.end.dateTime || ev.end.date || '').getTime();
    if (!startA || !endA) return false;

    return all.some((other) => {
      if (other.id === ev.id) return false;
      const startB = new Date(other.start.dateTime || other.start.date || '').getTime();
      const endB = new Date(other.end.dateTime || other.end.date || '').getTime();
      if (!startB || !endB) return false;
      return startA < endB && endA > startB;
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs relative overflow-hidden flex flex-col justify-between">
      {/* Top Calendar Blue accent hairline */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#4285F4]" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#4285F4]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Today's Schedule</h3>
              <p className="text-xs text-slate-500">Upcoming meetings and appointments</p>
            </div>
          </div>
          <Link
            to="/calendar"
            className="text-xs font-semibold text-[#4285F4] hover:text-[#1a73e8] flex items-center gap-1 transition-colors group"
          >
            <span>Full Calendar</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No events scheduled for today.
          </div>
        ) : (
          <div className="space-y-3">
            {events.slice(0, 4).map((ev) => {
              const conflicted = hasConflict(ev, events);
              const startFormatted = formatTime(ev.start.dateTime || ev.start.date);
              const endFormatted = formatTime(ev.end.dateTime || ev.end.date);

              return (
                <div
                  key={ev.id}
                  className={`p-3.5 rounded-lg border transition-all ${
                    conflicted
                      ? 'border-amber-200 bg-amber-50/40'
                      : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 truncate">
                          {ev.summary}
                        </span>
                        {conflicted && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300"
                            title="Overlaps with another scheduled meeting"
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Conflict</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-mono text-[11px] text-slate-700">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{startFormatted} – {endFormatted}</span>
                        </span>
                        {ev.location && (
                          <span className="flex items-center gap-1 text-[11px] truncate max-w-[180px]">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{ev.location}</span>
                          </span>
                        )}
                        {ev.attendees && ev.attendees.length > 0 && (
                          <span className="flex items-center gap-1 text-[11px]">
                            <Users className="w-3 h-3 text-slate-400" />
                            <span>{ev.attendees.length} attendees</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {ev.hangoutLink && (
                      <a
                        href={ev.hangoutLink}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 bg-[#4285F4] hover:bg-[#1a73e8] text-white text-xs font-semibold px-2.5 py-1.5 rounded-md flex items-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Join</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Showing {Math.min(events.length, 4)} of {events.length} meetings</span>
        <span className="font-mono text-[11px] text-slate-600">Primary Google Calendar</span>
      </div>
    </div>
  );
};
