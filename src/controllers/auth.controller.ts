import { Request, Response, NextFunction } from 'express';

import User from '../models/user.model';

import { ApiResponse } from '../types/response.types';
import { JWTPayload } from '../types/jwtPayload.types';

import { config } from '../config/env';
import { LoginCredentials, RegisterCredentials } from '../types/auth.types';
import { hashPassword, comparePassword } from '../helpers/password.helper';
import { signToken } from '../helpers/jwt.helper';
import { success, fail } from '../helpers/response.helper';

export const register = async (
  req: Request<{}, {}, RegisterCredentials>,
  res: Response<ApiResponse<any>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, acceptTerms } = req.body;

    const existingUser = await User.find({ email });

    if (existingUser.length > 0) {
      return fail(res, 'User already exists', 409);
    }

    const hashed = await hashPassword(password);

    const newUser = await User.create({
      email,
      firstName,
      lastName,
      password: hashed,
      acceptTerms,
    });

    const payload: JWTPayload = {
      id: newUser._id.toString(),
      role: newUser.role,
      email: newUser.email,
    };

    const token = signToken(payload);

    res.cookie('token', token, {
      httpOnly: config.nodeEnv === 'production' ? true : false,
      secure: config.nodeEnv === 'production' ? true : false,
      sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    success(res, null, 'Registration successful', 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<{}, {}, LoginCredentials>,
  res: Response<ApiResponse<any>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return fail(res, 'Invalid email or password', 401);
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return fail(res, 'Invalid email or password', 401);
    }

    const payload: JWTPayload = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    };
    const token = signToken(payload);

    res.cookie('token', token, {
      httpOnly: config.nodeEnv === 'production' ? true : false,
      secure: config.nodeEnv === 'production' ? true : false,
      sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    success(res, null, 'Login successful', 200);
  } catch (error) {
    next(error);
  }
};

export const checkAuthStatus = async (
  req: Request,
  res: Response<ApiResponse<any>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user?.id ? await User.findById(req.user.id) : null;

    if (!user) return fail(res, 'User not found', 404);
    console.log('user', user);

    success(res, { role: user.role }, 'User found', 200);
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response<ApiResponse<any>>,
  next: NextFunction,
): Promise<void> => {
  try {
    res.clearCookie('token', {
      httpOnly: config.nodeEnv === 'production' ? true : false,
      secure: config.nodeEnv === 'production' ? true : false,
      sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
    });

    success(res, null, 'Logout successful');
  } catch (error) {
    next(error);
  }
};
