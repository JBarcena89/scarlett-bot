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
  localStorage.setItem("name", userName);
  localStorage.setItem("email", userEmail);

  document.getElementById("form-screen").style.display = "none";
  document.getElementById("chat-screen").style.display = "block";

  appendMessage("Scarlett", `Hola ${userName}, ya estoy aquí 😘 ¿Qué quieres hacer hoy?`);
}

function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  appendMessage("Tú", message);
  input.value = "";
  showTyping();

  fetch("/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: userName,
      email: userEmail,
      message
    })
  })
    .then((res) => res.json())
    .then((data) => {
      hideTyping();
      appendMessage("Scarlett", data.reply);
    })
    .catch((err) => {
      hideTyping();
      appendMessage("Scarlett", "Ups, amor... algo falló 😢");
      console.error(err);
    });
}

function sendQuickReply(text) {
  document.getElementById("user-input").value = text;
  sendMessage();
}

function appendMessage(sender, message) {
  const chatBox = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTyping() {
  const chatBox = document.getElementById("chat-box");
  const typingDiv = document.createElement("div");
  typingDiv.id = "typing";
  typingDiv.classList.add("message");
  typingDiv.innerHTML = `<em>Scarlett está escribiendo...</em>`;
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTyping() {
  const typingDiv = document.getElementById("typing");
  if (typingDiv) typingDiv.remove();
}
