import { User as IUser } from '../types/user.types';
export const formatUser = (user: any): IUser => ({
  _id: user._id.toString(),
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role,
  address: user.address,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

export const formatUsers = (users: any[]): IUser[] => {
  return users.map((user) => formatUser(user));
};
