import { useState } from "react";
import { useToast } from "../context/ToastContext";
import { changePassword } from "../api/user";
import { Link, useNavigate } from "react-router";
import "./ChangePassword.css";

const ChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    //Client-side validation
    if (formData.newPassword !== formData.confirmPassword) {
      setErr("Passwords don't match.");
      return;
    }

    if (formData.newPassword === formData.oldPassword) {
      setErr("New password is same as the old password.");
      return;
    }

    if (formData.newPassword.length < 8) {
      setErr("Password length must be atleast 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      await changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });

      showToast("success", "Password changed successfully.");
      navigate("/profile");
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Failed to change password.";
      setErr(msg);
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="changePasswordWrapper">
      <div className="changePasswordHeader">
        <h2>Change Password</h2>
        <Link to="/profile">Back to Profile</Link>
      </div>

      <form className="changePasswordForm" onSubmit={handleSubmit}>
        <div className="formGroup">
          <label htmlFor="oldPassword">Current Password</label>
          <input
            id="oldPassword"
            type="password"
            required
            value={formData.oldPassword}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, oldPassword: e.target.value }));
            }}
            placeholder="Enter current password"
          />
        </div>

        <div className="formGroup">
          <label htmlFor="newPassword">New Password</label>
          <input
            id="newPassword"
            type="password"
            required
            value={formData.newPassword}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, newPassword: e.target.value }));
            }}
            placeholder="Enter new password"
          />
        </div>
        <div className="formGroup">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }));
            }}
            placeholder="Confirm new password"
          />
        </div>

        {err && <p className="error">{err}</p>}

        <div className="formActions">
          <button
            className="cancelBtn"
            type="button"
            onClick={() => {
              navigate("/profile");
            }}
          >
            Cancel
          </button>
          <button className="saveBtn" type="submit" disabled={loading}>
            {loading ? "Changing Password..." : "Change Password"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
