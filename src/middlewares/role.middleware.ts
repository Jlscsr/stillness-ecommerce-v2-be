import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/response.types';
import { safeRespond } from '../helpers/response.helper';

export const authorizedRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return safeRespond(res, 403, false, 'User role is not defined');
    }

    if (!allowedRoles.includes(userRole)) {
      return safeRespond(
        res,
        403,
        false,
        'You do not have permission to access this resource',
      );
    }

    next();
  };
};
