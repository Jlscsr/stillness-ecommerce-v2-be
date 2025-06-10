import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  rating: z
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  title: z.string().min(1, 'Title is required'),
  text: z.string().min(1, 'Review text is required'),
});
