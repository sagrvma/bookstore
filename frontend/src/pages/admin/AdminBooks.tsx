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
import "./AdminBooks.css";

const AdminBooks = () => {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [authors, setAuthors] = useState<Author[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const navigate = useNavigate();

  //Form State
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    price: 0,
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
      if (error?.response?.status == 401) {
        navigate("/login", { replace: true });
      }
      if (error?.response?.status === 403) {
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
      if (error?.response?.status == 401) {
        navigate("/login", { replace: true });
      }
      if (error?.response?.status === 403) {
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
      stock: book.stock,
      description: book.description || "",
      category: book.category,
      publishedDate: book.publishedDate?.split("T")[0] || "", //Format of ISODate strings is "2023-09-21T10:30:00.000Z"
      pages: book.pages || 0,
    });
    setEditingBook(book);
    setShowForm(true);
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
    return <p className="status">Loading books...</p>;
  }

  return (
    <div className="adminBooksWrapper">
      <div className="adminHeader">
        <h2>Manage Books</h2>
        <button
          className="addBtn"
          onClick={() => {
            setShowForm(true);
          }}
        >
          Add New Book
        </button>
      </div>

      {err && <p className="error">{err}</p>}

      {showForm && (
        <div className="bookForm">
          <h3>{editingBook ? "Edit Book" : "Create New Book"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="formGrid">
              <label>
                Title *
                <input
                  required
                  value={formData.title}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }));
                  }}
                />
              </label>

              <label>
                Author *
                <select
                  required
                  value={formData.author}
                  onChange={(e) => {
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

              <label>
                ISBN *
                <input
                  required
                  pattern="[0-9-]{10,17}"
                  value={formData.isbn}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, isbn: e.target.value }));
                  }}
                />
              </label>
              <label>
                Category *
                <input
                  required
                  value={formData.category}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }));
                  }}
                />
              </label>
              <label>
                Price *
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      price: Number(e.target.value),
                    }));
                  }}
                />
              </label>
              <label>
                Stock *
                <input
                  required
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      stock: Number(e.target.value),
                    }));
                  }}
                />
              </label>
              <label>
                Published Date
                <input
                  type="date"
                  value={formData.publishedDate}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      publishedDate: e.target.value,
                    }));
                  }}
                />
              </label>
              <label>
                Pages
                <input
                  type="number"
                  min="1"
                  value={formData.pages}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      pages: Number(e.target.value),
                    }));
                  }}
                />
              </label>
            </div>

            <label>
              Description
              <textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }));
                }}
              />
            </label>

            <div className="formActions">
              <button type="button" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit">{editingBook ? "Update" : "Create"}</button>
            </div>
          </form>
        </div>
      )}

      <div className="booksTable">
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
                <td className="bookTitle">{book.title}</td>
                <td>
                  {typeof book.author === "string"
                    ? "Unknown"
                    : book.author.name}
                </td>
                <td>{book.category}</td>
                <td>{book.price}</td>
                <td>{book.stock}</td>
                <td>
                  <div className="adminActions">
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
