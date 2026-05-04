import path from 'path';

import type { Express } from 'express';

import { config } from '../config/env';
import { supabase } from '../config/supabase';
import type { ProductImage } from '../types/product.types';

export const PRODUCT_CATEGORY_FOLDERS = [
  'collections',
  'decor',
  'gifts',
  'tea',
  'apparel',
  'home',
  'limited_edition',
  'seasonal',
  'wellness',
] as const;

const categoryFolderMap: Record<string, string> = {
  apparel: 'apparel',
  collections: 'collections',
  decor: 'decor',
  dining: 'collections',
  gifts: 'gifts',
  home: 'home',
  'limited edition': 'limited_edition',
  limited: 'limited_edition',
  limited_edition: 'limited_edition',
  seasonal: 'seasonal',
  tea: 'tea',
  wellness: 'wellness',
};

type UploadProductImageParams = {
  productId: string;
  productName: string;
  category: string;
  files: Express.Multer.File[];
  imageAlts?: string[];
  existingImageCount?: number;
};

type SupabaseStorageItem = {
  name: string;
  id?: string | null;
  metadata?: Record<string, unknown> | null;
};

export const normalizeForStorageMatch = (value: string): string =>
  value
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

export const resolveProductCategoryFolder = (category: string): string => {
  const normalizedCategory = normalizeForStorageMatch(category).replace(
    /_/g,
    ' ',
  );

  return categoryFolderMap[normalizedCategory] || 'collections';
};

export const getPublicProductImageUrl = (storagePath: string): string => {
  const { data } = supabase.storage
    .from(config.supabase.storageBucket)
    .getPublicUrl(storagePath);

  return data.publicUrl;
};

const sanitizeFileName = (fileName: string): string => {
  const extension = path.extname(fileName).toLowerCase();
  const baseName = path.basename(fileName, extension);
  const safeBaseName = normalizeForStorageMatch(baseName) || 'product_image';

  return `${safeBaseName}${extension}`;
};

const buildProductImagePath = ({
  productId,
  role,
  fileName,
  index,
}: {
  productId: string;
  role: 'main' | 'gallery';
  fileName: string;
  index: number;
}): string => {
  const safeFileName = sanitizeFileName(fileName);
  const timestamp = Date.now();

  return `products/${productId}/${role}/${timestamp}-${index}-${safeFileName}`;
};

export const uploadProductImages = async ({
  productId,
  productName,
  files,
  imageAlts = [],
  existingImageCount = 0,
}: UploadProductImageParams): Promise<ProductImage[]> => {
  const uploadedImages: ProductImage[] = [];

  for (const [index, file] of files.entries()) {
    const role = existingImageCount === 0 && index === 0 ? 'main' : 'gallery';
    const storagePath = buildProductImagePath({
      productId,
      role,
      fileName: file.originalname,
      index,
    });

    const { error } = await supabase.storage
      .from(config.supabase.storageBucket)
      .upload(storagePath, file.buffer, {
        cacheControl: '31536000',
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(`Supabase image upload failed: ${error.message}`);
    }

    uploadedImages.push({
      src: getPublicProductImageUrl(storagePath),
      alt: imageAlts[index] || `${productName} image ${index + 1}`,
      storageProvider: 'supabase',
      bucket: config.supabase.storageBucket,
      path: storagePath,
      role,
    });
  }

  return uploadedImages;
};

export const listProductImagesInFolder = async (
  folder: string,
): Promise<string[]> => {
  const files: string[] = [];

  const listFolder = async (prefix: string): Promise<void> => {
    const { data, error } = await supabase.storage
      .from(config.supabase.storageBucket)
      .list(prefix, {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      throw new Error(
        `Supabase image listing failed for ${prefix}: ${error.message}`,
      );
    }

    for (const item of (data || []) as SupabaseStorageItem[]) {
      const itemPath = `${prefix}/${item.name}`;
      const looksLikeFolder = !item.metadata && !path.extname(item.name);

      if (looksLikeFolder) {
        await listFolder(itemPath);
      } else {
        files.push(itemPath);
      }
    }
  };

  await listFolder(folder);

  return files;
};
