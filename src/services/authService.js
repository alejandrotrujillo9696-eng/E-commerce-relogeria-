import apiClient from './apiClient';

export const registerRequest = (user) =>
  apiClient('/auth/register', {
    method: 'POST',
    body: JSON.stringify(user),
  });

export const loginRequest = (credentials) =>
  apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

export const logoutRequest = () =>
  apiClient('/auth/logout', { method: 'POST' });

export const getCurrentUserRequest = () =>
  apiClient('/auth/me', { redirectOnUnauthorized: false });
