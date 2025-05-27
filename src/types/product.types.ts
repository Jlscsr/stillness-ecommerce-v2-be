import { Types, Document } from 'mongoose';

export interface Image extends Document {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  src: string;
  alt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product extends Document {
  _id: Types.ObjectId;
  name: string;
  japaneseText?: string;
  description: string;
  longDescription: string;
  price: number;
  category: string;
  images: Image[];
  materials: string[];
  dimensions: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}
