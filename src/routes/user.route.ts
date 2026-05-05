import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { authorizedRoles } from '../middlewares/role.middleware';
import {
  changePasswordSchema,
  updateUserSchema,
} from '../validators/user.validator';
import { validateFields } from '../middlewares/fieldsValidator.middleware';

const router = Router();

router.get(
  '/',
  isAuthenticated,
  authorizedRoles('admin'),
  UserController.getAllUsers,
);

router.get(
  '/me',
  isAuthenticated,
  authorizedRoles('customer', 'admin'),
  UserController.getUserById,
);

router.patch(
  '/me',
  isAuthenticated,
  authorizedRoles('customer'),
  validateFields(updateUserSchema),
  UserController.updateUser,
);

router.patch(
  '/me/password',
  isAuthenticated,
  authorizedRoles('customer'),
  validateFields(changePasswordSchema),
  UserController.changePassword,
);

router.put(
  '/',
  isAuthenticated,
  authorizedRoles('customer'),
  validateFields(updateUserSchema),
  UserController.updateUser,
);

router.put(
  '/address',
  isAuthenticated,
  authorizedRoles('customer'),
  UserController.updateUserAddress,
);

export default router;
