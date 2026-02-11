import { useEffect, useState } from "react";
import {
  Author,
  Book,
  createBook,
  getAuthors,
  getBooks,
  removeBook,
  updateBook,
} from "../../api/admin";
import { useNavigate } from "react-router";
import styles from "./AdminBooks.module.css";
import LoadingSpinner from "../../components/LoadingSpinner";

const AdminBooks = () => {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    price: 0,
    coverImage: "",
    stock: 0,
    description: "",
    category: "",
    publishedDate: "",
    pages: 0,
  });

  const loadBooks = async () => {
    try {
      const res = await getBooks();
      setBooks(res);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        navigate("/login", { replace: true });
      } else if (error?.response?.status === 403) {
        navigate("/", { replace: true });
      } else {
        setErr(error?.response?.data?.message || "Failed to load books.");
      }
    }
  };

  const loadAuthors = async () => {
    try {
      const res = await getAuthors();
      setAuthors(res);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        navigate("/login", { replace: true });
      } else if (error?.response?.status === 403) {
        navigate("/", { replace: true });
      } else {
        setErr(error?.response?.data?.message || "Failed to load authors.");
      }
    }
  };

  const load = async () => {
    setLoading(true);
    setErr("");
    await Promise.all([loadBooks(), loadAuthors()]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      isbn: "",
      price: 0,
      coverImage: "",
      stock: 0,
      description: "",
      category: "",
      publishedDate: "",
      pages: 0,
    });
    setEditingBook(null);
    setShowForm(false);
  };

  const startEdit = (book: Book) => {
    const authorId =
      typeof book.author === "string" ? book.author : book.author._id;

    setFormData({
      title: book.title,
      author: authorId,
      isbn: book.isbn,
      price: book.price,
      coverImage: book.coverImage || "",
      stock: book.stock,
      description: book.description || "",
      category: book.category,
      publishedDate: book.publishedDate?.split("T")[0] || "",
      pages: book.pages || 0,
    });

    setEditingBook(book);
    setShowForm(true);

    // Scroll to top so the edit form is visible
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    try {
      const bookData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        publishedDate: formData.publishedDate || undefined,
        pages: Number(formData.pages) || undefined,
      };

      if (editingBook) {
        await updateBook(editingBook._id, bookData);
      } else {
        await createBook(bookData);
      }

      resetForm();
      await loadBooks();
    } catch (error: any) {
      setErr(error?.response?.data?.message || "Failed to save book.");
    }
  };

  const handleDelete = async (bookId: string, title: string) => {
    if (!confirm(`Delete ${title}?`)) {
      return;
    }

    try {
      await removeBook(bookId);
      await loadBooks();
    } catch (error: any) {
      setErr(error?.response?.data?.message || "Failed to delete book.");
    }
  };

  if (loading && !books) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.adminBooksWrapper}>
      <div className={styles.adminHeader}>
        <h2>Manage Books</h2>
        <button
          className={styles.addBtn}
          onClick={() => {
            setShowForm(true);
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
          }}
        >
          Add New Book
        </button>
      </div>

      {err && <p className={styles.error}>{err}</p>}

      {showForm && (
        <div className={styles.bookForm}>
          <h3>{editingBook ? "Edit Book" : "Create New Book"}</h3>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <label className={styles.formField}>
                <span>Title *</span>
                <input
                  required
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }));
                  }}
                />
              </label>

              <label className={styles.formField}>
                <span>Author *</span>
                <select
                  required
                  value={formData.author}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setFormData((prev) => ({
                      ...prev,
                      author: e.target.value,
                    }));
                  }}
                >
                  <option value="">Select Author</option>
                  {authors?.map((author) => (
                    <option key={author._id} value={author._id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.formField}>
                <span>ISBN *</span>
                <input
                  required
                  pattern="[0-9-]{10,17}"
                  value={formData.isbn}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormData((prev) => ({ ...prev, isbn: e.target.value }));
                  }}
                />
              </label>

              <label className={styles.formField}>
                <span>Category *</span>
                <input
                  required
                  value={formData.category}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }));
                  }}
                />
              </label>

              <label className={styles.formField}>
                <span>Price *</span>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormData((prev) => ({
                      ...prev,
                      price: Number(e.target.value),
                    }));
                  }}
                />
              </label>

              <label className={styles.formField}>
                <span>Cover Image URL</span>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.coverImage}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormData((prev) => ({
                      ...prev,
                      coverImage: e.target.value,
                    }));
                  }}
                />
              </label>

              <label className={styles.formField}>
                <span>Stock *</span>
                <input
                  required
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormData((prev) => ({
                      ...prev,
                      stock: Number(e.target.value),
                    }));
                  }}
                />
              </label>

              <label className={styles.formField}>
                <span>Published Date</span>
                <input
                  type="date"
                  value={formData.publishedDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormData((prev) => ({
                      ...prev,
                      publishedDate: e.target.value,
                    }));
                  }}
                />
              </label>

              <label className={styles.formField}>
                <span>Pages</span>
                <input
                  type="number"
                  min="1"
                  value={formData.pages}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormData((prev) => ({
                      ...prev,
                      pages: Number(e.target.value),
                    }));
                  }}
                />
              </label>
            </div>

            <label className={styles.formField}>
              <span>Description</span>
              <textarea
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }));
                }}
              />
            </label>

            <div className={styles.formActions}>
              <button type="button" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit">{editingBook ? "Update" : "Create"}</button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.booksTable}>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books?.map((book) => (
              <tr key={book._id}>
                <td className={styles.bookTitle}>{book.title}</td>
                <td>
                  {typeof book.author === "string"
                    ? "Unknown"
                    : book.author.name}
                </td>
                <td>{book.category}</td>
                <td>{book.price}</td>
                <td>{book.stock}</td>
                <td>
                  <div className={styles.adminActions}>
                    <button
                      onClick={() => {
                        startEdit(book);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDelete(book._id, book.title);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBooks;
