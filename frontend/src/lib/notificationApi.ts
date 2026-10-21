import { apiFetch } from "./apiClient";

import type {
  NotificationListResponse,
  NotificationMarkAllReadResponse,
  NotificationReadResponse,
} from "../types/notifications";

export async function listNotifications(
  unreadOnly = false
): Promise<NotificationListResponse> {
  const query = unreadOnly
    ? "?unread_only=true"
    : "";

  return apiFetch<NotificationListResponse>(
    `/api/notifications/${query}`
  );
}

export async function markNotificationRead(
  notificationId: number
): Promise<NotificationReadResponse> {
  return apiFetch<NotificationReadResponse>(
    `/api/notifications/${notificationId}/read/`,
    {
      method: "PATCH",
    }
  );
}

export async function markAllNotificationsRead(): Promise<NotificationMarkAllReadResponse> {
  return apiFetch<NotificationMarkAllReadResponse>(
    "/api/notifications/read-all/",
    {
      method: "POST",
    }
  );
}