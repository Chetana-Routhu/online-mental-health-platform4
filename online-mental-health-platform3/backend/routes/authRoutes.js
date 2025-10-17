// backend/routes/authRoutes.js
import express from "express";
const router = express.Router();

// Dummy Auth routes (you’ll connect Firebase Auth later)
router.post("/signup", (req, res) => {
  res.json({ message: "Signup route working!" });
});

router.post("/login", (req, res) => {
  res.json({ message: "Login route working!" });
});

export default router;
