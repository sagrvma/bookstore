import { Navigate } from "react-router";
import { tokenStore } from "../lib/http";
import { jwtDecode } from "jwt-decode";
import { JSX } from "react";

export interface JWTPayload {
  userId: string;
  userName: string;
  role: "admin" | "user";
}

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const token = tokenStore.get();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const payload = jwtDecode<JWTPayload>(token);
    const isAdmin = payload.role === "admin";

    return isAdmin ? children : <Navigate to="/" replace />;
  } catch (error) {
    //Invalid token format
    return <Navigate to="/login" replace />;
  }
};

export default AdminRoute;
