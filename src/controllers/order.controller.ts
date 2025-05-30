import { Request, Response, NextFunction } from 'express';

import Order from '../models/order.model';

import { success, fail } from '../helpers/response.helper';
import { ApiResponse } from '../types/response.types';
import type {
  OrderRequestBody,
  Order as OrderType,
} from '../types/order.types';

export const getAllOrders = async (
  req: Request,
  res: Response<ApiResponse<OrderType[]>>,
  next: NextFunction,
): Promise<void> => {
  //
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
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (
  req: Request<{}, {}, OrderRequestBody>,
  res: Response<ApiResponse<any>>,
  next: NextFunction,
): Promise<void> => {
  //
};

export const updatePaymentStatus = async (
  req: Request<{ id: string }, {}, { paymentStatus: 'pending' | 'paid' }>,
  res: Response<ApiResponse<any>>,
  next: NextFunction,
): Promise<void> => {
  //
};

export const updateOrderStatus = async (
  req: Request<{ id: string }, {}, { orderStatus: string }>,
  res: Response<ApiResponse<any>>,
  next: NextFunction,
): Promise<void> => {
  //
};

export const cancelOrder = async (
  req: Request<{ id: string }, {}, { reasonOfCancellation: string }>,
  res: Response<ApiResponse<any>>,
  next: NextFunction,
): Promise<void> => {
  //
};
