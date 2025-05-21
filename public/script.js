// public/script.js
const chatMessages = document.getElementById("chat-messages");

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = "message";
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;

  appendMessage("Tú", text);
  input.value = "";

  // Simular mensaje de Scarlett "escribiendo..."
  const typing = document.createElement("div");
  typing.className = "message typing";
  typing.innerHTML = "<em>Scarlett está escribiendo...</em>";
  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  fetch("/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text }),
  })
    .then((res) => res.text())
    .then((reply) => {
      chatMessages.removeChild(typing);
      appendMessage("Scarlett 💋", reply);
    })
    .catch((err) => {
      chatMessages.removeChild(typing);
      appendMessage("Scarlett 💋", "Oops... hubo un error enviando tu mensaje 😢");
    });
}

function sendQuickReply(text) {
  document.getElementById("user-input").value = text;
  sendMessage();
}
