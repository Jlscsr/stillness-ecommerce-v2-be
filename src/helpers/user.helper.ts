import { UserResponse } from '../types/user.types';

export const toUserResponse = (user: any): UserResponse => {
  const { password, __v, ...rest } = user.toObject();

  return {
    ...rest,
    address: user.address
      ? {
          ...user.address.toObject(),
          _id: user.address._id.toString(),
        }
      : null,
  } as UserResponse;
};
