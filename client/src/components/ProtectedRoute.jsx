import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {

  const { user, loading } = useAuth();

  // Wait until session check finishes
  if (loading) {
    return <div className="bg-black"/>
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in
  return children;
};

export default ProtectedRoute;