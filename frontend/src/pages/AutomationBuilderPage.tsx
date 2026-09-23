import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Zap,
  GitBranch,
  Play,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  createAutomation,
  type AutomationCondition,
  type AutomationAction,
} from '../lib/automationApi';

const TRIGGERS = [
  { value: 'gmail_new', label: 'New Gmail' },
  { value: 'gmail_search', label: 'Gmail Search' },
  { value: 'calendar_new', label: 'New Calendar Event' },
  { value: 'calendar_upcoming', label: 'Upcoming Calendar Event' },
  { value: 'drive_new', label: 'New Drive File' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'manual', label: 'Manual' },
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

const ACTION_LABELS: Record<string, string> = {
  gmail_send: 'Send Gmail',
  calendar_create: 'Create Calendar Event',
  calendar_update: 'Update Calendar Event',
  drive_folder: 'Create Drive Folder',
  drive_save: 'Save to Drive',
  sheets_write: 'Write to Sheets',
  task_create: 'Create Task',
  notify: 'Notify',
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

  const [conditions, setConditions] = useState<AutomationCondition[]>([]);
  const [actions, setActions] = useState<AutomationAction[]>([
    emptyAction('drive_save'),
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const availableActions = useMemo(
    () => TRIGGER_ACTION_MAP[triggerType] || [],
    [triggerType]
  );

  const handleTriggerChange = (value: string) => {
    setTriggerType(value);

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
        `${response.message} Automation #${response.automation_id} was created.`
      );

      setName('');
      setConditions([]);
      setActions([emptyAction(TRIGGER_ACTION_MAP[triggerType][0])]);
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
              title="Back to Dashboard"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <div className="mb-1 flex items-center gap-2">
                <Zap size={18} className="text-indigo-600" />
                <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                  Automation
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                Create Automation
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Connect a trigger, optional conditions, and actions into one
                workflow.
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={17} />
            {isSaving ? 'Creating...' : 'Create Automation'}
          </button>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            <div className="text-sm">{successMessage}</div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <div className="text-sm">{errorMessage}</div>
          </div>
        )}

        {/* Automation Name */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Automation Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Example: Save important Gmail messages to Drive"
            maxLength={255}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
        </section>

        {/* Trigger */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Zap size={19} />
            </div>

            <div>
              <h2 className="font-semibold">Trigger</h2>
              <p className="text-sm text-slate-500">
                Choose what starts this automation.
              </p>
            </div>
          </div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Trigger Type
          </label>

          <select
            value={triggerType}
            onChange={(event) => handleTriggerChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          >
            {TRIGGERS.map((trigger) => (
              <option key={trigger.value} value={trigger.value}>
                {trigger.label}
              </option>
            ))}
          </select>
        </section>

        {/* Conditions */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <GitBranch size={19} />
              </div>

              <div>
                <h2 className="font-semibold">Conditions</h2>
                <p className="text-sm text-slate-500">
                  Optional rules that refine when the automation applies.
                </p>
              </div>
            </div>

            <button
              onClick={addCondition}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Plus size={16} />
              Add Condition
            </button>
          </div>

          {conditions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
              <p className="text-sm text-slate-500">
                No conditions added. This automation will run whenever its
                trigger occurs.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conditions.map((condition, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_1fr_1.5fr_auto]"
                >
                  <select
                    value={condition.field}
                    onChange={(event) =>
                      updateCondition(index, 'field', event.target.value)
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                  >
                    {FIELD_OPTIONS.map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={condition.operator}
                    onChange={(event) =>
                      updateCondition(index, 'operator', event.target.value)
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                  >
                    {OPERATORS.map((operator) => (
                      <option key={operator.value} value={operator.value}>
                        {operator.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={condition.value}
                    onChange={(event) =>
                      updateCondition(index, 'value', event.target.value)
                    }
                    placeholder="Enter value"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                  />

                  <button
                    onClick={() => removeCondition(index)}
                    className="flex items-center justify-center rounded-lg border border-red-100 bg-white px-3 text-red-500 transition hover:bg-red-50"
                    title="Remove condition"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Actions */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Play size={19} />
              </div>

              <div>
                <h2 className="font-semibold">Actions</h2>
                <p className="text-sm text-slate-500">
                  Choose what happens after the trigger and conditions match.
                </p>
              </div>
            </div>

            <button
              onClick={addAction}
              disabled={availableActions.length === 0}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={16} />
              Add Action
            </button>
          </div>

          <div className="space-y-3">
            {actions.map((action, index) => (
              <div
                key={`${index}-${action.type}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-500 shadow-sm">
                  {index + 1}
                </div>

                <select
                  value={action.type}
                  onChange={(event) =>
                    updateActionType(index, event.target.value)
                  }
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                >
                  {availableActions.map((actionType) => (
                    <option key={actionType} value={actionType}>
                      {ACTION_LABELS[actionType] || actionType}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => removeAction(index)}
                  disabled={actions.length === 1}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-100 bg-white text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                  title="Remove action"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
            Available actions are automatically filtered according to the
            selected trigger.
          </div>
        </section>

        {/* Bottom action */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={17} />
            {isSaving ? 'Creating...' : 'Create Automation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutomationBuilderPage;