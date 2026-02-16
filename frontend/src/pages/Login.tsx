import { useState } from "react";
import { Link, useNavigate } from "react-router";
import http, { tokenStore } from "../lib/http";
import { useToast } from "../context/ToastContext";

import styles from "./Login.module.css";

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

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await http.post<APISuccess<AuthPayload>>("/api/auth/login", {
        email,
        password,
      });
      const token = res.data.data.token;

      tokenStore.set(token);

      showToast("success", "Welcome back! Login successful.");

      navigate("/books", { replace: true });
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Login failed! Please try again.";
      showToast("error", msg);
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <form className={styles.loginForm} onSubmit={onSubmit}>
        <h2 className={styles.formTitle}>Welcome Back</h2>
        <p className={styles.formSubtitle}>
          Sign in to continue to your account
        </p>

        <label className={styles.inputLabel}>
          Email
          <input
            className={styles.inputField}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            disabled={loading}
          />
        </label>
        <label className={styles.inputLabel}>
          Password
          <input
            className={styles.inputField}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={loading}
          />
        </label>
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? (
            <span className={styles.btnLoading}>
              <span className={styles.spinner} />
              Signing in…
            </span>
          ) : (
            "Sign In"
          )}
        </button>
        {err && <p className={styles.error}>{err}</p>}
      </form>
      <div className={styles.loginFooter}>
        <p>
          Don't have an account?{" "}
          <Link to="/register" className={styles.authLink}>
            Create one here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
