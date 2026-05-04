import { Request, Response, NextFunction } from 'express';

import Product from '../models/product.model';

import { success, fail } from '../helpers/response.helper';
import { ApiResponse } from '../types/response.types';
import { ProductImage, ProductRequestBody } from '../types/product.types';
import { uploadProductImages } from '../services/supabaseStorage.service';

const normalizeProductImages = (
  images: ProductRequestBody['images'] = [],
): ProductImage[] =>
  images
    .filter((image) => image.src && image.alt)
    .map((image) => ({
      src: image.src,
      alt: image.alt,
      ...(image.storageProvider
        ? { storageProvider: image.storageProvider }
        : {}),
      ...(image.bucket ? { bucket: image.bucket } : {}),
      ...(image.path ? { path: image.path } : {}),
      ...(image.role ? { role: image.role } : {}),
    }));

const getUploadedImageFiles = (req: Request): Express.Multer.File[] =>
  Array.isArray(req.files) ? req.files : [];

const hasImagesField = (productData: ProductRequestBody): boolean =>
  Object.prototype.hasOwnProperty.call(productData, 'images');

const buildProductImages = async ({
  req,
  productId,
  productName,
  category,
  existingImageCount = 0,
}: {
  req: Request;
  productId: string;
  productName: string;
  category: string;
  existingImageCount?: number;
}): Promise<ProductImage[]> => {
  const productData = req.body as ProductRequestBody;
  const files = getUploadedImageFiles(req);
  const existingImages = normalizeProductImages(productData.images);
  const uploadedImages =
    files.length > 0
      ? await uploadProductImages({
          productId,
          productName,
          category,
          files,
          imageAlts: productData.imageAlts,
          existingImageCount: existingImages.length || existingImageCount,
        })
      : [];

  return [...existingImages, ...uploadedImages];
};

export const getAllProducts = async (
  req: Request,
  res: Response<ApiResponse<any[]>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const products = await Product.find();

    success(res, products, 'Products fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response<ApiResponse<any>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) return fail(res, 'Product not found', 404);

    success(res, product, 'Product fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request<{}, {}, ProductRequestBody>,
  res: Response<ApiResponse<any>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const productData = req.body;

    const newProduct = new Product({
      ...productData,
      images: [],
    });

    const images = await buildProductImages({
      req,
      productId: newProduct._id.toString(),
      productName: productData.name,
      category: productData.category,
    });

    if (images.length === 0) {
      fail(res, 'At least one product image is required', 400);
      return;
    }

    if (images.length > 5) {
      fail(res, 'A maximum of 5 images is allowed', 400);
      return;
    }

    newProduct.images = images;
    await newProduct.save();

    success(res, newProduct, 'Product created successfully');
  } catch (error) {
    console.error('Error creating product:', error);
    next(error);
  }
};

export const updateProduct = async (
  req: Request<{ id: string }, {}, ProductRequestBody>,
  res: Response<ApiResponse<any>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const productData = req.body;

    const existingProduct = await Product.findById(id);
    if (!existingProduct) return fail(res, 'Product not found', 404);

    const updateData: Partial<ProductRequestBody> = { ...productData };
    delete updateData.images;
    delete updateData.imageAlts;
    const uploadedFiles = getUploadedImageFiles(req);

    if (hasImagesField(productData) || uploadedFiles.length > 0) {
      const images = await buildProductImages({
        req,
        productId: id,
        productName: productData.name || existingProduct.name,
        category: productData.category || existingProduct.category,
        existingImageCount: existingProduct.images?.length || 0,
      });

      if (images.length === 0) {
        fail(res, 'At least one product image is required', 400);
        return;
      }

      if (images.length > 5) {
        fail(res, 'A maximum of 5 images is allowed', 400);
        return;
      }

      updateData.images = images;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedProduct) return fail(res, 'Error updating product', 500);

    success(res, updatedProduct, 'Product updated successfully');
  } catch (error) {
    console.error('Error updating product:', error);
    next(error);
  }
};

export const deleteProduct = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<null>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) return fail(res, 'Product not found', 404);

    await Product.findByIdAndDelete(id);

    success(res, null, 'Product deleted successfully');
  } catch (error) {
    console.error('Error deleting product:', error);
    next(error);
  }
};
