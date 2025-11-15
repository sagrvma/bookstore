import { useState } from "react";
import { Link, useNavigate } from "react-router";
import http, { tokenStore } from "../lib/http";
import "./Login.css";
import { useToast } from "../context/ToastContext";

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

  const { showToast } = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
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
    }
  };

  return (
    <div className="loginWrapper">
      <form className="loginForm" onSubmit={onSubmit}>
        <label>
          Email
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </label>
        <button type="submit">Sign In</button>
        {err && <p className="error">{err}</p>}
      </form>
      <div className="loginFooter">
        <p>
          Don't have an account?{" "}
          <Link to="/register" className="authLink">
            Create one here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
