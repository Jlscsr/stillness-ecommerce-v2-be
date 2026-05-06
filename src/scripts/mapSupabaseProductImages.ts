import path from 'path';
import mongoose from 'mongoose';

import { config } from '../config/env';
import { connectToMongo } from '../config/mongo';
import Product from '../models/product.model';
import type { ProductImage } from '../types/product.types';
import {
  PRODUCT_CATEGORY_FOLDERS,
  getPublicProductImageUrl,
  listProductImagesInFolder,
  normalizeForStorageMatch,
  resolveProductCategoryFolder,
} from '../services/supabaseStorage.service';

const MAX_IMAGES_PER_PRODUCT = 5;
const shouldApply = process.argv.includes('--apply');

type StorageImageCandidate = {
  path: string;
  normalizedName: string;
};

const getCandidateName = (storagePath: string): string => {
  const fileName = path.basename(storagePath);
  return normalizeForStorageMatch(fileName);
};

const loadStorageCandidates = async (): Promise<
  Map<string, StorageImageCandidate[]>
> => {
  const candidatesByFolder = new Map<string, StorageImageCandidate[]>();

  for (const folder of PRODUCT_CATEGORY_FOLDERS) {
    const files = await listProductImagesInFolder(folder);
    candidatesByFolder.set(
      folder,
      files.map((filePath) => ({
        path: filePath,
        normalizedName: getCandidateName(filePath),
      })),
    );
  }

  return candidatesByFolder;
};

const findProductImageMatches = (
  productName: string,
  candidates: StorageImageCandidate[],
): StorageImageCandidate[] => {
  const normalizedProductName = normalizeForStorageMatch(productName);

  return candidates
    .filter(
      (candidate) =>
        candidate.normalizedName.includes(normalizedProductName) ||
        normalizedProductName.includes(candidate.normalizedName),
    )
    .slice(0, MAX_IMAGES_PER_PRODUCT);
};

const toProductImages = (
  productName: string,
  matches: StorageImageCandidate[],
): ProductImage[] =>
  matches.map((match, index) => ({
    src: getPublicProductImageUrl(match.path),
    alt: `${productName} image ${index + 1}`,
    storageProvider: 'supabase',
    bucket: config.supabase.storageBucket,
    path: match.path,
    role: index === 0 ? 'main' : 'gallery',
  }));

const run = async (): Promise<void> => {
  await connectToMongo();

  const candidatesByFolder = await loadStorageCandidates();
  const products = await Product.find();
  let matchedCount = 0;
  let updatedCount = 0;

  console.log(
    shouldApply
      ? 'Applying Supabase product image matches...'
      : 'Dry run only. Re-run with --apply to update matched products.',
  );

  for (const product of products) {
    const folder = resolveProductCategoryFolder(product.category);
    const candidates = candidatesByFolder.get(folder) || [];
    const matches = findProductImageMatches(product.name, candidates);

    if (matches.length === 0) {
      console.log(`No match: ${product.name} (${product.category})`);
      continue;
    }

    matchedCount += 1;
    console.log(
      `Match: ${product.name} (${product.category}) -> ${matches
        .map((match) => match.path)
        .join(', ')}`,
    );

    if (shouldApply) {
      product.images = toProductImages(product.name, matches);
      await product.save();
      updatedCount += 1;
    }
  }

  console.log(
    `Finished. Matched products: ${matchedCount}. Updated products: ${updatedCount}.`,
  );

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('Supabase product image mapping failed:', error);
  await mongoose.disconnect();
  process.exit(1);
});
