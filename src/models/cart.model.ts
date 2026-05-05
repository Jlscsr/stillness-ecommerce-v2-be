import { Schema, model } from 'mongoose';

import { Cart, CartItem } from '../types/cart.types';

const CartItemSchema = new Schema<CartItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    priceAtTimeOfAddition: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const CartSchema = new Schema<Cart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [CartItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

CartSchema.index({ userId: 1 });

export default model<Cart>('Cart', CartSchema);
