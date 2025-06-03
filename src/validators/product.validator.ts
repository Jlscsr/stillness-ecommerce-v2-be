import { z } from 'zod';

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
    .number()
    .min(1, 'Product price is required')
    .max(10000, 'Product price must be less than 10000'),
  category: z
    .string()
    .min(1, 'Product category is required')
    .max(50, 'Product category must be less than 50 characters'),
  stock: z
    .number()
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
    .array(
      z.object({
        src: z.string(),
        alt: z.string().min(1, 'Image alt text is required'),
      }),
    )
    .min(1, 'At least one image is required')
    .max(5, 'A maximum of 5 images is allowed'),
});

export const updateProductSchema = createProductSchema.partial();
