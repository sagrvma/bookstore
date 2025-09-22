import { useState } from "react";
import http, { tokenStore } from "../lib/http";
import { Link, useNavigate } from "react-router";
import "./Register.css";

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
        }
      );

      const { token } = res.data.data;

      tokenStore.set(token);
      navigate("/books", { replace: true });
    } catch (error: any) {
      setErr(error?.response?.data?.message || "Failed to register user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registerWrapper">
      <form className="registerForm" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <label>
          Full Name
          <input
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

        <label>
          Email
          <input
            required
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, email: e.target.value }));
            }}
            placeholder="Enter your email"
          />
        </label>

        <label>
          Password
          <input
            required
            type="password"
            value={formData.password}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, password: e.target.value }));
            }}
            placeholder="Enter your password (Minimum 8 characters)"
            minLength={8}
          />
        </label>
        <label>
          Confirm Password
          <input
            required
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }));
            }}
            placeholder="Confirm your password"
            minLength={8}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        {err && <p className="error">{err}</p>}

        <div className="registerFooter">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="authLink">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
