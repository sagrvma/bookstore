import http from "../lib/http";

export type Address = {
  _id?: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
};

type APISuccess<T> = {
  success: true;
  message: string;
  data: T;
};

//User API Helpers
export const getProfile = async (): Promise<User> => {
  const res = await http.get<APISuccess<User>>("/api/user/profile");
  return res.data.data;
};

export const updateProfile = async (updates: {
  name?: string;
  email?: string;
}): Promise<User> => {
  const res = await http.patch<APISuccess<User>>("/api/user/profile", updates);
  return res.data.data;
};

export const changePassword = async (data: {
  oldPassword: string;
  newPassword: string;
}): Promise<void> => {
  const res = await http.patch<APISuccess<void>>(
    "/api/user/profile/password",
    data
  );
  return res.data.data;
};

//Address API Helpers

export const addAddress = async (
  address: Omit<Address, "_id">
): Promise<User> => {
  const res = await http.post<APISuccess<User>>("/api/user/addresses", address);
  return res.data.data;
};

export const updateAddress = async (
  addressId: string,
  updates: Partial<Address>
): Promise<User> => {
  const res = await http.patch<APISuccess<User>>(
    `/api/user/addresses/${addressId}`,
    updates
  );
  return res.data.data;
};

export const deleteAddress = async (addressId: string): Promise<User> => {
  const res = await http.delete(`/api/user/addresses/${addressId}`);
  return res.data.data;
};
