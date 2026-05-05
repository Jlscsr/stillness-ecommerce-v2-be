import jwt from 'jsonwebtoken';
import { config } from '../config/env';

const expiryUnitToSeconds: Record<string, number> = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 24 * 60 * 60,
  w: 7 * 24 * 60 * 60,
};

export const parseJwtExpiresInToSeconds = (
  expiresIn = config.jwt.expiresIn,
): number => {
  const normalizedExpiresIn = expiresIn.trim().toLowerCase();
  const match = normalizedExpiresIn.match(/^(\d+)([smhdw]?)$/);

  if (!match) {
    throw new Error(
      'JWT_EXPIRES_IN must be a positive number with an optional unit: s, m, h, d, or w',
    );
  }

  const value = Number(match[1]);
  const unit = match[2] || 's';
  const multiplier = expiryUnitToSeconds[unit];

  if (!Number.isSafeInteger(value) || value <= 0 || !multiplier) {
    throw new Error('JWT_EXPIRES_IN must be a positive duration');
  }

  return value * multiplier;
};

export const getJwtCookieMaxAge = (): number => {
  return parseJwtExpiresInToSeconds(config.jwt.expiresIn) * 1000;
};

export const signToken = (
  payload: object,
  expiresIn = config.jwt.expiresIn,
): string => {
  const expiresInSeconds = parseJwtExpiresInToSeconds(expiresIn);

  return jwt.sign(payload, config.jwt.secret as string, {
    expiresIn: expiresInSeconds,
  });
};

export const verifyToken = <T>(token: string): T => {
  return jwt.verify(token, config.jwt.secret as string) as T;
};
