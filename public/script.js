let userId = "";

document.getElementById("user-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("userName").value.trim();
  const email = document.getElementById("userEmail").value.trim();

  if (!name || !email) return;

  userId = btoa(email); // base64
  document.getElementById("form-screen").style.display = "none";
  document.getElementById("chat-screen").style.display = "block";
  addMessage(`Hola mi amor ${name} 💋 ¿En qué puedo complacerte hoy?`, "bot");
});

document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("messageInput");
  const message = input.value.trim();
  if (!message) return;

  addMessage(message, "user");
  input.value = "";

  addMessage("Scarlett está escribiendo... 💋", "bot");

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, userId })
    });

    const data = await res.json();

    const typing = document.querySelector(".message.bot:last-child");
    if (typing) typing.remove();
    addMessage(data.response, "bot");
  } catch {
    addMessage("Ups... no puedo responder ahora 😢", "bot");
  }
});

function addMessage(text, sender) {
  const chatBox = document.getElementById("chatBox");
  const div = document.createElement("div");
  div.classList.add("message", sender);
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}
