// Consultant model
// backend/models/Consultant.js
import db from "../config/db.js";

const consultantCollection = db.collection("consultants");

export const ConsultantModel = {
  async create(data) {
    const docRef = await consultantCollection.add(data);
    return { id: docRef.id, ...data };
  },

  async getAll() {
    const snapshot = await consultantCollection.get();
    const consultants = [];
    snapshot.forEach((doc) => {
      consultants.push({ id: doc.id, ...doc.data() });
    });
    return consultants;
  },

  async getById(id) {
    const doc = await consultantCollection.doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async update(id, data) {
    await consultantCollection.doc(id).update(data);
    return { id, ...data };
  },

  async delete(id) {
    await consultantCollection.doc(id).delete();
    return { message: "Consultant deleted successfully" };
  },
};

