import {
  CalendarEvent,
  CalendarEventCreateInput,
  CalendarEventUpdateInput,
  CalendarAnalytics,
} from '../types';
import { apiFetch, ApiAuthError, ApiNetworkError } from './apiClient';
import { MOCK_CALENDAR_EVENTS } from '../data/mockData';

const STORAGE_KEY = 'gwcc_mock_calendar_events_v1';

// In-memory / localStorage fallback storage
function getLocalMockEvents(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return [...MOCK_CALENDAR_EVENTS];
}

function saveLocalMockEvents(events: CalendarEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // ignore
  }
}

function computeMockAnalytics(events: CalendarEvent[]): CalendarAnalytics {
  const meetingsByDay: Record<string, number> = {};
  const meetingsByWeek: Record<string, number> = {};

  for (const ev of events) {
    const startStr = ev.start.dateTime || ev.start.date;
    if (!startStr) continue;

    const dateKey = startStr.slice(0, 10);
    meetingsByDay[dateKey] = (meetingsByDay[dateKey] || 0) + 1;

    try {
      const d = new Date(dateKey);
      const dayOfWeek = d.getDay(); // 0 is Sunday
      const diffToMon = (dayOfWeek + 6) % 7;
      const monday = new Date(d);
      monday.setDate(d.getDate() - diffToMon);
      const weekKey = monday.toISOString().slice(0, 10);
      meetingsByWeek[weekKey] = (meetingsByWeek[weekKey] || 0) + 1;
    } catch {
      // ignore
    }
  }

  return {
    total_meetings: events.length,
    meetings_by_day: meetingsByDay,
    meetings_by_week: meetingsByWeek,
  };
}

export interface CalendarApiResult<T> {
  data: T;
  source: 'live' | 'mock';
  authRequired?: boolean;
}

