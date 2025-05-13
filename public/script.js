let userId = null;
let userName = "";
let userEmail = "";

function startChat() {
  userName = document.getElementById("name").value.trim();
  userEmail = document.getElementById("email").value.trim();
  if (!userName || !userEmail) {
    alert("Por favor ingresa tu nombre y correo.");
    return;
  }
  userId = `${userEmail}_${Date.now()}`;
  document.getElementById("form-screen").style.display = "none";
  document.getElementById("chat-screen").style.display = "block";

  appendMessage("Scarlett", `Hola ${userName}, qué bueno tenerte aquí 💖`, "bot");
}

function appendMessage(sender, text, type) {
  const chatBox = document.getElementById("chat-box");
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}`;
  messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  appendMessage("Tú", message, "user");
  input.value = "";

  // Simula "escribiendo..."
  const typingDiv = document.createElement("div");
  typingDiv.className = "message bot";
  typingDiv.id = "typing";
  typingDiv.innerHTML = "<em>Scarlett está escribiendo...</em>";
  document.getElementById("chat-box").appendChild(typingDiv);

  try {
    const res = await fetch("/webchat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, userId }),
    });
    const data = await res.json();
    document.getElementById("typing").remove();
    appendMessage("Scarlett", data.response, "bot");
  } catch (err) {
    document.getElementById("typing").remove();
    appendMessage("Scarlett", "Oops, algo salió mal 😢", "bot");
  }
}

function sendQuickReply(message) {
  document.getElementById("user-input").value = message;
  sendMessage();
  logClick(message);
}

async function logClick(button) {
  await fetch("/webchat/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, button }),
  });
}
