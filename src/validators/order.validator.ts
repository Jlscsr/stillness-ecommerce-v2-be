import { z } from 'zod';

export const createOrderSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  orderNumber: z.string().min(1, 'Order number is required'),
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
        productId: z.string().min(1, 'Product ID is required'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
        priceAtTimeOfAddition: z
          .number()
          .min(0, 'Price must be a positive number'),
        totalItemAmount: z
          .number()
          .min(0, 'Total item amount must be a positive number'),
      }),
    )
    .min(1, 'At least one cart item is required'),
  cardInformation: z.object({
    nameOnCard: z.string().min(1, 'Name on card is required'),
    cardNumber: z
      .string()
      .min(16, 'Card number must be 16 digits')
      .max(16, 'Card number must be 16 digits'),
    expiryDate: z.string().refine((date) => {
      const currentDate = new Date();
      const expiry = new Date(date);
      return expiry > currentDate;
    }, 'Expiry date must be in the future'),
    cvv: z.string().length(3, 'CVV must be 3 digits'),
  }),
  paymentMethod: z.enum(['cod', 'online'], {
    errorMap: () => ({ message: 'Payment method is required' }),
  }),

  paymentStatus: z.enum(['pending', 'paid'], {
    errorMap: () => ({ message: 'Payment status is required' }),
  }),
  orderStatus: z.enum(
    ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    {
      errorMap: () => ({ message: 'Order status is required' }),
    },
  ),
  reasonOfCancellation: z.string().optional(),
  totalAmount: z.number().min(0, 'Total amount must be a positive number'),
});
