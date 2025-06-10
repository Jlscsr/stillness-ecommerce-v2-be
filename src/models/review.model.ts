import { Schema, model } from 'mongoose';

import { Review } from '../types/review.types';

export const ReviewSchema = new Schema<Review>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default model<Review>('Review', ReviewSchema);
