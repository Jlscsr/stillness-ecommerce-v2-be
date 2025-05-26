import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema } from 'zod';
import { safeRespond } from '../helpers/response.helper';

export const validateFields = (schema: ZodSchema): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      return safeRespond(res, 422, false, 'Validation error', errors);
    }

    req.body = result.data;
    next();
  };
};
