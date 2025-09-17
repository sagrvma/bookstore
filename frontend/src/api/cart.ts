import http from "../lib/http";

export type CartBook = {
  _id: string;
  title: string;
  author?: { _id: string; name: string } | string;
  isbn: string;
  category: string;
};

export type CartItem = {
  _id: string;
  book: CartBook | string;
  title: string;
  price: number;
  quantity: number;
  subtotal?: number; // virtual [server-calculated]
};

export type Cart = {
  _id: string;
  user: string;
  items: CartItem[];
  totalQuantity?: number;
  totalPrice?: number;
  createdAt: string;
  updatedAt: string;
};

type APISuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export const getCart = async () => {
  const res = await http.get<APISuccess<Cart>>("/api/cart");
  return res.data.data;
};

export const addToCart = async (bookId: string, bookQuantity: number) => {
  const res = await http.post<APISuccess<Cart>>("/api/cart", {
    bookId,
    bookQuantity,
  });
  return res.data.data;
};

export const updateCartItemById = async (
  itemId: string,
  newQuantity: number
) => {
  const res = await http.patch(`/api/cart/item/${itemId}`, { newQuantity });
  return res.data.data;
};

export const removeCartItemById = async (itemId: string) => {
  const res = await http.delete(`/api/cart/item/${itemId}`);
  return res.data.data;
};

export const removeCartItemByBookId = async (bookId: string) => {
  const res = await http.delete(`/api/cart/book/${bookId}`);
  return res.data.data;
};

export const clearCart = async () => {
  const res = await http.delete("/api/cart");
  return res.data.data;
};
