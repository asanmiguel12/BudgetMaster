import { Platform } from 'react-native';
import { getAuthToken } from './authStorage';

const DEFAULT_API_URL = 'http://127.0.0.1:3000';

function isIosSimulator() {
  if (Platform.OS !== 'ios') return false;
  try {
    // eslint-disable-next-line global-require
    const Constants = require('expo-constants').default;
    return Constants?.isDevice === false;
  } catch {
    return false;
  }
}

function resolveApiUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

  // Simulator shares the Mac network stack. Routing via a hotspot/LAN IP
  // (e.g. 172.20.x.x) often hangs; localhost works reliably.
  if (isIosSimulator()) {
    try {
      const parsed = new URL(fromEnv);
      if (parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
        return `http://127.0.0.1:${parsed.port || '3000'}`;
      }
    } catch {
      return DEFAULT_API_URL;
    }
  }

  return fromEnv;
}

export const API_CONFIG = {
  baseUrl: resolveApiUrl(),
  enabled: process.env.EXPO_PUBLIC_API_ENABLED !== 'false',
};

export function isApiEnabled() {
  return API_CONFIG.enabled && Boolean(API_CONFIG.baseUrl);
}

export function canUseRemoteApi() {
  return isApiEnabled() && Boolean(getAuthToken());
}
