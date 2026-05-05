import { Types, Document } from 'mongoose';

export interface CartItem extends Document {
  productId: Types.ObjectId;
  quantity: number;
  priceAtTimeOfAddition: number;
  image?: string;
  updatedAt?: Date;
  createdAt?: Date;
}

export interface Cart extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  items: CartItem[];
  totalAmount: number;
  updatedAt?: Date;
  createdAt?: Date;
}

export interface CartRequestBody {
  productId: string;
  quantity: number;
}
