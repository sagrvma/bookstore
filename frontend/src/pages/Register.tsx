import { useState } from "react";
import http, { tokenStore } from "../lib/http";
import { Link, useNavigate } from "react-router";
import { useToast } from "../context/ToastContext";
import styles from "./Register.module.css";

type AuthPayload = {
  user: {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
  };
  token: string;
};

type APISuccess<T> = {
  success: true;
  message: string;
  data: T;
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const navigate = useNavigate();

  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");

    //Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setErr("Passwords don't match.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setErr("Password must be atleast 8 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await http.post<APISuccess<AuthPayload>>(
        "/api/auth/register",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          // role: Defaults to user on backend
        },
      );

      const { token } = res.data.data;

      tokenStore.set(token);

      showToast(
        "success",
        "Account created successfully! Welcome to the bookstore.",
      );

      navigate("/books", { replace: true });
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to register user.";
      showToast("error", msg);
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerWrapper}>
      <form className={styles.registerForm} onSubmit={handleSubmit}>
        <h2 className={styles.formTitle}>Create Account</h2>
        <p className={styles.formSubtitle}>
          Join us and start your reading journey
        </p>

        <label className={styles.inputLabel}>
          Full Name
          <input
            className={styles.inputField}
            required
            value={formData.name}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                name: e.target.value,
              }));
            }}
            placeholder="Enter your full name"
            minLength={2}
            maxLength={100}
          />
        </label>

        <label className={styles.inputLabel}>
          Email
          <input
            className={styles.inputField}
            required
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, email: e.target.value }));
            }}
            placeholder="Enter your email"
          />
        </label>

        <label className={styles.inputLabel}>
          Password
          <input
            className={styles.inputField}
            required
            type="password"
            value={formData.password}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, password: e.target.value }));
            }}
            placeholder="Minimum 8 characters"
            minLength={8}
          />
        </label>

        <label className={styles.inputLabel}>
          Confirm Password
          <input
            className={styles.inputField}
            required
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }));
            }}
            placeholder="Re-enter your password"
            minLength={8}
          />
        </label>

        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        {err && <p className={styles.error}>{err}</p>}

        <div className={styles.registerFooter}>
          <p>
            Already have an account?{" "}
            <Link to="/login" className={styles.authLink}>
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};
export default Register;
