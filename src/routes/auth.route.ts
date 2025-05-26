import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

import { validateFields } from '../middlewares/fieldsValidator.middleware';
import { createUserSchema } from '../validators/user.validator';
import { isAuthenticated } from '../middlewares/auth.middleware';

const router = Router();

router.post(
  '/register',
  validateFields(createUserSchema),
  authController.register,
);
router.post('/login', authController.login);
router.post('/check', isAuthenticated, authController.checkAuthStatus);
router.post('/logout', authController.logout);

export default router;
