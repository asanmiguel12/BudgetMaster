import { apiRequest } from './client';
import { canUseRemoteApi } from './config';

export async function createLinkToken() {
  const { link_token } = await apiRequest('/api/plaid/link-token', { method: 'POST' });
  return link_token;
}

export async function exchangePublicToken(publicToken) {
  return apiRequest('/api/plaid/exchange', {
    method: 'POST',
    body: { public_token: publicToken },
  });
}

export async function connectSandboxBank() {
  if (!canUseRemoteApi()) {
    throw new Error('Sign in required to connect a bank');
  }
  return apiRequest('/api/plaid/sandbox/connect', { method: 'POST', body: {} });
}

export async function fetchPlaidItems() {
  if (!canUseRemoteApi()) return [];
  return apiRequest('/api/plaid/items');
}

export async function fetchBankAccounts() {
  if (!canUseRemoteApi()) return [];
  return apiRequest('/api/plaid/accounts');
}

export async function syncPlaidItem(itemId) {
  return apiRequest(`/api/plaid/items/${itemId}/sync`, { method: 'POST' });
}

export async function disconnectPlaidItem(itemId) {
  return apiRequest(`/api/plaid/items/${itemId}`, { method: 'DELETE' });
}
