import { WorkspaceTask, TaskCreateInput, TaskUpdateInput } from '../types';
import { MOCK_TASKS } from '../data/mockData';

const TASKS_STORAGE_KEY = 'gwcc_mock_tasks_v1';

function getStoredTasks(): WorkspaceTask[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return [...MOCK_TASKS];
}

function saveStoredTasks(tasks: WorkspaceTask[]) {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // ignore
  }
}

/**
 * Tasks API Adapter
 * Uses local state adapter until BE2's final API contract is available.
 */
export const tasksApi = {
  async listTasks(): Promise<{ data: WorkspaceTask[]; source: 'adapter' }> {
    return { data: getStoredTasks(), source: 'adapter' };
  },

  async createTask(input: TaskCreateInput): Promise<WorkspaceTask> {
    const tasks = getStoredTasks();
    const newTask: WorkspaceTask = {
      id: `task-${Date.now()}`,
      title: input.title,
      description: input.description,
      priority: input.priority,
      status: input.status || 'todo',
      dueDate: input.dueDate,
      service: input.service,
      assignedTo: input.assignedTo || 'Yash',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.unshift(newTask);
    saveStoredTasks(tasks);
    return newTask;
  },

  async updateTask(id: string, input: TaskUpdateInput): Promise<WorkspaceTask> {
    const tasks = getStoredTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Task not found: ${id}`);
    }
    const updated: WorkspaceTask = {
      ...tasks[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    tasks[index] = updated;
    saveStoredTasks(tasks);
    return updated;
  },

  async toggleComplete(id: string): Promise<WorkspaceTask> {
    const tasks = getStoredTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Task not found: ${id}`);
    }
    const current = tasks[index];
    const newStatus = current.status === 'completed' ? 'todo' : 'completed';
    const updated: WorkspaceTask = {
      ...current,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    tasks[index] = updated;
    saveStoredTasks(tasks);
    return updated;
  },

  async deleteTask(id: string): Promise<void> {
    const tasks = getStoredTasks();
    const filtered = tasks.filter((t) => t.id !== id);
    saveStoredTasks(filtered);
  },
};
