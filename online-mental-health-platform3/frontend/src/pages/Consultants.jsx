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
  const [filteredConsultants, setFilteredConsultants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [editConsultant, setEditConsultant] = useState(null);
  const [currentUserName, setCurrentUserName] = useState("");
  const [newConsultant, setNewConsultant] = useState({
    name: "",
    specialization: "",
    experience: "",
    image: "",
  });
  const [booking, setBooking] = useState({
    userName: "",
    age: "",
    date: "",
    time: "",
  });

  const navigate = useNavigate();

  // 🔐 Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
      else setCurrentUserName(user.displayName || user.email);
    });
    return () => unsubscribe();
  }, [navigate]);

  // 🔥 Fetch consultants
  const fetchConsultants = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "consultants"));
      const list = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setConsultants(list);
      setFilteredConsultants(list);
    } catch (error) {
      console.error("Error fetching consultants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultants();
  }, []);

  // 🔍 Filter consultants
  useEffect(() => {
    const filtered = consultants.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredConsultants(filtered);
  }, [searchTerm, consultants]);

  // ➕ Add consultant
  const handleAddConsultant = async (e) => {
    e.preventDefault();
    if (!newConsultant.name || !newConsultant.specialization || !newConsultant.experience) {
      alert("Please fill all required fields");
      return;
    }
    try {
      await addDoc(collection(db, "consultants"), newConsultant);
      alert("Consultant added successfully!");
      setNewConsultant({ name: "", specialization: "", experience: "", image: "" });
      setShowAddModal(false);
      fetchConsultants();
    } catch (error) {
      console.error(error);
    }
  };

  // ✏️ Update consultant
  const handleEditConsultant = async (e) => {
    e.preventDefault();
    try {
      const ref = doc(db, "consultants", editConsultant.id);
      await updateDoc(ref, {
        name: editConsultant.name,
        specialization: editConsultant.specialization,
        experience: editConsultant.experience,
        image: editConsultant.image,
      });
      alert("Consultant updated successfully!");
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

  // 📅 Booking
  const openBooking = (consultant) => {
    setSelectedConsultant(consultant);
    setBooking({ userName: currentUserName, age: "", date: "", time: "" });
    setShowBookingModal(true);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!booking.userName || !booking.age || !booking.date || !booking.time) {
      alert("Please fill all fields");
      return;
    }
    try {
      await addDoc(collection(db, "bookings"), {
        ...booking,
        consultantId: selectedConsultant.id,
        consultantName: selectedConsultant.name,
        createdAt: new Date(),
      });
      alert("Session booked successfully!");
      setShowBookingModal(false);
    } catch (error) {
      console.error("Error booking session:", error);
    }
  };

  if (loading)
    return (
      <div style={styles.centerScreen}>
        <p style={{ fontSize: "1.3rem", color: "#fff" }}>Loading consultants...</p>
      </div>
    );

  return (
    <div style={styles.fullScreen}>
      <div style={styles.container}>
        <h1 style={styles.title}>🧠 Our Consultants</h1>

        {/* Top Controls */}
        <div style={styles.topBar}>
          <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
            ⬅ Back
          </button>
          <input
            type="text"
            placeholder="Search by name or specialization"
            style={styles.searchBar}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button style={styles.addBtn} onClick={() => setShowAddModal(true)}>
            ➕ Add Consultant
          </button>
        </div>

        {/* Consultants Grid */}
        <div style={styles.grid}>
          {filteredConsultants.length === 0 ? (
            <p style={styles.noData}>No consultants found</p>
          ) : (
            filteredConsultants.map((c) => (
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
                    onClick={() => openBooking(c)}
                  >
                    📅 Book
                  </button>
                  <button
                    style={{ ...styles.cardBtn, backgroundColor: "#ffc107" }}
                    onClick={() => {
                      setEditConsultant(c);
                      setShowEditModal(true);
                    }}
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
      </div>

      {/* Add Consultant Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Add Consultant</h2>
            <form style={styles.form} onSubmit={handleAddConsultant}>
              <input type="text" placeholder="Name" value={newConsultant.name}
                onChange={(e) => setNewConsultant({ ...newConsultant, name: e.target.value })} required />
              <input type="text" placeholder="Specialization" value={newConsultant.specialization}
                onChange={(e) => setNewConsultant({ ...newConsultant, specialization: e.target.value })} required />
              <input type="text" placeholder="Experience (e.g., 5 years)" value={newConsultant.experience}
                onChange={(e) => setNewConsultant({ ...newConsultant, experience: e.target.value })} required />
              <input type="text" placeholder="Image URL" value={newConsultant.image}
                onChange={(e) => setNewConsultant({ ...newConsultant, image: e.target.value })} />
              <div style={styles.modalButtons}>
                <button type="submit" style={styles.submitBtn}>Add</button>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Consultant Modal */}
      {showEditModal && editConsultant && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Edit Consultant</h2>
            <form style={styles.form} onSubmit={handleEditConsultant}>
              <input type="text" value={editConsultant.name}
                onChange={(e) => setEditConsultant({ ...editConsultant, name: e.target.value })} required />
              <input type="text" value={editConsultant.specialization}
                onChange={(e) => setEditConsultant({ ...editConsultant, specialization: e.target.value })} required />
              <input type="text" value={editConsultant.experience}
                onChange={(e) => setEditConsultant({ ...editConsultant, experience: e.target.value })} required />
              <input type="text" value={editConsultant.image}
                onChange={(e) => setEditConsultant({ ...editConsultant, image: e.target.value })} />
              <div style={styles.modalButtons}>
                <button type="submit" style={styles.submitBtn}>Update</button>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedConsultant && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Book {selectedConsultant.name}</h2>
            <form style={styles.form} onSubmit={handleBooking}>
              <input type="text" placeholder="Your Name" value={booking.userName || currentUserName}
                onChange={(e) => setBooking({ ...booking, userName: e.target.value })} required />
              <input type="number" placeholder="Age" value={booking.age}
                onChange={(e) => setBooking({ ...booking, age: e.target.value })} required />
              <input type="date" value={booking.date}
                onChange={(e) => setBooking({ ...booking, date: e.target.value })} required />
              <input type="time" value={booking.time}
                onChange={(e) => setBooking({ ...booking, time: e.target.value })} required />
              <div style={styles.modalButtons}>
                <button type="submit" style={styles.submitBtn}>Confirm</button>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowBookingModal(false)}>Cancel</button>
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
  fullScreen: {
    width: "100vw",
    height: "100vh",
    background: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
    fontFamily: "'Poppins', sans-serif",
  },
  container: { width: "90%", maxWidth: "1000px", textAlign: "center" },
  title: { fontSize: "2.5rem", fontWeight: "700", marginBottom: "1rem" },
  topBar: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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
  searchBar: {
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    border: "none",
    width: "250px",
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "1rem",
  },
  card: {
    background: "rgba(255,255,255,0.15)",
    borderRadius: "15px",
    padding: "1.5rem",
    textAlign: "center",
    width: "200px",
    backdropFilter: "blur(10px)",
  },
  image: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "0.5rem",
    border: "2px solid rgba(255,255,255,0.6)",
  },
  name: { fontWeight: "600", fontSize: "1.1rem" },
  specialization: { color: "#eaf6ff", fontSize: "0.9rem" },
  experience: { color: "#eaf6ff", fontSize: "0.8rem", marginBottom: "1rem" },
  actions: { display: "flex", flexDirection: "column", gap: "0.5rem" },
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
    background: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
  },
};
