import http from "../lib/http";

type Book = {
  _id: string;
  title: string;
  author?: string;
  isbn?: string;
  category?: string;
};

type ShippingAddress = {
  fullName: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  phone: string;
};

type OrderItem = {
  _id: string;
  book: Book;
  title: string;
  author: string;
  price: number;
  quantity: number;
  lineTotal: number;
};

type Order = {
  user: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax?: number;
  shippingCost?: number;
  totalAmount: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: "cash_on_delivery" | "card";
  paymentIntentId?: string;
  shippingAddress: ShippingAddress;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

type OrdersPage = {
  orders: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    hasPrev: boolean;
    hasNext: boolean;
  };
};

type APISuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export const placeOrder = async (body: {
  shippingAddress: ShippingAddress;
  paymentMethod: "cash_on_delivery" | "card";
  notes?: string;
}) => {
  const res = await http.post<APISuccess<Order>>("/api/orders", body);
  return res.data.data;
};

export const getOrdersByUser = async (params: {
  page: number;
  limit: number;
}) => {
  const res = await http.get<APISuccess<OrdersPage>>("/api/orders", { params });
  return res.data.data;
};

export const getOrderById = async (orderId: string) => {
  const res = await http.get<APISuccess<Order>>(`/api/orders/${orderId}`);
  return res.data.data;
};

export const cancelOrder = async (orderId: string) => {
  const res = await http.patch<APISuccess<Order>>(
    `/api/orders/${orderId}/cancel`
  );
  return res.data.data;
};
