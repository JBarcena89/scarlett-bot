let name = '', email = '';

document.getElementById('user-form').addEventListener('submit', (e) => {
  e.preventDefault();
  name = document.getElementById('name').value;
  email = document.getElementById('email').value;
  document.getElementById('user-form').classList.add('hidden');
  document.getElementById('chat-box').classList.remove('hidden');
});

document.getElementById('chat-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = document.getElementById('message').value;
  appendMessage('user', message);
  document.getElementById('message').value = '';

  const res = await fetch('/api/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, message })
  });

  const data = await res.json();
  appendMessage('bot', data.reply);
});

function appendMessage(sender, text) {
  const chatBox = document.getElementById('chat-messages');
  const msg = document.createElement('div');
  msg.className = sender;
  msg.innerText = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
