import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function readToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' && token ? token : null;
}

async function userFromToken(token) {
  const payload = jwt.verify(token, process.env.JWT_SECRET); // throws if bad/expired
  // Look the user up every request so a deleted or demoted account loses access immediately.
  return User.findById(payload.sub);
}

// Requires a valid token. Sets req.user.
export async function requireAuth(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });

  let user;
  try {
    user = await userFromToken(token);
  } catch {
    return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }
  if (!user) return res.status(401).json({ message: 'Your account no longer exists.' });

  req.user = user;
  next();
}

// Anonymous visitors allowed through (req.user stays undefined).
export async function optionalAuth(req, _res, next) {
  const token = readToken(req);
  if (token) {
    try {
      req.user = (await userFromToken(token)) || undefined;
    } catch {
      /* invalid token on a public route is treated as anonymous */
    }
  }
  next();
}

// Use AFTER requireAuth.
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Only an admin can do that.' });
  }
  next();
}