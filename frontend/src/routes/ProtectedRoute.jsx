import { Navigate } from "react-router";

const ProtectedRoute = ({ children }) => {
  const key = import.meta.env.VITE_TOKEN_STORAGE_KEY; //The configured storage key
  const token = localStorage.getItem(key); //Look up JWT in localStorage
  return token ? children : <Navigate to="/login" replace />; //Replace tells the browser to replace the current history entry instead of pushing a new one, so going "Back" wont return to the protected page that triggered the redirect
};

export default ProtectedRoute;
