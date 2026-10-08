import {
  CalendarEvent,
  CalendarEventCreateInput,
  CalendarEventUpdateInput,
  CalendarAnalytics,
} from '../types';
import { apiFetch } from './apiClient';

export interface CalendarApiResult<T> {
  data: T;
  source: 'live';
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

    const response = await apiFetch<any>(endpoint);
    // Django Google Calendar response returns { items: [...] } or direct array
    const items = Array.isArray(response) ? response : response.items || [];
    return { data: items, source: 'live' };
  },

  /**
   * Create an event
   * POST /api/calendar/events/
   */
  async createEvent(input: CalendarEventCreateInput): Promise<CalendarApiResult<CalendarEvent>> {
    const created = await apiFetch<CalendarEvent>('/api/calendar/events/', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return { data: created, source: 'live' };
  },

  /**
   * Get single event detail
   * GET /api/calendar/events/{event_id}/
   */
  async getEvent(eventId: string): Promise<CalendarApiResult<CalendarEvent>> {
    const event = await apiFetch<CalendarEvent>(`/api/calendar/events/${eventId}/`);
    return { data: event, source: 'live' };
  },

  /**
   * Update single event
   * PATCH /api/calendar/events/{event_id}/
   */
  async updateEvent(
    eventId: string,
    input: CalendarEventUpdateInput
  ): Promise<CalendarApiResult<CalendarEvent>> {
    const updated = await apiFetch<CalendarEvent>(`/api/calendar/events/${eventId}/`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    return { data: updated, source: 'live' };
  },

  /**
   * Delete an event
   * DELETE /api/calendar/events/{event_id}/
   */
  async deleteEvent(eventId: string): Promise<CalendarApiResult<void>> {
    await apiFetch<void>(`/api/calendar/events/${eventId}/`, {
      method: 'DELETE',
    });
    return { data: undefined as void, source: 'live' };
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

    const analytics = await apiFetch<CalendarAnalytics>(endpoint);
    return { data: analytics, source: 'live' };
  },
};

