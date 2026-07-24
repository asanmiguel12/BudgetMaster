const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureUsersFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
  }
}

function readUsersData() {
  ensureUsersFile();
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.users) ? parsed.users : [];
  } catch {
    return [];
  }
}

function writeUsersData(users) {
  ensureUsersFile();
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
}

function createUserId() {
  return crypto.randomUUID();
}

function findUserByEmail(email) {
  const normalized = email.trim().toLowerCase();
  return readUsersData().find((user) => user.email === normalized) ?? null;
}

function findUserById(id) {
  return readUsersData().find((user) => user.id === id) ?? null;
}

function createUser({ email, passwordHash, name }) {
  const users = readUsersData();
  const normalizedEmail = email.trim().toLowerCase();
  const user = {
    id: createUserId(),
    email: normalizedEmail,
    passwordHash,
    name: name?.trim() || normalizedEmail.split('@')[0],
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeUsersData(users);
  return user;
}

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  toPublicUser,
};
