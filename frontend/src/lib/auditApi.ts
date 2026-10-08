import { apiFetch } from './apiClient';

export interface AuditLog {
  id: number;
  user: number | null;
  username: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AuditLogFilters {
  user?: string;
  action?: string;
  date_from?: string;
  date_to?: string;
}

export interface AuditLogResponse {
  success: boolean;
  count: number;
  next: string | null;
  previous: string | null;
  results: AuditLog[];
}

export async function getAuditLogs(
  filters: AuditLogFilters = {}
): Promise<AuditLog[]> {
  const params = new URLSearchParams();

  if (filters.user?.trim()) {
    params.set('user', filters.user.trim());
  }

  if (filters.action?.trim()) {
    params.set('action', filters.action.trim());
  }

  if (filters.date_from) {
    params.set('date_from', filters.date_from);
  }

  if (filters.date_to) {
    params.set('date_to', filters.date_to);
  }

  const queryString = params.toString();

  const endpoint = `/api/audit/${
    queryString ? `?${queryString}` : ''
  }`;

  const response = await apiFetch<AuditLogResponse>(endpoint);

  return response.results || [];
}