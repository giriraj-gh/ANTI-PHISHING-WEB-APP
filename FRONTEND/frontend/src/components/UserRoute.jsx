import { Navigate } from "react-router-dom";

export default function UserRoute({ children }) {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/" />;
  }
  
  return role === "user" ? children : <Navigate to="/admin" />;
}
