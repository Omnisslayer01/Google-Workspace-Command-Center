import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Zap,
  GitBranch,
  Save,
  CheckCircle2,
  AlertCircle,
  History,
  ChevronDown,
  Mail,
  CalendarDays,
  HardDrive,
  Clock,
  Check,
  Workflow,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  createAutomation,
  type AutomationCondition,
  type AutomationAction,
} from '../lib/automationApi';
import { Header } from '../components/common/Header';

interface TriggerOption {
  value: string;
  label: string;
  category: 'Gmail' | 'Calendar' | 'Google Drive' | 'Schedule';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  accentClass: string;
}

const TRIGGER_OPTIONS: TriggerOption[] = [
  {
    value: 'gmail_new',
    label: 'New Gmail Message',
    category: 'Gmail',
    description: 'Triggers automatically whenever a new email arrives in your connected Gmail inbox.',
    icon: Mail,
    color: '#EA4335',
    accentClass: 'bg-red-50 text-[#EA4335] border-red-200',
  },
  {
    value: 'gmail_search',
    label: 'Gmail Search Match',
    category: 'Gmail',
    description: 'Triggers when a message arriving in your inbox matches specific query terms.',
    icon: Mail,
    color: '#EA4335',
    accentClass: 'bg-red-50 text-[#EA4335] border-red-200',
  },
  {
    value: 'calendar_new',
    label: 'New Calendar Event',
    category: 'Calendar',
    description: 'Triggers when a new event or meeting is scheduled in Google Calendar.',
    icon: CalendarDays,
    color: '#4285F4',
    accentClass: 'bg-blue-50 text-[#4285F4] border-blue-200',
  },
  {
    value: 'calendar_upcoming',
    label: 'Upcoming Calendar Event',
    category: 'Calendar',
    description: 'Triggers ahead of approaching calendar events to execute prep workflows.',
    icon: CalendarDays,
    color: '#4285F4',
    accentClass: 'bg-blue-50 text-[#4285F4] border-blue-200',
  },
  {
    value: 'drive_new',
    label: 'New Drive File',
    category: 'Google Drive',
    description: 'Triggers when a file, spreadsheet, or doc is added or uploaded to Google Drive.',
    icon: HardDrive,
    color: '#FBBC04',
    accentClass: 'bg-amber-50 text-[#b45309] border-amber-200',
  },
  {
    value: 'scheduled',
    label: 'Scheduled Interval',
    category: 'Schedule',
    description: 'Runs periodically on a continuous background schedule.',
    icon: Clock,
    color: '#64748B',
    accentClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
];

const TRIGGER_ACTION_MAP: Record<string, string[]> = {
  gmail_new: [
    'drive_save',
    'calendar_create',
    'gmail_send',
    'notify',
    'task_create',
  ],
  gmail_search: [
    'drive_save',
    'calendar_create',
    'gmail_send',
    'notify',
    'task_create',
  ],
  calendar_new: [
    'calendar_update',
    'gmail_send',
    'notify',
    'task_create',
  ],
  calendar_upcoming: [
    'gmail_send',
    'notify',
    'task_create',
  ],
  drive_new: [
    'notify',
    'gmail_send',
    'task_create',
  ],
  scheduled: [
    'gmail_send',
    'calendar_create',
    'sheets_write',
    'notify',
    'task_create',
  ],
  manual: [
    'gmail_send',
    'calendar_create',
    'drive_folder',
    'sheets_write',
    'notify',
    'task_create',
  ],
};

const ACTION_DEFINITIONS: Record<
  string,
  {
    label: string;
    description: string;
    fields: { key: string; label: string; placeholder: string; type?: string }[];
  }
> = {
  gmail_send: {
    label: 'Gmail — Send email',
    description: 'Send an email message via connected Gmail account',
    fields: [
      { key: 'to', label: 'Recipient Email', placeholder: 'colleague@example.com', type: 'email' },
      { key: 'subject', label: 'Subject', placeholder: 'Workspace Notification' },
      { key: 'body', label: 'Message Body', placeholder: 'Automated details...' },
    ],
  },
  calendar_create: {
    label: 'Calendar — Create event',
    description: 'Schedule a new event on Google Calendar',
    fields: [
      { key: 'summary', label: 'Event Title', placeholder: 'Project Sync' },
      { key: 'description', label: 'Description', placeholder: 'Auto-generated meeting' },
      { key: 'location', label: 'Location / Link', placeholder: 'Google Meet' },
      { key: 'start_time', label: 'Start Time', placeholder: 'YYYY-MM-DDTHH:MM:SS' },
      { key: 'end_time', label: 'End Time', placeholder: 'YYYY-MM-DDTHH:MM:SS' },
    ],
  },
  calendar_update: {
    label: 'Calendar — Update event',
    description: 'Update an existing Google Calendar event',
    fields: [
      { key: 'event_id', label: 'Google Event ID', placeholder: 'event_id_to_update' },
      { key: 'summary', label: 'Updated Title', placeholder: 'Updated Title' },
      { key: 'description', label: 'Updated Description', placeholder: 'Updated Notes' },
    ],
  },
  drive_folder: {
    label: 'Drive — Create folder',
    description: 'Create a new folder in Google Drive',
    fields: [
      { key: 'name', label: 'Folder Name', placeholder: 'Project Archive 2026' },
      { key: 'parent_id', label: 'Parent Folder ID (Optional)', placeholder: 'root or folder ID' },
    ],
  },
  drive_save: {
    label: 'Drive — Save file',
    description: 'Save incoming attachments or files to Google Drive',
    fields: [
      { key: 'folder_id', label: 'Destination Folder ID (Optional)', placeholder: 'root or folder ID' },
    ],
  },
  sheets_write: {
    label: 'Sheets — Write to spreadsheet',
    description: 'Append a row of data to Google Sheets',
    fields: [
      { key: 'spreadsheet_id', label: 'Spreadsheet ID', placeholder: 'Google Spreadsheet ID' },
      { key: 'range_name', label: 'Sheet / Tab Range', placeholder: 'Sheet1!A:E' },
    ],
  },
  task_create: {
    label: 'Tasks — Create internal task',
    description: 'Create an actionable task in Command Center & Google Tasks',
    fields: [
      { key: 'title', label: 'Task Title', placeholder: 'Review incoming submission' },
      { key: 'description', label: 'Task Notes', placeholder: 'Generated from automation' },
      { key: 'due_date', label: 'Due Date', placeholder: 'YYYY-MM-DD', type: 'date' },
    ],
  },
  notify: {
    label: 'Notifications — Send alert',
    description: 'Send an in-app workspace notification alert',
    fields: [
      { key: 'message', label: 'Alert Message', placeholder: 'Automated workflow completed.' },
    ],
  },
};

const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'starts_with', label: 'Starts With' },
  { value: 'ends_with', label: 'Ends With' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
];

