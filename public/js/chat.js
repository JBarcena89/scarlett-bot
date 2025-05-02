const chatBox = document.getElementById('chat-box');
const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const typingIndicator = document.getElementById('typing-indicator');

function addMessage(sender, text) {
  const message = document.createElement('div');
  message.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userText = input.value.trim();
  if (!userText) return;

  addMessage('Tú', userText);
  input.value = '';

  typingIndicator.classList.remove('hidden');

  const res = await fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userText })
  });

  const data = await res.json();
  typingIndicator.classList.add('hidden');
  addMessage('Scarlett', data.reply);
});