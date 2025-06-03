import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

import Product from '../models/product.model';

import { success, fail } from '../helpers/response.helper';
import { ApiResponse } from '../types/response.types';
import {
  ProductRequestBody,
  ImageUpload,
  CloudinaryImage,
} from '../types/product.types';
import { uploadImage, deleteFolder, toSnakeCase } from '../utils/cloudinary';

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

    const cloudinaryImages: CloudinaryImage[] = [];

    if (productData.images && productData.images.length > 0) {
      try {
        for (const image of productData.images) {
          if (image.src && image.alt) {
            const uploadResult = await uploadImage(
              image.src,
              productData.category,
              productData.name,
            );

            cloudinaryImages.push({
              public_id: uploadResult.public_id,
              src: uploadResult.secure_url,
              alt: image.alt,
            });
          }
        }
      } catch (uploadError) {
        console.error('Error uploading images to Cloudinary:', uploadError);
        return fail(res, 'Error uploading images', 500);
      }
    }

    const newProduct = new Product({
      ...productData,
      images: cloudinaryImages,
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

    const isImageUpdate = productData.images && productData.images.length > 0;

    let cloudinaryImages: CloudinaryImage[] = [];

    if (isImageUpdate) {
      const hasNewImages = productData.images.some(
        (img) => img.src && img.src.startsWith('data:'),
      );

      if (hasNewImages) {
        try {
          const folderPath = `stillness-ecommerce-images/${toSnakeCase(existingProduct.category)}/${toSnakeCase(existingProduct.name)}`;
          await deleteFolder(folderPath);
          console.log(
            `Deleted Cloudinary folder for product update: ${existingProduct.name}`,
          );

          for (const image of productData.images) {
            if (image.src && image.src.startsWith('data:')) {
              const category = productData.category || existingProduct.category;
              const productName = productData.name || existingProduct.name;

              const uploadResult = await uploadImage(
                image.src,
                category,
                productName,
              );

              // Create a CloudinaryImage object
              cloudinaryImages.push({
                public_id: uploadResult.public_id,
                src: uploadResult.secure_url,
                alt: image.alt,
              });
            }
          }
        } catch (uploadError) {
          console.error(
            'Error processing images for product update:',
            uploadError,
          );
          return fail(res, 'Error updating product images', 500);
        }
      }
    }

    const nameChanged =
      productData.name && productData.name !== existingProduct.name;
    const categoryChanged =
      productData.category && productData.category !== existingProduct.category;

    if (
      (nameChanged || categoryChanged) &&
      !isImageUpdate &&
      existingProduct.images.length > 0
    ) {
      try {
        // Get the old and new folder paths
        const oldFolderPath = `stillness-ecommerce-images/${toSnakeCase(existingProduct.category)}/${toSnakeCase(existingProduct.name)}`;
        const newCategory = productData.category || existingProduct.category;
        const newName = productData.name || existingProduct.name;

        console.log(
          `Moving images from ${oldFolderPath} to a new folder structure based on updated name/category`,
        );

        cloudinaryImages = [];

        for (const image of existingProduct.images) {
          // Extract the original image URL
          const imageUrl = image.src;

          try {
            // For now, use a simplified approach assuming we have access to the image data

            const uploadResult = await uploadImage(
              imageUrl,
              newCategory,
              newName,
              true,
            );

            cloudinaryImages.push({
              public_id: uploadResult.public_id,
              src: uploadResult.secure_url,
              alt: image.alt || newName,
            });
          } catch (downloadError) {
            console.error(
              `Error processing image during name/category change: ${imageUrl}`,
              downloadError,
            );
          }
        }

        await deleteFolder(oldFolderPath);

        const updatedProductData = {
          ...productData,
          images: cloudinaryImages,
        };
      } catch (folderError) {
        console.error(
          'Error moving images to new folder structure:',
          folderError,
        );
        return fail(res, 'Error updating product folder structure', 500);
      }
    }

    const updateData = {
      ...productData,
    };

    if (cloudinaryImages.length > 0) {
      // @ts-ignore - this is compatible with MongoDB schema
      updateData.images = cloudinaryImages;
    }

    // Update the product in the database
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate('images');

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

    try {
      const folderPath = `stillness-ecommerce-images/${toSnakeCase(product.category)}/${toSnakeCase(product.name)}`;

      await deleteFolder(folderPath);
      console.log(`Deleted Cloudinary folder for product: ${product.name}`);
    } catch (cloudinaryError) {
      console.error(
        'Error deleting product folder from Cloudinary:',
        cloudinaryError,
      );
    }

    await Product.findByIdAndDelete(id);

    success(res, null, 'Product and associated images deleted successfully');
  } catch (error) {
    console.error('Error deleting product:', error);
    next(error);
  }
};
