import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

import Order from '../models/order.model';
import Cart from '../models/cart.model';
import Product from '../models/product.model';
import User from '../models/user.model';

import { success, fail } from '../helpers/response.helper';
import { ApiResponse } from '../types/response.types';
import type {
  OrderItem,
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

    success(
      res,
      populatedOrders as unknown as OrderType[],
      'Orders fetched successfully',
    );
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<OrderType>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!mongoose.isValidObjectId(id)) {
      return fail(res, 'Invalid order ID', 400);
    }

    const orderQuery =
      userRole === 'admin' ? { _id: id } : { _id: id, userId };

    const order = await Order.findOne(orderQuery);

    if (!order) {
      return fail(res, 'Order not found', 404);
    }

    success(res, order, 'Order fetched successfully');
  } catch (error) {
    next(error);
  }
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
    if (!userId) return fail(res, 'User not authenticated', 401);

    const orderItems: OrderItem[] = [];
    let totalAmount = 0;
    const stockChecks = new Map<
      string,
      { name: string; stock: number; requestedQuantity: number }
    >();

    for (const item of orderData.orderItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return fail(res, 'Product not found', 404);
      }

      const stockCheckKey = product._id.toString();
      const stockCheck = stockChecks.get(stockCheckKey);

      if (stockCheck) {
        stockCheck.requestedQuantity += item.quantity;
      } else {
        stockChecks.set(stockCheckKey, {
          name: product.name,
          stock: product.stock,
          requestedQuantity: item.quantity,
        });
      }

      const priceAtTimeOfAddition = product.price;
      const itemTotal = priceAtTimeOfAddition * item.quantity;
      const image = product.images?.[0] ?? { src: '', alt: product.name };

      orderItems.push({
        productId: product._id,
        name: product.name,
        image: {
          src: image.src,
          alt: image.alt || product.name,
        },
        quantity: item.quantity,
        priceAtTimeOfAddition,
        total: itemTotal,
      });

      totalAmount += itemTotal;
    }

    for (const stockCheck of stockChecks.values()) {
      if (stockCheck.stock < stockCheck.requestedQuantity) {
        return fail(res, `Insufficient stock for ${stockCheck.name}`, 400);
      }
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return fail(res, 'Cart not found', 404);
    }

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const [order] = await Order.create(
        [
          {
            shippingInformation: orderData.shippingInformation,
            orderItems,
            paymentMethod: orderData.paymentMethod,
            paymentStatus: 'pending',
            totalAmount,
            userId,
            orderNumber: generateOrderNumber(),
            orderStatus: 'pending',
            reasonOfCancellation: null,
          },
        ],
        { session },
      );

      for (const item of order.orderItems) {
        const stockUpdate = await Product.updateOne(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session },
        );

        if (stockUpdate.modifiedCount !== 1) {
          await session.abortTransaction();
          return fail(res, `Insufficient stock for ${item.name}`, 400);
        }
      }

      const cartUpdate = await Cart.updateOne(
        { userId },
        { $set: { items: [], totalAmount: 0 } },
        { session },
      );

      if (cartUpdate.matchedCount !== 1) {
        await session.abortTransaction();
        return fail(res, 'Cart not found', 404);
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
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
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;
    const { reasonOfCancellation } = req.body;

    session.startTransaction();

    const order = await Order.findById(id).session(session);

    if (!order) {
      await session.abortTransaction();
      return fail(res, 'Order not found', 404);
    }

    if (!['pending', 'processing'].includes(order.orderStatus)) {
      await session.abortTransaction();
      return fail(
        res,
        'Only pending or processing orders can be cancelled',
        400,
      );
    }

    for (const item of order.orderItems) {
      const stockUpdate = await Product.updateOne(
        { _id: item.productId },
        { $inc: { stock: item.quantity } },
        { session },
      );

      if (stockUpdate.matchedCount !== 1) {
        await session.abortTransaction();
        return fail(res, `Product not found for ${item.name}`, 404);
      }
    }

    order.orderStatus = 'cancelled';
    order.reasonOfCancellation =
      reasonOfCancellation || 'Order cancelled by admin';

    await order.save({ session });
    await session.commitTransaction();

    success(res, null, 'Order cancelled successfully');
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
};
