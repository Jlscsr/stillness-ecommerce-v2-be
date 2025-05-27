import { Request, Response, NextFunction } from 'express';

import Address from '../models/address.model';

import { success, fail } from '../helpers/response.helper';
import { ApiResponse } from '../types/response.types';
import { AddressRequestBody } from '../types/address.types';

export const addNewAddress = async (
  req: Request<{}, {}, AddressRequestBody>,
  res: Response<ApiResponse<any>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { street, city, province, postalCode, country } = req.body;

    const newAddress = await Address.create({
      userId,
      street,
      city,
      province,
      postalCode,
      country,
    });

    success(res, newAddress, 'Address added successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (
  req: Request<{ id: string }, {}, AddressRequestBody>,
  res: Response<ApiResponse<any>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { street, city, province, postalCode, country } = req.body;

    const updatedAddress = await Address.findByIdAndUpdate(
      id,
      {
        street,
        city,
        province,
        postalCode,
        country,
      },
      { new: true },
    );

    if (!updatedAddress) {
      return fail(res, 'Address not found', 404);
    }

    success(res, updatedAddress, 'Address updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<any>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedAddress = await Address.findByIdAndDelete(id);

    if (!deletedAddress) {
      return fail(res, 'Address not found', 404);
    }

    success(res, null, 'Address deleted successfully', 200);
  } catch (error) {
    next(error);
  }
};
