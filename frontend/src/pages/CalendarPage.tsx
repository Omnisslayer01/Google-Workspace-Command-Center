import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '../components/common/Header';
import { CalendarControls, CalendarViewMode } from '../components/calendar/CalendarControls';
import { CalendarMonthView } from '../components/calendar/CalendarMonthView';
import { CalendarWeekView } from '../components/calendar/CalendarWeekView';
import { CalendarAgendaView } from '../components/calendar/CalendarAgendaView';
import { CalendarEventModal } from '../components/calendar/CalendarEventModal';
import { CalendarEventDetailModal } from '../components/calendar/CalendarEventDetailModal';
import { CalendarAnalyticsCard } from '../components/calendar/CalendarAnalyticsCard';
import { calendarApi } from '../lib/calendarApi';
import { CalendarEvent, CalendarEventCreateInput, CalendarAnalytics } from '../types';
import { MOCK_CALENDAR_EVENTS } from '../data/mockData';
import { ApiAuthError } from '../lib/apiClient';
import { AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_CALENDAR_EVENTS);
  const [analytics, setAnalytics] = useState<CalendarAnalytics | null>(null);
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'live' | 'mock'>('mock');

  // Modal states
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [defaultDateForModal, setDefaultDateForModal] = useState<Date | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    setLoading(true);
    setAuthError(null);

    try {
      const [eventsRes, analyticsRes] = await Promise.all([
        calendarApi.listEvents(),
        calendarApi.getAnalytics(),
      ]);

      setEvents(eventsRes.data);
      setDataSource(eventsRes.source);
      setAnalytics(analyticsRes.data);
    } catch (err: any) {
      if (err instanceof ApiAuthError) {
        setAuthError(err.message);
      } else {
        console.error('Failed to fetch calendar data:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Date Navigation handler
  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    const next = new Date(currentDate);
    if (direction === 'today') {
      setCurrentDate(new Date());
      return;
    }

    const step = direction === 'next' ? 1 : -1;
    if (viewMode === 'month') {
      next.setMonth(next.getMonth() + step);
    } else if (viewMode === 'week') {
      next.setDate(next.getDate() + step * 7);
    } else {
      next.setDate(next.getDate() + step * 7);
    }
    setCurrentDate(next);
  };

  // Select Event to view details
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  // Open creation modal
  const handleNewEvent = () => {
    setEditingEvent(null);
    setDefaultDateForModal(currentDate);
    setIsEventModalOpen(true);
  };

  const handleCreateAtDate = (date: Date) => {
    setEditingEvent(null);
    setDefaultDateForModal(date);
    setIsEventModalOpen(true);
  };

  const handleCreateAtTime = (date: Date, hour: number) => {
    const d = new Date(date);
    d.setHours(hour, 0, 0, 0);
    setEditingEvent(null);
    setDefaultDateForModal(d);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setDefaultDateForModal(null);
    setIsDetailModalOpen(false);
    setIsEventModalOpen(true);
  };

  // Save Event (Create or Update)
  const handleSaveEvent = async (input: CalendarEventCreateInput) => {
    if (editingEvent) {
      const updatedRes = await calendarApi.updateEvent(editingEvent.id, input);
      setEvents((prev) =>
        prev.map((ev) => (ev.id === editingEvent.id ? updatedRes.data : ev))
      );
    } else {
      const createdRes = await calendarApi.createEvent(input);
      setEvents((prev) => [createdRes.data, ...prev]);
    }

    // Refresh analytics after changes
    try {
      const analyticsRes = await calendarApi.getAnalytics();
      setAnalytics(analyticsRes.data);
    } catch {
      // ignore
    }
  };

  // Delete Event
  const handleDeleteEvent = async (eventId: string) => {
    try {
      await calendarApi.deleteEvent(eventId);
      setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
      if (selectedEvent?.id === eventId) {
        setIsDetailModalOpen(false);
        setSelectedEvent(null);
      }
      const analyticsRes = await calendarApi.getAnalytics();
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  // Check if selected event has an overlap
  const selectedEventHasConflict = useMemo(() => {
    if (!selectedEvent) return false;
    const startA = new Date(selectedEvent.start.dateTime || selectedEvent.start.date || '').getTime();
    const endA = new Date(selectedEvent.end.dateTime || selectedEvent.end.date || '').getTime();
    if (!startA || !endA) return false;

    return events.some((other) => {
      if (other.id === selectedEvent.id) return false;
      const startB = new Date(other.start.dateTime || other.start.date || '').getTime();
      const endB = new Date(other.end.dateTime || other.end.date || '').getTime();
      if (!startB || !endB) return false;
      return startA < endB && endA > startB;
    });
  }, [selectedEvent, events]);

  // Compute meetings per week
  const meetingsPerWeek = useMemo(() => {
    if (analytics?.meetings_by_week) {
      const weeks = Object.values(analytics.meetings_by_week);
      if (weeks.length > 0) {
        const sum = weeks.reduce((a, b) => a + b, 0);
        return Math.round(sum / weeks.length);
      }
    }
    return events.length;
  }, [analytics, events]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-[#4285F4] selection:text-white">
      <Header unreadCount={2} />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Title & Status Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#4285F4] font-mono">
                Google Calendar Integration
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-mono">API /api/calendar/events/</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Calendar Command Center
            </h1>
            <p className="mt-1 text-sm text-slate-500 max-w-2xl">
              Inspect schedules, resolve overlapping meeting conflicts, track weekly frequency, and join Google Meet virtual sessions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadCalendarData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh Events'}</span>
            </button>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[#4285F4] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4285F4]" />
              <span>OAuth 2.0 Scoped</span>
            </div>
          </div>
        </div>

        {/* Auth Error Banner (Rule 1: Show explicit authorization state on 401/403) */}
        {authError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Google Calendar Authorization Required</h3>
              <p className="mt-0.5 text-xs text-red-700 leading-relaxed">{authError}</p>
              <p className="mt-1.5 text-xs text-red-600 font-medium">
                Live Google Calendar events cannot be synchronized without an active Google OAuth token. Please verify BE1 authentication credentials.
              </p>
            </div>
          </div>
        )}

        {/* Interactive Calendar Controls */}
        <CalendarControls
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          currentDate={currentDate}
          onNavigate={handleNavigate}
          onNewEvent={handleNewEvent}
          meetingsPerWeek={meetingsPerWeek}
          totalMeetings={events.length}
          dataSource={dataSource}
          onToggleAnalytics={() => setShowAnalytics(!showAnalytics)}
          showAnalytics={showAnalytics}
        />

        {/* Analytics Card (collapsible or toggleable) */}
        {showAnalytics && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <CalendarAnalyticsCard analytics={analytics} loading={loading} />
          </div>
        )}

        {/* Active View Mode */}
        {viewMode === 'month' && (
          <CalendarMonthView
            currentDate={currentDate}
            events={events}
            onSelectEvent={handleSelectEvent}
            onCreateAtDate={handleCreateAtDate}
          />
        )}

        {viewMode === 'week' && (
          <CalendarWeekView
            currentDate={currentDate}
            events={events}
            onSelectEvent={handleSelectEvent}
            onCreateAtTime={handleCreateAtTime}
          />
        )}

        {viewMode === 'agenda' && (
          <CalendarAgendaView
            events={events}
            onSelectEvent={handleSelectEvent}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        )}
      </main>

      {/* Create / Edit Event Modal */}
      <CalendarEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveEvent}
        initialEvent={editingEvent}
        defaultDate={defaultDateForModal}
        existingEvents={events}
      />

      {/* Event Details Modal */}
      <CalendarEventDetailModal
        event={selectedEvent}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
        hasConflict={selectedEventHasConflict}
      />
    </div>
  );
};

export default CalendarPage;
