let userId = "";

document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  userId = `${email}-${name}`;

  document.getElementById("form-container").style.display = "none";
  document.getElementById("chat-container").style.display = "flex";
  addMessage("Scarlett", `Hola mi amor ${name} 💋 ¿En qué puedo complacerte hoy?`);
});

document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("message-input");
  const message = input.value.trim();
  if (!message) return;

  addMessage("Tú", message);
  input.value = "";
  addTyping();

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, userId })
    });

    const data = await res.json();
    setTimeout(() => {
      removeTyping();
      addMessage("Scarlett", data.response || "Ups... no pude responder 😢");
    }, 5000);
  } catch (err) {
    removeTyping();
    addMessage("Scarlett", "Ups... no puedo responder ahora 😢");
  }
});

function addMessage(sender, text) {
  const chatBox = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.className = "message";
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addTyping() {
  const chatBox = document.getElementById("chat-box");
  const typing = document.createElement("div");
  typing.id = "typing";
  typing.className = "message";
  typing.innerHTML = `<em>Scarlett está escribiendo...</em>`;
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTyping() {
  const typing = document.getElementById("typing");
  if (typing) typing.remove();
}
