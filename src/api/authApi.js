import { apiRequest } from './client';
import { isApiEnabled } from './config';

export async function registerUser({ email, password, name }) {
  if (!isApiEnabled()) {
    throw new Error('API is disabled');
  }

  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: { email, password, name },
    skipAuth: true,
  });
}

export async function loginUser({ email, password }) {
  if (!isApiEnabled()) {
    throw new Error('API is disabled');
  }

  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email, password },
    skipAuth: true,
  });
}

export async function fetchCurrentUser() {
  return apiRequest('/api/auth/me');
}
