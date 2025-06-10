import { Schema } from 'mongoose';
export interface Review {
  _id: string;
  productId: Schema.Types.ObjectId;
  name: string;
  email: string;
  rating: number;
  title: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export type ReviewRequestBody = Omit<Review, '_id' | 'createdAt' | 'updatedAt'>;
