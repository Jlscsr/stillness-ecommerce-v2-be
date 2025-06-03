import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/env';

// Configure cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

interface UploadResponse {
  public_id: string;
  secure_url: string;
}

/**
 * Convert a string to snake_case (replacing spaces with underscores)
 * @param text - The string to convert
 * @returns The snake_case string
 */
export const toSnakeCase = (text: string): string => {
  return text.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
};

/**
 * Upload a base64 image to Cloudinary with organized folder structure
 * @param base64Image - Base64 encoded image
 * @param category - Product category (for first level folder)
 * @param productName - Product name (for second level folder)
 * @returns Promise with upload result
 */
export const uploadImage = async (
  base64Image: string,
  category?: string,
  productName?: string
): Promise<UploadResponse> => {
  try {
    // Remove data:image/format;base64, prefix if it exists
    const base64WithoutPrefix = base64Image.includes('base64,')
      ? base64Image.split('base64,')[1]
      : base64Image;

    // Build folder path: stillness-ecommerce-images/category/product_name
    // Start with the main folder
    let folderPath = 'stillness-ecommerce-images';
    
    if (category) {
      folderPath += `/${toSnakeCase(category)}`;
      
      if (productName) {
        folderPath += `/${toSnakeCase(productName)}`;
      }
    } else {
      // Default folder if no category
      folderPath += '/products';
      
      if (productName) {
        folderPath += `/${toSnakeCase(productName)}`;
      }
    }

    const result = await cloudinary.uploader.upload(
      `data:image/png;base64,${base64WithoutPrefix}`,
      {
        folder: folderPath,
        resource_type: 'image',
      }
    );

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Image upload failed');
  }
};

/**
 * Upload multiple base64 images to Cloudinary with organized folder structure
 * @param base64Images - Array of base64 encoded images
 * @param category - Product category (for first level folder)
 * @param productName - Product name (for second level folder)
 * @returns Promise with array of upload results
 */
export const uploadMultipleImages = async (
  base64Images: string[],
  category?: string,
  productName?: string
): Promise<UploadResponse[]> => {
  try {
    const uploadPromises = base64Images.map((image) => 
      uploadImage(image, category, productName)
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images to Cloudinary:', error);
    throw new Error('Multiple image upload failed');
  }
};

/**
 * Delete an image from Cloudinary
 * @param publicId - Public ID of the image to delete
 * @returns Promise with deletion result
 */
export const deleteImage = async (publicId: string): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};

/**
 * Delete an entire folder from Cloudinary including all nested files
 * @param folderPath - Path of the folder to delete (e.g., 'stillness-ecommerce-images/category/product_name')
 * @returns Promise with deletion result
 */
export const deleteFolder = async (folderPath: string): Promise<boolean> => {
  try {
    // First delete all assets in the folder (required before deleting the folder)
    const deleteResult = await cloudinary.api.delete_resources_by_prefix(folderPath);
    
    // Then delete the empty folder
    const folderResult = await cloudinary.api.delete_folder(folderPath);
    
    console.log(`Deleted folder: ${folderPath}`);
    return true;
  } catch (error) {
    console.error(`Error deleting folder ${folderPath} from Cloudinary:`, error);
    return false;
  }
};
