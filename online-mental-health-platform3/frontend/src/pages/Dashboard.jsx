// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState("");
  const [bookings, setBookings] = useState([]);
  const [showBookings, setShowBookings] = useState(false);
  const navigate = useNavigate();

  // ✅ Detect logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        fetchBookings(user.email);
      } else navigate("/login");
    });
    return () => unsubscribe();
  }, [navigate]);

  // ✅ Fetch bookings for the current user
  const fetchBookings = async (email) => {
    try {
      const q = query(collection(db, "bookings"), where("userEmail", "==", email));
      const querySnapshot = await getDocs(q);
      const userBookings = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBookings(userBookings);

      // 🕐 Check for upcoming sessions within 24 hours
      checkUpcomingSessions(userBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  // 🔔 Show reminder if session is within 24 hours
  const checkUpcomingSessions = (bookings) => {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in ms

    const upcoming = bookings.filter((b) => {
      if (b.sessionDateTime?.seconds) {
        const sessionTime = new Date(b.sessionDateTime.seconds * 1000);
        const diff = sessionTime - now;
        return diff > 0 && diff <= oneDay; // session within next 24h
      }
      return false;
    });

    if (upcoming.length > 0) {
      const names = upcoming.map((b) => b.consultantName).join(", ");
      alert(`⏰ Reminder: You have upcoming session(s) with ${names} within 24 hours!`);
    }
  };

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

          {/* Book Session — Now shows booking list */}
          <button
            onClick={() => setShowBookings(!showBookings)}
            style={{
              ...styles.card,
              background: "rgba(255,255,255,0.25)",
              border: "none",
              cursor: "pointer",
            }}
          >
            <h3 style={styles.cardTitle}>📅 My Sessions</h3>
            <p style={styles.cardText}>View your booked appointments.</p>
          </button>

          {/* My Profile */}
          <Link
            to="/profile"
            style={{ ...styles.card, background: "rgba(255,255,255,0.25)" }}
          >
            <h3 style={styles.cardTitle}>👤 My Profile</h3>
            <p style={styles.cardText}>View your information and progress.</p>
          </Link>
        </div>

        {/* 🔹 Booking List (toggle) */}
        {showBookings && (
          <div style={styles.bookingContainer}>
            <h2 style={styles.bookingTitle}>📋 My Booked Sessions</h2>

            {bookings.length === 0 ? (
              <p style={styles.noBookings}>You haven’t booked any sessions yet.</p>
            ) : (
              <div style={styles.bookingGrid}>
                {bookings.map((b) => (
                  <div key={b.id} style={styles.bookingCard}>
                    <h3 style={styles.consultantName}>
                      {b.consultantName || "Unknown Consultant"}
                    </h3>
                    <p>📅 {b.date}</p>
                    <p>⏰ {b.time}</p>
                    {b.age && <p>🎂 Age: {b.age}</p>}
                    {b.message && <p>💬 {b.message}</p>}
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "#f1f1f1",
                        marginTop: "0.5rem",
                      }}
                    >
                      Booked on:{" "}
                      {b.createdAt?.seconds
                        ? new Date(b.createdAt.seconds * 1000).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
  logo: { fontSize: "1.5rem", fontWeight: "700", color: "#fff" },
  userInfo: { display: "flex", alignItems: "center", gap: "1rem" },
  emailText: { fontSize: "0.9rem", color: "#f1f1f1" },
  logoutBtn: {
    background: "#ff4b5c",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "0.6rem 1rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  main: { textAlign: "center", marginTop: "3rem" },
  welcome: { fontSize: "2rem", fontWeight: "600" },
  subtext: { fontSize: "1rem", marginBottom: "2rem", color: "rgba(255, 255, 255, 0.8)" },
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
  cardTitle: { fontSize: "1.3rem", marginBottom: "0.5rem" },
  cardText: { fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.9)" },
  bookingContainer: {
    background: "rgba(255,255,255,0.2)",
    marginTop: "3rem",
    marginInline: "auto",
    padding: "2rem",
    borderRadius: "15px",
    width: "80%",
  },
  bookingTitle: { fontSize: "1.5rem", marginBottom: "1.2rem" },
  noBookings: { color: "#fff", fontSize: "1rem" },
  bookingGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    justifyContent: "center",
  },
  bookingCard: {
    background: "rgba(255,255,255,0.15)",
    padding: "1rem",
    borderRadius: "12px",
    width: "220px",
    textAlign: "center",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  },
  consultantName: { fontWeight: "600", fontSize: "1.1rem", marginBottom: "0.5rem" },
};
