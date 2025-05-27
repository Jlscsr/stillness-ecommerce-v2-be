import { Types, Document } from 'mongoose';

export interface Product extends Document {
  _id: Types.ObjectId;
  name: string;
  japaneseText?: string;
  description: string;
  longDescription: string;
  price: number;
  category: string;
  images: object[];
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
  longDescription: string;
  price: number;
  category: string;
  images: object[];
  materials: string[];
  dimensions: string;
  stock: number;
}
