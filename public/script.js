let userId = "";
let userName = "";

// Al enviar el formulario inicial
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  userId = `${email}-${name}`;
  userName = name;

  document.getElementById("form-container").style.display = "none";
  document.getElementById("chat-container").style.display = "flex";

  addMessage("Scarlett", `Hola mi amor ${name} 💋 ¿En qué puedo complacerte hoy?`, "scarlett");
});

// Al enviar un mensaje del chat
document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("message-input");
  const message = input.value.trim();
  if (!message) return;

  addMessage("Tú", message, "user");
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
      setTimeout(async () => {
        const replyRes = await fetch("/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, userId })
        });
        const final = await replyRes.json();
        removeTyping();
        addMessage("Scarlett", final.response, "scarlett");
      }, 5000);
    } else {
      removeTyping();
      addMessage("Scarlett", data.response, "scarlett");
    }
  } catch (err) {
    removeTyping();
    addMessage("Scarlett", "Ups... no puedo responder ahora 😢", "scarlett");
  }
});

function addMessage(sender, text, type) {
  const chatBox = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.className = `message ${type}`;
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addTyping() {
  const chatBox = document.getElementById("chat-box");
  const typing = document.createElement("div");
  typing.id = "typing";
  typing.className = "message scarlett";
  typing.innerHTML = `<em>Scarlett está escribiendo...</em>`;
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTyping() {
  const typing = document.getElementById("typing");
  if (typing) typing.remove();
}

// Acciones para los botones fijos inferiores
document.getElementById("btn-vip").addEventListener("click", () => {
  addMessage("Scarlett", `🔥 Mi contenido más íntimo está aquí amor: <a href="https://onlyfans.com/scarlettvip" target="_blank">VIP 🔥</a>`, "scarlett");
});

document.getElementById("btn-telegram").addEventListener("click", () => {
  addMessage("Scarlett", `💋 Únete a mi canal exclusivo en Telegram: <a href="https://t.me/scarletoficial" target="_blank">Mi Canal 💋</a>`, "scarlett");
});

document.getElementById("btn-socials").addEventListener("click", () => {
  addMessage("Scarlett", `📸 Sígueme en todas mis redes, amor: <a href="https://instagram.com/scarlettvirtual" target="_blank">Instagram 📸</a>`, "scarlett");
});
