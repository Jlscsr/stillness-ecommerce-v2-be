import { Request, Response, NextFunction } from 'express';

import Cart from '../models/cart.model';
import Product from '../models/product.model';

import { success, fail } from '../helpers/response.helper';
import { ApiResponse } from '../types/response.types';
import { CartRequestBody } from '../types/cart.types';

const calculateCartTotal = (
  items: { quantity: number; priceAtTimeOfAddition: number }[],
): number => {
  return items.reduce(
    (total, item) => total + item.quantity * item.priceAtTimeOfAddition,
    0,
  );
};

export const getCartItems = async (
  req: Request,
  res: Response<ApiResponse<any>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) return fail(res, 'User not authenticated', 401);

    const cart = await Cart.findOne({ userId })
      .populate('items.productId', 'name images')
      .lean();

    if (!cart) return success(res, null, 'Cart is empty');

    const enrichedItems = cart.items.map((item) => {
      const product = item.productId as any;
      const firstImage = product?.images?.[0] || null;

      return {
        _id: item._id,
        productId: product?._id || item.productId,
        quantity: item.quantity,
        priceAtTimeOfAddition: item.priceAtTimeOfAddition,
        image: firstImage,
        name: product?.name || 'Unknown Product',
        updatedAt: item.updatedAt,
        createdAt: item.createdAt,
      };
    });

    return success(
      res,
      {
        _id: cart._id,
        userId: cart.userId,
        items: enrichedItems,
        totalAmount: cart.totalAmount,
        updatedAt: cart.updatedAt,
        createdAt: cart.createdAt,
      },
      'Cart fetched successfully',
    );
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (
  req: Request<{}, {}, CartRequestBody>,
  res: Response<ApiResponse<any[]>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { productId, quantity } = req.body;

    if (!userId) return fail(res, 'User not authenticated', 401);

    const product = await Product.findById(productId);
    if (!product) return fail(res, 'Product not found', 404);

    const priceAtTimeOfAddition = product.price;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      const newCart = new Cart({
        userId,
        items: [{ productId, quantity, priceAtTimeOfAddition }],
        totalAmount: quantity * priceAtTimeOfAddition,
      });
      await newCart.save();
      return success(res, newCart.items, 'Item added to cart successfully');
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString(),
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].priceAtTimeOfAddition =
        priceAtTimeOfAddition;
    } else {
      cart.items.push({ productId, quantity, priceAtTimeOfAddition } as any);
    }

    cart.totalAmount = calculateCartTotal(cart.items);

    await cart.save();

    success(res, cart.items, 'Item added to cart successfully');
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (
  req: Request<{ productId: string }, {}, CartRequestBody>,
  res: Response<ApiResponse<any[]>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!userId) return fail(res, 'User not authenticated', 401);

    const product = await Product.findById(productId);
    if (!product) return fail(res, 'Product not found', 404);

    const cart = await Cart.findOne({ userId });

    if (!cart) return fail(res, 'Cart not found', 404);

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (itemIndex === -1) return fail(res, 'Item not found in cart', 404);

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].priceAtTimeOfAddition = product.price;

    cart.totalAmount = calculateCartTotal(cart.items);

    await cart.save();

    success(res, cart.items, 'Cart item updated successfully');
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (
  req: Request<{ productId: string }>,
  res: Response<ApiResponse<any[]>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;

    if (!userId) return fail(res, 'User not authenticated', 401);

    const cart = await Cart.findOne({ userId });

    if (!cart) return fail(res, 'Cart not found', 404);

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (itemIndex === -1) return fail(res, 'Item not found in cart', 404);

    cart.totalAmount -=
      cart.items[itemIndex].quantity *
      cart.items[itemIndex].priceAtTimeOfAddition;

    cart.items.splice(itemIndex, 1);

    await cart.save();

    success(res, cart.items, 'Cart item removed successfully');
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (
  req: Request,
  res: Response<ApiResponse<any[]>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) return fail(res, 'User not authenticated', 401);

    const cart = await Cart.findOne({ userId });

    if (!cart) return fail(res, 'Cart not found', 404);

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();
    success(res, cart.items, 'Cart cleared successfully');
  } catch (error) {
    next(error);
  }
};
