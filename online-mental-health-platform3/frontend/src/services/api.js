// frontend/src/services/api.js
const API_BASE = "http://localhost:5000/api";

export async function getConsultants() {
  try {
    const response = await fetch(`${API_BASE}/consultants`);
    if (!response.ok) throw new Error("Failed to fetch consultants");
    return await response.json();
  } catch (err) {
    console.error("Error fetching consultants:", err);
    return [];
  }
}
