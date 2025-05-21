// ... código anterior ...

function sendQuickReply(message) {
  const chatBox = document.getElementById("chat-box");
  const userInput = document.getElementById("user-input");
  
  // Mostrar el mensaje seleccionado
  appendMessage("Tú", message);
  
  // Deshabilitar botones temporalmente
  document.querySelectorAll('.chat-button').forEach(btn => {
    btn.disabled = true;
    btn.style.opacity = '0.6';
  });
  
  // Mostrar indicador de typing
  showTypingIndicator();
  
  // Enviar después de breve retraso (mejor UX)
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
      
      // Rehabilitar botones
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

// ... código posterior ...
