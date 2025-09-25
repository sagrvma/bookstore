import { useEffect, useState } from "react";
import http from "../lib/http";
import "./Books.css";
import { Link, useNavigate } from "react-router";
import { addToCart } from "../api/cart";
import { getBooks } from "../api/admin";

type Author = { _id: string; name: string } | string;

type Book = {
  _id: string;
  title: string;
  author?: Author;
  isbn: string;
  price: number;
  stock: number;
  description?: string;
  category: string;
  publishedDate?: string; //Dates come in ISO strings from the API via toJSON/toISOString
  pages?: number;
  createdAt: string;
  updatedAt: string;
};

type BookFilters = {
  //For search and Filter functionality
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  sortBy: "title" | "price" | "createdAt";
  sortOrder: "asc" | "desc";
};

type APISuccess<T> = {
  success: true;
  message: string;
  data: T;
};

const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  //Filter state
  const [filters, setFilters] = useState<BookFilters>({
    search: "",
    category: "",
    minPrice: 0,
    maxPrice: 10000,
    sortBy: "title",
    sortOrder: "asc",
  });

  const navigate = useNavigate();

  const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  const load = async () => {
    setLoading(true);
    setErr("");

    try {
      const res = await getBooks();
      setBooks(res);

      //Extract unique categories
      const uniqueCategories = [...new Set(res.map((book) => book.category))]; //... converts the set back to an array
      setCategories(uniqueCategories);
    } catch (error: any) {
      setErr(error?.response?.data?.message || "Failed to load books.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...books]; //Creates a new array with books

    //Search Filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter((book) => {
        const bookName = book.title.toLowerCase();
        const authorName =
          typeof book.author === "string"
            ? book.author.toLowerCase()
            : book.author?.name?.toLowerCase() || "";

        return bookName.includes(searchTerm) || authorName.includes(searchTerm);
      });
    }

    //Category filter
    if (filters.category) {
      filtered = filtered.filter((book) => book.category === filters.category);
    }

    //Price Range filter
    filtered = filtered.filter(
      (book) => filters.minPrice <= book.price && book.price <= filters.maxPrice
    );

    //Sort
    filtered.sort((a, b) => {
      let aValue: any = a[filters.sortBy];
      let bValue: any = b[filters.sortBy];

      if (filters.sortBy === "title") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (filters.sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredBooks(filtered);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [books, filters]);

  const updateFilters = <K extends keyof BookFilters>( //Update filters
    key: K,
    value: BookFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      minPrice: 0,
      maxPrice: 10000,
      sortBy: "title",
      sortOrder: "asc",
    });
  };

  if (loading) {
    return <p className="status">Loading books...</p>;
  }

  if (err) {
    return <p className="error">{err}</p>;
  }

  return (
    <div className="booksWrapper">
      <div className="booksHeader">
        <h2>Books</h2>
        <div className="booksCount">
          {filteredBooks.length} of {books.length} books
        </div>
      </div>

      {/* Search and Filter Controls*/}

      <div className="booksFilters">
        <div className="searchBar">
          <input
            className="searchInput"
            type="text"
            placeholder="Search"
            value={filters.search}
            onChange={(e) => {
              updateFilters("search", e.target.value);
            }}
          />
        </div>
        <div className="filterControls">
          <select
            className="categoryFilter"
            value={filters.category}
            onChange={(e) => {
              updateFilters("category", e.target.value);
            }}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <div className="priceRange">
            <label>
              Min Price: {inr.format(filters.minPrice)}
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={filters.minPrice}
                onChange={(e) => {
                  updateFilters("minPrice", Number(e.target.value));
                }}
              />
            </label>
            <label>
              Max Price: {inr.format(filters.maxPrice)}
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={filters.maxPrice}
                onChange={(e) => {
                  updateFilters("maxPrice", Number(e.target.value));
                }}
              />
            </label>
          </div>

          <div className="sortControls">
            <select
              value={filters.sortBy}
              onChange={(e) => {
                updateFilters(
                  "sortBy",
                  e.target.value as BookFilters["sortBy"]
                );
              }}
            >
              <option value="title">Sort by Title</option>
              <option value="price">Sort by Price</option>
              <option value="createdAt">Sort by Date Added</option>
            </select>

            <select
              value={filters.sortOrder}
              onChange={(e) => {
                updateFilters(
                  "sortOrder",
                  e.target.value as BookFilters["sortOrder"]
                );
              }}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <button className="clearFilters" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="noBooksFound">
          <p>No books found matching your criteria.</p>
          <button className="clearFilters" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      ) : (
        <ul className="booksList">
          {filteredBooks.map((book) => (
            <li key={book._id} className="bookItem">
              <div className="bookInfo">
                <Link to={`/books/${book._id}`}>
                  <div className="bookTitle">{book.title}</div>
                </Link>
                <div className="bookMeta">
                  by{" "}
                  {typeof book.author === "string"
                    ? "Unknown"
                    : book.author?.name}
                </div>
                <div className="bookDetails">
                  <span className="bookCategory">{book.category}</span>
                  <span className="bookPrice">{inr.format(book.price)}</span>
                  <span className="bookStock">
                    {book.stock > 0 ? `${book.stock} in stock` : "Out of stock"}
                  </span>
                </div>
                <div className="bookDescription">
                  {book.description?.substring(0, 150)}
                  {/* {book.description?.length > 150 && "..."} */}
                </div>

                <div className="bookActions">
                  <button
                    disabled={book.stock === 0}
                    onClick={async () => {
                      try {
                        await addToCart(book._id, 1);
                        //Could add toast notification here
                      } catch (error: any) {
                        if (error.response?.status === 401) {
                          navigate("/login", { replace: true });
                        }
                      }
                    }}
                    className={`addToCartBtn ${
                      book.stock === 0 ? "disabled" : ""
                    }`}
                  >
                    {book.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
    // <div className="booksWrap">
    //   <h2>Books</h2>
    //   <ul className="booksList">
    //     {books.map((book) => (
    //       <li key={book._id} className="bookItem">
    //         <div className="bookTitle">{book.title}</div>
    //         <div className="bookMeta">
    //           {typeof book.author === "string"
    //             ? book.author
    //             : book.author?.name ?? "Unknown"}
    //         </div>
    //         <button
    //           onClick={async () => {
    //             try {
    //               await addToCart(book._id, 1);
    //             } catch (error: any) {
    //               if (error?.response?.status === 401) {
    //                 navigate("/login");
    //               }
    //             }
    //           }}
    //         >
    //           Add to Cart
    //         </button>
    //       </li>
    //     ))}
    //   </ul>
    // </div>
  );
};

export default Books;
