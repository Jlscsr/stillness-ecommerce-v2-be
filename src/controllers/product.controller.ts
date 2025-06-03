import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

import Product from '../models/product.model';

import { success, fail } from '../helpers/response.helper';
import { ApiResponse } from '../types/response.types';
import { ProductRequestBody, ImageUpload, CloudinaryImage } from '../types/product.types';
import { uploadImage } from '../utils/cloudinary';

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
    
    // Process image uploads
    const cloudinaryImages: CloudinaryImage[] = [];
    
    // Check if images array exists and is not empty
    if (productData.images && productData.images.length > 0) {
      try {
        // Process each image in the array
        for (const image of productData.images) {
          // Check if the image has a src (base64) and alt
          if (image.src && image.alt) {
            // Upload to Cloudinary using category/product_name folder structure
            const uploadResult = await uploadImage(
              image.src,
              productData.category,  // First level folder - category
              productData.name       // Second level folder - product_name
            );
            
            // Create a CloudinaryImage object mapped to match the schema
            cloudinaryImages.push({
              public_id: uploadResult.public_id,
              src: uploadResult.secure_url, // Changed from url to src to match MongoDB schema
              alt: image.alt,
            });
          }
        }
      } catch (uploadError) {
        console.error('Error uploading images to Cloudinary:', uploadError);
        return fail(res, 'Error uploading images', 500);
      }
    }
    
    // Create new product with Cloudinary image URLs
    const newProduct = new Product({
      ...productData,
      images: cloudinaryImages, // Replace base64 images with Cloudinary URLs
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
