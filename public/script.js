let userName, userEmail, userId;

function appendMessage(sender, message) {
  const chatBox = document.getElementById("chat-box");
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender === "Tú" ? "user" : "bot"}`;
  messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  
  if (!message) return;
  
  appendMessage("Tú", message);
  input.value = "";
  
  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: userName,
        email: userEmail,
        message
      })
    });
    
    const data = await response.json();
    appendMessage("Scarlett", data.response);
  } catch (error) {
    console.error("Error:", error);
    appendMessage("Scarlett", "Ups, algo salió mal. Inténtalo de nuevo, cariño 😘");
  }
}

function sendQuickReply(message) {
  document.getElementById("user-input").value = message;
  sendMessage();
}

// Inicialización mejorada
document.addEventListener("DOMContentLoaded", () => {
  const savedName = localStorage.getItem("name");
  const savedEmail = localStorage.getItem("email");
  
  if (savedName && savedEmail) {
    document.getElementById("name").value = savedName;
    document.getElementById("email").value = savedEmail;
  }
  
  document.getElementById("user-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
});

// ... funciones existentes ...
