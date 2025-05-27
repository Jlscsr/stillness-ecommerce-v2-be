import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
import * as AddressController from '../controllers/address.controller';
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

router.post(
  '/address',
  isAuthenticated,
  authorizedRoles('customer'),
  AddressController.addNewAddress,
);

router.put(
  '/address/:id',
  isAuthenticated,
  authorizedRoles('customer'),
  AddressController.updateAddress,
);

router.delete(
  '/address/:id',
  isAuthenticated,
  authorizedRoles('customer'),
  AddressController.deleteAddress,
);

export default router;
