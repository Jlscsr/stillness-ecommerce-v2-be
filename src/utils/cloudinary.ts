import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/env';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

interface UploadResponse {
  public_id: string;
  secure_url: string;
}

export const toSnakeCase = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
};

export const uploadImage = async (
  imageSource: string,
  category?: string,
  productName?: string,
  isUrl: boolean = false,
): Promise<UploadResponse> => {
  try {
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

    let result;

    if (isUrl) {
      console.log(`Uploading image from URL to folder: ${folderPath}`);
      result = await cloudinary.uploader.upload(imageSource, {
        folder: folderPath,
        resource_type: 'image' as 'image',
      });
    } else {
      const base64WithoutPrefix = imageSource.includes('base64,')
        ? imageSource.split('base64,')[1]
        : imageSource;

      console.log(`Uploading base64 image to folder: ${folderPath}`);
      result = await cloudinary.uploader.upload(
        `data:image/png;base64,${base64WithoutPrefix}`,
        {
          folder: folderPath,
          resource_type: 'image' as 'image',
        },
      );
    }

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Image upload failed');
  }
};

export const uploadMultipleImages = async (
  base64Images: string[],
  category?: string,
  productName?: string,
): Promise<UploadResponse[]> => {
  try {
    const uploadPromises = base64Images.map((image) =>
      uploadImage(image, category, productName),
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images to Cloudinary:', error);
    throw new Error('Multiple image upload failed');
  }
};

export const deleteImage = async (publicId: string): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};

export const deleteFolder = async (folderPath: string): Promise<boolean> => {
  try {
    // First delete all assets in the folder (required before deleting the folder)
    const deleteResult =
      await cloudinary.api.delete_resources_by_prefix(folderPath);

    // Then delete the empty folder
    const folderResult = await cloudinary.api.delete_folder(folderPath);

    console.log(`Deleted folder: ${folderPath}`);
    return true;
  } catch (error) {
    console.error(
      `Error deleting folder ${folderPath} from Cloudinary:`,
      error,
    );
    return false;
  }
};
