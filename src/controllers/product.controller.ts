import { Request, Response, NextFunction } from 'express';

import Product from '../models/product.model';

import { success, fail } from '../helpers/response.helper';
import { ApiResponse } from '../types/response.types';
import { ProductRequestBody } from '../types/product.types';

export const getAllProducts = async (
  req: Request,
  res: Response<ApiResponse<any[]>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const products = await Product.find().populate('images');

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

    const product = await Product.findById(id).populate('images');

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

    const product = new Product(productData);
    await product.save();

    success(res, product, 'Product created successfully');
  } catch (error) {
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

    const product = await Product.findByIdAndUpdate(id, productData, {
      new: true,
    }).populate('images');

    if (!product) return fail(res, 'Product not found', 404);

    success(res, product, 'Product updated successfully');
  } catch (error) {
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

    const product = await Product.findByIdAndDelete(id);

    if (!product) return fail(res, 'Product not found', 404);

    success(res, null, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};
