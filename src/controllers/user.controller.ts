import { Request, Response, NextFunction } from 'express';

import User from '../models/user.model';
import Address from '../models/address.model';

import { success, fail } from '../helpers/response.helper';
import { ApiResponse } from '../types/response.types';
import { UserResponse } from '../types/user.types';
import { toUserResponse } from '../helpers/user.helper';

export const getAllUsers = async (
  req: Request,
  res: Response<ApiResponse<UserResponse[]>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const raw = await User.find();

    const users: UserResponse[] = await Promise.all(
      raw.map(async (user) => {
        const userAddress = await Address.findOne({ userId: user._id });
        return toUserResponse(user, userAddress);
      }),
    );

    success(res, users, 'Users fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response<ApiResponse<UserResponse>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) return fail(res, 'User not found', 404);

    const userAddress = await Address.findOne({ userId: user._id });

    success(
      res,
      toUserResponse(user, userAddress),
      'User fetched successfully',
    );
  } catch (error) {
    next(error);
  }
};
