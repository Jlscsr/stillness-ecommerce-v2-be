import type { Request, Response, NextFunction, RequestHandler } from 'express';
import multer from 'multer';

import { safeRespond } from '../helpers/response.helper';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_COUNT = 5;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
    files: MAX_IMAGE_COUNT,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }

    cb(null, true);
  },
});

const parseJsonArray = <T>(value: unknown, fallback: T[] = []): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (typeof value !== 'string' || value.trim() === '') return fallback;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
};

export const uploadProductImageFiles: RequestHandler = (req, res, next) => {
  upload.array('imageFiles', MAX_IMAGE_COUNT)(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    const message =
      error instanceof multer.MulterError
        ? error.message
        : error.message || 'Image upload failed';

    safeRespond(res, 400, false, message);
  });
};

export const parseProductFormData = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if ('materials' in req.body) {
    req.body.materials = parseJsonArray<string>(req.body.materials);
  }

  if ('images' in req.body) {
    req.body.images = parseJsonArray(req.body.images);
  }

  if ('imageAlts' in req.body) {
    req.body.imageAlts = parseJsonArray<string>(req.body.imageAlts);
  }

  next();
};
