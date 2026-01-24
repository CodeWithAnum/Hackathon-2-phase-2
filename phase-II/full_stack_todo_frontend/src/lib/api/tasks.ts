// Task API functions

import apiClient from '@/lib/api/client';
import { Task, TaskUpdateRequest } from '@/types/tasks';

/**
 * Fetch a single task by ID
 */
export async function getTask(userId: string, taskId: string): Promise<Task> {
  try {
    const response = await apiClient.get(`/users/${userId}/tasks/${taskId}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching task:', error);
    const message = error && typeof error === 'object' && 'response' in error
      ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
      : 'Failed to fetch task';
    throw new Error(message || 'Failed to fetch task');
  }
}

/**
 * Update a task
 */
export async function updateTask(
  userId: string,
  taskId: string,
  data: TaskUpdateRequest
): Promise<Task> {
  try {
    const response = await apiClient.patch(
      `/users/${userId}/tasks/${taskId}`,
      data
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Error updating task:', error);
    const message = error && typeof error === 'object' && 'response' in error
      ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
      : 'Failed to update task';
    throw new Error(message || 'Failed to update task');
  }
}
