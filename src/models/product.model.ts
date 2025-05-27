import { Schema, model } from 'mongoose';

import type { Product, Image } from '../types/product.types';

const ImageSchema = new Schema<Image>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    src: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

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
    },
    images: [ImageSchema],
    materials: { types: [String], required: true },
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

export default model<Product>('Product', ProductSchema);
