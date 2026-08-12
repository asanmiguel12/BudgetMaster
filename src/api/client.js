import { API_CONFIG } from './config';
import { getAuthToken } from './authStorage';

const REQUEST_TIMEOUT_MS = 20000;

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

function getErrorMessage(responseBody, status) {
  if (typeof responseBody?.error === 'string' && responseBody.error) {
    return responseBody.error;
  }

  if (Array.isArray(responseBody?.errors) && responseBody.errors.length > 0) {
    const details = responseBody.errors
      .map((entry) => {
        const field = entry.path || entry.param;
        const message = entry.msg || entry.message;
        if (field && message) return `${field}: ${message}`;
        return message;
      })
      .filter(Boolean);

    if (details.length > 0) return details.join('. ');
  }

  return `Request failed (${status})`;
}

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, headers = {}, skipAuth = false } = options;
  const url = `${API_CONFIG.baseUrl.replace(/\/$/, '')}${path}`;

  const authHeaders = {};
  const token = getAuthToken();
  if (!skipAuth && token) {
    authHeaders.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetchWithTimeout(url, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...authHeaders,
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    const aborted = error?.name === 'AbortError'
      || /aborted|cancelled|canceled/i.test(error?.message || '');
    if (aborted) {
      throw new ApiError(
        `Request timed out talking to ${API_CONFIG.baseUrl}. Is the backend running, and is EXPO_PUBLIC_API_URL your current Mac IP/port?`,
        { status: 0 },
      );
    }
    throw new ApiError(
      error?.message || `Network error talking to ${API_CONFIG.baseUrl}`,
      { status: 0 },
    );
  }

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(responseBody, response.status), {
      status: response.status,
      body: responseBody,
    });
  }

  return responseBody;
}

export async function checkHealth() {
  return apiRequest('/health');
}
