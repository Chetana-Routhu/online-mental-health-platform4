// frontend/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // for profile pictures later

const firebaseConfig = {
  apiKey: "AIzaSyAr_tEi5IlHlEFuPgrhZhcvUnN83jQezNA",
  authDomain: "online-mental-health-platform.firebaseapp.com",
  projectId: "online-mental-health-platform",
  storageBucket: "online-mental-health-platform.firebasestorage.app",
  messagingSenderId: "808797254033",
  appId: "1:808797254033:web:c4b5ad37810113308daa30"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
