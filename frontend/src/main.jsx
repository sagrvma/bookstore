import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Login from "./pages/Login.tsx";
import Books from "./pages/Books.tsx";
import Header from "./components/Header.tsx";
import { BrowserRouter, Routes, Route } from "react-router";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<App />} />
        {/*Login page*/}
        <Route path="/login" element={<Login />} />
        {/*Public Books page*/}
        <Route path="/books" element={<Books />} />
        {/*Protected Routes*/}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <div>
                <h2>Cart</h2>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
