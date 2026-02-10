import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Book, getBookById, getBooks } from "../api/admin";
import { addToCart } from "../api/cart";
import { useToast } from "../context/ToastContext";
import styles from "./BookDetails.module.css";
import LoadingSpinner from "../components/LoadingSpinner";

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
                book.author?.name === currentBook.author?.name)),
        )
        .slice(0, 4);

      setRelatedBooks(related);
    } catch (error: any) {
      console.error("Failed to load related books.");
    }
  };

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
      await loadRelatedBooks(res);
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

  const handleAddToCart = async () => {
    if (!book || addingToCart) return;

    setAddingToCart(true);

    try {
      await addToCart(book._id, quantity);

      const quantityText = quantity === 1 ? "copy" : "copies";

      showToast(
        "success",
        `${quantity} ${quantityText} of ${book.title} added to cart!`,
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
    return <LoadingSpinner />;
  }

  if (err) {
    return <p className={styles.error}>{err}</p>;
  }

  if (!book) {
    return <p className={styles.error}>Book not found.</p>;
  }

  const authorName =
    typeof book.author === "object" ? book.author?.name : "Unkown author";
  const authorBio = typeof book.author === "object" ? book.author?.bio : null;
  const inStock = book.stock > 0;
  const maxQuantity = Math.min(book.stock, 10);

  return (
    <div className={styles.bookDetailsWrapper}>
      {/* Breadcrumb */}
      <nav className={styles.breadCrumb}>
        <Link to="/books">Books</Link>
        <span className={styles.breadCrumbSeperator}>{">"}</span>
        <span>{book.category}</span>
        <span className={styles.breadCrumbSeperator}>{">"}</span>
        <span>{book.title}</span>
      </nav>

      {/* Main 2-column layout */}
      <div className={styles.bookDetailGrid}>
        {/* LEFT COLUMN */}
        <aside className={styles.bookImageSection}>
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className={styles.bookImage}
            />
          ) : (
            <>
              <div className={styles.bookImagePlaceholder}>
                <div className={styles.imagePlaceholderText}>
                  📚
                  <br />
                  Book Cover
                </div>
              </div>
            </>
          )}

          <div className={styles.bookQuickInfo}>
            <h4>Quick Info</h4>
            <div className={styles.quickInfoItem}>
              <span className={styles.quickInfoLabel}>Author:</span>
              <span>{authorName}</span>
            </div>
            <div className={styles.quickInfoItem}>
              <span className={styles.quickInfoLabel}>Category:</span>
              <span className={styles.bookCategory}>{book.category}</span>
            </div>
            <div className={styles.quickInfoItem}>
              <span className={styles.quickInfoLabel}>ISBN:</span>
              <span>{book.isbn}</span>
            </div>
            {book.pages && (
              <div className={styles.quickInfoItem}>
                <span className={styles.quickInfoLabel}>Pages:</span>
                <span>{book.pages}</span>
              </div>
            )}
            {book.publishedDate && (
              <div className={styles.quickInfoItem}>
                <span className={styles.quickInfoLabel}>Published:</span>
                <span>
                  {new Date(book.publishedDate).toLocaleDateString("en-IN")}
                </span>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN */}
        <section className={styles.bookMainContent}>
          <h1 className={styles.bookDetailTitle}>{book.title}</h1>
          <div className={styles.bookAuthorLine}>
            by <span>{authorName}</span>
          </div>

          {/* Buy box */}
          <div className={styles.buyBox}>
            <div className={styles.priceSection}>
              <span className={styles.priceLabel}>Price:</span>
              <span className={styles.currentPrice}>
                {inr.format(book.price)}
              </span>
            </div>

            <div className={styles.stockSection}>
              {inStock ? (
                <span className={styles.inStock}>✓ {book.stock} in stock</span>
              ) : (
                <span className={styles.outOfStock}>Out of stock</span>
              )}
            </div>

            {inStock && (
              <div className={styles.addToCartSection}>
                <div className={styles.quantitySelector}>
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
                      ),
                    )}
                  </select>
                </div>

                <button
                  className={styles.addToCartBtn}
                  onClick={handleAddToCart}
                  disabled={!inStock || addingToCart}
                >
                  {addingToCart ? "Adding..." : `Add ${quantity} to Cart`}
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          {book.description && (
            <div className={styles.bookDescription}>
              <h3>About this book</h3>
              <p>{book.description}</p>
            </div>
          )}

          {/* Product Details */}
          <div className={styles.bookDetails}>
            <h3>Product Details</h3>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>ISBN:</span> {book.isbn}
              </div>
              {book.pages && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Pages:</span>{" "}
                  {book.pages}
                </div>
              )}
              {book.publishedDate && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Published:</span>{" "}
                  {new Date(book.publishedDate).toLocaleDateString("en-IN")}
                </div>
              )}
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Category:</span>{" "}
                {book.category}
              </div>
            </div>
          </div>

          {/* Author Info */}
          {authorBio && (
            <div className={styles.authorInfo}>
              <h3>About the Author</h3>
              <h4>{authorName}</h4>
              <p>{authorBio}</p>
            </div>
          )}

          {/* Related Books */}
          {relatedBooks.length > 0 && (
            <div className={styles.relatedBooks}>
              <h3>Customers also viewed</h3>
              <div className={styles.relatedBooksGrid}>
                {relatedBooks.map((relatedBook) => (
                  <Link
                    key={relatedBook._id}
                    to={`/books/${relatedBook._id}`}
                    className={styles.relatedBookCard}
                  >
                    <div className={styles.relatedBookTitle}>
                      {relatedBook.title}
                    </div>
                    <div className={styles.relatedBookAuthor}>
                      {typeof relatedBook.author === "object"
                        ? relatedBook.author.name
                        : "Unknown"}
                    </div>
                    <div className={styles.relatedBookPrice}>
                      {inr.format(relatedBook.price)}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <button className={styles.backBtn} onClick={() => navigate("/books")}>
            ← Back to Books
          </button>
        </section>
      </div>
    </div>
  );
};

export default BookDetails;
