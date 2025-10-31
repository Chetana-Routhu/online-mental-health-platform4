import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Consultants() {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [newConsultant, setNewConsultant] = useState({
    name: "",
    specialization: "",
    experience: "",
    image: "",
  });

  const navigate = useNavigate();

  // ✅ Authentication check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
    });
    return () => unsubscribe();
  }, [navigate]);

  // ✅ Fetch consultants
  const fetchConsultants = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "consultants"));
      const list = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setConsultants(list);
    } catch (error) {
      console.error("Error fetching consultants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultants();
  }, []);

  // ➕ Add consultant
  const handleAddConsultant = async (e) => {
    e.preventDefault();
    if (!newConsultant.name || !newConsultant.specialization || !newConsultant.experience) {
      alert("Please fill all required fields");
      return;
    }
    try {
      await addDoc(collection(db, "consultants"), newConsultant);
      alert("✅ Consultant added!");
      setNewConsultant({ name: "", specialization: "", experience: "", image: "" });
      setShowAddModal(false);
      fetchConsultants();
    } catch (error) {
      console.error("Error adding consultant:", error);
    }
  };

  // ✏️ Open edit modal
  const openEditModal = (consultant) => {
    setSelectedConsultant(consultant);
    setNewConsultant(consultant);
    setShowEditModal(true);
  };

  // 💾 Update consultant
  const handleUpdateConsultant = async (e) => {
    e.preventDefault();
    if (!selectedConsultant) return;
    try {
      const ref = doc(db, "consultants", selectedConsultant.id);
      await updateDoc(ref, newConsultant);
      alert("✅ Consultant updated!");
      setShowEditModal(false);
      fetchConsultants();
    } catch (error) {
      console.error("Error updating consultant:", error);
    }
  };

  // ❌ Delete consultant
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this consultant?")) {
      try {
        await deleteDoc(doc(db, "consultants", id));
        fetchConsultants();
      } catch (error) {
        console.error("Error deleting consultant:", error);
      }
    }
  };

  // 🧠 Book Session
  const handleBookSession = (consultantId) => {
    navigate(`/book/${consultantId}`);
  };

  // 💬 Chat Page
  const handleChat = (consultantId) => {
    navigate(`/chat/${consultantId}`);
  };

  if (loading)
    return (
      <div style={styles.centerScreen}>
        <p style={{ fontSize: "1.3rem", color: "#fff" }}>Loading consultants...</p>
      </div>
    );

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🧠 Our Consultants</h1>
        <div style={styles.headerButtons}>
          <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
            ⬅ Back
          </button>
          <button style={styles.addBtn} onClick={() => setShowAddModal(true)}>
            ➕ Add Consultant
          </button>
        </div>
      </div>

      {/* Consultant Grid */}
      <div style={styles.grid}>
        {consultants.length === 0 ? (
          <p style={styles.noData}>No consultants found</p>
        ) : (
          consultants.map((c) => (
            <div key={c.id} style={styles.card}>
              <img
                src={c.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                alt={c.name}
                style={styles.image}
              />
              <h3 style={styles.name}>{c.name}</h3>
              <p style={styles.specialization}>{c.specialization}</p>
              <p style={styles.experience}>{c.experience}</p>

              <div style={styles.actions}>
                <button
                  style={{ ...styles.cardBtn, backgroundColor: "#00c9ff" }}
                  onClick={() => handleBookSession(c.id)}
                >
                  📅 Book
                </button>
                <button
                  style={{ ...styles.cardBtn, backgroundColor: "#6f42c1" }}
                  onClick={() => handleChat(c.id)}
                >
                  💬 Chat
                </button>
                <button
                  style={{ ...styles.cardBtn, backgroundColor: "#f4b400" }}
                  onClick={() => openEditModal(c)}
                >
                  ✏️ Edit
                </button>
                <button
                  style={{ ...styles.cardBtn, backgroundColor: "#ff4b5c" }}
                  onClick={() => handleDelete(c.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ➕ Add Consultant Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Add Consultant</h2>
            <form style={styles.form} onSubmit={handleAddConsultant}>
              <input
                type="text"
                placeholder="Name"
                value={newConsultant.name}
                onChange={(e) => setNewConsultant({ ...newConsultant, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Specialization"
                value={newConsultant.specialization}
                onChange={(e) =>
                  setNewConsultant({ ...newConsultant, specialization: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Experience"
                value={newConsultant.experience}
                onChange={(e) =>
                  setNewConsultant({ ...newConsultant, experience: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Image URL"
                value={newConsultant.image}
                onChange={(e) => setNewConsultant({ ...newConsultant, image: e.target.value })}
              />
              <div style={styles.modalButtons}>
                <button type="submit" style={styles.submitBtn}>
                  Add
                </button>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✏️ Edit Consultant Modal */}
      {showEditModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Edit Consultant</h2>
            <form style={styles.form} onSubmit={handleUpdateConsultant}>
              <input
                type="text"
                value={newConsultant.name}
                onChange={(e) => setNewConsultant({ ...newConsultant, name: e.target.value })}
              />
              <input
                type="text"
                value={newConsultant.specialization}
                onChange={(e) =>
                  setNewConsultant({ ...newConsultant, specialization: e.target.value })
                }
              />
              <input
                type="text"
                value={newConsultant.experience}
                onChange={(e) =>
                  setNewConsultant({ ...newConsultant, experience: e.target.value })
                }
              />
              <input
                type="text"
                value={newConsultant.image}
                onChange={(e) => setNewConsultant({ ...newConsultant, image: e.target.value })}
              />
              <div style={styles.modalButtons}>
                <button type="submit" style={styles.submitBtn}>
                  Update
                </button>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// 🎨 Styles
const styles = {
  page: {
    width: "100vw",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #74ebd5, #9face6)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "#fff",
    fontFamily: "'Poppins', sans-serif",
    overflowY: "auto",
    paddingBottom: "2rem",
  },
  header: { textAlign: "center", marginTop: "2rem" },
  title: { fontSize: "2.2rem", fontWeight: "700", marginBottom: "1rem" },
  headerButtons: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  backBtn: {
    background: "#ff4b5c",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "0.6rem 1.2rem",
    cursor: "pointer",
  },
  addBtn: {
    background: "#00c9ff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "0.6rem 1.2rem",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
    width: "90%",
    maxWidth: "1100px",
  },
  card: {
    background: "rgba(255,255,255,0.15)",
    borderRadius: "15px",
    padding: "1.5rem",
    textAlign: "center",
    backdropFilter: "blur(12px)",
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
  },
  image: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "0.8rem",
    border: "2px solid rgba(255,255,255,0.6)",
  },
  name: { fontWeight: "600", fontSize: "1.1rem" },
  specialization: { color: "#eaf6ff", fontSize: "0.9rem" },
  experience: { color: "#eaf6ff", fontSize: "0.8rem", marginBottom: "1rem" },
  actions: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  cardBtn: {
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    padding: "0.5rem",
    cursor: "pointer",
  },
  noData: { fontSize: "1rem", color: "#fff" },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "#fff",
    color: "#000",
    borderRadius: "15px",
    padding: "2rem",
    width: "90%",
    maxWidth: "400px",
    textAlign: "center",
  },
  form: { display: "flex", flexDirection: "column", gap: "0.7rem" },
  modalButtons: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  submitBtn: {
    background: "#00c9ff",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    padding: "0.6rem",
    cursor: "pointer",
  },
  cancelBtn: {
    background: "#ff4b5c",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    padding: "0.6rem",
    cursor: "pointer",
  },
  centerScreen: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #74ebd5, #9face6)",
  },
};
