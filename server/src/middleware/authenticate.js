import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import { findUserById } from '../modules/auth/auth.service.js';

/**
 * Verifies the bearer token and loads the caller onto req.user. Every task
 * route depends on this — req.user.id is the only source of ownership.
 */
const authenticate = async (req, res, next) => {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Missing or malformed Authorization header'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(payload.sub);

    // A token can outlive the user it was issued for.
    if (!user) {
      return next(ApiError.unauthorized('Invalid or expired token'));
    }

    req.user = user;
    return next();
  } catch {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
};

export default authenticate;
