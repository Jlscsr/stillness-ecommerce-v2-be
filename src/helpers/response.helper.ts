import { Response } from 'express';
import { ApiResponse } from '../types/response.types';

export const success = <T>(
  res: Response<ApiResponse<T>>,
  data: T,
  message = 'Success',
  status = 200,
): void => {
  res.status(status).json({
    success: true,
    message,
    data,
  });
};

export const fail = (
  res: Response<ApiResponse>,
  message = 'Something went wrong',
  status = 500,
): void => {
  res.status(status).json({
    success: false,
    message,
  });
};

export const safeRespond = <T>(
  res: Response<ApiResponse<T>>,
  status: number,
  successFlag: boolean,
  message: string,
  data?: T,
): void => {
  res.status(status).json({
    success: successFlag,
    message,
    data,
  });
};
