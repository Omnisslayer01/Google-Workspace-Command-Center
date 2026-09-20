// ─── Notifications API types ─────────────────────────────────────────────────
// These match the response envelopes produced by backend/notifications/views.py

export type NotificationType = "gmail" | "calendar" | "drive" | "sheets" | "system";

export interface Notification {
  id: number;
  notification_type: NotificationType;
  message: string;
  is_read: boolean;
  created_at: string; // ISO 8601 datetime string
}

/** Response envelope for GET /api/notifications/ */
export interface NotificationListResponse {
  notifications: Notification[];
  unread_count: number;
}

/** Response envelope for PATCH /api/notifications/<id>/read/ */
export type NotificationReadResponse = Notification;

/** Response envelope for POST /api/notifications/read-all/ */
export interface NotificationMarkAllReadResponse {
  marked_read: number;
}
