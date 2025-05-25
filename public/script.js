let name = "";
let email = "";

document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();
  name = document.getElementById('name').value;
  email = document.getElementById('email').value;

  document.getElementById('login-form').style.display = 'none';
  document.getElementById('chat-section').style.display = 'block';
});

document.getElementById('chat-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const userInput = document.getElementById('user-input').value;
  appendMessage('user', userInput);
  document.getElementById('user-input').value = '';

  // Mostrar "Scarlett está escribiendo..."
  document.getElementById('typing').style.display = 'block';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message: userInput })
    });

    const data = await response.json();

    // Esperar para simular "escribiendo..."
    setTimeout(() => {
      appendMessage('bot', data.reply);
      document.getElementById('typing').style.display = 'none';
    }, Math.floor(Math.random() * 3000) + 2000); // entre 2 y 5 segundos
  } catch (error) {
    appendMessage('bot', 'Oops, algo falló amor 😢');
    document.getElementById('typing').style.display = 'none';
  }
});

function appendMessage(sender, message) {
  const chatbox = document.getElementById('chatbox');
  const div = document.createElement('div');
  div.classList.add('message', sender);
  div.innerText = sender === 'user' ? `Tú: ${message}` : `Scarlett: ${message}`;
  chatbox.appendChild(div);
  chatbox.scrollTop = chatbox.scrollHeight;
}
