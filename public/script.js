let userId = "";

document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  userId = `${email}-${name}`;

  document.getElementById("form-container").style.display = "none";
  document.getElementById("chat-container").style.display = "block";

  addMessage("Scarlett", `Hola mi amor ${name} 💋 ¿En qué puedo complacerte hoy?`);
  showActions();
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

    if (data.typing) {
      // Simulación de espera
      const replyRes = await new Promise(resolve =>
        setTimeout(async () => {
          const r = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, userId })
          });
          resolve(r.json());
        }, 5000)
      );

      removeTyping();
      addMessage("Scarlett", replyRes.response);
    } else {
      removeTyping();
      addMessage("Scarlett", data.response);
    }
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

function showActions() {
  const container = document.getElementById("chat-container");
  const actions = document.createElement("div");
  actions.id = "chat-actions";
  actions.innerHTML = `
    <button onclick="window.open('https://fanlove.mx/scarlettWilson363', '_blank')">Contenido VIP 💎</button>
    <button onclick="window.open('https://t.me/scarletoficial', '_blank')">Mi Canal 💌</button>
    <button onclick="window.open('https://www.atom.bio/scarlettwilson363', '_blank')">Mis Redes 📸</button>
  `;
  container.appendChild(actions);
}
