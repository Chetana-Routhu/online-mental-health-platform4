// frontend/src/pages/Login.jsx
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("✅ Login successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("❌ " + error.message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔐 Login</h2>
        <p style={styles.subtitle}>Welcome back! Continue your journey.</p>

        <form onSubmit={handleLogin} style={styles.form}>
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

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={styles.linkText}>
          Don’t have an account?{" "}
          <Link to="/" style={styles.link}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

// 🎨 Same centered layout as Signup
const styles = {
  wrapper: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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
    alignItems: "center",
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
