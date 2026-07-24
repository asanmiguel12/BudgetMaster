import { getAuthToken } from './authStorage';

const DEFAULT_API_URL = 'http://localhost:3000';

export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL,
  enabled: process.env.EXPO_PUBLIC_API_ENABLED !== 'false',
};

export function isApiEnabled() {
  return API_CONFIG.enabled && Boolean(API_CONFIG.baseUrl);
}

export function canUseRemoteApi() {
  return isApiEnabled() && Boolean(getAuthToken());
}
