import { Link, useNavigate } from "react-router";
import { CSSProperties, useEffect, useState } from "react";
import { getBooks } from "./api/admin";
// 1. IMPORT STYLES AS AN OBJECT
import styles from "./App.module.css";

interface Book {
  _id: string;
  title: string;
  author: any;
  price: number;
  createdAt: string;
}

const App = () => {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const allBooks = await getBooks();
        const sorted = allBooks.sort(
          (a: Book, b: Book) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setFeaturedBooks(sorted.slice(0, 5));
      } catch (err) {
        console.error("Failed to load featured books");
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const categories = [
    { name: "Mystery", color: "#FF6B6B" },
    { name: "Fantasy", color: "#4ECDC4" },
    { name: "Horror", color: "#45B7D1" },
    { name: "Literary Fiction", color: "#96CEB4" },
  ];

  const features = [
    {
      icon: "🚀",
      title: "Fast Shipping",
      text: "Delivery within 3-5 business days",
    },
    { icon: "🛡️", title: "Secure Payment", text: "100% Secure Transactions" },
    { icon: "↩️", title: "Easy Returns", text: "7-day return policy" },
  ];

  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Discover your favourite book here.</h1>
          <p>
            Explore our vast collection of books across all genres. From
            timeless classics to the latest bestsellers, there is something for
            everyone.
          </p>
          <div className={styles.heroActions}>
            <Link to="/books" className={styles.primaryBtn}>
              Browse All Books
            </Link>
            <Link to="/register" className={styles.secondaryBtn}>
              Join for Free
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.featuresStrip}>
        {features.map((feature) => (
          <div key={feature.title} className={styles.featureItem}>
            <span className={styles.featureIcon}>{feature.icon}</span>
            <div className={styles.featureText}>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section className={styles.categorySection}>
        <div className={styles.sectionHeader}>
          <h2>Browse By Categories</h2>
        </div>
        <div className={styles.categoryGrid}>
          {categories.map((category) => (
            <div
              key={category.name}
              className={styles.categoryCard}
              onClick={() => navigate(`/books?category=${category.name}`)}
              style={{ "--cat-color": category.color } as CSSProperties}
            >
              <h3>{category.name}</h3>
              <p>Explore →</p>
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className={styles.featuredSection}>
        <div className={styles.sectionHeader}>
          <h2>New Arrivals</h2>
          <Link to="/books" className={styles.seeAllLink}>
            View all →
          </Link>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className={styles.booksGrid}>
            {featuredBooks.map((book) => (
              <Link
                to={`/books/${book._id}`}
                key={book._id}
                className={styles.bookCardHome}
              >
                <div className={styles.homeBookPlaceholder}>📚</div>
                <div className={styles.bookInfoHome}>
                  <h4 className={styles.bookTitle}>{book.title}</h4>
                  <p className={styles.bookAuthor}>
                    {typeof book.author === "object"
                      ? book.author?.name
                      : "Unknown"}
                  </p>
                  <p className={styles.bookPrice}>{inr.format(book.price)}</p>
                </div>
              </Link>
            ))}
            {featuredBooks.length === 0 && <p>No books found.</p>}
          </div>
        )}
      </section>
    </div>
  );
};

export default App;
