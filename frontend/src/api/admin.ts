import http from "../lib/http";

import { OrdersPage, Order } from "./order";

export type Author = {
  _id: string;
  name: string;
  slug: string;
  bio?: string;
  birthDate?: string; //Type dates as strings since JSON only returns strings
  nationality?: string;
  createdAt: string; //Type dates as strings since JSON only returns strings
  updatedAt: string; //Type dates as strings since JSON only returns strings
};

export type Book = {
  _id: string;
  title: string;
  author: string | Author;
  isbn: string;
  price: number;
  stock: number;
  description?: string;
  category: string;
  publishedDate?: string; //Type dates as strings since JSON only returns strings
  pages?: number;
  createdAt: string; //Type dates as strings since JSON only returns strings
  updatedAt: string; //Type dates as strings since JSON only returns strings
};

export type APISuccess<T> = {
  success: true;
  message: string;
  data: T;
};

//Admin: Order API Helpers
export const getAllOrders = async (params: {
  //Using object as status is optional
  page?: number;
  limit?: number;
  status?: string;
}) => {
  const res = await http.get<APISuccess<OrdersPage>>("/api/orders/admin/all", {
    params,
  });

  return res.data.data;
};

export const updateOrderStatus = async (
  orderId: string,
  status: Order["status"]
) => {
  const res = await http.patch<APISuccess<Order>>(
    `/api/orders/admin/${orderId}/status`,
    { status }
  );
  return res.data.data;
};

//Admin: Author API Helpers
export const getAuthors = async () => {
  const res = await http.get<APISuccess<Author[]>>("/api/authors");
  return res.data.data;
};

export const getAuthorById = async (authorId: string) => {
  const res = await http.get<APISuccess<Author>>(`/api/authors/${authorId}`);
  return res.data.data;
};

export const createAuthor = async (authorData: Partial<Author>) => {
  //Partial since _id, createdAt and updatedAt can't be provided, will handle mandatoriness from UI for all required fields anyways
  const res = await http.post<APISuccess<Author>>("/api/authors", authorData);
  return res.data.data;
};

export const deleteAuthor = async (authorId: string) => {
  const res = await http.delete<APISuccess<Author>>(`/api/authors/${authorId}`);
  return res.data.data;
};

export const updateAuthor = async (
  authorId: string,
  updates: Partial<Author>
) => {
  const res = await http.patch<APISuccess<Author>>(
    `/api/authors/${authorId}`,
    updates
  );
  return res.data.data;
};

//Admin Book API Helpers
export const getBooks = async () => {
  const res = await http.get<APISuccess<Book[]>>("/api/books");
  return res.data.data;
};

export const getBookById = async (bookId: string) => {
  const res = await http.get<APISuccess<Book>>(`/api/books/${bookId}`);
  return res.data.data;
};

export const createBook = async (bookData: Partial<Book>) => {
  //Partial since _id, createdAt and updatedAt can't be provided, will handle mandatoriness from UI for all required fields anyways
  const res = await http.post<APISuccess<Book>>("/api/books/", bookData);
  return res.data.data;
};

export const removeBook = async (bookId: string) => {
  const res = await http.delete<APISuccess<Book>>(`/api/books/${bookId}`);
  return res.data.data;
};

export const updateBook = async (bookId: string, updates: Partial<Book>) => {
  const res = await http.patch<APISuccess<Book>>(
    `/api/books/${bookId}`,
    updates
  );
  return res.data.data;
};
