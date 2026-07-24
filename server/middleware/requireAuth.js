const { verifyToken } = require('../auth');
const { findUserById, toPublicUser } = require('../users');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'authentication required' });
  }

  try {
    const payload = verifyToken(token);
    const user = findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'invalid token' });
    }
    req.user = toPublicUser(user);
    next();
  } catch {
    return res.status(401).json({ error: 'invalid or expired token' });
  }
}

module.exports = requireAuth;
