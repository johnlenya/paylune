import jwt from 'jsonwebtoken';
import { HttpError } from './helpers.js';

const SECRET =
  process.env.JWT_SECRET || 'paylune-local-demo-secret-change-me-before-deploying';

export function signToken(userId) {
  return jwt.sign({}, SECRET, {
    subject: userId,
    expiresIn: '7d',
    issuer: 'paylune',
    algorithm: 'HS256',
  });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new HttpError(401, 'Please sign in to continue.'));
  }

  try {
    const payload = jwt.verify(token, SECRET, {
      issuer: 'paylune',
      algorithms: ['HS256'],
    });
    req.userId = payload.sub;
    return next();
  } catch {
    return next(new HttpError(401, 'Your session has expired. Please sign in again.'));
  }
}
