import { Schema, model } from 'mongoose';

import { VALID_CATEGORIES } from '../constants/categories';
import type { Product } from '../types/product.types';

const ProductSchema = new Schema<Product>(
  {
    name: {
      type: String,
      required: true,
    },
    japaneseText: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    longDescription: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: VALID_CATEGORIES,
    },
    images: [
      {
        src: { type: String, required: true },
        alt: { type: String, required: true },
        storageProvider: {
          type: String,
          enum: ['supabase', 'cloudinary', 'external'],
        },
        bucket: { type: String },
        path: { type: String },
        role: {
          type: String,
          enum: ['main', 'gallery'],
        },
      },
    ],
    materials: { type: [String], required: true },
    dimensions: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

ProductSchema.index({ category: 1 });

export default model<Product>('Product', ProductSchema);
