// frontend/src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

export default function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "5rem", color: "#333" }}>
        Loading...
      </h2>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
