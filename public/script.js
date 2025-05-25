document.getElementById('chat-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  if (!name || !email || !message) return;

  const chatBox = document.getElementById('chat-box');
  chatBox.innerHTML += `<p><strong>${name}:</strong> ${message}</p>`;
  chatBox.scrollTop = chatBox.scrollHeight;

  document.getElementById('message').value = '';

  try {
    const res = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });
    const data = await res.json();
    if (data.reply) {
      chatBox.innerHTML += `<p><strong>Scarlett:</strong> ${data.reply}</p>`;
      chatBox.scrollTop = chatBox.scrollHeight;
    } else {
      chatBox.innerHTML += `<p><strong>Scarlett:</strong> Lo siento, ocurrió un error.</p>`;
    }
  } catch (err) {
    console.error(err);
    chatBox.innerHTML += `<p><strong>Scarlett:</strong> Error de conexión.</p>`;
  }
});
