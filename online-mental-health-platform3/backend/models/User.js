// User model
// backend/models/User.js
import db from "../config/db.js";

const userCollection = db.collection("users");

export const UserModel = {
  async create(data) {
    const docRef = await userCollection.add(data);
    return { id: docRef.id, ...data };
  },

  async getById(id) {
    const doc = await userCollection.doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async update(id, data) {
    await userCollection.doc(id).update(data);
    return { id, ...data };
  },

  async delete(id) {
    await userCollection.doc(id).delete();
    return { message: "User deleted successfully" };
  },
};
