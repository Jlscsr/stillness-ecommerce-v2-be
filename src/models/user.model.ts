import { Schema, model, Document, Types } from 'mongoose';

interface Address extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  country: string;
  province: string;
  city: string;
  postalCode: string;
  street: string;
  createdAt?: string;
  updatedAt?: string;
}

interface User extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin';
  address: Address;
  acceptTerms: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<Address>(
  {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

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
    address: addressSchema,
    acceptTerms: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true },
);

export default model<User>('User', userSchema);
