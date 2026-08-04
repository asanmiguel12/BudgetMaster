import { API_CONFIG } from './config';
import { getAuthToken } from './authStorage';

const REQUEST_TIMEOUT_MS = 8000;

function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => {
    clearTimeout(timer);
  });
}

export class ApiError extends Error {
  constructor(message, { status, body } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function parseResponseBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, headers = {}, skipAuth = false } = options;
  const url = `${API_CONFIG.baseUrl.replace(/\/$/, '')}${path}`;

  const authHeaders = {};
  const token = getAuthToken();
  if (!skipAuth && token) {
    authHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetchWithTimeout(url, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...authHeaders,
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    const message = responseBody?.error || `Request failed (${response.status})`;
    throw new ApiError(message, { status: response.status, body: responseBody });
  }

  return responseBody;
}

export async function checkHealth() {
  return apiRequest('/health');
}
