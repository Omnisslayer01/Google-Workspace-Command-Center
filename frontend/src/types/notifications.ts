export type NotificationType =
  | "gmail"
  | "calendar"
  | "drive"
  | "sheets"
  | "system";

export interface Notification {
  id: number;
  notification_type: NotificationType;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  unread_count: number;
}

export type NotificationReadResponse = Notification;

export interface NotificationMarkAllReadResponse {
  marked_read: number;
}