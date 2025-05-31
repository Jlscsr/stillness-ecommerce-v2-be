import { Router } from 'express';

import { authorizedRoles } from '../middlewares/role.middleware';
import { isAuthenticated } from '../middlewares/auth.middleware';
import * as paypalController from '../controllers/paypal.controller';

const router = Router();

router.post(
  '/create-order',
  isAuthenticated,
  authorizedRoles('customer'),
  paypalController.createPayPalOrder,
);

export default router;
