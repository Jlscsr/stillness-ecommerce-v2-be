import { Document, Types } from 'mongoose';
export interface Address extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  country: string;
  province: string;
  city: string;
  postalCode: string;
  street: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'customer';
  address?: Address;
  acceptTerms: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserResponse = Omit<User, 'password'>;
