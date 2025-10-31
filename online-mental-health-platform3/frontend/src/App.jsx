// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Consultants from "./pages/Consultants";
import Book from "./pages/Book";
import Chat from "./pages/Chat";
import VideoCall from "./pages/VideoCall"; // 👈 Added for Week 4
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* 🟢 Public Routes */}
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* 🔒 Protected Routes */}
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
          path="/book/:id"
          element={
            <ProtectedRoute>
              <Book />
            </ProtectedRoute>
          }
        />

        {/* 💬 Chat Route */}
        <Route
          path="/chat/:id"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        {/* 🎥 Video Consultation Route */}
        <Route
          path="/video/:id"
          element={
            <ProtectedRoute>
              <VideoCall />
            </ProtectedRoute>
          }
        />

        {/* 🚧 404 Fallback */}
        <Route
          path="*"
          element={
            <div
              style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
                color: "white",
                fontSize: "1.5rem",
                fontFamily: "'Poppins', sans-serif",
                flexDirection: "column",
                textAlign: "center",
              }}
            >
              <h2>🚧 404 - Page Not Found</h2>
              <p>Please check your URL or go back to the Dashboard.</p>
              <button
                onClick={() => (window.location.href = "/dashboard")}
                style={{
                  marginTop: "1rem",
                  background: "#00c9ff",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.6rem 1.2rem",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ⬅ Go Back to Dashboard
              </button>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
