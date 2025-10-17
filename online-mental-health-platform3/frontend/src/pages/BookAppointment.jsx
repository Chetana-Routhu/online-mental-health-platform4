import { useState, useEffect } from "react";
import { getConsultants } from "../services/api";

export default function BookAppointment() {
  const [consultants, setConsultants] = useState([]);
  const [selectedConsultant, setSelectedConsultant] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchData() {
      const data = await getConsultants();
      setConsultants(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!selectedConsultant || !date || !time) {
      setMessage("Please fill all fields.");
      return;
    }

    const consultant = consultants.find(c => c.id === selectedConsultant);

    const bookingData = {
      userEmail: "testuser@example.com", // later replace with logged-in user email
      consultantId: selectedConsultant,
      consultantName: consultant.name,
      date,
      time,
    };

    try {
      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (res.ok) {
        setMessage("✅ Appointment booked successfully!");
        setDate("");
        setTime("");
        setSelectedConsultant("");
      } else {
        setMessage("❌ Failed to book appointment. Try again.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error booking appointment.");
    }
  };

  if (loading) return <p>Loading consultants...</p>;

  return (
    <div className="booking" style={{ padding: "2rem" }}>
      <h2>📅 Book Appointment</h2>
      <form onSubmit={handleBooking}>
        <label>Choose Consultant:</label>
        <select
          value={selectedConsultant}
          onChange={(e) => setSelectedConsultant(e.target.value)}
        >
          <option value="">Select a consultant</option>
          {consultants.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} – {c.specialization}
            </option>
          ))}
        </select>

        <br /><br />
        <label>Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <br /><br />
        <label>Time:</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <br /><br />
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Book Appointment
        </button>
      </form>

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </div>
  );
}
