function sendMessage() {
    const input = document.getElementById("chatInput");
    const messages = document.getElementById("chatMessages");
    const message = input.value.trim();
    if (!message) return;
  
    messages.innerHTML += `<p><strong>You:</strong> ${message}</p>`;
    messages.innerHTML += `<p><strong>AI:</strong> Thinking...</p>`;
    input.value = "";
  
    fetch(window.API_CONFIG.CHATBOT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    })
    .then(res => res.json())
    .then(data => {
      const response = data.response || "Sorry, I didn’t understand that.";
      messages.innerHTML = messages.innerHTML.replace("Thinking...", response);
    })
    .catch(err => {
      console.error(err);
      messages.innerHTML += "<p><strong>AI:</strong> Error occurred. Please try again.</p>";
    });
  }
  
  window.sendMessage = sendMessage;
  