async function loadChatHistory(email) {
  try {
    const res = await fetch(`/chat/history/${email}`);
    const history = await res.json();

    history.forEach((msg) => {
      const sender = msg.sender === "user" ? "Tú" : "Scarlett";
      appendMessage(sender, msg.message);
    });
  } catch (error) {
    console.error("Error cargando historial:", error);
  }
}

async function startChat() {
  userName = document.getElementById("name").value.trim();
  userEmail = document.getElementById("email").value.trim();

  if (!userName || !userEmail) {
    alert("Por favor ingresa tu nombre y correo.");
    return;
  }

  userId = `${userEmail}_${Date.now()}`;
  localStorage.setItem("name", userName);
  localStorage.setItem("email", userEmail);
  localStorage.setItem("userId", userId);

  document.getElementById("form-screen").style.display = "none";
  document.getElementById("chat-screen").style.display = "block";

  appendMessage("Scarlett", `Hola ${userName}, ya estoy aquí 😘 ¿Qué quieres hacer hoy?`);

  await loadChatHistory(userEmail); // <-- Cargar historial
}
