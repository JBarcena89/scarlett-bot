const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message');

document.getElementById('chat-form').addEventListener('submit', handleSubmit);

// Enter para enviar
messageInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    document.getElementById('chat-form').dispatchEvent(new Event('submit'));
  }
});

async function handleSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = messageInput.value.trim();
  if (!name || !email || !message) return;

  agregarMensaje(message, 'user'); // Mostrar mensaje del usuario
  showTypingDots();

  messageInput.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    await new Promise(resolve => setTimeout(resolve, 4000 + Math.random() * 2000)); // 4-6 seg

    const res = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });

    const data = await res.json();
    removeTypingDots();

    if (data.reply) {
      agregarMensaje(data.reply, 'bot');
    } else {
      agregarMensaje('Lo siento, ocurrió un error.', 'bot');
    }
  } catch (err) {
    console.error(err);
    removeTypingDots();
    agregarMensaje('Error de conexión.', 'bot');
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}

// Mostrar mensaje en burbuja
function agregarMensaje(texto, tipo = 'bot') {
  const mensaje = document.createElement('div');
  mensaje.className = `bubble ${tipo}`;
  mensaje.innerHTML = texto;
  chatBox.appendChild(mensaje);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Mostrar "escribiendo..."
function showTypingDots() {
  const typing = document.createElement('div');
  typing.id = 'typing';
  typing.className = 'bubble bot';
  typing.innerHTML = '<span class="dotting"></span>';
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Quitar "escribiendo..."
function removeTypingDots() {
  const typing = document.getElementById('typing');
  if (typing) typing.remove();
}

// Botones rápidos
function mostrarMensaje(tipo) {
  let mensaje = '';
  if (tipo === 'contenido') {
    mensaje = 'Aquí tienes mi contenido VIP 😘 👉 <a href="https://mi-contenido-vip.com" target="_blank">https://mi-contenido-vip.com</a>';
  } else if (tipo === 'canal') {
    mensaje = 'Únete a mi canal de Telegram 💋 👉 <a href="https://t.me/scarlettbot" target="_blank">https://t.me/scarlettbot</a>';
  } else if (tipo === 'redes') {
    mensaje = 'Sígueme en todas mis redes 🌐 👉 <a href="https://linktr.ee/scarlettbot" target="_blank">https://linktr.ee/scarlettbot</a>';
  }

  agregarMensaje(mensaje, 'bot');
}
