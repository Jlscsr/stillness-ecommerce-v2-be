import path from 'path';

import type { Express } from 'express';

import { config } from '../config/env';
import { supabase } from '../config/supabase';
import { isValidCategory, VALID_CATEGORIES } from '../constants/categories';
import type { ProductImage } from '../types/product.types';

export const PRODUCT_CATEGORY_FOLDERS = VALID_CATEGORIES;

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

const resolveKnownProductCategoryFolder = (category: string): string | null => {
  const normalizedCategory = normalizeForStorageMatch(category).replace(
    /_/g,
    ' ',
  );

  return categoryFolderMap[normalizedCategory] || null;
};

export const resolveProductCategoryFolder = (category: string): string => {
  return resolveKnownProductCategoryFolder(category) || 'collections';
};

const slugifyStorageSegment = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const getPublicProductImageUrl = (storagePath: string): string => {
  const { data } = supabase.storage
    .from(config.supabase.storageBucket)
    .getPublicUrl(storagePath);

  return data.publicUrl;
};

export const getSupabaseProductImagePath = (
  image: Pick<ProductImage, 'bucket' | 'path' | 'src' | 'storageProvider'>,
): string | null => {
  if (
    image.path &&
    (image.storageProvider === 'supabase' ||
      image.bucket === config.supabase.storageBucket)
  ) {
    return image.path;
  }

  try {
    const imageUrl = new URL(image.src);
    const supabaseUrl = new URL(config.supabase.url);

    if (imageUrl.host !== supabaseUrl.host) {
      return null;
    }

    const publicPathPrefix = `/storage/v1/object/public/${config.supabase.storageBucket}/`;

    if (!imageUrl.pathname.startsWith(publicPathPrefix)) {
      return null;
    }

    return decodeURIComponent(imageUrl.pathname.slice(publicPathPrefix.length));
  } catch {
    return null;
  }
};

export const getSupabaseProductImagePaths = (
  images: ProductImage[] = [],
): string[] => {
  const paths = images
    .map((image) => getSupabaseProductImagePath(image))
    .filter((storagePath): storagePath is string => Boolean(storagePath));

  return [...new Set(paths)];
};

export const deleteProductImagePaths = async (
  storagePaths: string[],
): Promise<void> => {
  const uniqueStoragePaths = [...new Set(storagePaths)].filter(Boolean);

  if (uniqueStoragePaths.length === 0) {
    return;
  }

  const { error } = await supabase.storage
    .from(config.supabase.storageBucket)
    .remove(uniqueStoragePaths);

  if (error) {
    throw new Error(`Supabase image delete failed: ${error.message}`);
  }
};

const sanitizeFileName = (fileName: string): string => {
  const extension = path.extname(fileName).toLowerCase();
  const baseName = path.basename(fileName, extension);
  const safeBaseName = slugifyStorageSegment(baseName) || 'product-image';
  const safeExtension = extension.replace(/[^a-z0-9.]/g, '');

  return `${safeBaseName}${safeExtension}`;
};

const buildProductImagePath = ({
  productId,
  productName,
  category,
  fileName,
}: {
  productId: string;
  productName: string;
  category: string;
  fileName: string;
}): string => {
  const folder = resolveKnownProductCategoryFolder(category);

  if (!folder || !isValidCategory(folder)) {
    throw new Error(`Invalid product image category: ${category}`);
  }

  const productSlug = slugifyStorageSegment(productName) || productId;
  const safeFileName = sanitizeFileName(fileName);
  const timestamp = Date.now();

  return `${folder}/${productSlug}/${timestamp}-${safeFileName}`;
};

export const uploadProductImages = async ({
  productId,
  productName,
  category,
  files,
  imageAlts = [],
  existingImageCount = 0,
}: UploadProductImageParams): Promise<ProductImage[]> => {
  const uploadedImages: ProductImage[] = [];

  for (const [index, file] of files.entries()) {
    const role = existingImageCount === 0 && index === 0 ? 'main' : 'gallery';
    const storagePath = buildProductImagePath({
      productId,
      productName,
      category,
      fileName: file.originalname,
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
