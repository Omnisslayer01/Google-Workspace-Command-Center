
import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Bell,
  CalendarDays,
  Check,
  CheckCheck,
  Circle,
  Clock,
  FileSpreadsheet,
  HardDrive,
  Info,
  Mail,
  RefreshCw,
} from "lucide-react";

import { Header } from "../components/common/Header";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../lib/notificationApi";
import type {
  Notification,
  NotificationType,
} from "../types/notifications";

type NotificationListData = {
  notifications: Notification[];
  unread_count: number;
};

function unwrap<T>(response: unknown): T {
  if (
    response !== null &&
    typeof response === "object" &&
    "data" in response
  ) {
    return (response as { data: T }).data;
  }
  return response as T;
}

const styles: Record<
  NotificationType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  gmail: {
    label: "Gmail",
    icon: <Mail className="h-5 w-5" />,
    color: "bg-red-50 text-red-600",
  },
  calendar: {
    label: "Calendar",
    icon: <CalendarDays className="h-5 w-5" />,
    color: "bg-blue-50 text-blue-600",
  },
  drive: {
    label: "Drive",
    icon: <HardDrive className="h-5 w-5" />,
    color: "bg-amber-50 text-amber-600",
  },
  sheets: {
    label: "Sheets",
    icon: <FileSpreadsheet className="h-5 w-5" />,
    color: "bg-emerald-50 text-emerald-600",
  },
  system: {
    label: "System",
    icon: <Info className="h-5 w-5" />,
    color: "bg-slate-100 text-slate-600",
  },
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const elapsed = Date.now() - date.getTime();

  if (elapsed >= 0 && elapsed < 60_000) return "Just now";
  if (elapsed >= 0 && elapsed < 3_600_000) {
    const minutes = Math.floor(elapsed / 60_000);
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  if (elapsed >= 0 && elapsed < 86_400_000) {
    const hours = Math.floor(elapsed / 3_600_000);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear()
      ? "numeric"
      : undefined,
    hour: "numeric",
    minute: "2-digit",
  });
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async (refresh = false) => {
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      setError(null);

      // Load all records; the All/Unread filter is applied locally.
      const response = await listNotifications(false);
      const data = unwrap<NotificationListData>(response);

      setNotifications(
        Array.isArray(data?.notifications) ? data.notifications : []
      );
      setUnreadCount(
        typeof data?.unread_count === "number" ? data.unread_count : 0
      );
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not load notifications."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (item: Notification) => {
    if (item.is_read || markingId !== null) return;

    try {
      setMarkingId(item.id);
      setError(null);
      await markNotificationRead(item.id);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === item.id
            ? { ...notification, is_read: true }
            : notification
        )
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      setError(
        err instanceof Error ? err.message : "Could not update notification."
      );
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || markingAll) return;

    try {
      setMarkingAll(true);
      setError(null);
      await markAllNotificationsRead();

      setNotifications((current) =>
        current.map((item) => ({ ...item, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      setError(
        err instanceof Error ? err.message : "Could not mark all as read."
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const visible = notifications.filter(
    (item) => filter === "all" || !item.is_read
  );
  const readCount = notifications.filter((item) => item.is_read).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Header />

      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        <section className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#4285F4]" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#4285F4]">
                Workspace Updates
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Notifications
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Stay up to date with activity across your connected Workspace services.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void loadNotifications(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => void handleMarkAllRead()}
              disabled={unreadCount === 0 || markingAll}
              className="inline-flex items-center gap-2 rounded-lg bg-[#4285F4] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3367d6] disabled:opacity-50"
            >
              <CheckCheck className="h-4 w-4" />
              {markingAll ? "Marking..." : "Mark all as read"}
            </button>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Total notifications</p>
            <p className="mt-3 text-3xl font-bold">
              {loading ? "—" : notifications.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Circle className="h-3 w-3 fill-blue-500 text-blue-500" />
              Unread
            </p>
            <p className="mt-3 text-3xl font-bold text-[#4285F4]">
              {loading ? "—" : unreadCount}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Check className="h-4 w-4 text-emerald-600" />
              Read
            </p>
            <p className="mt-3 text-3xl font-bold text-emerald-600">
              {loading ? "—" : readCount}
            </p>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Notification request failed</p>
              <p className="mt-1 break-words text-sm">{error}</p>
              <button
                type="button"
                onClick={() => void loadNotifications(true)}
                className="mt-2 text-sm font-semibold underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold">Your activity</h2>
              <p className="mt-1 text-xs text-slate-500">
                Updates from connected Workspace services
              </p>
            </div>

            <div className="inline-flex w-fit rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`rounded-md px-4 py-2 text-sm font-medium ${
                  filter === "all"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilter("unread")}
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium ${
                  filter === "unread"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="mx-auto h-6 w-6 animate-spin text-slate-400" />
              <p className="mt-3 text-sm text-slate-500">
                Loading notifications...
              </p>
            </div>
          ) : visible.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                {filter === "unread" ? (
                  <CheckCheck className="h-7 w-7" />
                ) : (
                  <Bell className="h-7 w-7" />
                )}
              </div>
              <h3 className="mt-4 font-semibold text-slate-800">
                {filter === "unread" ? "You're all caught up" : "No notifications yet"}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {filter === "unread"
                  ? "There are no unread notifications."
                  : "New Workspace activity will appear here."}
              </p>
              {filter === "unread" && notifications.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className="mt-4 text-sm font-semibold text-[#4285F4] hover:underline"
                >
                  View all notifications
                </button>
              )}
            </div>
          ) : (
            <div>
              {visible.map((item) => {
                const style = styles[item.notification_type] ?? styles.system;

                return (
                  <article
                    key={item.id}
                    className={`flex items-start gap-4 border-b border-slate-100 px-5 py-5 last:border-b-0 ${
                      item.is_read ? "bg-white" : "bg-blue-50/40"
                    }`}
                  >
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.color}`}>
                      {style.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">
                          {style.label}
                        </span>
                        {!item.is_read && (
                          <span className="h-2 w-2 rounded-full bg-[#4285F4]" />
                        )}
                      </div>
                      <p className={`mt-1 break-words text-sm ${
                        item.is_read
                          ? "font-medium text-slate-700"
                          : "font-semibold text-slate-900"
                      }`}>
                        {item.message}
                      </p>
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(item.created_at)}
                      </p>
                    </div>

                    {!item.is_read && (
                      <button
                        type="button"
                        onClick={() => void handleMarkRead(item)}
                        disabled={markingId !== null}
                        aria-label={`Mark notification ${item.id} as read`}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                      >
                        {markingId === item.id ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        <span className="hidden sm:inline">Mark read</span>
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default NotificationsPage;
