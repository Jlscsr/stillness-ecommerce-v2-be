import type { Request, Response, NextFunction, RequestHandler } from 'express';
import multer from 'multer';

import { safeRespond } from '../helpers/response.helper';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_COUNT = 5;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const hasJpegSignature = (buffer: Buffer): boolean =>
  buffer.length >= 3 &&
  buffer[0] === 0xff &&
  buffer[1] === 0xd8 &&
  buffer[2] === 0xff;

const hasPngSignature = (buffer: Buffer): boolean =>
  buffer.length >= 8 &&
  buffer[0] === 0x89 &&
  buffer[1] === 0x50 &&
  buffer[2] === 0x4e &&
  buffer[3] === 0x47 &&
  buffer[4] === 0x0d &&
  buffer[5] === 0x0a &&
  buffer[6] === 0x1a &&
  buffer[7] === 0x0a;

const hasGifSignature = (buffer: Buffer): boolean => {
  if (buffer.length < 6) return false;

  const signature = buffer.subarray(0, 6).toString('ascii');
  return signature === 'GIF87a' || signature === 'GIF89a';
};

const hasWebpSignature = (buffer: Buffer): boolean => {
  if (buffer.length < 12) return false;

  return (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  );
};

const hasValidImageSignature = (file: Express.Multer.File): boolean => {
  switch (file.mimetype) {
    case 'image/jpeg':
      return hasJpegSignature(file.buffer);
    case 'image/png':
      return hasPngSignature(file.buffer);
    case 'image/gif':
      return hasGifSignature(file.buffer);
    case 'image/webp':
      return hasWebpSignature(file.buffer);
    default:
      return false;
  }
};

const getUploadedFiles = (req: Request): Express.Multer.File[] =>
  Array.isArray(req.files) ? req.files : [];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
    files: MAX_IMAGE_COUNT,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
      cb(
        new Error(
          'Only JPEG, PNG, WebP, and GIF image files are allowed',
        ),
      );
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
      const invalidFile = getUploadedFiles(req).find(
        (file) => !hasValidImageSignature(file),
      );

      if (invalidFile) {
        safeRespond(
          res,
          400,
          false,
          `Invalid image file content for ${invalidFile.originalname}`,
        );
        return;
      }

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
