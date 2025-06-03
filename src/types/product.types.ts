import { Types, Document } from 'mongoose';

// Frontend image structure (base64)
export interface ImageUpload {
  _id?: number;
  src: string; // base64 encoded image
  alt: string;
}

// Database image structure (after Cloudinary upload)
export interface CloudinaryImage {
  _id?: Types.ObjectId;
  public_id: string; // Cloudinary public ID
  src: string; // Cloudinary secure URL (using src to match MongoDB schema)
  alt: string; // Alt text for the image
}

export interface Product extends Document {
  _id: Types.ObjectId;
  name: string;
  japaneseText?: string;
  description: string;
  longDescription?: string;
  price: number;
  category: string;
  images: CloudinaryImage[];
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
  images: ImageUpload[];
  materials: string[];
  dimensions: string;
  stock: number;
}
