import asyncHandler from '../../utils/asyncHandler.js';
import * as authService from './auth.service.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { token, user } = await authService.login(email, password);

  res.status(200).json({ token, user });
});

export const me = asyncHandler(async (req, res) => {
  res.status(200).json({ user: req.user });
});
