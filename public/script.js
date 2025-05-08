let userId = "";

document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  userId = `${email}-${name}`;

  document.getElementById("form-container").style.display = "none";
  document.getElementById("chat-container").style.display = "block";
  addMessage("Scarlett", `Hola mi amor ${name} 💋 ¿En qué puedo complacerte hoy?`, "bot");
});

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
      addMessage("Scarlett", replyRes.response, "bot");
    } else {
      removeTyping();
      addMessage("Scarlett", data.response, "bot");
    }
  } catch (err) {
    removeTyping();
    addMessage("Scarlett", "Ups... no puedo responder ahora 😢", "bot");
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
  typing.className = "message bot";
  typing.innerHTML = `<em>Scarlett está escribiendo...</em>`;
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTyping() {
  const typing = document.getElementById("typing");
  if (typing) typing.remove();
}

function sendQuick(tipo) {
  let mensaje = "";
  if (tipo === "contenido") {
    mensaje = "Quiero ver tu contenido exclusivo";
  } else if (tipo === "canal") {
    mensaje = "Pásame tu canal amor";
  } else if (tipo === "redes") {
    mensaje = "Dónde te sigo en redes, bebé?";
  }
  document.getElementById("message-input").value = mensaje;
  document.getElementById("chat-form").dispatchEvent(new Event("submit"));
}
