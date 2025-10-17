// frontend/src/pages/ConsultantProfile.jsx
import { useState } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

export default function ConsultantProfile() {
  const [form, setForm] = useState({
    name: "",
    bio: "",
    expertise: "",
    availability: "",
    image: null,
  });
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files[0]) {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      let imageUrl = "";

      // Upload image to Firebase Storage
      if (form.image) {
        const imageRef = ref(storage, `consultants/${form.image.name}`);
        await uploadBytes(imageRef, form.image);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Save consultant data to Firestore
      await addDoc(collection(db, "consultants"), {
        name: form.name,
        bio: form.bio,
        expertise: form.expertise.split(",").map((s) => s.trim()),
        availability: form.availability,
        image: imageUrl,
      });

      alert("✅ Consultant profile created successfully!");
      setForm({
        name: "",
        bio: "",
        expertise: "",
        availability: "",
        image: null,
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Error adding consultant profile:", error);
      alert("❌ Failed to add consultant. Try again!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.title}>🧠 Consultant Profile</h2>
        <p style={styles.subtitle}>Add your professional details</p>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <textarea
          name="bio"
          placeholder="Short Bio"
          value={form.bio}
          onChange={handleChange}
          rows="3"
          style={styles.textarea}
          required
        ></textarea>

        <input
          type="text"
          name="expertise"
          placeholder="Expertise (comma-separated)"
          value={form.expertise}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <input
          type="text"
          name="availability"
          placeholder="Availability (e.g., Mon–Fri 10 AM–5 PM)"
          value={form.availability}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          style={styles.fileInput}
        />

        <button type="submit" style={styles.submitBtn} disabled={uploading}>
          {uploading ? "Uploading..." : "Save Profile"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          style={styles.backBtn}
        >
          ⬅ Back to Dashboard
        </button>
      </form>
    </div>
  );
}

// 🎨 Styling
const styles = {
  wrapper: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #74ebd5, #9face6)",
    fontFamily: "'Poppins', sans-serif",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.25)",
    backdropFilter: "blur(15px)",
    borderRadius: "16px",
    padding: "2rem 2.5rem",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    width: "90%",
    maxWidth: "480px",
    textAlign: "center",
    color: "#fff",
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
  input: {
    padding: "0.8rem",
    borderRadius: "8px",
    border: "none",
    outline: "none",
    marginBottom: "1rem",
    width: "100%",
  },
  textarea: {
    padding: "0.8rem",
    borderRadius: "8px",
    border: "none",
    outline: "none",
    marginBottom: "1rem",
    resize: "none",
    width: "100%",
  },
  fileInput: {
    color: "#fff",
    marginBottom: "1rem",
  },
  submitBtn: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "0.8rem 1.5rem",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s",
    marginBottom: "1rem",
  },
  backBtn: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "0.8rem 1.5rem",
    cursor: "pointer",
  },
};
