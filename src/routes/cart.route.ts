import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';

import { validateFields } from '../middlewares/fieldsValidator.middleware';
import {
  addToCartSchema,
  updateCartItemSchema,
} from '../validators/cart.validator';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { authorizedRoles } from '../middlewares/role.middleware';

const router = Router();

router.get('/', isAuthenticated, cartController.getCartItems);
router.post(
  '/',
  isAuthenticated,
  authorizedRoles('customer'),
  validateFields(addToCartSchema),
  cartController.addToCart,
);
router.put(
  '/:productId',
  isAuthenticated,
  authorizedRoles('customer'),
  validateFields(updateCartItemSchema),
  cartController.updateCartItem,
);
router.delete(
  '/:productId',
  isAuthenticated,
  authorizedRoles('customer'),
  cartController.removeCartItem,
);
router.delete(
  '/',
  isAuthenticated,
  authorizedRoles('customer'),
  cartController.clearCart,
);

export default router;
