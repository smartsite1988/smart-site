document.addEventListener("DOMContentLoaded", function () { 
    // ✅ Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (event) {
            event.preventDefault();
            document.querySelector(this.getAttribute("href")).scrollIntoView({
                behavior: "smooth"
            });
        });
    });

    // ✅ Dark Mode Toggle
    const toggleButton = document.getElementById("dark-mode-toggle");
    if (toggleButton) {
        toggleButton.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
        });
    }

    // ✅ Form Validation for Secure Login
    const loginForm = document.querySelector(".login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            const email = document.querySelector("#email").value;
            const password = document.querySelector("#password").value;
            
            if (email.trim() === "" || password.trim() === "") {
                event.preventDefault();
                alert("All fields must be filled.");
            }
        });
    }

    // ✅ Chat Modal Functionality
    const chatButton = document.getElementById("chatButton");
    const chatModal = document.getElementById("chatModal");
    const chatClose = document.querySelector(".chat-close");
    const chatInput = document.getElementById("chatInput");
    const chatMessages = document.getElementById("chatMessages");

    if (chatButton && chatModal) {
        chatButton.addEventListener("click", function () {
            chatModal.style.display = "block";
        });

        chatClose.addEventListener("click", function () {
            chatModal.style.display = "none";
        });

        // ✅ Send Message on Enter Key Press
        chatInput.addEventListener("keypress", function (event) {
            if (event.key === "Enter" && chatInput.value.trim() !== "") {
                sendMessage(chatInput.value.trim());
                chatInput.value = ""; // Clear input field after sending
            }
        });
    }

    // ✅ Function to Send Message to Backend
    function sendMessage(message) {
        chatMessages.innerHTML += `<p><strong>You:</strong> ${message}</p>`;

        fetch("https://smartsite-chatbot-830410132546.europe-west2.run.app/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message, role: "User" })
        })
        .then(response => response.json())
        .then(data => {
            chatMessages.innerHTML += `<p><strong>AI:</strong> ${data.response}</p>`;
        })
        .catch(error => {
            console.error("Error fetching chat response:", error);
            chatMessages.innerHTML += `<p><strong>AI:</strong> An error occurred. Please try again later.</p>`;
        });
    }
});
