import { useEffect, useState } from "react";
import { getProfile, updateProfile, User } from "../api/user";
import { useToast } from "../context/ToastContext";
import { Link, useNavigate } from "react-router";

const EditProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const navigate = useNavigate();

  const loadProfile = async () => {
    setErr("");
    setLoading(true);
    try {
      const userData = await getProfile();
      setUser(userData);
      setFormData({
        name: userData.name,
        email: userData.email,
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        navigate("/login", { replace: true });
      }
      const msg = error.response?.data?.message || "Failed to load profile.";
      showToast("error", msg);
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      return;
    }

    //Check if data same as earlier, if yes then return
    if (formData.name === user.name && formData.email === user.email) {
      showToast("info", "No changes to save");
      return;
    }

    setSaving(true);
    setErr("");

    try {
      const updates: { name?: string; email?: string } = {};

      if (formData.name && formData.name !== user.name) {
        updates.name = formData.name;
      }
      if (formData.email && formData.email !== user.email) {
        updates.email = formData.email;
      }

      await updateProfile(updates);
      showToast("success", "Profile updated successfully.");
      navigate("/profile");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to update profile.";
      showToast("error", msg);
      setErr(msg);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return <p className="status">Loading profile...</p>;
  }
  if (!user) {
    return <p className="error">User not found.</p>;
  }

  return (
    <div className="editProfileWrapper">
      <div className="editProfileHeader">
        <h2>Edit Profile</h2>
        <Link to="/profile" className="actionBtn">
          Back to Profile
        </Link>
      </div>
      <form className="editProfileForm" onSubmit={handleSubmit}>
        <div className="formGroup">
          <label className="formLabel" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            required
            minLength={2}
            maxLength={100}
            value={formData.name}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, name: e.target.value }));
            }}
            placeholder="Enter name"
          />
        </div>
        <div className="formGroup">
          <label className="formLabel">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, email: e.target.value }));
            }}
            placeholder="Enter email"
          />
        </div>

        {err && <p className="error">{err}</p>}

        <div className="formActions">
          <button
            type="button"
            onClick={() => {
              navigate("/profile");
            }}
            className="cancelBtn"
          >
            Cancel
          </button>
          <button type="submit">{saving ? "Saving..." : "Save changes"}</button>
        </div>
      </form>
    </div>
  );
};
