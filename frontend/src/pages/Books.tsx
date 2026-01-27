import { useState } from "react";
import BooksHero from "../components/books/BooksHero";

const Books = () => {
  const [search, setSearch] = useState<string>("");

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      <BooksHero searchTerm={search} onSearchChange={setSearch} />
      <h3>{search}</h3>
    </div>
  );
};

export default Books;
