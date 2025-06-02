import { Router } from 'express';

import { authorizedRoles } from '../middlewares/role.middleware';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { validateFields } from '../middlewares/fieldsValidator.middleware';
import { createOrderSchema } from '../validators/order.validator';
import * as orderController from '../controllers/order.controller';

const router = Router();

router.get(
  '/',
  isAuthenticated,
  authorizedRoles('admin'),
  orderController.getAllOrders,
);

router.get(
  '/users',
  isAuthenticated,
  authorizedRoles('admin'),
  orderController.getUsersOrders,
);

router.get(
  '/user',
  isAuthenticated,
  authorizedRoles('customer'),
  orderController.getOrderByUserId,
);

router.get(
  '/:id',
  isAuthenticated,
  authorizedRoles('admin'),
  orderController.getOrderById,
);

router.post(
  '/',
  isAuthenticated,
  authorizedRoles('customer'),
  validateFields(createOrderSchema),
  orderController.createOrder,
);

router.put(
  '/:orderId/payment-status',
  isAuthenticated,
  authorizedRoles('admin'),
  orderController.updatePaymentStatus,
);

router.put(
  '/:orderId/order-status',
  isAuthenticated,
  authorizedRoles('admin'),
  orderController.updateOrderStatus,
);

router.delete(
  '/:id',
  isAuthenticated,
  authorizedRoles('admin'),
  orderController.cancelOrder,
);

export default router;
