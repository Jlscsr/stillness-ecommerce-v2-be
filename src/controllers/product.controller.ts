import { Request, Response, NextFunction } from 'express';

import Product from '../models/product.model';

import { success, fail } from '../helpers/response.helper';
import { ApiResponse } from '../types/response.types';
import { ProductImage, ProductRequestBody } from '../types/product.types';

const normalizeProductImages = (
  images: ProductRequestBody['images'] = [],
): ProductImage[] =>
  images
    .filter((image) => image.src && image.alt)
    .map((image) => ({
      src: image.src,
      alt: image.alt,
    }));

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
      images: normalizeProductImages(productData.images),
    });

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

    const updateData = {
      ...productData,
    };

    if (productData.images && productData.images.length > 0) {
      updateData.images = normalizeProductImages(productData.images);
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
