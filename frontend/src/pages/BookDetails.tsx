import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Book, getBookById, getBooks } from "../api/admin";
import { addToCart } from "../api/cart";
import "./BookDetails.css";

const BookDetails = () => {
  const [loading, setLoading] = useState(true);
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [err, setErr] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const navigate = useNavigate();

  const inr = new Intl.NumberFormat("en-In", {
    style: "currency",
    currency: "INR",
  });

  const loadBook = async () => {
    if (!bookId) {
      navigate("/books", { replace: true });
      return;
    }

    setErr("");
    setLoading(true);

    try {
      const res = await getBookById(bookId);
      setBook(res);

      await loadRelatedBooks(res); //Load related books
    } catch (error: any) {
      if (error.response?.status === 401) {
        navigate("/login", { replace: true });
        return;
      }
      setErr(error.response?.data?.message || "Failed to load book.");
      return;
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedBooks = async (currentBook: Book) => {
    try {
      const allBooks = await getBooks();

      const related = allBooks
        .filter(
          (book) =>
            book._id !== currentBook._id &&
            (book.category === currentBook.category ||
              (typeof book.author === "object" &&
                typeof currentBook.author === "object" &&
                book.author?.name === currentBook.author?.name))
        )
        .slice(0, 4); //Limit to 4 related books.

      setRelatedBooks(related);
    } catch (error: any) {
      //Fail silently for related books.
      console.error("Failed to load related books.");
    }
  };

  const handleAddToCart = async () => {
    if (!book || addingToCart) {
      return;
    }

    setAddingToCart(true);

    try {
      await addToCart(book._id, quantity);

      navigate("/cart");
    } catch (error: any) {
      if (error.response?.status === 401) {
        navigate("/login", { replace: true });
        return;
      }
      setErr(error?.response?.data?.message || "Failed to add book to cart.");
    } finally {
      setAddingToCart(false);
    }
  };

  useEffect(() => {
    loadBook();
  }, [bookId]);

  if (loading) {
    return <p className="status">Loading book...</p>;
  }

  if (err) {
    return <p className="error">{err}</p>;
  }

  if (!book) {
    return <p className="error">Book not found.</p>;
  }

  const authorName =
    typeof book.author === "object" ? book.author?.name : "Unkown author";
  const authorBio = typeof book.author === "object" ? book.author?.bio : null;
  const inStock = book.stock > 0;
  const maxQuantity = Math.min(book.stock, 10);

  return (
    <div className="bookDetailsWrapper">
      <nav className="breadCrumb">
        <Link to="/books">Books</Link>
        <span className="breadCrumbSeperator">{">"}</span>
        <span>{book.category}</span>
        <span className="breadCrumbSeperator">{">"}</span>
        <span>{book.title}</span>
      </nav>

      <div className="bookDetailGrid">
        <section className="bookMainInfo">
          <div className="bookHeader">
            <h1 className="bookDetailTitle">{book.title}</h1>
            <div className="bookMeta">
              <span className="bookAuthor">by {authorName}</span>
              <span className="bookCategory">{book.category}</span>
            </div>
          </div>

          <div className="bookPrice">
            <span className="currentPrice">{inr.format(book.price)}</span>
          </div>

          <div className="stockInfo">
            {inStock ? (
              <span className="inStock">{book.stock} in stock</span>
            ) : (
              <span className="outOfStock">Out of stock.</span>
            )}
          </div>

          <div className="addToCartSection">
            {inStock && (
              <div className="quantitySelector">
                <label htmlFor="quantity">Quantity:</label>
                <select
                  id="quantity"
                  disabled={addingToCart}
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(Number(e.target.value));
                  }}
                >
                  {Array.from({ length: maxQuantity }, (_, i) => i + 1).map(
                    (num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}

            <button
              className={`addToCartBtn ${inStock ? "" : "disabled"}`}
              onClick={handleAddToCart}
              disabled={!inStock || addingToCart}
            >
              {addingToCart
                ? "Adding to Cart..."
                : inStock
                ? `Add ${quantity} to Cart`
                : "Out of Stock"}
            </button>
          </div>

          <div className="bookDetails">
            <h3>Book Details</h3>
            <div className="detailsGrid">
              <div className="detailItem">
                <span className="detailLabel">ISBN: </span>
                <span>{book.isbn}</span>
              </div>
              {book.pages && (
                <div className="detailItem">
                  <span className="detailLabel">Pages: </span>
                  <span>{book.pages}</span>
                </div>
              )}
              {book.publishedDate && (
                <div className="detailItem">
                  <span className="detailLabel">Published Date: </span>
                  <span>
                    {new Date(book.publishedDate).toLocaleDateString("en-IN")}
                  </span>
                </div>
              )}
              <div className="detailItem">
                <span className="detailLabel">Category: </span>
                <span>{book.category}</span>
              </div>
            </div>
          </div>

          {book.description && (
            <div className="bookDescription">
              <h3>Description</h3>
              <p>{book.description}</p>
            </div>
          )}

          {authorBio && (
            <div className="authorInfo">
              <h3>About the Author</h3>
              <div className="authorDetails">
                <h4>{authorName}</h4>
                <p>{authorBio}</p>
              </div>
            </div>
          )}
        </section>

        <aside className="bookSidebar">
          <div className="quickActions">
            <button
              className="backBtn"
              onClick={() => {
                navigate("/books");
              }}
            >
              Back to Books
            </button>
          </div>

          {relatedBooks.length > 0 && (
            <div className="relatedBooks">
              <h4>Books you might also like</h4>
              <ul className="relatedBooksList">
                {relatedBooks.map((relatedBook) => (
                  <li key={relatedBook._id} className="relatedBookItem">
                    <Link
                      to={`/books/${relatedBook._id}`}
                      className="relatedBookLink"
                    >
                      <div className="relatedBookInfo">
                        <div className="relatedBookTitle">
                          {relatedBook.title}
                        </div>
                        <div className="relatedBookAuthor">
                          {typeof relatedBook.author === "object"
                            ? relatedBook.author.name
                            : "Unknown"}
                        </div>
                        <div className="relatedBookPrice">
                          {inr.format(relatedBook.price)}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default BookDetails;
