export interface Address {
  _id: string;
  userId: string;
  country: string;
  province: string;
  city: string;
  postalCode: string;
  street: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'customer';
  address: Address;
  token?: string;
  createdAt?: string;
  updatedAt?: string;
}
