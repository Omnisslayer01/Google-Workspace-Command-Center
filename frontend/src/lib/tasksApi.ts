import { WorkspaceTask, TaskCreateInput, TaskUpdateInput } from '../types';
import { apiFetch } from './apiClient';

/**
 * Tasks API Client
 * Connects to BE2 Task 8 /api/tasks/ endpoint.
 */
export const tasksApi = {
  async listTasks(): Promise<{ data: WorkspaceTask[]; source: 'live' }> {
    const data = await apiFetch<WorkspaceTask[]>('/api/tasks/');
    return { data, source: 'live' };
  },

  async createTask(input: TaskCreateInput): Promise<WorkspaceTask> {
    return await apiFetch<WorkspaceTask>('/api/tasks/', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async updateTask(id: string, input: TaskUpdateInput): Promise<WorkspaceTask> {
    return await apiFetch<WorkspaceTask>(`/api/tasks/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  async toggleComplete(id: string): Promise<WorkspaceTask> {
    // We need to fetch current task to know its status, or just pass a status toggle
    // Assuming backend patch accepts just status
    // To do this properly without fetching first, we should really know the current status.
    // Wait, the UI passes the ID to toggle. The UI already has the task in state, but the API method just takes ID.
    // Let's change the API method to take currentStatus, OR we fetch it first.
    const task = await apiFetch<WorkspaceTask>(`/api/tasks/${id}/`);
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    
    return await apiFetch<WorkspaceTask>(`/api/tasks/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
  },

  async deleteTask(id: string): Promise<void> {
    await apiFetch<void>(`/api/tasks/${id}/`, {
      method: 'DELETE',
    });
  },
};
