import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  priceAtTimeOfAddition: z.number().min(0, 'Price must be a positive number'),
});

export const updateCartItemSchema = addToCartSchema.partial();
