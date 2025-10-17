// frontend/src/pages/Signup.jsx
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("✅ Signup successful! Redirecting to login...");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>🧠 Create Account</h2>
        <p style={styles.subtitle}>Join our Mental Health Community</p>

        <form onSubmit={handleSignup} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={styles.input}
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p style={styles.linkText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

// 🎨 Styles — perfectly centered layout
const styles = {
  wrapper: {
    height: "100vh", // full vertical screen
    width: "100vw", // full horizontal screen
    display: "flex",
    justifyContent: "center", // horizontally center
    alignItems: "center", // vertically center
    background: "linear-gradient(135deg, #89f7fe, #66a6ff)",
    fontFamily: "'Poppins', sans-serif",
  },
  card: {
    backgroundColor: "#fff",
    padding: "2.5rem 2rem",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
    width: "100%",
    maxWidth: "380px",
    textAlign: "center",
    animation: "fadeIn 0.8s ease-in-out",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: "600",
    color: "#333",
    marginBottom: "0.5rem",
  },
  subtitle: {
    fontSize: "0.9rem",
    color: "#666",
    marginBottom: "1.8rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // center the form elements
    gap: "1rem",
  },
  input: {
    width: "85%",
    padding: "0.8rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    textAlign: "center",
    outline: "none",
    transition: "border-color 0.3s ease",
  },
  button: {
    width: "85%",
    padding: "0.8rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    transition: "background-color 0.3s ease, transform 0.2s ease",
  },
  linkText: {
    marginTop: "1.5rem",
    fontSize: "0.9rem",
    color: "#555",
  },
  link: {
    color: "#007bff",
    fontWeight: "bold",
    textDecoration: "none",
  },
};
