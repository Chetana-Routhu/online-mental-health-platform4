import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, addDoc, collection, Timestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Book() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultant, setConsultant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    date: "",
    time: "",
    age: "",
    message: "",
  });

  // ✅ Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) navigate("/login");
      else setUser(currentUser);
    });
    return () => unsubscribe();
  }, [navigate]);

  // ✅ Fetch consultant details
  useEffect(() => {
    const fetchConsultant = async () => {
      try {
        const docRef = doc(db, "consultants", id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setConsultant(snapshot.data());
        } else {
          alert("Consultant not found");
          navigate("/consultants");
        }
      } catch (error) {
        console.error("Error fetching consultant:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConsultant();
  }, [id, navigate]);

  // ✅ Handle form submit (adds session timestamp for reminders)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.time || !form.age) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const sessionDateTime = new Date(`${form.date}T${form.time}`);

      await addDoc(collection(db, "bookings"), {
        consultantId: id,
        consultantName: consultant.name,
        userId: user.uid,
        userEmail: user.email,
        date: form.date,
        time: form.time,
        age: form.age,
        message: form.message,
        sessionDateTime: Timestamp.fromDate(sessionDateTime), // 🔥 Added field
        createdAt: Timestamp.now(),
      });

      alert("✅ Booking confirmed successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Booking error:", error);
      alert("❌ Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={styles.center}>
        <p style={{ color: "#fff", fontSize: "1.2rem" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Book a Session</h2>
        <p style={styles.consultantName}>with {consultant?.name}</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="number"
            placeholder="Your Age"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            required
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
          <input
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            required
          />
          <textarea
            placeholder="Message (optional)"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            style={{ minHeight: "70px" }}
          />

          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.submitBtn}>
              Confirm Booking
            </button>
            <button
              type="button"
              onClick={() => navigate("/consultants")}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 🎨 Styles
const styles = {
  wrapper: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
    fontFamily: "'Poppins', sans-serif",
    overflow: "hidden",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    backdropFilter: "blur(12px)",
    borderRadius: "16px",
    padding: "2.5rem 3rem",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
    color: "#fff",
    width: "90%",
    maxWidth: "420px",
    animation: "fadeIn 0.8s ease-in-out",
  },
  title: { fontSize: "1.8rem", fontWeight: "600", marginBottom: "0.5rem" },
  consultantName: {
    fontSize: "1.1rem",
    color: "rgba(255,255,255,0.9)",
    marginBottom: "1.5rem",
  },
  form: { display: "flex", flexDirection: "column", gap: "0.8rem" },
  buttonGroup: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  submitBtn: {
    backgroundColor: "#00c9ff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "0.8rem",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "all 0.3s ease",
  },
  cancelBtn: {
    backgroundColor: "#ff4b5c",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "0.8rem",
    cursor: "pointer",
  },
  center: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
  },
};
