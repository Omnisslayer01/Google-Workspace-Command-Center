import React from 'react';
import { CalendarEvent } from '../../types';
import {
  Clock,
  MapPin,
  Users,
  Video,
  AlertTriangle,
  Bell,
  Trash2,
  Edit2,
  Calendar,
} from 'lucide-react';

interface CalendarAgendaViewProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
}

export const CalendarAgendaView: React.FC<CalendarAgendaViewProps> = ({
  events,
  onSelectEvent,
  onEditEvent,
  onDeleteEvent,
}) => {
  // Sort events chronologically
  const sortedEvents = React.useMemo(() => {
    return [...events].sort((a, b) => {
      const timeA = new Date(a.start.dateTime || a.start.date || '').getTime();
      const timeB = new Date(b.start.dateTime || b.start.date || '').getTime();
      return timeA - timeB;
    });
  }, [events]);

  // Group events by date string
  const groupedByDate = React.useMemo(() => {
    const groups: { [dateStr: string]: CalendarEvent[] } = {};
    for (const ev of sortedEvents) {
      const startStr = ev.start.dateTime || ev.start.date;
      if (!startStr) continue;
      const key = startStr.slice(0, 10);
      if (!groups[key]) groups[key] = [];
      groups[key].push(ev);
    }
    return groups;
  }, [sortedEvents]);

  // Helper to format date header
  const formatDateHeading = (dateStr: string) => {
    try {
      const d = new Date(`${dateStr}T00:00:00`);
      const today = new Date();
      const isToday =
        today.toISOString().slice(0, 10) === dateStr;
      const prefix = isToday ? 'Today — ' : '';
      return `${prefix}${d.toLocaleDateString([], {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
    } catch {
      return dateStr;
    }
  };

  const formatTimeRange = (startStr?: string, endStr?: string) => {
    if (!startStr) return '';
    try {
      const s = new Date(startStr);
      const startFormatted = s.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      if (!endStr) return startFormatted;
      const e = new Date(endStr);
      const endFormatted = e.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      const durationMin = Math.round((e.getTime() - s.getTime()) / 60000);
      const durationFormatted =
        durationMin >= 60
          ? `${Math.floor(durationMin / 60)}h ${durationMin % 60 > 0 ? `${durationMin % 60}m` : ''}`
          : `${durationMin}m`;

      return `${startFormatted} – ${endFormatted} (${durationFormatted.trim()})`;
    } catch {
      return '';
    }
  };

  // Conflict detector
  const isConflicted = (ev: CalendarEvent, allEvents: CalendarEvent[]) => {
    const startA = new Date(ev.start.dateTime || ev.start.date || '').getTime();
    const endA = new Date(ev.end.dateTime || ev.end.date || '').getTime();
    if (!startA || !endA) return false;

    return allEvents.some((other) => {
      if (other.id === ev.id) return false;
      const startB = new Date(other.start.dateTime || other.start.date || '').getTime();
      const endB = new Date(other.end.dateTime || other.end.date || '').getTime();
      if (!startB || !endB) return false;
      return startA < endB && endA > startB;
    });
  };

  const dateKeys = Object.keys(groupedByDate);

  if (dateKeys.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
        <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p className="text-sm font-medium">No upcoming agenda events found.</p>
        <p className="text-xs text-slate-400 mt-1">Create a new event to populate the schedule.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dateKeys.map((dateStr) => {
        const dayEvents = groupedByDate[dateStr];
        return (
          <div
            key={dateStr}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs"
          >
            {/* Date Group Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                {formatDateHeading(dateStr)}
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {dayEvents.length} {dayEvents.length === 1 ? 'meeting' : 'meetings'}
              </span>
            </div>

            {/* Event List */}
            <div className="divide-y divide-slate-100">
              {dayEvents.map((ev) => {
                const conflicted = isConflicted(ev, events);

                return (
                  <div
                    key={ev.id}
                    onClick={() => onSelectEvent(ev)}
                    className={`p-5 hover:bg-slate-50/70 transition-all cursor-pointer flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                      conflicted ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    {/* Left: Summary, details, attendees */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-slate-900 hover:text-[#4285F4] transition-colors">
                          {ev.summary}
                        </span>

                        {conflicted && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Overlapping Conflict Flagged</span>
                          </span>
                        )}
                      </div>

                      {/* Time, location, reminder */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                        <span className="flex items-center gap-1.5 font-mono font-medium text-slate-800">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatTimeRange(ev.start.dateTime || ev.start.date, ev.end.dateTime || ev.end.date)}</span>
                        </span>

                        {ev.location && (
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{ev.location}</span>
                          </span>
                        )}

                        {ev.reminders && (
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Bell className="w-3.5 h-3.5 text-slate-400" />
                            <span>Reminder: 15m before</span>
                          </span>
                        )}
                      </div>

                      {/* Description snippet */}
                      {ev.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 max-w-2xl leading-relaxed">
                          {ev.description}
                        </p>
                      )}

                      {/* Attendees List */}
                      {ev.attendees && ev.attendees.length > 0 && (
                        <div className="pt-2 flex flex-wrap items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400 mr-1" />
                          {ev.attendees.map((att, aIdx) => (
                            <span
                              key={aIdx}
                              className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border font-mono ${
                                att.self
                                  ? 'bg-blue-50 text-blue-800 border-blue-200 font-semibold'
                                  : 'bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                              title={`${att.email} (${att.responseStatus || 'invited'})`}
                            >
                              <span>{att.displayName || att.email.split('@')[0]}</span>
                              {att.responseStatus === 'accepted' && (
                                <span className="text-emerald-600">✓</span>
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions & Meeting Link */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      {ev.hangoutLink && (
                        <a
                          href={ev.hangoutLink}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 rounded-lg bg-[#4285F4] hover:bg-[#1a73e8] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Meet</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditEvent(ev);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                        title="Edit event"
                        aria-label="Edit event"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete event "${ev.summary}"?`)) {
                            onDeleteEvent(ev.id);
                          }
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-slate-500 hover:text-red-600 hover:border-red-200 transition-colors"
                        title="Delete event"
                        aria-label="Delete event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
