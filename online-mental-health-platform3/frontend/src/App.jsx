// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Consultants from "./pages/Consultants";
import ConsultantProfile from "./pages/ConsultantProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* 🟢 Public Pages */}
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* 🔐 Protected Pages (Only logged-in users can access) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/consultants"
          element={
            <ProtectedRoute>
              <Consultants />
            </ProtectedRoute>
          }
        />

        <Route
          path="/consultant-profile"
          element={
            <ProtectedRoute>
              <ConsultantProfile />
            </ProtectedRoute>
          }
        />

        {/* 🌈 Fallback Route */}
        <Route
          path="*"
          element={
            <div
              style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background:
                  "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
                color: "white",
                fontSize: "1.5rem",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              <div>
                <h2>🚧 404 - Page Not Found</h2>
                <p>Please check your URL or go back to Dashboard.</p>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
