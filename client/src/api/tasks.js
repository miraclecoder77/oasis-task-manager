import { request } from './client.js';

export const fetchTasks = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);

  const query = params.toString();
  return request(`/tasks${query ? `?${query}` : ''}`);
};

export const createTask = (data) =>
  request('/tasks', { method: 'POST', body: data });

export const updateTask = (id, data) =>
  request(`/tasks/${id}`, { method: 'PATCH', body: data });
