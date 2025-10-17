import express from "express";
import db from "../config/db.js";

const router = express.Router();
const bookingCollection = db.collection("bookings");

// ✅ Create new booking
router.post("/", async (req, res) => {
  try {
    const { userEmail, consultantId, consultantName, date, time } = req.body;
    if (!userEmail || !consultantId || !date || !time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newBooking = {
      userEmail,
      consultantId,
      consultantName,
      date,
      time,
      createdAt: new Date(),
    };

    const docRef = await bookingCollection.add(newBooking);
    res.status(201).json({ id: docRef.id, ...newBooking });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Get all bookings
router.get("/", async (req, res) => {
  try {
    const snapshot = await bookingCollection.get();
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
