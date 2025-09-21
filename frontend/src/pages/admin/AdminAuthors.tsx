import { useEffect, useState } from "react";
import {
  Author,
  createAuthor,
  deleteAuthor,
  getAuthors,
  updateAuthor,
} from "../../api/admin";
import { useNavigate } from "react-router";

const AdminAuthors = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const navigate = useNavigate();

  //Form state
  const [showForm, setShowForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    bio: "",
    birthDate: "",
    nationality: "",
  });

  const loadAuthors = async () => {
    try {
      const res = await getAuthors();
      setAuthors(res);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        navigate("/login", { replace: true });
      }
      if (error?.response?.status === 403) {
        navigate("/", { replace: true });
      }
      setErr(error?.response?.data?.message || "Failed to load authors.");
    }
  };

  const load = async () => {
    setLoading(true);
    setErr("");
    await loadAuthors();
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      bio: "",
      birthDate: "",
      nationality: "",
    });

    setEditingAuthor(null);
    setShowForm(false);
  };

  const startEdit = (author: Author) => {
    setFormData({
      name: author.name,
      slug: author.slug,
      bio: author.bio || "",
      birthDate: author.birthDate?.split("T")[0] || "",
      nationality: author.nationality || "",
    });

    setEditingAuthor(author);
    setShowForm(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    try {
      const authorData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name),
        birthDate: formData.birthDate || undefined,
      };

      if (editingAuthor) {
        await updateAuthor(editingAuthor._id, authorData);
      } else {
        await createAuthor(authorData);
      }

      resetForm();
      await load();
    } catch (error: any) {
      setErr(error?.response?.data?.message || "Failed to save author.");
    }
  };

  const handleDelete = async (authorId: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) {
      return;
    }
    try {
      await deleteAuthor(authorId);
      await load();
    } catch (error: any) {
      setErr(error?.response?.data?.message || "Failed to delete author.");
    }
  };

  if (loading) {
    return <p className="status">Loading...</p>;
  }

  return (
    <div className="adminAuthorWrapper">
      <div className="adminHeader">
        <h2>Manage Authors</h2>
        <button
          className="addBtn"
          onClick={() => {
            setShowForm(true);
          }}
        >
          Add New Author
        </button>
      </div>

      {err && <p className="error">{err}</p>}

      {showForm && (
        <div className="authorForm">
          <h3>{editingAuthor ? "Edit Author" : "Add New Author"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="formGrid">
              <label>
                Name *
                <input
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      name: newName,
                      slug: prev.slug || generateSlug(newName),
                    }));
                  }}
                />
              </label>
              <label>
                Slug *
                <input
                  required
                  pattern="[a-z0-9-]+"
                  value={formData.slug}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      slug: e.target.value,
                    }));
                  }}
                />
              </label>
              <label>
                Birth Date
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      birthDate: e.target.value,
                    }));
                  }}
                />
              </label>
              <label>
                Nationality
                <input
                  value={formData.nationality}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      nationality: e.target.value,
                    }));
                  }}
                />
              </label>
            </div>
            <label>
              Biography
              <input
                value={formData.bio}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, bio: e.target.value }));
                }}
              />
            </label>
            <div className="formActions">
              <button type="submit">
                {editingAuthor ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="authorsTable">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Nationality</th>
              <th>Birth Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {authors.map((author) => (
              <tr key={author._id}>
                <td className="authorName">{author.name}</td>
                <td>{author.slug}</td>
                <td>{author.nationality}</td>
                <td>
                  {author.birthDate
                    ? new Date(author.birthDate).toLocaleDateString()
                    : "-"}
                </td>
                <td>
                  <div className="adminActions">
                    <button
                      className="editBtn"
                      onClick={() => {
                        startEdit(author);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="deleteBtn"
                      onClick={() => {
                        handleDelete(author._id, author.name);
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
