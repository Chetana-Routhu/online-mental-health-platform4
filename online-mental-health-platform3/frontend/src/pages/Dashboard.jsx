// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  // ✅ Detect logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserEmail(user.email);
      else navigate("/login");
    });
    return () => unsubscribe();
  }, [navigate]);

  // ✅ Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("✅ Logged out successfully!");
      navigate("/login");
    } catch (error) {
      alert("❌ Logout failed: " + error.message);
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* 🔹 Header */}
      <header style={styles.header}>
        <h2 style={styles.logo}>🧠 MindConnect</h2>
        <div style={styles.userInfo}>
          <span style={styles.emailText}>{userEmail}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>

      {/* 🔹 Main Section */}
      <main style={styles.main}>
        <h1 style={styles.welcome}>Welcome Back 👋</h1>
        <p style={styles.subtext}>How are you feeling today?</p>

        {/* 🔹 Dashboard Cards */}
        <div style={styles.cardsContainer}>
          {/* View Consultants */}
          <Link
            to="/consultants"
            style={{ ...styles.card, background: "rgba(255,255,255,0.25)" }}
          >
            <h3 style={styles.cardTitle}>🧑‍⚕️ Consultants</h3>
            <p style={styles.cardText}>Find and connect with professionals.</p>
          </Link>

          {/* Book Appointment */}
          <Link
            to="/book-appointment"
            style={{ ...styles.card, background: "rgba(255,255,255,0.25)" }}
          >
            <h3 style={styles.cardTitle}>📅 Book Session</h3>
            <p style={styles.cardText}>Schedule your next consultation.</p>
          </Link>

          {/* My Profile */}
          <Link
            to="/profile"
            style={{ ...styles.card, background: "rgba(255,255,255,0.25)" }}
          >
            <h3 style={styles.cardTitle}>👤 My Profile</h3>
            <p style={styles.cardText}>View your information and progress.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}

// 🎨 Styles — clean, centered, glassmorphism
const styles = {
  wrapper: {
    minHeight: "100vh",
    width: "100vw",
    background: "linear-gradient(135deg, #9face6, #74ebd5)",
    fontFamily: "'Poppins', sans-serif",
    color: "#fff",
    overflowX: "hidden",
    animation: "fadeIn 1s ease-in-out",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.2rem 3rem",
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
  },
  logo: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#fff",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  emailText: {
    fontSize: "0.9rem",
    color: "#f1f1f1",
  },
  logoutBtn: {
    background: "#ff4b5c",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "0.6rem 1rem",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  main: {
    textAlign: "center",
    marginTop: "3rem",
  },
  welcome: {
    fontSize: "2rem",
    fontWeight: "600",
  },
  subtext: {
    fontSize: "1rem",
    marginBottom: "2rem",
    color: "rgba(255, 255, 255, 0.8)",
  },
  cardsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.5rem",
    padding: "2rem 3rem",
    justifyContent: "center",
  },
  card: {
    backdropFilter: "blur(15px)",
    borderRadius: "15px",
    padding: "1.5rem",
    textDecoration: "none",
    color: "#fff",
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease, background 0.3s ease",
  },
  cardTitle: {
    fontSize: "1.3rem",
    marginBottom: "0.5rem",
  },
  cardText: {
    fontSize: "0.9rem",
    color: "rgba(255, 255, 255, 0.9)",
  },
};
