// Session model
// backend/models/Session.js
import db from "../config/db.js";

const sessionCollection = db.collection("sessions");

export const SessionModel = {
  async create(data) {
    const docRef = await sessionCollection.add(data);
    return { id: docRef.id, ...data };
  },

  async getAll() {
    const snapshot = await sessionCollection.get();
    const sessions = [];
    snapshot.forEach((doc) => {
      sessions.push({ id: doc.id, ...doc.data() });
    });
    return sessions;
  },

  async getById(id) {
    const doc = await sessionCollection.doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async delete(id) {
    await sessionCollection.doc(id).delete();
    return { message: "Session deleted successfully" };
  },
};
