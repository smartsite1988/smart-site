import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
            const userRole = userDoc.data().role;
            console.log("User role:", userRole);

            // Redirect users based on role to the correct subdirectory
            switch (userRole) {
                case "contractor":
                    window.location.href = "/contractor/contractor-dashboard.html";
                    break;
                case "operative":
                    window.location.href = "/operative/operative-dashboard.html";
                    break;
                case "subcontractor":
                    window.location.href = "/subcontractor/subcontractor-dashboard.html";
                    break;
                case "supplier":
                    window.location.href = "/supplier/supplier-dashboard.html";
                    break;
                case "architect":
                    window.location.href = "/architect/architect-dashboard.html";
                    break;
                default:
                    window.location.href = "/index.html"; // Redirect to main menu if no role found
                    break;
            }
        } else {
            console.error("User role not found in Firestore.");
            alert("Error: User role not found. Contact support.");
        }
    } catch (error) {
        console.error("Login Error:", error.code, error.message);
        alert(error.message);
    }
});
