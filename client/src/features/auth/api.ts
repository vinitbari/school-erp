/**
 * Auth API functions.
 */
import apiClient from '@/lib/api-client';

export const authApi = {
  login: (username: string, password: string) =>
    apiClient.post('/auth/login', { username, password }),

  logout: () =>
    apiClient.post('/auth/logout'),

  me: () =>
    apiClient.get('/auth/me'),

  refresh: () =>
    apiClient.post('/auth/refresh'),
};
