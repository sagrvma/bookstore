import { Link } from "react-router";

const App = () => {
  const categories = [
    {
      name: "Fiction",
      color: "#FF6B6B",
    },
    {
      name: "Business",
      color: "#4ECDC4",
    },
    {
      name: "Science",
      color: "#45B7D1",
    },
    {
      name: "Biography",
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
          <div className="featureItem">
            <span className="featureIcon">{feature.icon}</span>
            <div className="featureText">
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default App;
