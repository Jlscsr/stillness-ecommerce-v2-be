import { Request, Response, NextFunction } from 'express';

import User from '../models/user.model';

import { success, fail } from '../helpers/response.helper';
import { ApiResponse } from '../types/response.types';
import { User as IUser } from '../types/user.types';
import { formatUser, formatUsers } from '../helpers/user.helper';

export const getAllUsers = async (
  req: Request,
  res: Response<ApiResponse<IUser[]>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const raw = await User.find().lean();

    const users: IUser[] = formatUsers(raw);

    success(res, users, 'Users fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response<ApiResponse<IUser>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).lean();

    if (!user) return fail(res, 'User not found', 404);

    const formattedUser = formatUser(user);

    success(res, formattedUser, 'User fetched successfully');
  } catch (error) {
    next(error);
  }
};
