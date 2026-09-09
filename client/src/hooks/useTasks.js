import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as tasksApi from '../api/tasks.js';

const TASKS_KEY = 'tasks';

export function useTasks(filters = {}) {
  return useQuery({
    queryKey: [TASKS_KEY, filters],
    queryFn: () => tasksApi.fetchTasks(filters),
    select: (response) => response.data,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => tasksApi.createTask(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TASKS_KEY] }),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => tasksApi.updateTask(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TASKS_KEY] }),
  });
}
