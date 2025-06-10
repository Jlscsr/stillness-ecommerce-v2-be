import { Request, Response, NextFunction } from 'express';

import Review from '../models/review.model';

import { success, fail } from '../helpers/response.helper';
import { ApiResponse } from '../types/response.types';
import { ReviewRequestBody } from '../types/review.types';

export const getReviewsByProductId = async (
  req: Request<{ productId: string }>,
  res: Response<ApiResponse<any[]>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });

    if (reviews.length === 0) {
      return success(res, [], 'No reviews found');
    }

    success(res, reviews, 'Reviews fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const addNewReview = async (
  req: Request,
  res: Response<ApiResponse<any>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const reviewData: ReviewRequestBody = req.body;

    const newReview = new Review({
      productId: reviewData.productId,
      name: reviewData.name,
      email: reviewData.email,
      rating: reviewData.rating,
      title: reviewData.title,
      text: reviewData.text,
    });

    await newReview.save();

    success(res, null, 'Review added successfully');
  } catch (error) {
    next(error);
  }
};
