export interface ServiceIntegration {
  id: 'gmail' | 'calendar' | 'drive' | 'sheets';
  name: string;
  category: string;
  description: string;
  color: string;
  borderColor: string;
  bgLight: string;
  status: 'Ready' | 'Active' | 'Connected';
  eventsSupported: string[];
  actionsSupported: string[];
  scopes: string[];
}

export const WORKSPACE_SERVICES: ServiceIntegration[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'Communication & Ingestion',
    description: 'Listen for inbound messages, labels, invoice attachments, and send formatted follow-up notifications.',
    color: '#ea4335',
    borderColor: 'border-red-200',
    bgLight: 'bg-red-50',
    status: 'Connected',
    eventsSupported: ['New message matching query', 'Label applied', 'Attachment received', 'Thread updated'],
    actionsSupported: ['Send message', 'Apply label', 'Create draft', 'Archive thread'],
    scopes: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'],
  },
  {
    id: 'drive',
    name: 'Google Drive',
    category: 'Storage & Governance',
    description: 'Archive attachments into organized folder structures, manage file permissions, and audit external sharing.',
    color: '#0f9d58',
    borderColor: 'border-emerald-200',
    bgLight: 'bg-emerald-50',
    status: 'Connected',
    eventsSupported: ['File created', 'File modified in folder', 'Permission changed', 'External share detected'],
    actionsSupported: ['Upload file', 'Move to folder', 'Update permissions', 'Export metadata'],
    scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.metadata.readonly'],
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    category: 'Scheduling & Deadlines',
    description: 'Schedule automated review checkpoints, create meeting agendas, and verify participant availability.',
    color: '#1a73e8',
    borderColor: 'border-blue-200',
    bgLight: 'bg-blue-50',
    status: 'Connected',
    eventsSupported: ['Event starts', 'RSVP changed', 'Calendar invite received'],
    actionsSupported: ['Create event with Drive link', 'Add attendee', 'Set reminder deadline', 'Check availability'],
    scopes: ['https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar.readonly'],
  },
  {
    id: 'sheets',
    name: 'Google Sheets',
    category: 'Structured Data & Audit',
    description: 'Append real-time execution rows, reconcile tabular vendor data, and update financial logs automatically.',
    color: '#f9ab00',
    borderColor: 'border-amber-200',
    bgLight: 'bg-amber-50',
    status: 'Connected',
    eventsSupported: ['Row added', 'Cell modified', 'Form submission linked'],
    actionsSupported: ['Append row', 'Update cell range', 'Query table values', 'Clear range'],
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  },
];

export interface WorkflowStep {
  stepNumber: number;
  service: 'gmail' | 'drive' | 'calendar' | 'sheets' | 'system';
  title: string;
  summary: string;
  payloadKey: string;
  payloadValue: string;
  latencyMs: number;
}

export const SAMPLE_WORKFLOW = {
  id: 'wf_inv_2026_09',
  title: 'Inbound Vendor Invoice Pipeline',
  triggerType: 'Email Received with PDF attachment',
  frequency: 'Real-time event hook',
  steps: [
    {
      stepNumber: 1,
      service: 'gmail' as const,
      title: 'Match Incoming Invoice',
      summary: 'Filters inbound messages matching subject:"Invoice" OR has:attachment filename:pdf',
      payloadKey: 'email.from',
      payloadValue: 'billing@meridian-supplies.com',
      latencyMs: 140,
    },
    {
      stepNumber: 2,
      service: 'drive' as const,
      title: 'Archive PDF to Dedicated Folder',
      summary: 'Extracts attachment "INV-2026-089.pdf" and commits to /Finance/2026/Q3/Payables',
      payloadKey: 'drive.folderId',
      payloadValue: '0B12xA9_DriveFinance2026',
      latencyMs: 380,
    },
    {
      stepNumber: 3,
      service: 'calendar' as const,
      title: 'Create 3-Day Payment Review',
      summary: 'Schedules 30-min finance review with attachment link 3 business days before due date',
      payloadKey: 'calendar.summary',
      payloadValue: 'Review & Approve Meridian Invoice #089',
      latencyMs: 210,
    },
    {
      stepNumber: 4,
      service: 'sheets' as const,
      title: 'Append Ledger Entry',
      summary: 'Records vendor name, invoice amount ($14,250.00), Drive URL, and pending status in master sheet',
      payloadKey: 'sheets.row_range',
      payloadValue: 'AccountsPayable!A128:G128',
      latencyMs: 195,
    },
  ],
};

export const CORE_PILLARS = [
  {
    step: '01',
    name: 'Connect',
    tagline: 'Direct Google Workspace OAuth scopes without fragile scraping or third-party middleware.',
    details: [
      'Zero-configuration discovery of Gmail labels, Drive directories, and active Calendars.',
      'Least-privilege permission grants per automated workflow.',
      'Enterprise Google Workspace delegated authority support.',
    ],
  },
  {
    step: '02',
    name: 'See',
    tagline: 'Real-time visibility across files, scheduling conflicts, and cross-service dependencies.',
    details: [
      'Comprehensive audit log tracking who shared what, when, and to whom.',
      'Execution history with millisecond-level step logs and error telemetry.',
      'Granular drive permission governance across internal and external collaborators.',
    ],
  },
  {
    step: '03',
    name: 'Automate',
    tagline: 'Deterministic visual workflows triggering actions across all four services seamlessly.',
    details: [
      'Visual node-based workflow builder with condition branching and payload mapping.',
      'Guaranteed delivery and retry mechanisms backed by Celery job queues.',
      'Manual approval checkpoints before sensitive actions execute.',
    ],
  },
];
