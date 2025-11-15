import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Book, getBookById, getBooks } from "../api/admin";
import { addToCart } from "../api/cart";
import "./BookDetails.css";
import { useToast } from "../context/ToastContext";

const BookDetails = () => {
  const [loading, setLoading] = useState(true);
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [err, setErr] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const navigate = useNavigate();

  const { showToast } = useToast();

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

      const quantityText = quantity === 1 ? "copy" : "copies";

      showToast(
        "success",
        `${quantity} ${quantityText} of ${book.title} added to cart!`
      );

      navigate("/cart");
    } catch (error: any) {
      if (error.response?.status === 401) {
        navigate("/login", { replace: true });
        return;
      }
      const msg =
        error?.response?.data?.message || "Failed to add book to cart.";
      showToast("error", "Failed to add to cart! Please try again.");
      setErr(msg);
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
      {/* Breadcrumb stays at top */}
      <nav className="breadCrumb">
        <Link to="/books">Books</Link>
        <span className="breadCrumbSeperator">{">"}</span>
        <span>{book.category}</span>
        <span className="breadCrumbSeperator">{">"}</span>
        <span>{book.title}</span>
      </nav>

      {/* Main 2-column layout */}
      <div className="bookDetailGrid">
        {/* LEFT COLUMN - Image + Quick Info */}
        <aside className="bookImageSection">
          <div className="bookImagePlaceholder">
            <div className="imagePlaceholderText">
              📚
              <br />
              Book Cover
            </div>
          </div>

          <div className="bookQuickInfo">
            <h4>Quick Info</h4>
            <div className="quickInfoItem">
              <span className="quickInfoLabel">Author:</span>
              <span>{authorName}</span>
            </div>
            <div className="quickInfoItem">
              <span className="quickInfoLabel">Category:</span>
              <span className="bookCategory">{book.category}</span>
            </div>
            <div className="quickInfoItem">
              <span className="quickInfoLabel">ISBN:</span>
              <span>{book.isbn}</span>
            </div>
            {book.pages && (
              <div className="quickInfoItem">
                <span className="quickInfoLabel">Pages:</span>
                <span>{book.pages}</span>
              </div>
            )}
            {book.publishedDate && (
              <div className="quickInfoItem">
                <span className="quickInfoLabel">Published:</span>
                <span>
                  {new Date(book.publishedDate).toLocaleDateString("en-IN")}
                </span>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN - Main Content */}
        <section className="bookMainContent">
          {/* Title */}
          <h1 className="bookDetailTitle">{book.title}</h1>
          <div className="bookAuthorLine">
            by <span>{authorName}</span>
          </div>

          {/* Price & Stock - Compact Box */}
          <div className="buyBox">
            <div className="priceSection">
              <span className="priceLabel">Price:</span>
              <span className="currentPrice">{inr.format(book.price)}</span>
            </div>

            <div className="stockSection">
              {inStock ? (
                <span className="inStock">✓ {book.stock} in stock</span>
              ) : (
                <span className="outOfStock">Out of stock</span>
              )}
            </div>

            {/* Quantity + Add to Cart */}
            {inStock && (
              <div className="addToCartSection">
                <div className="quantitySelector">
                  <label htmlFor="quantity">Qty:</label>
                  <select
                    id="quantity"
                    disabled={addingToCart}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
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

                <button
                  className="addToCartBtn"
                  onClick={handleAddToCart}
                  disabled={!inStock || addingToCart}
                >
                  {addingToCart ? "Adding..." : `Add ${quantity} to Cart`}
                </button>
              </div>
            )}
          </div>

          {/* Description - HIGH UP */}
          {book.description && (
            <div className="bookDescription">
              <h3>About this book</h3>
              <p>{book.description}</p>
            </div>
          )}

          {/* Book Details */}
          <div className="bookDetails">
            <h3>Product Details</h3>
            <div className="detailsGrid">
              <div className="detailItem">
                <span className="detailLabel">ISBN:</span> {book.isbn}
              </div>
              {book.pages && (
                <div className="detailItem">
                  <span className="detailLabel">Pages:</span> {book.pages}
                </div>
              )}
              {book.publishedDate && (
                <div className="detailItem">
                  <span className="detailLabel">Published:</span>{" "}
                  {new Date(book.publishedDate).toLocaleDateString("en-IN")}
                </div>
              )}
              <div className="detailItem">
                <span className="detailLabel">Category:</span> {book.category}
              </div>
            </div>
          </div>

          {/* Author Info - Still included but lower */}
          {authorBio && (
            <div className="authorInfo">
              <h3>About the Author</h3>
              <h4>{authorName}</h4>
              <p>{authorBio}</p>
            </div>
          )}

          {/* Related Books */}
          {relatedBooks.length > 0 && (
            <div className="relatedBooks">
              <h3>Customers also viewed</h3>
              <div className="relatedBooksGrid">
                {relatedBooks.map((relatedBook) => (
                  <Link
                    key={relatedBook._id}
                    to={`/books/${relatedBook._id}`}
                    className="relatedBookCard"
                  >
                    <div className="relatedBookTitle">{relatedBook.title}</div>
                    <div className="relatedBookAuthor">
                      {typeof relatedBook.author === "object"
                        ? relatedBook.author.name
                        : "Unknown"}
                    </div>
                    <div className="relatedBookPrice">
                      {inr.format(relatedBook.price)}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <button className="backBtn" onClick={() => navigate("/books")}>
            ← Back to Books
          </button>
        </section>
      </div>
    </div>
  );
};

export default BookDetails;
