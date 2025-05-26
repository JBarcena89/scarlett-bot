document.getElementById('chat-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  if (!name || !email || !message) return;

  const chatBox = document.getElementById('chat-box');
  chatBox.innerHTML += `<p><strong>${name}:</strong> ${message}</p>`;
  chatBox.innerHTML += `<p id="typing"><em>Scarlett está escribiendo...</em></p>`;
  chatBox.scrollTop = chatBox.scrollHeight;

  document.getElementById('message').value = '';

  try {
    await new Promise(resolve => setTimeout(resolve, 6000)); // 6 segundos de espera

    const res = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });
    const data = await res.json();

    document.getElementById('typing')?.remove();

    if (data.reply) {
      chatBox.innerHTML += `<p><strong>Scarlett:</strong> ${data.reply}</p>`;
    } else {
      chatBox.innerHTML += `<p><strong>Scarlett:</strong> Lo siento, ocurrió un error.</p>`;
    }
  } catch (err) {
    console.error(err);
    document.getElementById('typing')?.remove();
    chatBox.innerHTML += `<p><strong>Scarlett:</strong> Error de conexión.</p>`;
  }

  chatBox.scrollTop = chatBox.scrollHeight;
});

// Botones personalizados
function mostrarMensaje(tipo) {
  const chatBox = document.getElementById('chat-box');
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
