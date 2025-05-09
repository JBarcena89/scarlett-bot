document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("user-name").value.trim();
  const email = document.getElementById("user-email").value.trim();
  const message = document.getElementById("user-message").value.trim();
  const userId = `${name}-${email}`;

  if (!name || !email || !message) {
    alert("Por favor ingresa tu nombre, correo y mensaje.");
    return;
  }

  addMessage("Tú", message);
  addTyping();

  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, userId })
  });

  const data = await res.json();
  removeTyping();
  addMessage("Scarlett", data.response);
});

function addMessage(sender, text) {
  const chat = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.className = sender === "Tú" ? "message user" : "message bot";
  msg.innerText = `${sender}: ${text}`;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function addTyping() {
  const chat = document.getElementById("chat-box");
  const typing = document.createElement("div");
  typing.id = "typing";
  typing.className = "message bot";
  typing.innerText = "Scarlett está escribiendo...";
  chat.appendChild(typing);
  chat.scrollTop = chat.scrollHeight;
}

function removeTyping() {
  const typing = document.getElementById("typing");
  if (typing) typing.remove();
}
