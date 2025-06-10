import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import { success, fail } from '../helpers/response.helper';
import { ApiResponse } from '../types/response.types';
import axios from 'axios';

export const createPayPalOrder = async (
  req: Request,
  res: Response<ApiResponse<any>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { totalAmount } = req.body;

    const authResponse = await axios({
      url: 'https://api-m.sandbox.paypal.com/v1/oauth2/token',
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      auth: {
        username: config.paypal.sandbox.clientId!,
        password: config.paypal.sandbox.secret!,
      },
      data: 'grant_type=client_credentials',
    });

    const accessToken = authResponse.data.access_token;

    const orderResponse = await axios({
      url: 'https://api-m.sandbox.paypal.com/v2/checkout/orders',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: totalAmount,
            },
          },
        ],
        application_context: {
          return_url: 'https://localhost:5173/checkout?success=true',
          cancel_url: 'https://localhost:5173/checkout?success=false',
        },
      },
    });

    if (orderResponse.status !== 201) {
      return fail(res, 'Failed to create PayPal order', 500);
    }

    const orderID = orderResponse.data.id;

    return success(res, { orderID }, 'PayPal order created successfully');
  } catch (error) {
    next(error);
  }
};
