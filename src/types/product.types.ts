import { Document, Types } from 'mongoose';

// Product image data is stored as a URL or local data URL until storage is migrated.
export interface ProductImage {
  _id?: number;
  src: string;
  alt: string;
}

export interface Product extends Document {
  _id: Types.ObjectId;
  name: string;
  japaneseText?: string;
  description: string;
  longDescription?: string;
  price: number;
  category: string;
  images: ProductImage[];
  materials: string[];
  dimensions: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductRequestBody {
  name: string;
  japaneseText?: string;
  description: string;
  longDescription?: string;
  price: number;
  category: string;
  images: ProductImage[];
  materials: string[];
  dimensions: string;
  stock: number;
}
