import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { getBooks, type Book } from "./api/admin";
import "./App.css";

const App = () => {
  const [latestBooks, setLatestBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  const categories = [
    {
      name: "Mystery",
      color: "#FF6B6B",
    },
    {
      name: "Fantasy",
      color: "#4ECDC4",
    },
    {
      name: "Horror",
      color: "#45B7D1",
    },
    {
      name: "Literary Fiction",
      color: "#96CEB4",
    },
  ];

  const features = [
    {
      icon: "🚀",
      title: "Fast Shipping",
      text: "Delivery within 3-5 business days",
    },
    {
      icon: "🛡️",
      title: "Secure Payment",
      text: "100% Secure Transactions",
    },
    {
      icon: "↩️",
      title: "Easy Returns",
      text: "7-day return policy",
    },
  ];

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const allBooks: Book[] = await getBooks();
        //Sort books by latest created
        const sortedBooks: Book[] = allBooks.sort(
          (a: Book, b: Book) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        //Take top 4
        setLatestBooks(sortedBooks.slice(0, 5));

        console.log(latestBooks);
      } catch (error) {
        console.error("Failed to fetch latest books.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="homePage">
      {/*Hero Section*/}
      <section className="hero">
        <div className="heroContent">
          <h1>Discover your favourite book here.</h1>
          <p>
            Explore our vast collection of books across all genres. From
            timeless classics to the latest bestsellers, there is something for
            everyone.
          </p>
          <div className="heroActions">
            <Link to="/books">Browse All Books</Link>
            <Link to="/register">Join for Free</Link>
          </div>
        </div>
      </section>
      {/*Features/Trust Signals*/}
      <section className="featuresStrip">
        {features.map((feature) => (
          <div key={feature.title} className="featureItem">
            <span className="featureIcon">{feature.icon}</span>
            <div className="featureText">
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          </div>
        ))}
      </section>
      {/*Browse by Category */}
      <section className="categorySection">
        <div className="sectionHeader">Browse By Categories</div>
        <div className="categoryGrid">
          {categories.map((category) => (
            <div
              key={category.name}
              className="categoryCard"
              onClick={() => navigate(`/books?category=${category.name}`)}
              // style={{ "--cat-color": category.color as React.CSSProperties }}
            >
              <h3>{category.name}</h3>
              <p>Explore→</p>
            </div>
          ))}
        </div>
      </section>
      {/*Featured Section (Latest Books) */}
    </div>
  );
};

export default App;
