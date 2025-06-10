import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';

import { validateFields } from '../middlewares/fieldsValidator.middleware';
import { createReviewSchema } from '../validators/review.validator';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { authorizedRoles } from '../middlewares/role.middleware';

const router = Router();

router.get(
  '/:productId',
  isAuthenticated,
  authorizedRoles('customer'),
  reviewController.getReviewsByProductId,
);

router.post(
  '/',
  isAuthenticated,
  authorizedRoles('customer'),
  validateFields(createReviewSchema),
  reviewController.addNewReview,
);

export default router;