export const calendarApi = {
  /**
   * List calendar events
   * GET /api/calendar/events/?start=...&end=...
   */
  async listEvents(params?: {
    start?: string;
    end?: string;
    pageToken?: string;
  }): Promise<CalendarApiResult<CalendarEvent[]>> {
    const query = new URLSearchParams();
    if (params?.start) query.append('start', params.start);
    if (params?.end) query.append('end', params.end);
    if (params?.pageToken) query.append('page_token', params.pageToken);

    const queryString = query.toString();
    const endpoint = `/api/calendar/events/${queryString ? `?${queryString}` : ''}`;

    try {
      const response = await apiFetch<any>(endpoint);
      // Django Google Calendar response returns { items: [...] } or direct array
      const items = Array.isArray(response) ? response : response.items || [];
      return { data: items, source: 'live' };
    } catch (err) {
      // RULE 1: Do NOT silently fall back to mock data on 401/403 authorization errors!
      if (err instanceof ApiAuthError) {
        throw err;
      }
      // If network is down/server offline, fallback to mock data
      if (err instanceof ApiNetworkError) {
        console.warn('Backend server offline. Using local mock calendar adapter.');
        return { data: getLocalMockEvents(), source: 'mock' };
      }
      throw err;
    }
  },

  /**
   * Create an event
   * POST /api/calendar/events/
   */
  async createEvent(input: CalendarEventCreateInput): Promise<CalendarApiResult<CalendarEvent>> {
    try {
      const created = await apiFetch<CalendarEvent>('/api/calendar/events/', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return { data: created, source: 'live' };
    } catch (err) {
      if (err instanceof ApiAuthError) {
        throw err;
      }
      if (err instanceof ApiNetworkError) {
        console.warn('Backend server offline. Creating event in local mock adapter.');
        const events = getLocalMockEvents();
        const newEvent: CalendarEvent = {
          id: `local-evt-${Date.now()}`,
          summary: input.summary,
          description: input.description,
          start: { dateTime: input.start_time },
          end: { dateTime: input.end_time },
          location: input.location,
          hangoutLink: `https://meet.google.com/local-${Date.now().toString(36)}`,
          attendees: (input.attendees || []).map((email) => ({
            email,
            displayName: email.split('@')[0],
            responseStatus: 'needsAction',
          })),
          status: 'confirmed',
          colorId: '1',
        };
        events.unshift(newEvent);
        saveLocalMockEvents(events);
        return { data: newEvent, source: 'mock' };
      }
      throw err;
    }
  },

  /**
   * Get single event detail
   * GET /api/calendar/events/{event_id}/
   */
  async getEvent(eventId: string): Promise<CalendarApiResult<CalendarEvent>> {
    try {
      const event = await apiFetch<CalendarEvent>(`/api/calendar/events/${eventId}/`);
      return { data: event, source: 'live' };
    } catch (err) {
      if (err instanceof ApiAuthError) {
        throw err;
      }
      if (err instanceof ApiNetworkError) {
        const events = getLocalMockEvents();
        const found = events.find((e) => e.id === eventId);
        if (!found) {
          throw new Error(`Event not found: ${eventId}`);
        }
        return { data: found, source: 'mock' };
      }
      throw err;
    }
  },

  /**
   * Update single event
   * PATCH /api/calendar/events/{event_id}/
   */
  async updateEvent(
    eventId: string,
    input: CalendarEventUpdateInput
  ): Promise<CalendarApiResult<CalendarEvent>> {
    try {
      const updated = await apiFetch<CalendarEvent>(`/api/calendar/events/${eventId}/`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      });
      return { data: updated, source: 'live' };
    } catch (err) {
      if (err instanceof ApiAuthError) {
        throw err;
      }
      if (err instanceof ApiNetworkError) {
        const events = getLocalMockEvents();
        const index = events.findIndex((e) => e.id === eventId);
        if (index === -1) {
          throw new Error(`Event not found: ${eventId}`);
        }
        const existing = events[index];
        const updatedEvent: CalendarEvent = {
          ...existing,
          summary: input.summary !== undefined ? input.summary : existing.summary,
          description: input.description !== undefined ? input.description : existing.description,
          location: input.location !== undefined ? input.location : existing.location,
          start: input.start_time ? { dateTime: input.start_time } : existing.start,
          end: input.end_time ? { dateTime: input.end_time } : existing.end,
          attendees:
            input.attendees !== undefined
              ? input.attendees.map((email) => ({
                  email,
                  displayName: email.split('@')[0],
                  responseStatus: 'needsAction',
                }))
              : existing.attendees,
        };
        events[index] = updatedEvent;
        saveLocalMockEvents(events);
        return { data: updatedEvent, source: 'mock' };
      }
      throw err;
    }
  },

  /**
   * Delete an event
   * DELETE /api/calendar/events/{event_id}/
   */
  async deleteEvent(eventId: string): Promise<CalendarApiResult<void>> {
    try {
      await apiFetch<void>(`/api/calendar/events/${eventId}/`, {
        method: 'DELETE',
      });
      return { data: undefined as void, source: 'live' };
    } catch (err) {
      if (err instanceof ApiAuthError) {
        throw err;
      }
      if (err instanceof ApiNetworkError) {
        const events = getLocalMockEvents();
        const filtered = events.filter((e) => e.id !== eventId);
        saveLocalMockEvents(filtered);
        return { data: undefined as void, source: 'mock' };
      }
      throw err;
    }
  },

  /**
   * Get analytics
   * GET /api/calendar/analytics/
   */
  async getAnalytics(params?: {
    start?: string;
    end?: string;
  }): Promise<CalendarApiResult<CalendarAnalytics>> {
    const query = new URLSearchParams();
    if (params?.start) query.append('start', params.start);
    if (params?.end) query.append('end', params.end);

    const queryString = query.toString();
    const endpoint = `/api/calendar/analytics/${queryString ? `?${queryString}` : ''}`;

    try {
      const analytics = await apiFetch<CalendarAnalytics>(endpoint);
      return { data: analytics, source: 'live' };
    } catch (err) {
      if (err instanceof ApiAuthError) {
        throw err;
      }
      if (err instanceof ApiNetworkError) {
        const events = getLocalMockEvents();
        return { data: computeMockAnalytics(events), source: 'mock' };
      }
      throw err;
    }
  },
};
