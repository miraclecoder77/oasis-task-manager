import { z } from 'zod';

export const loginSchema = z.object({
  // Trim and lower-case before the format check, so a stray space or a
  // capitalised address still matches the stored email.
  email: z
    .string({ error: 'A valid email is required' })
    .trim()
    .toLowerCase()
    .pipe(z.email('A valid email is required')),
  password: z
    .string({ error: 'Password is required' })
    .min(1, 'Password is required'),
});
