import { UserResponse } from '../types/user.types';

export const toUserResponse = (
  user: any,
  address: any = null,
): UserResponse => {
  const { password, __v, ...rest } = user.toObject();

  return {
    ...rest,
    address: address
      ? {
          ...address.toObject(),
        }
      : null,
  } as UserResponse;
};
