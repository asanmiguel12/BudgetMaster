const express = require('express');
const { hashPassword, verifyPassword, signToken } = require('../auth');
const { findUserByEmail, createUser, toPublicUser } = require('../users');

const router = express.Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
  return typeof email === 'string' && EMAIL_PATTERN.test(email.trim());
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 6;
}

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body ?? {};

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'valid email is required' });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({ error: 'password must be at least 6 characters' });
  }
  if (findUserByEmail(email)) {
    return res.status(409).json({ error: 'email already registered' });
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = createUser({ email, passwordHash, name });
    const token = signToken(user);

    res.status(201).json({
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'failed to create account' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!validateEmail(email) || !validatePassword(password)) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'invalid email or password' });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'invalid email or password' });
  }

  const token = signToken(user);

  res.json({
    token,
    user: toPublicUser(user),
  });
});

module.exports = router;
