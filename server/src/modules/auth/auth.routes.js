import { Router } from 'express';
import validate from '../../middleware/validate.js';
import authenticate from '../../middleware/authenticate.js';
import { loginSchema } from './auth.schema.js';
import * as authController from './auth.controller.js';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);

export default router;
