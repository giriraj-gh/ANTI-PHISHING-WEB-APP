import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/" />;
  }
  
  return role === "admin" ? children : <Navigate to="/home" />;
}
