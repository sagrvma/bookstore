import { Link, useNavigate } from "react-router";
import { CSSProperties } from "react";

const App = () => {
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

  const navigate = useNavigate();

  return (
    <div className="homePage">
      \{/*Hero Section*/}
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
              style={{ "--cat-color": category.color }}
            >
              <h3>{category.name}</h3>
              <p>Explore→</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default App;
