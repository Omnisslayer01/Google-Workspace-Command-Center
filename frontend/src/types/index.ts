export type WorkspaceService = 'gmail' | 'calendar' | 'drive' | 'sheets';

// ==========================================
// 1. Calendar Interfaces (Matches Django API)
// ==========================================
export interface Attendee {
  email: string;
  displayName?: string;
  responseStatus?: 'accepted' | 'tentative' | 'declined' | 'needsAction';
  self?: boolean;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  attendees?: Attendee[];
  htmlLink?: string;
  hangoutLink?: string;
  status?: string;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{ method: string; minutes: number }>;
  };
  colorId?: string;
}

export interface CalendarEventCreateInput {
  summary: string;
  description?: string;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  location?: string;
  attendees?: string[]; // email array
}

export interface CalendarEventUpdateInput {
  summary?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  attendees?: string[];
}

export interface CalendarAnalytics {
  total_meetings: number;
  meetings_by_day: Record<string, number>;
  meetings_by_week: Record<string, number>;
}

export interface CalendarConflict {
  eventA: CalendarEvent;
  eventB: CalendarEvent;
  overlapMinutes: number;
}

// ==========================================
// 2. Tasks Interfaces
// ==========================================
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface WorkspaceTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  due_date?: string;
  created_by_automation?: number | null;
  created_at: string;
  updated_at: string;
}

export interface TaskCreateInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  due_date?: string;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  due_date?: string;
}

// ==========================================
// 3. Sheets Analytics Interfaces
// ==========================================
export interface SheetMetric {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtext?: string;
}

export interface SheetColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'currency' | 'date' | 'status';
}

export interface WorksheetItem {
  id: string;
  title: string;
  rowCount: number;
  colCount: number;
  metrics: SheetMetric[];
  columns: SheetColumn[];
  records: Record<string, any>[];
  chartData: {
    categories: Array<{ label: string; value: number; color?: string }>;
    timeline: Array<{ period: string; count: number; value: number }>;
  };
}

export interface SpreadsheetItem {
  id: string;
  title: string;
  lastModified: string;
  worksheets: WorksheetItem[];
}

// ==========================================
// 4. Command Center Dashboard & Workspace Health
// ==========================================
export interface ServiceStatusInfo {
  id: WorkspaceService;
  name: string;
  connected: boolean;
  accountEmail: string;
  lastSync: string;
  status: 'Active' | 'Connected' | 'Warning' | 'Disconnected';
  authError?: string;
}

export interface DriveFileItem {
  id: string;
  name: string;
  type: 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'folder';
  size: string;
  modifiedAt: string;
  owner: string;
  sharedWith: string[];
  webViewLink?: string;
}

export interface AuditLogItem {
  id: string;
  service: WorkspaceService;
  action: string;
  resource: string;
  actor: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  details?: string;
}

export interface AutomationWorkflowItem {
  id: string;
  title: string;
  trigger: string;
  status: 'active' | 'paused' | 'executing';
  lastRun: string;
  successRate: string;
  latency: string;
  runsCount: number;
}

export interface NotificationAlert {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'critical';
  service: WorkspaceService;
}
