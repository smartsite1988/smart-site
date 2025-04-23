import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");

    if (!registerForm) {
        console.error("registerForm not found in the document.");
        return;
    }

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const confirmEmail = document.getElementById("confirmEmail").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const role = "architect"; // ✅ Correct role

        if (email !== confirmEmail) {
            alert("Emails do not match!");
            return;
        }
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save user details in Firestore with correct role
            await setDoc(doc(db, "users", user.uid), {
                email: email,
                role: role,
                createdAt: new Date().toISOString(),
            });

            alert("Registration successful! Redirecting to login...");
            window.location.href = "/login.html";
        } catch (error) {
            console.error("Registration Error:", error);
            alert(error.message);
        }
    });
});
