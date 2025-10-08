import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Login from "./pages/Login.tsx";
import Books from "./pages/Books.tsx";
import Header from "./components/Header.tsx";
import CartPage from "./pages/CartPage.tsx";
import Checkout from "./pages/Checkout.tsx";
import Orders from "./pages/Orders.tsx";
import OrderDetails from "./pages/OrderDetails.tsx";
import AdminOrders from "./pages/admin/AdminOrders.tsx";
import AdminBooks from "./pages/admin/AdminBooks.tsx";
import AdminAuthors from "./pages/admin/AdminAuthors.tsx";
import Register from "./pages/Register.tsx";
import BookDetails from "./pages/BookDetails.tsx";
import Profile from "./pages/Profile.tsx";
import EditProfile from "./pages/EditProfile.tsx";
import ChangePassword from "./pages/ChangePassword.tsx";
import ManageAddresses from "./pages/ManageAddresses.tsx";
import { BrowserRouter, Routes, Route } from "react-router";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import AdminRoute from "./routes/AdminRoute.tsx";
import { ToastProvider } from "./context/ToastContext.tsx";
import ToastContainer from "./components/Toast.tsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<App />} />
          {/*Login page*/}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/*Public Books page*/}
          <Route path="/books" element={<Books />} />
          {/*Protected Routes*/}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminOrders />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/books"
            element={
              <AdminRoute>
                <AdminBooks />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/authors"
            element={
              <AdminRoute>
                <AdminAuthors />
              </AdminRoute>
            }
          />

          <Route path="/books/:bookId" element={<BookDetails />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/addresses"
            element={
              <ProtectedRoute>
                <ManageAddresses />
              </ProtectedRoute>
            }
          />
        </Routes>

        <ToastContainer />
      </BrowserRouter>
    </ToastProvider>
  </StrictMode>
);