const FIELD_OPTIONS = [
  { value: 'subject', label: 'Subject' },
  { value: 'sender', label: 'Sender' },
  { value: 'recipient', label: 'Recipient' },
  { value: 'title', label: 'Title' },
  { value: 'description', label: 'Description' },
  { value: 'name', label: 'Name' },
  { value: 'status', label: 'Status' },
];

const emptyCondition = (): AutomationCondition => ({
  field: 'subject',
  operator: 'contains',
  value: '',
});

const emptyAction = (type: string): AutomationAction => ({
  type,
  config: {},
  order: 1,
});

export const AutomationBuilderPage: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState('gmail_new');
  const [isTriggerMenuOpen, setIsTriggerMenuOpen] = useState(false);
  const triggerMenuRef = useRef<HTMLDivElement>(null);

  const [conditions, setConditions] = useState<AutomationCondition[]>([]);
  const [actions, setActions] = useState<AutomationAction[]>([
    emptyAction('drive_save'),
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Close trigger menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (triggerMenuRef.current && !triggerMenuRef.current.contains(e.target as Node)) {
        setIsTriggerMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedTriggerOption = useMemo(() => {
    return (
      TRIGGER_OPTIONS.find((t) => t.value === triggerType) ||
      TRIGGER_OPTIONS[0]
    );
  }, [triggerType]);

  const availableActions = useMemo(
    () => TRIGGER_ACTION_MAP[triggerType] || [],
    [triggerType]
  );

  const handleSelectTrigger = (value: string) => {
    setTriggerType(value);
    setIsTriggerMenuOpen(false);

    const allowed = TRIGGER_ACTION_MAP[value] || [];

    setActions((currentActions) => {
      const filtered = currentActions.filter((action) =>
        allowed.includes(action.type)
      );

      if (filtered.length > 0) {
        return filtered.map((action, index) => ({
          ...action,
          order: index + 1,
        }));
      }

      if (allowed.length > 0) {
        return [emptyAction(allowed[0])];
      }

      return [];
    });
  };

  const addCondition = () => {
    setConditions((current) => [...current, emptyCondition()]);
  };

  const updateCondition = (
    index: number,
    field: keyof AutomationCondition,
    value: string
  ) => {
    setConditions((current) =>
      current.map((condition, conditionIndex) =>
        conditionIndex === index
          ? { ...condition, [field]: value }
          : condition
      )
    );
  };

  const removeCondition = (index: number) => {
    setConditions((current) =>
      current.filter((_, conditionIndex) => conditionIndex !== index)
    );
  };

  const addAction = () => {
    if (availableActions.length === 0) return;

    const firstAvailable =
      availableActions.find(
        (type) => !actions.some((action) => action.type === type)
      ) || availableActions[0];

    setActions((current) => [
      ...current,
      {
        ...emptyAction(firstAvailable),
        order: current.length + 1,
      },
    ]);
  };

  const updateActionType = (index: number, type: string) => {
    setActions((current) =>
      current.map((action, actionIndex) =>
        actionIndex === index
          ? {
              ...action,
              type,
              config: {},
            }
          : action
      )
    );
  };

  const updateActionConfig = (actionIndex: number, fieldKey: string, value: string) => {
    setActions((current) =>
      current.map((action, index) =>
        index === actionIndex
          ? {
              ...action,
              config: {
                ...(action.config || {}),
                [fieldKey]: value,
              },
            }
          : action
      )
    );
  };

  const removeAction = (index: number) => {
    setActions((current) =>
      current
        .filter((_, actionIndex) => actionIndex !== index)
        .map((action, actionIndex) => ({
          ...action,
          order: actionIndex + 1,
        }))
    );
  };

  const handleSave = async () => {
    setSuccessMessage('');
    setErrorMessage('');

    const trimmedName = name.trim();

    if (!trimmedName) {
      setErrorMessage('Please enter an automation name.');
      return;
    }

    if (actions.length === 0) {
      setErrorMessage('Please add at least one action.');
      return;
    }

    if (conditions.some((condition) => !condition.value.trim())) {
      setErrorMessage('Please complete all condition values.');
      return;
    }

    setIsSaving(true);

    try {
      const response = await createAutomation({
        name: trimmedName,
        trigger: {
          type: triggerType,
          config: {},
        },
        conditions: conditions.map((condition) => ({
          field: condition.field,
          operator: condition.operator,
          value: condition.value.trim(),
        })),
        actions: actions.map((action, index) => ({
          type: action.type,
          config: action.config || {},
          order: index + 1,
        })),
      });

      setSuccessMessage(
        `${response.message} Background automation #${response.automation_id} was registered and is now active.`
      );

      setName('');
      setConditions([]);
      setActions([emptyAction(TRIGGER_ACTION_MAP[triggerType][0])]);
      setTimeout(() => {
        navigate('/automations');
      }, 1200);
    } catch (error: any) {
      const backendError =
        error?.data?.actions?.[0]?.error ||
        error?.data?.detail ||
        error?.message ||
        'Failed to create automation.';

      setErrorMessage(backendError);
    } finally {
      setIsSaving(false);
    }
  };

  const TriggerIcon = selectedTriggerOption.icon;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-[#EA4335] selection:text-white">
      <Header />

      <main className="mx-auto max-w-5xl w-full flex-1 px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/automations')}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 shadow-2xs"
              title="Back to Automations"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#EA4335] font-mono">
                  Automation Builder
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-mono">Background Orchestration</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Create Background Automation
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Workflows run continuously in the background whenever triggers occur.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/automations')}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
            >
              All Automations
            </button>

            <button
              type="button"
              onClick={() => navigate('/automations/history')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
            >
              <History className="w-3.5 h-3.5" />
              <span>Execution History</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-lg bg-[#EA4335] hover:bg-[#d93025] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Registering...' : 'Create Automation'}</span>
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {successMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div className="font-medium">{successMessage}</div>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <div className="font-medium">{errorMessage}</div>
          </div>
        )}

        {/* 1. Automation Name */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
            Automation Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Save important Gmail attachments to Drive archive"
            maxLength={255}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#EA4335] focus:bg-white focus:ring-2 focus:ring-red-100"
          />
        </section>

        {/* 2. Trigger Type (Improved Custom Menu) */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs relative">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 border border-red-200 text-[#EA4335]">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Trigger</h2>
                <p className="text-xs text-slate-500">
                  Select which background event starts this workflow.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-medium text-slate-400">Step 1 of 3</span>
          </div>

          <label className="mb-2 block text-xs font-semibold text-slate-700">
            Select Trigger Type
          </label>

          {/* Custom Trigger Dropdown */}
          <div className="relative" ref={triggerMenuRef}>
            <button
              type="button"
              onClick={() => setIsTriggerMenuOpen((prev) => !prev)}
              className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 p-3.5 transition-all text-left shadow-2xs focus:outline-none focus:ring-2 focus:ring-red-100"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${selectedTriggerOption.accentClass}`}
                >
                  <TriggerIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 truncate">
                      {selectedTriggerOption.label}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {selectedTriggerOption.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {selectedTriggerOption.description}
                  </p>
                </div>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-3 ${
                  isTriggerMenuOpen ? 'rotate-180 text-slate-700' : ''
                }`}
              />
            </button>

            {/* Floating Options Menu */}
            {isTriggerMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-white border border-slate-200 rounded-xl shadow-lg p-2 max-h-[380px] overflow-y-auto space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Available Background Triggers
                </div>

                {TRIGGER_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = opt.value === triggerType;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelectTrigger(opt.value)}
                      className={`w-full flex items-start justify-between gap-3 p-3 rounded-lg text-left transition-colors ${
                        isSelected
                          ? 'bg-red-50/70 border border-red-200'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${opt.accentClass}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-semibold ${
                                isSelected ? 'text-red-900' : 'text-slate-900'
                              }`}
                            >
                              {opt.label}
                            </span>
                            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {opt.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                            {opt.description}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-[#EA4335] shrink-0 mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* 3. Conditions */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                <GitBranch className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Conditions</h2>
                <p className="text-xs text-slate-500">
                  Optional rules to refine when the automation applies.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={addCondition}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Condition</span>
            </button>
          </div>

          {conditions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-6 text-center">
              <p className="text-xs text-slate-500">
                No conditions configured. This workflow will execute for all events of this trigger.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conditions.map((condition, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center rounded-xl border border-slate-200 bg-slate-50/60 p-3.5"
                >
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Field
                    </label>
                    <select
                      value={condition.field}
                      onChange={(event) =>
                        updateCondition(index, 'field', event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#EA4335]"
                    >
                      {FIELD_OPTIONS.map((field) => (
                        <option key={field.value} value={field.value}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Operator
                    </label>
                    <select
                      value={condition.operator}
                      onChange={(event) =>
                        updateCondition(index, 'operator', event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#EA4335]"
                    >
                      {OPERATORS.map((operator) => (
                        <option key={operator.value} value={operator.value}>
                          {operator.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Value
                    </label>
                    <input
                      type="text"
                      value={condition.value}
                      onChange={(event) =>
                        updateCondition(index, 'value', event.target.value)
                      }
                      placeholder="e.g. invoice or urgent"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#EA4335]"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end sm:justify-center pt-2 sm:pt-4">
                    <button
                      type="button"
                      onClick={() => removeCondition(index)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove condition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. Actions */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200 text-[#0f9d58]">
                <Workflow className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Actions</h2>
                <p className="text-xs text-slate-500">
                  What operations should happen when the trigger and conditions match.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={addAction}
              disabled={availableActions.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 shadow-2xs disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Action</span>
            </button>
          </div>

          <div className="space-y-4">
            {actions.map((action, index) => {
              const def = ACTION_DEFINITIONS[action.type];

              return (
                <div
                  key={`${index}-${action.type}`}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-2xs">
                      {index + 1}
                    </div>

                    <select
                      value={action.type}
                      onChange={(event) =>
                        updateActionType(index, event.target.value)
                      }
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#EA4335]"
                    >
                      {availableActions.map((actionType) => (
                        <option key={actionType} value={actionType}>
                          {ACTION_DEFINITIONS[actionType]?.label || actionType}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => removeAction(index)}
                      disabled={actions.length === 1}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                      title="Remove action"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {def && (
                    <div className="pl-11 space-y-2">
                      <p className="text-[11px] text-slate-500 font-medium">
                        {def.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {def.fields.map((field) => (
                          <div
                            key={field.key}
                            className={
                              field.key === 'body' || field.key === 'description'
                                ? 'sm:col-span-2'
                                : ''
                            }
                          >
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              {field.label}
                            </label>
                            <input
                              type={field.type || 'text'}
                              value={String((action.config as any)?.[field.key] || '')}
                              onChange={(e) =>
                                updateActionConfig(index, field.key, e.target.value)
                              }
                              placeholder={field.placeholder}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#EA4335]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom action */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-[#EA4335] hover:bg-[#d93025] px-6 py-3 text-sm font-semibold text-white shadow-2xs transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Registering...' : 'Create Background Automation'}</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default AutomationBuilderPage;
