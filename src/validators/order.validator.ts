import { z } from 'zod';

export const createOrderSchema = z.object({
  shippingInformation: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
  orderItems: z
    .array(
      z.object({
        name: z.string().min(1, 'Product name is required'),
        image: z.object({
          src: z.string().min(1, 'Image source is required'),
          alt: z.string().optional(),
        }),
        productId: z.string().min(1, 'Product ID is required'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
        priceAtTimeOfAddition: z
          .number()
          .min(0, 'Price must be a positive number'),
        total: z.number().min(0, 'Total item amount must be a positive number'),
      }),
    )
    .min(1, 'At least one cart item is required'),
  paymentMethod: z.enum(['cod', 'online'], {
    errorMap: () => ({ message: 'Payment method is required' }),
  }),
  paymentStatus: z.enum(['pending', 'paid'], {
    errorMap: () => ({ message: 'Payment status is required' }),
  }),
  reasonOfCancellation: z.string().optional(),
  totalAmount: z.number().min(0, 'Total amount must be a positive number'),
});
