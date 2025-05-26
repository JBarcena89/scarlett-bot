const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message');

document.getElementById('chat-form').addEventListener('submit', handleSubmit);

// Habilita Enter para enviar
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

  chatBox.innerHTML += `<p><strong>${name}:</strong> ${message}</p>`;
  showTypingDots();
  chatBox.scrollTop = chatBox.scrollHeight;

  messageInput.value = '';

  try {
    await new Promise(resolve => setTimeout(resolve, 6000)); // 6 segundos

    const res = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });
    const data = await res.json();

    removeTypingDots();

    if (data.reply) {
      chatBox.innerHTML += `<p><strong>Scarlett:</strong> ${data.reply}</p>`;
    } else {
      chatBox.innerHTML += `<p><strong>Scarlett:</strong> Lo siento, ocurrió un error.</p>`;
    }
  } catch (err) {
    console.error(err);
    removeTypingDots();
    chatBox.innerHTML += `<p><strong>Scarlett:</strong> Error de conexión.</p>`;
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingDots() {
  const typing = document.createElement('p');
  typing.id = 'typing';
  typing.innerHTML = `<strong>Scarlett:</strong> <span class="dotting"></span>`;
  chatBox.appendChild(typing);
}

function removeTypingDots() {
  document.getElementById('typing')?.remove();
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
  chatBox.innerHTML += `<p><strong>Scarlett:</strong> ${mensaje}</p>`;
  chatBox.scrollTop = chatBox.scrollHeight;
}
