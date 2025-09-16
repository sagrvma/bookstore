import { Link, useNavigate } from "react-router";
import { tokenStore } from "../lib/http";

const Header = () => {
  const navigate = useNavigate();
  const isAuthed = localStorage.getItem(
    //Check if authenticated/signed in or not
    import.meta.env.VITE_TOKEN_STORAGE_KEY || "bookstore_token"
  );

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
          <Link to="/login" className="btn">
            Login
          </Link>
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
      </nav>
    </header>
  );
};

export default Header;
