import { jwtDecode } from "jwt-decode";
import { tokenStore } from "../lib/http";
import { JWTPayload } from "../routes/AdminRoute";
import { useToast } from "../context/ToastContext";
import { Link, useNavigate } from "react-router";

import "./Header.css";

const Header = () => {
  const { showToast } = useToast();

  const navigate = useNavigate();

  const token = tokenStore.get();

  const isAuthed: boolean = !!token; //Converts the string into a strict boolean

  let isAdmin = false;

  if (token) {
    const payload = jwtDecode<JWTPayload>(token);
    isAdmin = payload.role === "admin";
  }

  const handleLogout = () => {
    tokenStore.clear();
    showToast("success", "You have been logged out.");
    navigate("/login", { replace: true });
  };

  return (
    <header className="siteHeader">
      <nav className="headerNav">
        {/*Left : Brand */}
        <div className="headerLeft">
          <Link to="/" className="brand">
            Bookstore
          </Link>
        </div>
        {/*Center : Main Nav */}
        <div className="headerCenter">
          <Link to="/books" className="navLink">
            Books
          </Link>
          <Link to="/cart" className="navLink">
            Cart
          </Link>

          {isAdmin && (
            <div className="adminLinks">
              <span className="adminLabel">Admin</span>
              <Link to="/admin/orders" className="navLink">
                Orders
              </Link>
              <Link to="/admin/books" className="navLink">
                Books
              </Link>
              <Link to="/admin/authors" className="navLink">
                Authors
              </Link>
            </div>
          )}
        </div>
        {/*Right : Auth */}
        <div className="headerRight">
          {isAuthed ? (
            <>
              <Link to="/profile" className="navLink">
                Profile
              </Link>
              <button className="logoutBtn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navLink">
                Login
              </Link>
              <Link to="/register" className="navLink">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
