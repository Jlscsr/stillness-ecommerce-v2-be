import { Document, Types } from 'mongoose';

export interface ShippingInformation {
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  productId: Types.ObjectId;
  name: string;
  image: {
    src: string;
    alt: string;
  };
  quantity: number;
  priceAtTimeAddition: number;
  total: number;
}

export interface Order extends Document {
  userId: Types.ObjectId;
  orderNumber: string;
  shippingInformation: ShippingInformation;
  orderItems: OrderItem[];
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'paid';
  orderStatus:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';
  reasonOfCancellation?: string;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderRequestBody {
  shippingInformation: ShippingInformation;
  orderItems: OrderItem[];
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'paid';
  orderStatus:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';
  reasonOfCancellation?: string;
  totalAmount: number;
}
