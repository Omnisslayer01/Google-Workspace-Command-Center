import React from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Check, ArrowRight } from 'lucide-react';
import { WorkspaceTask } from '../../types';

interface PendingTasksCardProps {
  tasks: WorkspaceTask[];
  onToggleTask: (id: string) => void;
}

export const PendingTasksCard: React.FC<PendingTasksCardProps> = ({ tasks, onToggleTask }) => {
  const priorityStyles = {
    urgent: 'bg-red-50 text-red-700 border-red-200',
    high: 'bg-amber-50 text-amber-700 border-amber-200',
    medium: 'bg-blue-50 text-blue-700 border-blue-200',
    low: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const serviceColors = {
    gmail: 'bg-red-500',
    calendar: 'bg-blue-500',
    drive: 'bg-amber-500',
    sheets: 'bg-emerald-500',
  };

  const pending = tasks.filter((t) => t.status !== 'completed');

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs relative overflow-hidden flex flex-col justify-between">
      {/* Top green/slate hairline */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Pending Tasks</h3>
              <p className="text-xs text-slate-500">Cross-service actionable items</p>
            </div>
          </div>
          <Link
            to="/tasks"
            className="text-xs font-semibold text-slate-800 hover:text-slate-950 flex items-center gap-1 transition-colors group"
          >
            <span>All Tasks</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">All tasks cleared!</div>
        ) : (
          <div className="space-y-2.5">
            {tasks.slice(0, 4).map((task) => {
              const isCompleted = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                    isCompleted
                      ? 'border-slate-100 bg-slate-50/50 opacity-60'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-[#34A853] border-[#34A853] text-white'
                          : 'border-slate-300 hover:border-[#34A853] bg-white'
                      }`}
                      aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div className="min-w-0">
                      <div
                        className={`text-sm font-medium ${
                          isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {task.title}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        {task.service && (
                          <span className="flex items-center gap-1 font-medium capitalize">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                serviceColors[task.service] || 'bg-slate-400'
                              }`}
                            />
                            <span>{task.service}</span>
                          </span>
                        )}
                        {task.assignedTo && <span>• {task.assignedTo}</span>}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 ${
                      priorityStyles[task.priority]
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>{pending.length} tasks remaining</span>
        <span className="font-medium text-emerald-600">
          {tasks.length > 0 ? Math.round(((tasks.length - pending.length) / tasks.length) * 100) : 0}% Done
        </span>
      </div>
    </div>
  );
};
