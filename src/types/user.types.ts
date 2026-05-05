import { Document, Types } from 'mongoose';
export interface Address extends Document {
  country: string;
  city: string;
  postalCode: string;
  street: string;
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
export type UserUpdateRequestBody = {
  email?: string;
  firstName?: string;
  lastName?: string;
  address?: AddressUpdateRequestBody;
  currentPassword?: string;
};

export type AddressUpdateRequestBody = {
  country: string;
  city: string;
  postalCode: string;
  street: string;
};

export type ChangePasswordRequestBody = {
  currentPassword: string;
  newPassword: string;
};
