import { Request, Response, NextFunction } from 'express';

import User from '../models/user.model';

import { success, fail } from '../helpers/response.helper';
import { ApiResponse } from '../types/response.types';
import {
  UserResponse,
  UserUpdateRequestBody,
  AddressUpdateRequestBody,
  ChangePasswordRequestBody,
} from '../types/user.types';
import { toUserResponse } from '../helpers/user.helper';
import { comparePassword, hashPassword } from '../helpers/password.helper';

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
  res: Response<ApiResponse<UserResponse>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { email, firstName, lastName, address, currentPassword } = req.body;

    const user = await User.findById(userId).select('+password');
    if (!user) return fail(res, 'User not found', 404);

    if (email && email !== user.email) {
      if (!currentPassword) {
        return fail(res, 'Current password is required to update email', 400);
      }

      const isPasswordValid = await comparePassword(
        currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        return fail(res, 'Current password is incorrect', 401);
      }

      const existingUser = await User.findOne({
        email,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return fail(res, 'Email is already in use', 409);
      }

      user.email = email;
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (address !== undefined) user.set('address', address);

    await user.save();

    success(res, toUserResponse(user), 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request<{}, {}, ChangePasswordRequestBody>,
  res: Response<ApiResponse<null>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId).select('+password');
    if (!user) return fail(res, 'User not found', 404);

    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      return fail(res, 'Current password is incorrect', 401);
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    success(res, null, 'Password changed successfully');
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
