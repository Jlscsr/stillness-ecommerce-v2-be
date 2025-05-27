import { Schema, model } from 'mongoose';
import { User } from '../types/user.types';

const userSchema = new Schema<User>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    acceptTerms: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true },
);

export default model<User>('User', userSchema);
