import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = '@mybudget/authToken';
const AUTH_USER_KEY = '@mybudget/authUser';

let sessionToken = null;
let sessionUser = null;

export function getAuthToken() {
  return sessionToken;
}

export function getAuthUser() {
  return sessionUser;
}

export function isAuthenticated() {
  return Boolean(sessionToken);
}

export async function loadAuthSession() {
  const [token, userJson] = await Promise.all([
    AsyncStorage.getItem(AUTH_TOKEN_KEY),
    AsyncStorage.getItem(AUTH_USER_KEY),
  ]);

  sessionToken = token || null;
  sessionUser = userJson ? JSON.parse(userJson) : null;
  return { token: sessionToken, user: sessionUser };
}

export async function saveAuthSession({ token, user }) {
  sessionToken = token;
  sessionUser = user;
  await Promise.all([
    AsyncStorage.setItem(AUTH_TOKEN_KEY, token),
    AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user)),
  ]);
}

export async function clearAuthSession() {
  sessionToken = null;
  sessionUser = null;
  await Promise.all([
    AsyncStorage.removeItem(AUTH_TOKEN_KEY),
    AsyncStorage.removeItem(AUTH_USER_KEY),
  ]);
}
