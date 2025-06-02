import { Request, Response, NextFunction } from 'express';

import Order from '../models/order.model';
import Cart from '../models/cart.model';
import Product from '../models/product.model';
import User from '../models/user.model';

import { success, fail } from '../helpers/response.helper';
import { ApiResponse } from '../types/response.types';
import type {
  OrderRequestBody,
  Order as OrderType,
} from '../types/order.types';

const generateOrderNumber = (): string => {
  return `ORD-${Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0')}`;
};

export const getAllOrders = async (
  req: Request,
  res: Response<ApiResponse<OrderType[]>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return success(res, [], 'No orders found');
    }

    success(res, orders, 'Orders fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getUsersOrders = async (
  req: Request,
  res: Response<ApiResponse<OrderType[]>>,
  next: NextFunction,
): Promise<void> => {
  try {
    // Get all the orders for all users

    const orders = await Order.find().sort({ createdAt: -1 });
    if (!orders || orders.length === 0) {
      return success(res, [], 'No orders found');
    }

    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        const user = await User.findById(
          order.userId,
          'firstName lastName email',
        );
        return {
          ...order.toJSON(),
          user,
        };
      }),
    );

    success(res, populatedOrders, 'Orders fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<OrderType>>,
  next: NextFunction,
): Promise<void> => {
  //
};

export const getOrderByUserId = async (
  req: Request,
  res: Response<ApiResponse<OrderType[]>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return success(res, [], 'No orders found for this user');
    }

    success(res, orders, 'Orders fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (
  req: Request<{}, {}, OrderRequestBody>,
  res: Response<ApiResponse<any>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const orderData = req.body;
    const userId = req.user?.id;

    const order = new Order({
      ...orderData,
      userId,
      orderNumber: generateOrderNumber(),
      orderStatus: 'pending',
      reasonOfCancellation: null,
    });

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return fail(res, 'Cart not found', 404);
    }

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    await order.save();

    // Reduce stock for each product in the order
    for (const item of order.orderItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return fail(res, 'Product not found', 404);
      }

      if (product.stock < item.quantity) {
        return fail(res, 'Insufficient stock for product', 400);
      }

      product.stock -= item.quantity;
      await product.save();
    }

    success(res, null, 'Order created successfully');
  } catch (error) {
    next(error);
  }
};

export const updatePaymentStatus = async (
  req: Request<{ orderId: string }, {}, { paymentStatus: 'pending' | 'paid' }>,
  res: Response<ApiResponse<any>>,
  next: NextFunction,
): Promise<void> => {
  console.log('updatePaymentStatus called');
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus },
      { new: true },
    );

    if (!order) {
      return fail(res, 'Order not found', 404);
    }

    success(res, null, 'Payment status updated successfully');
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: Request<{ orderId: string }, {}, { orderStatus: string }>,
  res: Response<ApiResponse<any>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    console.log(orderId);
    console.log(orderStatus);

    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true },
    );

    if (!order) {
      return fail(res, 'Order not found', 404);
    }

    success(res, null, 'Order status updated successfully');
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (
  req: Request<{ id: string }, {}, { reasonOfCancellation: string }>,
  res: Response<ApiResponse<any>>,
  next: NextFunction,
): Promise<void> => {
  //
};
