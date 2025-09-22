import { Link, useNavigate } from "react-router";
import { tokenStore } from "../lib/http";
import "./Header.css";
import { jwtDecode } from "jwt-decode";
import { JWTPayload } from "../routes/AdminRoute";

const Header = () => {
  const navigate = useNavigate();
  const isAuthed = localStorage.getItem(
    //Check if authenticated/signed in or not
    import.meta.env.VITE_TOKEN_STORAGE_KEY || "bookstore_token"
  );

  const token = tokenStore.get();
  let isAdmin = false;
  if (token) {
    const payload = jwtDecode<JWTPayload>(token);
    isAdmin = payload.role === "admin";
  }

  return (
    <header className="siteHeader">
      <nav>
        <Link to="/" className="brand">
          Bookstore
        </Link>
        <div className="spacer" />
        <Link to="/books">Books</Link>
        <Link to="/cart">Cart</Link>
        {!isAuthed ? (
          <>
            <Link to="/login" className="btn">
              Login
            </Link>
            <Link to="/register" className="btn">
              Register
            </Link>
          </>
        ) : (
          <button
            className="btn"
            onClick={() => {
              tokenStore.clear(); //Remove token to remove authentication and logout
              navigate("/login", { replace: true });
            }}
          >
            Log Out
          </button>
        )}
        {isAdmin && (
          <>
            <Link to="/admin/orders">Admin Orders</Link>
            <Link to="admin/books">Admin Books</Link>
            <Link to="admin/authors">Admin Authors</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
