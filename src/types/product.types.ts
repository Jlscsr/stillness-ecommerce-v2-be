import { Document, Types } from 'mongoose';

// Product images keep src/alt compatibility while storage metadata stays optional.
export interface ProductImage {
  _id?: number;
  src: string;
  alt: string;
  storageProvider?: 'supabase' | 'cloudinary' | 'external';
  bucket?: string;
  path?: string;
  role?: 'main' | 'gallery';
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
  images?: ProductImage[];
  imageAlts?: string[];
  materials: string[];
  dimensions: string;
  stock: number;
}
