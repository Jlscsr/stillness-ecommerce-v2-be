import { Router } from 'express';
import * as productController from '../controllers/product.controller';

import { validateFields } from '../middlewares/fieldsValidator.middleware';
import {
  createProductSchema,
  updateProductSchema,
} from '../validators/product.validator';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { authorizedRoles } from '../middlewares/role.middleware';

const router = Router();

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post(
  '/',
  isAuthenticated,
  authorizedRoles('admin'),
  validateFields(createProductSchema),
  productController.createProduct,
);
router.put(
  '/:id',
  isAuthenticated,
  authorizedRoles('admin'),
  validateFields(updateProductSchema),
  productController.updateProduct,
);
router.delete(
  '/:id',
  isAuthenticated,
  authorizedRoles('admin'),
  productController.deleteProduct,
);

export default router;
