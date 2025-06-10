import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/response.types';
import { JWTPayload } from '../types/jwtPayload.types';
import { verifyToken } from '../helpers/jwt.helper';
import { safeRespond, fail } from '../helpers/response.helper';

declare module 'express' {
  export interface Request {
    user?: JWTPayload;
  }
}

const parseCookies = (cookieHeader: string): Record<string, string> => {
  const cookies: Record<string, string> = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
  }
  return cookies;
};

export const isAuthenticated = (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
): void => {
  try {
    let token: string | undefined;

    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.cookie) {
      const cookies = parseCookies(req.headers.cookie);
      token = cookies.token;
    }

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return safeRespond(res, 401, false, 'Authentication token is missing');
    }

    const decoded = verifyToken<JWTPayload>(token);

    req.user = decoded;
    next();
  } catch (error) {
    fail(res, 'Invalid or expired token', 401);
  }
};
