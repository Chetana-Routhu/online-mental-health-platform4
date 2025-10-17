// frontend/src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/login"); // redirect if not logged in
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (!user) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <h2 style={styles.loading}>Loading your profile...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>👤 My Profile</h2>
        <p style={styles.subtitle}>Here are your account details</p>

        <div style={styles.infoBox}>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>UID:</strong> {user.uid}</p>
          <p>
            <strong>Created On:</strong>{" "}
            {new Date(user.metadata.creationTime).toLocaleString()}
          </p>
          <p>
            <strong>Last Login:</strong>{" "}
            {new Date(user.metadata.lastSignInTime).toLocaleString()}
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          style={styles.backBtn}
        >
          ⬅ Back to Dashboard
        </button>
      </div>
    </div>
  );
}

// 🎨 Styling – matches your dashboard theme
const styles = {
  wrapper: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #9face6, #74ebd5)",
    fontFamily: "'Poppins', sans-serif",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.25)",
    backdropFilter: "blur(15px)",
    borderRadius: "16px",
    padding: "2.5rem 3rem",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    width: "90%",
    maxWidth: "480px",
    textAlign: "center",
    color: "#fff",
    animation: "fadeIn 0.8s ease-in-out",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: "600",
    marginBottom: "0.5rem",
  },
  subtitle: {
    fontSize: "1rem",
    color: "rgba(255,255,255,0.9)",
    marginBottom: "1.5rem",
  },
  infoBox: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: "12px",
    padding: "1.2rem",
    textAlign: "left",
    marginBottom: "2rem",
  },
  backBtn: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "0.8rem 1.5rem",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  loading: {
    color: "#fff",
    fontSize: "1.2rem",
  },
};
