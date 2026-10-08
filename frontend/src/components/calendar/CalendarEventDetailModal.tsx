import React from 'react';
import { CalendarEvent } from '../../types';
import {
  X,
  Clock,
  MapPin,
  FileText,
  Users,
  Video,
  AlertTriangle,
  Bell,
  Edit2,
  Trash2,
  ExternalLink,
} from 'lucide-react';

interface CalendarEventDetailModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
  hasConflict?: boolean;
}

export const CalendarEventDetailModal: React.FC<CalendarEventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  hasConflict = false,
}) => {
  if (!isOpen || !event) return null;

  const formatFullDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top 4-color accent hairline stripe */}
        <div className="grid grid-cols-4 h-1 w-full">
          <span className="bg-[#4285F4]"></span>
          <span className="bg-[#EA4335]"></span>
          <span className="bg-[#FBBC04]"></span>
          <span className="bg-[#34A853]"></span>
        </div>

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/50">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4285F4] font-mono">
                Google Calendar Event
              </span>
              {hasConflict && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.2 rounded border border-amber-300">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  <span>Time Conflict</span>
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              {event.summary}
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              {formatFullDate(event.start.dateTime || event.start.date)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs">
          {/* Conflict Alert Banner */}
          {hasConflict && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Overlapping Meeting Detected:</span>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  Another event is currently scheduled during this time window. Consider adjusting the meeting schedule or notifying participants.
                </p>
              </div>
            </div>
          )}

          {/* Time and Duration */}
          <div className="flex items-start gap-3 text-slate-700">
            <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-900">
                {formatTimeRange(event.start.dateTime || event.start.date, event.end.dateTime || event.end.date)}
              </div>
              <div className="text-[11px] text-slate-500">
                Google Calendar Primary Timeline
              </div>
            </div>
          </div>

          {/* Google Meet Link */}
          {event.hangoutLink && (
            <div className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#4285F4] text-white flex items-center justify-center shadow-2xs">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Join with Google Meet</div>
                  <div className="text-[11px] text-slate-500 font-mono truncate max-w-[200px] sm:max-w-xs">
                    {event.hangoutLink}
                  </div>
                </div>
              </div>

              <a
                href={event.hangoutLink}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-md bg-[#4285F4] hover:bg-[#1a73e8] text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors shrink-0"
              >
                <span>Join</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-3 text-slate-700">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-slate-900">{event.location}</div>
                <div className="text-[11px] text-slate-500">Meeting Room / Location</div>
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="flex items-start gap-3 text-slate-700">
              <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-slate-900 mb-1">Description</div>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </div>
          )}

          {/* Attendees */}
          {event.attendees && event.attendees.length > 0 && (
            <div className="flex items-start gap-3 text-slate-700">
              <Users className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-slate-900 mb-1.5">
                  Attendees ({event.attendees.length})
                </div>
                <div className="space-y-1.5">
                  {event.attendees.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-[10px]">
                          {(att.displayName || att.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">
                            {att.displayName || att.email}
                          </div>
                          {att.displayName && (
                            <div className="text-[10px] text-slate-400 font-mono">{att.email}</div>
                          )}
                        </div>
                      </div>

                      <span
                        className={`font-mono text-[10px] uppercase font-semibold px-2 py-0.5 rounded border ${
                          att.responseStatus === 'accepted'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : att.responseStatus === 'declined'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {att.responseStatus || 'invited'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reminders */}
          <div className="flex items-center gap-3 text-slate-600 pt-2 border-t border-slate-100 text-[11px]">
            <Bell className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Reminder notification scheduled 15 minutes before meeting start</span>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (confirm(`Are you sure you want to delete "${event.summary}"?`)) {
                onDelete(event.id);
                onClose();
              }
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-red-50 hover:border-red-200 text-red-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Event</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200/50 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onEdit(event);
                onClose();
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#4285F4] hover:bg-[#1a73e8] rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Event</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
