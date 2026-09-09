import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma.js';
import ApiError from '../../utils/ApiError.js';

const TOKEN_TTL = '24h';

/** Fields safe to serialise back to the client — never the password hash. */
const publicUserFields = { id: true, email: true, createdAt: true };

export const findUserById = (id) =>
  prisma.user.findUnique({ where: { id }, select: publicUserFields });

export const login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // The same error for an unknown email and a wrong password: distinguishing
  // them would let a caller enumerate registered accounts.
  const passwordMatches = user
    ? await bcrypt.compare(password, user.password)
    : false;

  if (!user || !passwordMatches) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_TTL,
  });

  return {
    token,
    user: { id: user.id, email: user.email, createdAt: user.createdAt },
  };
};
