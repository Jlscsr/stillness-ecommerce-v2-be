import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { authorizedRoles } from '../middlewares/role.middleware';

const router = Router();

router.get(
  '/',
  isAuthenticated,
  authorizedRoles('admin'),
  UserController.getAllUsers,
);

router.get(
  '/:id',
  isAuthenticated,
  authorizedRoles('admin'),
  UserController.getUserById,
);

export default router;
