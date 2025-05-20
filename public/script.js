let userName, userEmail, userId;

// Mostrar mensaje en el chat
function appendMessage(sender, message) {
  const chatBox = document.getElementById("chat-box");
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender === "Tú" ? "user" : "bot"}`;
  
  // Formatear mensajes con emojis y saltos de línea
  const formattedMessage = message
    .replace(/\n/g, '<br>')
    .replace(/:\)/g, '😊')
    .replace(/:\(/g, '😢')
    .replace(/:D/g, '😃')
    .replace(/<3/g, '❤️');
  
  messageDiv.innerHTML = `<div class="message-content">${formattedMessage}</div>`;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Mostrar indicador de que está escribiendo
function showTypingIndicator() {
  const chatBox = document.getElementById("chat-box");
  const existingIndicator = document.getElementById("typing-indicator");
  
  if (existingIndicator) return;
  
  const typingDiv = document.createElement("div");
  typingDiv.id = "typing-indicator";
  typingDiv.className = "typing-indicator";
  typingDiv.innerHTML = `
    <div class="typing-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="typing-text">Scarlett está escribiendo...</div>
  `;
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Ocultar indicador de escritura
function hideTypingIndicator() {
  const indicator = document.getElementById("typing-indicator");
  if (indicator) {
    indicator.remove();
  }
}

// Enviar mensaje
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
    
    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }
    
    const data = await response.json();
    hideTypingIndicator();
    
    if (data.response) {
      appendMessage("Scarlett", data.response);
    } else {
      throw new Error('Respuesta vacía del servidor');
    }
  } catch (error) {
    console.error("Error:", error);
    hideTypingIndicator();
    appendMessage("Scarlett", "Ups, algo salió mal. Inténtalo de nuevo, cariño 😘");
  }
}

// Respuesta rápida con botones
function sendQuickReply(message) {
  const input = document.getElementById("user-input");
  input.value = message;
  sendMessage();
}

// Cargar historial de chat
async function loadChatHistory(email) {
  try {
    const res = await fetch(`/chat/history/${encodeURIComponent(email)}`);
    
    if (!res.ok) {
      throw new Error('Error al cargar historial');
    }
    
    const history = await res.json();
    
    if (Array.isArray(history)) {
      history.forEach((msg) => {
        const sender = msg.role === "user" ? "Tú" : "Scarlett";
        appendMessage(sender, msg.content);
      });
    }
  } catch (error) {
    console.error("Error cargando historial:", error);
  }
}

// Iniciar chat
async function startChat() {
  userName = document.getElementById("name").value.trim();
  userEmail = document.getElementById("email").value.trim();

  if (!userName || !userEmail) {
    alert("Por favor ingresa tu nombre y un correo válido.");
    return;
  }

  // Validación básica de email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
    alert("Por favor ingresa un correo electrónico válido.");
    return;
  }

  userId = `${userEmail}_${Date.now()}`;
  localStorage.setItem("name", userName);
  localStorage.setItem("email", userEmail);
  localStorage.setItem("userId", userId);

  document.getElementById("form-screen").style.display = "none";
  document.getElementById("chat-screen").style.display = "flex";

  // Mensaje de bienvenida con retardo
  setTimeout(() => {
    appendMessage("Scarlett", `Hola ${userName} 💋 ¡Qué emoción hablar contigo!`);
    setTimeout(() => {
      appendMessage("Scarlett", "Soy Scarlett, tu novia virtual. Estoy aquí para lo que necesites 😘");
    }, 1500);
  }, 1000);

  await loadChatHistory(userEmail);
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Cargar datos guardados si existen
  const savedName = localStorage.getItem("name");
  const savedEmail = localStorage.getItem("email");
  
  if (savedName && savedEmail) {
    document.getElementById("name").value = savedName;
    document.getElementById("email").value = savedEmail;
  }
  
  // Enviar mensaje al presionar Enter
  document.getElementById("user-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });
});
