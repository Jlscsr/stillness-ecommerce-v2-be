import { Request, Response, NextFunction } from 'express';

import User from '../models/user.model';

import { success, fail } from '../helpers/response.helper';
import { ApiResponse } from '../types/response.types';
import {
  UserResponse,
  UserUpdateRequestBody,
  AddressUpdateRequestBody,
} from '../types/user.types';
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
        return toUserResponse(user);
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
    const userId = req.user?.id;

    const user = await User.findById(userId);

    if (!user) return fail(res, 'User not found', 404);

    success(res, toUserResponse(user), 'User fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request<{}, {}, UserUpdateRequestBody>,
  res: Response<ApiResponse<any>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const updateData = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { ...updateData },
      { new: true },
    );

    if (!user) return fail(res, 'User not found', 404);

    success(res, null, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

export const updateUserAddress = async (
  req: Request<{}, {}, AddressUpdateRequestBody>,
  res: Response<ApiResponse<any>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { country, city, postalCode, street } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        address: {
          country,
          city,
          postalCode,
          street,
        },
      },
      { new: true },
    );

    if (!user) return fail(res, 'User not found', 404);

    success(res, null, 'User address updated successfully');
  } catch (error) {
    next(error);
  }
};
