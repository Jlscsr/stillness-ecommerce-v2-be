import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

import { validateFields } from '../middlewares/fieldsValidator.middleware';
import { createUserSchema, loginSchema } from '../validators/user.validator';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { authRateLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validateFields(createUserSchema),
  authController.register,
);
router.post(
  '/login',
  authRateLimiter,
  validateFields(loginSchema),
  authController.login,
);
router.post('/check', isAuthenticated, authController.checkAuthStatus);
router.post('/logout', authController.logout);

export default router;
