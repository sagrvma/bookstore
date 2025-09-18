import { useEffect, useState } from "react";
import http from "../lib/http";
import "./Books.css";
import { useNavigate } from "react-router";
import { addToCart } from "../api/cart";

type Author = { _id: string; name: string } | string;

type Book = {
  _id: string;
  title: string;
  author?: Author;
  isbn: string;
  price: number;
  stock: number;
  description?: string;
  category: string;
  publishedDate?: string; //Dates come in ISO strings from the API via toJSON/toISOString
  pages?: number;
  createdAt: string;
  updatedAt: string;
};

type APISuccess<T> = {
  success: true;
  message: string;
  data: T;
};

const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    http
      .get<APISuccess<Book[]>>("/api/books")
      .then((res) => {
        if (!mounted) {
          return;
        }
        setBooks(res.data.data ?? []);
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        setErr("Error while fetching books.");
      })
      .finally(() => {
        if (!mounted) {
          return;
        }
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (err) {
    return <p className="error">{err}</p>;
  }

  return (
    <div className="booksWrap">
      <h2>Books</h2>
      <ul className="booksList">
        {books.map((book) => (
          <li key={book._id} className="bookItem">
            <div className="bookTitle">{book.title}</div>
            <div className="bookMeta">
              {typeof book.author === "string"
                ? book.author
                : book.author?.name ?? "Unknown"}
            </div>
            <button
              onClick={async () => {
                try {
                  await addToCart(book._id, 1);
                } catch (error: any) {
                  if (error?.response?.status === 401) {
                    navigate("/login");
                  }
                }
              }}
            >
              Add to Cart
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Books;
