// frontend/src/pages/ConsultantProfile.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { motion } from "framer-motion";

export default function ConsultantProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultant, setConsultant] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState({
    name: "",
    specialization: "",
    experience: "",
    image: "",
  });

  useEffect(() => {
    const fetchConsultant = async () => {
      try {
        const docRef = doc(db, "consultants", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setConsultant(docSnap.data());
          setUpdatedData(docSnap.data());
        } else {
          console.error("No such consultant!");
        }
      } catch (error) {
        console.error("Error fetching consultant:", error);
      }
    };
    fetchConsultant();
  }, [id]);

  const handleUpdate = async () => {
    try {
      const docRef = doc(db, "consultants", id);
      await updateDoc(docRef, updatedData);
      alert("✅ Consultant updated successfully!");
      setConsultant(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating consultant:", error);
    }
  };

  if (!consultant)
    return (
      <div style={styles.wrapper}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={styles.loading}
        >
          Loading consultant details...
        </motion.p>
      </div>
    );

  return (
    <div style={styles.wrapper}>
      <motion.div
        className="consultant-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={styles.card}
      >
        <motion.img
          src={
            consultant.image ||
            "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          }
          alt={consultant.name}
          style={styles.image}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        />

        <motion.h2
          style={styles.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {consultant.name}
        </motion.h2>

        {isEditing ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={styles.form}
          >
            <input
              type="text"
              value={updatedData.name}
              onChange={(e) =>
                setUpdatedData({ ...updatedData, name: e.target.value })
              }
              placeholder="Name"
            />
            <input
              type="text"
              value={updatedData.specialization}
              onChange={(e) =>
                setUpdatedData({
                  ...updatedData,
                  specialization: e.target.value,
                })
              }
              placeholder="Specialization"
            />
            <input
              type="text"
              value={updatedData.experience}
              onChange={(e) =>
                setUpdatedData({
                  ...updatedData,
                  experience: e.target.value,
                })
              }
              placeholder="Experience"
            />
            <input
              type="text"
              value={updatedData.image}
              onChange={(e) =>
                setUpdatedData({ ...updatedData, image: e.target.value })
              }
              placeholder="Image URL"
            />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={styles.saveBtn}
              onClick={handleUpdate}
            >
              💾 Save Changes
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={styles.cancelBtn}
              onClick={() => setIsEditing(false)}
            >
              ❌ Cancel
            </motion.button>
          </motion.div>
        ) : (
          <>
            <motion.p
              style={styles.text}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <strong>Specialization:</strong> {consultant.specialization}
            </motion.p>

            <motion.p
              style={styles.text}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <strong>Experience:</strong> {consultant.experience}
            </motion.p>

            <motion.div
              style={styles.actions}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#00e0ff" }}
                style={styles.editBtn}
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#ff6b6b" }}
                style={styles.backBtn}
                onClick={() => navigate("/consultants")}
              >
                ⬅ Back
              </motion.button>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}

const styles = {
  wrapper: {
    height: "100vh",
    width: "100vw",
    background: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Poppins', sans-serif",
  },
  card: {
    background: "rgba(255,255,255,0.25)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "2rem",
    width: "90%",
    maxWidth: "450px",
    textAlign: "center",
    color: "#fff",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },
  image: {
    width: "110px",
    height: "110px",
    borderRadius: "50%",
    marginBottom: "1rem",
    border: "3px solid rgba(255,255,255,0.5)",
  },
  title: { fontSize: "1.8rem", fontWeight: "bold", marginBottom: "1rem" },
  text: { fontSize: "1rem", margin: "0.5rem 0" },
  editBtn: {
    background: "#00c9ff",
    border: "none",
    padding: "0.7rem 1.2rem",
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  backBtn: {
    background: "#ff4b5c",
    border: "none",
    padding: "0.7rem 1.2rem",
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
    marginLeft: "0.7rem",
    fontWeight: "600",
  },
  form: { display: "flex", flexDirection: "column", gap: "0.7rem", marginTop: "1rem" },
  saveBtn: {
    background: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "0.7rem",
    cursor: "pointer",
    fontWeight: "600",
  },
  cancelBtn: {
    background: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "0.7rem",
    cursor: "pointer",
    fontWeight: "600",
  },
  loading: { color: "#fff", fontSize: "1.3rem" },
  actions: { marginTop: "1rem" },
};
