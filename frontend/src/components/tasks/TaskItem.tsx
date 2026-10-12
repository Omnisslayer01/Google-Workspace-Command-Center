import React from 'react';
import { WorkspaceTask } from '../../types';
import {
  Check,
  Clock,
  Edit2,
  Trash2,
  User,
  Calendar,
  Mail,
  HardDrive,
  Table,
} from 'lucide-react';

interface TaskItemProps {
  task: WorkspaceTask;
  onToggleComplete: (id: string) => void;
  onEdit: (task: WorkspaceTask) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const isCompleted = task.status === 'completed';

  const priorityConfig = {
    urgent: { label: 'Urgent', class: 'bg-red-50 text-red-700 border-red-200' },
    high: { label: 'High', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    medium: { label: 'Medium', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    low: { label: 'Low', class: 'bg-slate-100 text-slate-700 border-slate-200' },
  }[task.priority] || { label: task.priority, class: 'bg-slate-100 text-slate-700' };

  const serviceConfig = {
    gmail: { name: 'Gmail', icon: Mail, color: 'text-[#EA4335] bg-red-50 border-red-200' },
    calendar: { name: 'Calendar', icon: Calendar, color: 'text-[#4285F4] bg-blue-50 border-blue-200' },
    drive: { name: 'Drive', icon: HardDrive, color: 'text-[#b45309] bg-amber-50 border-amber-200' },
    sheets: { name: 'Sheets', icon: Table, color: 'text-[#34A853] bg-emerald-50 border-emerald-200' },
  }[task.service || 'calendar'];

  const formatDueDate = (isoString?: string) => {
    if (!isoString) return null;
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return null;
    }
  };

  const ServiceIcon = serviceConfig?.icon;

  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-150 flex items-start justify-between gap-4 ${
        isCompleted
          ? 'bg-slate-50/60 border-slate-200 opacity-65'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
      }`}
    >
      {/* Left: Checkbox and content */}
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onToggleComplete(task.id)}
          className={`w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center transition-all ${
            isCompleted
              ? 'bg-[#34A853] border-[#34A853] text-white shadow-2xs'
              : 'border-slate-300 hover:border-[#34A853] bg-white'
          }`}
          aria-label={isCompleted ? 'Mark task incomplete' : 'Mark task completed'}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
        </button>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-sm font-semibold ${
                isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
              }`}
            >
              {task.title}
            </span>

            {/* Priority Chip */}
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${priorityConfig.class}`}
            >
              {priorityConfig.label}
            </span>

            {/* Service Association Chip */}
            {task.service && serviceConfig && ServiceIcon && (
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border ${serviceConfig.color}`}
              >
                <ServiceIcon className="w-3 h-3" />
                <span>{serviceConfig.name}</span>
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Metadata Row: Due Date & Assignee */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500 font-mono">
            {task.dueDate && (
              <span className="flex items-center gap-1 text-slate-600">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Due: {formatDueDate(task.dueDate)}</span>
              </span>
            )}

            {task.assignedTo && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                <span>Assignee: {task.assignedTo}</span>
              </span>
            )}

            <span className="text-slate-400">
              • Status: <span className="capitalize text-slate-600">{task.status.replace('_', ' ')}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 shrink-0 pt-0.5">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
          title="Edit task"
          aria-label="Edit task"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => {
            if (confirm(`Delete task "${task.title}"?`)) {
              onDelete(task.id);
            }
          }}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 hover:border-red-200 transition-colors"
          title="Delete task"
          aria-label="Delete task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
