// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC1awnAXA5ht7uQ4yPV1uxulXXgIKxfoHw",  // ✅ Ensure correct API key
    authDomain: "smart-site-3ff43.firebaseapp.com",
    projectId: "smart-site-3ff43",
    storageBucket: "smart-site-3ff43.appspot.com",  // ✅ Fix incorrect storageBucket format
    messagingSenderId: "830410132546",
    appId: "1:830410132546:web:12bf44d6db8e350f7ab1db",
    measurementId: "G-LNQX5N830P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
