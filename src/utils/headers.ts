import { type Response } from 'express';
import { config } from '../config/env';

export const handlePreflightHeaders = (res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', config.cors.origin);
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS',
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};
