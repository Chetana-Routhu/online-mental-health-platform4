// Consultant routes
// backend/routes/consultantRoutes.js
import express from "express";
import db from "../config/db.js";

const router = express.Router();
const consultantCollection = db.collection("consultants");

// Add consultant
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const docRef = await consultantCollection.add(data);
    res.status(201).json({ id: docRef.id, ...data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all consultants
router.get("/", async (req, res) => {
  try {
    const snapshot = await consultantCollection.get();
    const consultants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(consultants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
