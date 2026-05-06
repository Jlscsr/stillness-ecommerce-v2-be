import { z } from 'zod';

import { VALID_CATEGORIES } from '../constants/categories';

const productImageSchema = z.object({
  src: z.string(),
  alt: z.string().min(1, 'Image alt text is required'),
  storageProvider: z.enum(['supabase', 'cloudinary', 'external']).optional(),
  bucket: z.string().optional(),
  path: z.string().optional(),
  role: z.enum(['main', 'gallery']).optional(),
});

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(50, 'Product name must be less than 50 characters'),
  japaneseText: z
    .string()
    .max(50, 'Japanese text must be less than 50 characters'),
  description: z
    .string()
    .min(1, 'Product description is required')
    .max(500, 'Product description must be less than 500 characters'),
  longDescription: z
    .string()
    .min(1, 'Product long description is required')
    .max(1000, 'Product long description must be less than 1000 characters'),
  price: z
    .coerce.number()
    .min(1, 'Product price is required')
    .max(10000, 'Product price must be less than 10000'),
  category: z.enum(VALID_CATEGORIES, {
    errorMap: () => ({ message: 'Product category is invalid' }),
  }),
  stock: z
    .coerce.number()
    .min(1, 'Product stock is required')
    .max(100, 'Product stock must be less than 100'),
  materials: z
    .array(z.string())
    .min(1, 'Product materials are required')
    .max(5, 'Product materials must be less than 5'),
  dimensions: z
    .string()
    .min(1, 'Product dimensions are required')
    .max(50, 'Product dimensions must be less than 50 characters'),
  images: z
    .array(productImageSchema)
    .max(5, 'A maximum of 5 images is allowed')
    .optional(),
  imageAlts: z.array(z.string()).optional(),
});

export const updateProductSchema = createProductSchema.partial();
