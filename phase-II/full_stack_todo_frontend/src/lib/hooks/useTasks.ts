import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '@/lib/api/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { PaginationState } from '@/types/ui';
import { Task, TaskCreateRequest, TaskUpdateRequest } from '@/types/tasks';

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  createTask: (data: TaskCreateRequest) => Promise<Task>;
  updateTask: (taskId: string, data: TaskUpdateRequest) => Promise<Task>;
  toggleComplete: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  goToPage: (page: number) => void;
  refreshTasks: () => Promise<void>;
}

export function useTasks(initialPage: number = 1, initialLimit: number = 10): UseTasksReturn {
  const { user, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: initialPage,
    pageSize: initialLimit,
    totalItems: 0,
    totalPages: 0,
    canGoBack: false,
    canGoForward: false,
  });

  // Use refs to avoid circular dependencies
  const currentPageRef = useRef(initialPage);
  const pageSizeRef = useRef(initialLimit);

  const fetchTasks = useCallback(async (page: number, limit: number) => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/users/${user.id}/tasks`, {
        params: {
          page: page,
          page_size: limit,
        },
      });

      // Backend returns { items: [...], total: ..., page: ..., page_size: ..., total_pages: ... }
      const taskItems = response.data.items || [];
      setTasks(taskItems);

      // Use pagination data from backend response
      const totalTasks = response.data.total || 0;
      const totalPages = response.data.total_pages || 1;

      currentPageRef.current = page;
      pageSizeRef.current = limit;

      setPagination({
        currentPage: page,
        pageSize: limit,
        totalItems: totalTasks,
        totalPages: totalPages,
        canGoBack: page > 1,
        canGoForward: page < totalPages,
      });
    } catch (err: unknown) {
      console.error('Error fetching tasks:', err);
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Failed to load tasks';
      setError(message || 'Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const createTask = useCallback(async (data: TaskCreateRequest): Promise<Task> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);

      const response = await apiClient.post(
        `/users/${user.id}/tasks`,
        data
      );

      const newTask = response.data;

      // Update local state
      setTasks(prevTasks => [newTask, ...prevTasks]);

      // Update pagination total
      setPagination(prev => {
        const newTotal = prev.totalItems + 1;
        const newTotalPages = Math.ceil(newTotal / prev.pageSize);
        return {
          ...prev,
          totalItems: newTotal,
          totalPages: newTotalPages,
          canGoForward: prev.currentPage < newTotalPages,
        };
      });

      return newTask;
    } catch (err: unknown) {
      console.error('Error creating task:', err);
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Failed to create task';
      const errorMessage = message || 'Failed to create task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [user]);

  const updateTask = useCallback(async (taskId: string, data: TaskUpdateRequest): Promise<Task> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);

      const response = await apiClient.patch(
        `/users/${user.id}/tasks/${taskId}`,
        data
      );

      const updatedTask = response.data;

      // Update local state
      setTasks(prevTasks =>
        prevTasks.map(t => (t.id === taskId ? updatedTask : t))
      );

      return updatedTask;
    } catch (err: unknown) {
      console.error('Error updating task:', err);
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Failed to update task';
      const errorMessage = message || 'Failed to update task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [user]);

  const toggleComplete = useCallback(async (taskId: string) => {
    if (!user) return;

    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      await apiClient.patch(
        `/users/${user.id}/tasks/${taskId}`,
        { is_completed: !task.is_completed }
      );

      // Update local state
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === taskId ? { ...t, is_completed: !t.is_completed } : t
        )
      );
    } catch (err: unknown) {
      console.error('Error toggling task completion:', err);
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Failed to update task';
      setError(message || 'Failed to update task');
    }
  }, [tasks, user]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!user) return;

    try {
      await apiClient.delete(`/users/${user.id}/tasks/${taskId}`);

      // Update local state
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));

      // Update pagination total
      setPagination(prev => {
        const newTotal = prev.totalItems - 1;
        const newTotalPages = Math.ceil(newTotal / prev.pageSize);
        return {
          ...prev,
          totalItems: newTotal,
          totalPages: newTotalPages,
          canGoForward: prev.currentPage < newTotalPages,
        };
      });
    } catch (err: unknown) {
      console.error('Error deleting task:', err);
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Failed to delete task';
      setError(message || 'Failed to delete task');
      throw err; // Re-throw so the component can handle it
    }
  }, [user]);

  const goToPage = useCallback((page: number) => {
    fetchTasks(page, pageSizeRef.current);
  }, [fetchTasks]);

  const refreshTasks = useCallback(async () => {
    await fetchTasks(currentPageRef.current, pageSizeRef.current);
  }, [fetchTasks]);

  // Fetch tasks on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTasks(initialPage, initialLimit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  return {
    tasks,
    loading,
    error,
    pagination,
    createTask,
    updateTask,
    toggleComplete,
    deleteTask,
    goToPage,
    refreshTasks,
  };
}
