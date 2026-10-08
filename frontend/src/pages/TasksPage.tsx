import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '../components/common/Header';
import { TaskItem } from '../components/tasks/TaskItem';
import { TaskModal } from '../components/tasks/TaskModal';
import { tasksApi } from '../lib/tasksApi';
import {
  WorkspaceTask,
  TaskCreateInput,
  TaskStatus,
} from '../types';
import { MOCK_TASKS } from '../data/mockData';

import {
  CheckSquare,
  Plus,
  Search,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<WorkspaceTask[]>(MOCK_TASKS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] =
    useState<WorkspaceTask | null>(null);

  const [statusFilter, setStatusFilter] =
    useState<'all' | TaskStatus>('all');

  const [searchQuery, setSearchQuery] = useState('');

  // ---------------------------------------------------------
  // LOAD TASKS
  // ---------------------------------------------------------

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await tasksApi.listTasks();

      /*
       * Your API helper already returns the normalized response.
       * Do NOT use response.data.data or response.data.result here.
       */

      if (Array.isArray(response?.data)) {
        setTasks(response.data);
      } else if (Array.isArray(response)) {
        setTasks(response as unknown as WorkspaceTask[]);
      } else {
        console.warn('Unexpected tasks API response:', response);
        setTasks([]);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);

      // Keep mock tasks so the page never becomes blank.
      setTasks(MOCK_TASKS);
    }
  };

  // ---------------------------------------------------------
  // TOGGLE TASK
  // ---------------------------------------------------------

  const handleToggleComplete = async (id: string) => {
    try {
      const updatedTask = await tasksApi.toggleComplete(id);

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === id ? updatedTask : task
        )
      );
    } catch (error) {
      console.error('Failed to toggle task:', error);

      /*
       * Local fallback.
       * This keeps the UI working even if backend is unavailable.
       */
      setTasks((previousTasks) =>
        previousTasks.map((task) => {
          if (task.id !== id) return task;

          const currentStatus = task.status;

          const nextStatus =
            currentStatus === 'completed'
              ? ('todo' as TaskStatus)
              : ('completed' as TaskStatus);

          return {
            ...task,
            status: nextStatus,
          };
        })
      );
    }
  };

  // ---------------------------------------------------------
  // SAVE TASK
  // ---------------------------------------------------------

  const handleSaveTask = async (data: TaskCreateInput) => {
    /*
     * EDIT EXISTING TASK
     */
    if (editingTask) {
      try {
        const updatedTask = await tasksApi.updateTask(
          editingTask.id,
          data
        );

        setTasks((previousTasks) =>
          previousTasks.map((task) =>
            task.id === editingTask.id
              ? updatedTask
              : task
          )
        );
      } catch (error) {
        console.error(
          'Failed to update task. Updating locally instead:',
          error
        );

        /*
         * Local fallback.
         *
         * We only use fields that are actually present
         * in TaskCreateInput.
         */
        setTasks((previousTasks) =>
          previousTasks.map((task) =>
            task.id === editingTask.id
              ? {
                  ...task,
                  title: data.title,
                  description: data.description ?? task.description,
                  due_date:
                    data.due_date ?? task.due_date,
                }
              : task
          )
        );
      }

      setIsModalOpen(false);
      setEditingTask(null);
      return;
    }

    /*
     * CREATE NEW TASK
     */
    try {
      /*
       * IMPORTANT:
       *
       * tasksApi.createTask() returns the task itself.
       * It is NOT an Axios response.
       *
       * Therefore:
       *
       * ❌ response.data
       *
       * ✅ createdTask
       */
      const createdTask = await tasksApi.createTask(data);

      setTasks((previousTasks) => [
        createdTask,
        ...previousTasks,
      ]);
    } catch (error) {
      console.error(
        'Failed to create task. Creating local task instead:',
        error
      );

      /*
       * Backend unavailable fallback.
       *
       * We intentionally do NOT use data.priority because
       * TaskCreateInput in your project does not contain it.
       *
       * We also cast only this local fallback because the exact
       * WorkspaceTask backend fields are defined by your project.
       */
      const localTask = {
        id: `local-${Date.now()}`,
        title: data.title,
        description: data.description ?? '',
        status: 'todo',
        due_date: data.due_date,
      } as unknown as WorkspaceTask;

      setTasks((previousTasks) => [
        localTask,
        ...previousTasks,
      ]);
    }

    setIsModalOpen(false);
    setEditingTask(null);
  };

  // ---------------------------------------------------------
  // DELETE TASK
  // ---------------------------------------------------------

  const handleDeleteTask = async (id: string) => {
    try {
      await tasksApi.deleteTask(id);

      setTasks((previousTasks) =>
        previousTasks.filter((task) => task.id !== id)
      );
    } catch (error) {
      console.error(
        'Failed to delete task. Removing locally:',
        error
      );

      /*
       * Even if backend fails, remove it from the UI.
       */
      setTasks((previousTasks) =>
        previousTasks.filter((task) => task.id !== id)
      );
    }
  };

  // ---------------------------------------------------------
  // EDIT
  // ---------------------------------------------------------

  const handleEdit = (task: WorkspaceTask) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // ---------------------------------------------------------
  // NEW TASK
  // ---------------------------------------------------------

  const handleNewTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  // ---------------------------------------------------------
  // FILTER TASKS
  // ---------------------------------------------------------

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      /*
       * STATUS FILTER
       */
      if (
        statusFilter !== 'all' &&
        task.status !== statusFilter
      ) {
        return false;
      }

      /*
       * SEARCH FILTER
       */
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();

        const title =
          task.title?.toLowerCase() ?? '';

        const description =
          task.description?.toLowerCase() ?? '';

        const matchesSearch =
          title.includes(query) ||
          description.includes(query);

        if (!matchesSearch) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, statusFilter, searchQuery]);

  // ---------------------------------------------------------
  // STATISTICS
  // ---------------------------------------------------------

  const totalCount = tasks.length;

  const todoCount = tasks.filter(
    (task) => task.status === 'todo'
  ).length;

  const inProgressCount = tasks.filter(
    (task) => task.status === 'in_progress'
  ).length;

  const completedCount = tasks.filter(
    (task) => task.status === 'completed'
  ).length;

  const completionPercentage =
    totalCount > 0
      ? Math.round(
          (completedCount / totalCount) * 100
        )
      : 0;

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-[#34A853] selection:text-white">

      <Header unreadCount={2} />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">

          <div>
            <div className="flex items-center gap-2 mb-1">

              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#34A853] font-mono">
                Workspace Operations
              </span>

              <span className="text-slate-300">
                •
              </span>

              <span className="text-xs text-slate-500 font-mono">
                Tasks Command Center
              </span>

            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Workspace Action Queue
            </h1>

            <p className="mt-1 text-sm text-slate-500 max-w-2xl">
              Assign, track, and complete actionable
              items generated across Gmail ingestion,
              Calendar events, and Drive audits.
            </p>
          </div>

          <button
            type="button"
            onClick={handleNewTask}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>

        </div>

        {/* KPI CARDS */}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

          {/* ALL */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">

            <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-1">
              <span>ALL TASKS</span>

              <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="text-2xl font-bold text-slate-900 font-mono">
              {totalCount}
            </div>

            <div className="text-[11px] text-slate-500 mt-0.5">
              Total across services
            </div>

          </div>

          {/* PENDING */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">

            <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-1">
              <span>PENDING / TO DO</span>

              <Clock className="w-3.5 h-3.5 text-[#4285F4]" />
            </div>

            <div className="text-2xl font-bold text-[#4285F4] font-mono">
              {todoCount}
            </div>

            <div className="text-[11px] text-slate-500 mt-0.5">
              {inProgressCount} in progress
            </div>

          </div>

          {/* COMPLETED */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">

            <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-1">
              <span>COMPLETED</span>

              <CheckCircle2 className="w-3.5 h-3.5 text-[#34A853]" />
            </div>

            <div className="text-2xl font-bold text-[#34A853] font-mono">
              {completedCount}
            </div>

            <div className="text-[11px] text-slate-500 mt-0.5">
              {completionPercentage}% completion
            </div>

          </div>

          {/* ACTIVE */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">

            <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-1">
              <span>ACTIVE</span>

              <Clock className="w-3.5 h-3.5 text-[#EA4335]" />
            </div>

            <div className="text-2xl font-bold text-[#EA4335] font-mono">
              {todoCount + inProgressCount}
            </div>

            <div className="text-[11px] text-slate-500 mt-0.5">
              Requires attention
            </div>

          </div>

        </div>

        {/* FILTER BAR */}

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          {/* STATUS */}

          <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50 overflow-x-auto">

            {(
              [
                'all',
                'todo',
                'in_progress',
                'completed',
              ] as const
            ).map((status) => (

              <button
                key={status}
                type="button"
                onClick={() =>
                  setStatusFilter(status)
                }
                className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status.replace('_', ' ')}
              </button>

            ))}

          </div>

          {/* SEARCH */}

          <div className="relative">

            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search tasks..."
              className="pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#34A853] w-48 sm:w-64"
            />

          </div>

        </div>

        {/* TASK LIST */}

        <div className="space-y-3">

          {filteredTasks.length === 0 ? (

            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">

              <CheckSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />

              <p className="text-sm font-medium">
                No tasks found matching current filters.
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Add a new task or adjust your search query.
              </p>

            </div>

          ) : (

            filteredTasks.map((task) => (

              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={
                  handleToggleComplete
                }
                onEdit={handleEdit}
                onDelete={handleDeleteTask}
              />

            ))

          )}

        </div>

      </main>

      {/* MODAL */}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
      />

    </div>
  );
};

export default TasksPage;