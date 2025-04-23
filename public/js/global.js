// Global Navigation Function
function navigateTo(page) {
    window.location.href = page;
}

// Logout Function
function logout() {
    alert("Logging out...");
    window.location.href = "/login.html";
}

// Chatbot Functions
function openChat() {
    document.getElementById("chatModal").style.display = "block";
}
function closeChat() {
    document.getElementById("chatModal").style.display = "none";
}

// Apply Event Listeners for Chatbot
document.addEventListener("DOMContentLoaded", () => {
    const chatButton = document.getElementById("chatButton");
    if (chatButton) {
        chatButton.addEventListener("click", openChat);
    }
});
