import { request } from './client.js';

export const login = (email, password) =>
  request('/auth/login', {
    method: 'POST',
    body: { email, password },
    skipAuthHandler: true,
  });

export const fetchCurrentUser = () => request('/auth/me');
