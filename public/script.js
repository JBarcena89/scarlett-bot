const form = document.querySelector("form");
const input = document.getElementById("messageInput");
const chatBox = document.getElementById("chatBox");
const nameInput = document.getElementById("userName");
const emailInput = document.getElementById("userEmail");
const buttons = document.querySelectorAll(".chat-buttons button");

function addMessage(text, sender) {
  const div = document.createElement("div");
  div.classList.add("message", sender);
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();

  if (!name || !email || !message) return;

  const userId = btoa(email); // usar email como ID codificado
  addMessage(message, "user");
  input.value = "";

  addMessage("Scarlett está escribiendo... 💋", "bot");

  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, userId })
  });

  const data = await res.json();
  const typingEl = chatBox.querySelector(".message.bot:last-child");
  if (typingEl) typingEl.remove();
  if (data.response) addMessage(data.response, "bot");
});

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    let text = "";
    if (btn.id === "vip") {
      text = "🔥 ¿Quieres algo rico? Aquí están mis enlaces más calientes:\n💋 VIP: https://fanlove.mx/scarlettWilson363";
    } else if (btn.id === "canal") {
      text = "📸 Este es mi canal privado, bebé:\n👉 https://t.me/scarletoficial";
    } else if (btn.id === "socials") {
      text = "💖 Aquí están todas mis redes lindas:\n🌐 https://www.atom.bio/scarlettwilson363";
    }
    addMessage(text, "bot");
  });
});
