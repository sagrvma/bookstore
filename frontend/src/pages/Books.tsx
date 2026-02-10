import { useEffect, useState } from "react";
import BooksHero from "../components/books/BooksHero";
import BooksFilter, {
  BooksFiltersState,
} from "../components/books/BooksFilter";
import { Book, getBooks } from "../api/admin";
import { useSearchParams } from "react-router";
import { useToast } from "../context/ToastContext";
import { addToCart } from "../api/cart";

import styles from "./Books.module.css";
import BookCard from "../components/books/BookCard";
import LoadingSpinner from "../components/LoadingSpinner";

const Books = () => {
  //Core Data States
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  //Filter States
  const [search, setSearch] = useState<string>("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<BooksFiltersState>({
    category: "",
    minPrice: 0,
    maxPrice: 10000,
    sortBy: "title",
    sortOrder: "asc",
  });

  const { showToast } = useToast();

  const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  //Load Data

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await getBooks();
        setBooks(res);

        //Filter unique categories out of all received books
        const uniqCat = [...new Set(res.map((b) => b.category))];

        setCategories(uniqCat);
      } catch (error) {
        showToast("error", "Failed to load library.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  //Filtering Logic

  useEffect(() => {
    let res = [...books];

    //Search
    if (search) {
      const term = search.toLowerCase();
      res = res.filter(
        (b) =>
          b.title.toLowerCase().includes(term) ||
          (typeof b.author === "object" ? b.author.name : "")
            .toLowerCase()
            .includes(term),
      );
    }

    //Filters - Category

    if (filters.category) {
      res = res.filter((b) => b.category === filters.category);
    }

    //Filters - Price
    res = res.filter(
      (b) => filters.minPrice <= b.price && b.price <= filters.maxPrice,
    );

    //Filters - SortBy
    res = res.sort((a: Book, b: Book) => {
      let valA: any = a[filters.sortBy];
      let valB: any = b[filters.sortBy];

      if (filters.sortBy === "title") {
        //In this case a string, otherwise integers for price or latest time (converted to int)
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return filters.sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return filters.sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredBooks(res);

    //Sync URL with Category

    if (filters.category) {
      setSearchParams({ category: filters.category }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [books, search, filters]);

  //Handlers

  const handleAddToCart = async (bookId: string) => {
    try {
      await addToCart(bookId, 1);
      showToast("success", "Book added to cart!");
    } catch (error) {
      showToast("error", "Login required to add items!");
    }
  };

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
    setSearch("");
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.pageWrapper}>
      <BooksHero searchTerm={search} onSearchChange={setSearch} />

      <div className={styles.layoutGrid}>
        <BooksFilter
          filters={filters}
          categories={categories}
          onFilterChange={handleFilterChange}
          onClear={handleClear}
          currencyFormatter={inr}
        />

        <main>
          <div className={styles.resultsCount}>
            Showing <strong>{filteredBooks.length}</strong> results
          </div>

          {filteredBooks.length === 0 ? (
            <div className={styles.emptyState}>
              <div style={{ fontSize: "3rem", opacity: 0.5 }}>📚</div>
              <h3>No books found.</h3>
              <button onClick={handleClear} className={styles.clearBtn}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredBooks.map((book) => (
                <BookCard
                  key={book._id}
                  book={book}
                  currencyFormatter={inr}
                  onAddtoCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Books;
