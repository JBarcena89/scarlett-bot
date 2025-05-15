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
  localStorage.setItem("email", userEmail); // Guardamos el email para seguimiento

  document.getElementById("form-screen").style.display = "none";
  document.getElementById("chat-screen").style.display = "block";

  appendMessage("Scar
