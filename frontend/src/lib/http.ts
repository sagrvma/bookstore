import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL as string;
const TOKEN_KEY = import.meta.env.VITE_TOKEN_STORAGE_KEY || "bookstore_token"; //Storage key for JWT

//Minimal helpers to get/set/clear token using the WEB Storage API
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

//A single axios instance with a shared baseURL and JSON header for all requests
export const http = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

//Request interceptor: Before sending any request attach Authorization: Bearer if present to authenticate any protected endpoints
http.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//Respone interceptor: If server returns 401 (expired./invaid token), then clear the token and redirect to login
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const reqUrl = err?.config?.url || "";

    const isAuthReq = reqUrl.includes("/auth/");

    if (err?.response?.status === 401 && !isAuthReq) {
      tokenStore.clear();
      window.location.assign("/login");
    }
    return Promise.reject(err);
  },
);

export default http; //Can be used across the app, e.g http.get("api/books")
