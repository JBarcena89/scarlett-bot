let userName, userEmail, userId;

function appendMessage(sender, message) {
  const chatBox = document.getElementById("chat-box");
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender === "Tú" ? "user" : "bot"}`;
  messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingIndicator() {
  const chatBox = document.getElementById("chat-box");
  const typingDiv = document.createElement("div");
  typingDiv.id = "typing-indicator";
  typingDiv.className = "typing";
  typingDiv.innerHTML = `
    <div class="typing-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <em>Scarlett está escribiendo...</em>
  `;
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTypingIndicator() {
  const indicator = document.getElementById("typing-indicator");
  if (indicator) {
    indicator.remove();
  }
}

async function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  
  if (!message) return;
  
  appendMessage("Tú", message);
  input.value = "";
  
  showTypingIndicator();
  
  try {
    // Retardo artificial de 3-6 segundos
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 3000));
    
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
    hideTypingIndicator();
    appendMessage("Scarlett", data.response);
  } catch (error) {
    console.error("Error:", error);
    hideTypingIndicator();
    appendMessage("Scarlett", "Ups, algo salió mal. Inténtalo de nuevo, cariño 😘");
  }
}

function sendQuickReply(message) {
  const chatBox = document.getElementById("chat-box");
  const userInput = document.getElementById("user-input");
  
  appendMessage("Tú", message);
  
  document.querySelectorAll('.chat-button').forEach(btn => {
    btn.disabled = true;
    btn.style.opacity = '0.6';
  });
  
  showTypingIndicator();
  
  setTimeout(async () => {
    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          message: message
        })
      });
      
      const data = await response.json();
      hideTypingIndicator();
      appendMessage("Scarlett", data.response);
      
      document.querySelectorAll('.chat-button').forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
      });
    } catch (error) {
      console.error("Error:", error);
      hideTypingIndicator();
      appendMessage("Scarlett", "Ups, algo salió mal. Inténtalo de nuevo, cariño 😘");
    }
  }, 1000);
}

async function loadChatHistory(email) {
  try {
    const res = await fetch(`/chat/history/${email}`);
    const history = await res.json();

    history.forEach((msg) => {
      const sender = msg.role === "user" ? "Tú" : "Scarlett";
      appendMessage(sender, msg.content);
    });
  } catch (error) {
    console.error("Error cargando historial:", error);
  }
}

async function startChat() {
  userName = document.getElementById("name").value.trim();
  userEmail = document.getElementById("email").value.trim();

  if (!userName || !userEmail) {
    alert("Por favor ingresa tu nombre y correo.");
    return;
  }

  userId = `${userEmail}_${Date.now()}`;
  localStorage.setItem("name", userName);
  localStorage.setItem("email", userEmail);
  localStorage.setItem("userId", userId);

  document.getElementById("form-screen").style.display = "none";
  document.getElementById("chat-screen").style.display = "block";

  // Mensaje inicial con retardo
  setTimeout(() => {
    appendMessage("Scarlett", `Hola ${userName}, ya estoy aquí 😘 ¿Qué quieres hacer hoy?`);
  }, 1500);

  await loadChatHistory(userEmail);
}

// Event listeners
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
