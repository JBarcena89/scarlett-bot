<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Scarlett - Tu novia virtual 💕</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div id="form-screen">
    <h2>Scarlett 💖</h2>
    <p>Tu novia 24/7, estoy para ti para lo que necesites 😘</p>
    <input type="text" id="name" placeholder="Tu nombre" />
    <input type="email" id="email" placeholder="Tu correo" />
    <button onclick="startChat()">Iniciar Chat</button>
  </div>

  <div id="chat-screen" style="display:none;">
    <div class="chat-box" id="chat-box"></div>
    <input type="text" id="user-input" placeholder="Escríbeme algo..." />
    <button onclick="sendMessage()">Enviar</button>

    <div class="chat-buttons">
      <button class="chat-button" onclick="sendQuickReply('¿Tienes algo sexy para mí?')">Contenido VIP 🔥</button>
      <button class="chat-button" onclick="sendQuickReply('¿Dónde te sigo, amor?')">Mis Redes 💋</button>
      <button class="chat-button" onclick="sendQuickReply('Quiero unirme a tu canal')">Mi Canal 📲</button>
    </div>
  </div>

  <script src="script.js"></script>
</body>
</html>
