import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export const signToken = (
  payload: object,
  expiresIn: string = '1h',
): string => {
  const expiresInSeconds = parseInt(expiresIn, 10) * 60 * 60; // convert hours to seconds
  return jwt.sign(payload, config.jwt.secret as string, {
    expiresIn: expiresInSeconds,
  });
};

export const verifyToken = <T>(token: string): T => {
  return jwt.verify(token, config.jwt.secret as string) as T;
};
