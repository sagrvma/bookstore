import { useState } from "react";
import BooksHero from "../components/books/BooksHero";
import BooksFilter, {
  BooksFiltersState,
} from "../components/books/BooksFilter";

const Books = () => {
  const [search, setSearch] = useState<string>("");

  const [filters, setFilters] = useState<BooksFiltersState>({
    category: "",
    minPrice: 0,
    maxPrice: 10000,
    sortBy: "title",
    sortOrder: "asc",
  });

  const categories = ["Fiction", "Business", "Sci-Fi", "Mystery"];

  const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  const handleFilterChange = (key: keyof BooksFiltersState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    setFilters({
      category: "",
      minPrice: 0,
      maxPrice: 10000,
      sortBy: "title",
      sortOrder: "asc",
    });
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <BooksHero searchTerm={search} onSearchChange={setSearch} />

      {/* 4. Layout Grid: Sidebar | Main Content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: "3rem",
          maxWidth: "1300px",
          margin: "0 auto",
          padding: "4rem 2rem",
        }}
      >
        {/* Sidebar */}
        <BooksFilter
          filters={filters}
          categories={categories}
          onFilterChange={handleFilterChange}
          onClear={handleClear}
          currencyFormatter={inr}
        />
        <main>
          <h2>Results</h2>
          <pre>{JSON.stringify({ search, ...filters }, null, 2)}</pre>
        </main>
      </div>
    </div>
  );
};

export default Books;
