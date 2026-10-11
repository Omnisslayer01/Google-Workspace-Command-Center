import React, { useState, useEffect, useMemo } from 'react';
import { CalendarEvent, CalendarEventCreateInput } from '../../types';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Users,
  AlertTriangle,
  Check,
} from 'lucide-react';

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CalendarEventCreateInput) => Promise<void>;
  initialEvent?: CalendarEvent | null;
  defaultDate?: Date | null;
  existingEvents?: CalendarEvent[];
}

export const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEvent,
  defaultDate,
  existingEvents = [],
}) => {
  // Format Date to datetime-local input string YYYY-MM-DDTHH:mm
  const formatInputDateTime = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const h = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${y}-${m}-${d}T${h}:${min}`;
  };

  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [attendeeInput, setAttendeeInput] = useState('');
  const [attendees, setAttendees] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize form state when modal opens or initialEvent changes
  useEffect(() => {
    if (!isOpen) return;

    if (initialEvent) {
      setSummary(initialEvent.summary || '');
      setDescription(initialEvent.description || '');
      setLocation(initialEvent.location || '');

      const start = initialEvent.start.dateTime || initialEvent.start.date;
      const end = initialEvent.end.dateTime || initialEvent.end.date;
      if (start) setStartTime(formatInputDateTime(new Date(start)));
      if (end) setEndTime(formatInputDateTime(new Date(end)));

      const attEmails = (initialEvent.attendees || []).map((a) => a.email);
      setAttendees(attEmails);
    } else {
      const base = defaultDate ? new Date(defaultDate) : new Date();
      // default: next hour
      base.setMinutes(0, 0, 0);
      base.setHours(base.getHours() + 1);
      const end = new Date(base);
      end.setHours(end.getHours() + 1);

      setSummary('');
      setDescription('');
      setLocation('');
      setStartTime(formatInputDateTime(base));
      setEndTime(formatInputDateTime(end));
      setAttendees(['command.lead@workspace.internal']);
    }
    setAttendeeInput('');
    setValidationError(null);
  }, [isOpen, initialEvent, defaultDate]);

  // Check for conflicts in real-time
  const conflictingEvents = useMemo(() => {
    if (!startTime || !endTime) return [];
    const startMs = new Date(startTime).getTime();
    const endMs = new Date(endTime).getTime();
    if (isNaN(startMs) || isNaN(endMs) || endMs <= startMs) return [];

    return existingEvents.filter((ev) => {
      // Don't compare with self if editing
      if (initialEvent && ev.id === initialEvent.id) return false;

      const evStart = new Date(ev.start.dateTime || ev.start.date || '').getTime();
      const evEnd = new Date(ev.end.dateTime || ev.end.date || '').getTime();
      if (!evStart || !evEnd) return false;

      // Overlap condition: startA < endB && endA > startB
      return startMs < evEnd && endMs > evStart;
    });
  }, [startTime, endTime, existingEvents, initialEvent]);

  if (!isOpen) return null;

  const handleAddAttendee = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const email = attendeeInput.trim().replace(/,$/, '');
    if (email && email.includes('@') && !attendees.includes(email)) {
      setAttendees([...attendees, email]);
      setAttendeeInput('');
    }
  };

  const handleRemoveAttendee = (email: string) => {
    setAttendees(attendees.filter((a) => a !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!summary.trim()) {
      setValidationError('Please enter a meeting summary / title.');
      return;
    }

    const startMs = new Date(startTime).getTime();
    const endMs = new Date(endTime).getTime();

    if (isNaN(startMs) || isNaN(endMs)) {
      setValidationError('Please enter valid start and end times.');
      return;
    }

    if (endMs <= startMs) {
      setValidationError('End time must be after start time.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        summary: summary.trim(),
        description: description.trim() || undefined,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        location: location.trim() || undefined,
        attendees: attendees.length > 0 ? attendees : undefined,
      });
      onClose();
    } catch (err: any) {
      setValidationError(err.message || 'Failed to save calendar event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#4285F4]">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {initialEvent ? 'Edit Calendar Event' : 'Schedule New Event'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Validation Error Banner */}
          {validationError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Conflict Warning Banner */}
          {conflictingEvents.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Scheduling Conflict Warning</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                This time range overlaps with{' '}
                <span className="font-bold">{conflictingEvents[0].summary}</span>.
                You may still schedule the event, but attendees may have double-booking.
              </p>
            </div>
          )}

          {/* Title / Summary */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Event Title / Summary *
            </label>
            <input
              type="text"
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g. Q3 Pipeline Review or Architecture Sync"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
            />
          </div>

          {/* Start and End Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Start Time *</span>
              </label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-[#4285F4] focus:border-transparent font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>End Time *</span>
              </label>
              <input
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-[#4285F4] focus:border-transparent font-mono"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Location / Conference Room</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Google Meet or Conference Room 4B"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-[#4285F4]"
            />
          </div>

          {/* Attendees */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Attendees (Press Enter to add)</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="email"
                value={attendeeInput}
                onChange={(e) => setAttendeeInput(e.target.value)}
                onKeyDown={handleAddAttendee}
                placeholder="colleague@workspace.internal"
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-[#4285F4]"
              />
              <button
                type="button"
                onClick={handleAddAttendee}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
              >
                Add
              </button>
            </div>

            {/* Attendee chips */}
            <div className="flex flex-wrap gap-1.5 min-h-6">
              {attendees.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-mono"
                >
                  <span>{email}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttendee(email)}
                    className="hover:text-red-600 rounded-full"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Description / Agenda Notes</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline discussion items, shared Google Drive links, and goals..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-[#4285F4]"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#4285F4] hover:bg-[#1a73e8] rounded-lg shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : initialEvent ? 'Update Event' : 'Create Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
