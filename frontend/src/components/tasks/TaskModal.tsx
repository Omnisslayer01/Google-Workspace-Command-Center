import React, { useState, useEffect } from 'react';
import { WorkspaceTask, TaskCreateInput, TaskPriority, TaskStatus, WorkspaceService } from '../../types';
import { X, CheckSquare, Check } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: TaskCreateInput) => Promise<void>;
  initialTask?: WorkspaceTask | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [service, setService] = useState<WorkspaceService>('calendar');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('Yash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setPriority(initialTask.priority);
      setStatus(initialTask.status);
      setService(initialTask.service || 'calendar');
      setDueDate(initialTask.dueDate ? initialTask.dueDate.slice(0, 10) : '');
      setAssignedTo(initialTask.assignedTo || 'Yash');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('todo');
      setService('calendar');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(tomorrow.toISOString().slice(0, 10));
      setAssignedTo('Yash');
    }
    setError(null);
  }, [isOpen, initialTask]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a task title.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        service,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        assignedTo,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center text-slate-800">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {initialTask ? 'Edit Workspace Task' : 'Create Workspace Task'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Reconcile invoices or audit permissions"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-[#34A853] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-[#34A853]"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-[#34A853]"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Google Service
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value as WorkspaceService)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-[#34A853]"
              >
                <option value="gmail">Gmail</option>
                <option value="calendar">Calendar</option>
                <option value="drive">Drive</option>
                <option value="sheets">Sheets</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-[#34A853] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Assignee
            </label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="e.g. Yash, Sarah Chen"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-[#34A853]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add relevant links, document IDs, or notes..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-[#34A853]"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : initialTask ? 'Update Task' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
