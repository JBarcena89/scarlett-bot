function appendMessage(text, className) {
  const chatBox = document.getElementById('chat-box');
  const message = document.createElement('div');
  message.className = className;
  message.textContent = text;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function typingAnimation() {
  const chatBox = document.getElementById('chat-box');
  const typing = document.createElement('div');
  typing.className = 'bot-message';
  typing.textContent = 'Escribiendo';
  chatBox.appendChild(typing);

  let dots = 0;
  const interval = setInterval(() => {
    dots = (dots + 1) % 4;
    typing.textContent = 'Escribiendo' + '.'.repeat(dots);
  }, 500);

  return { typing, interval };
}

async function sendMessage() {
  const input = document.getElementById('user-input');
  const text = input.value.trim();
  if (!text) return;

  appendMessage(text, 'user-message');
  input.value = '';

  const { typing, interval } = typingAnimation();

  await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
  clearInterval(interval);
  typing.remove();

  const res = await fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text })
  });

  const data = await res.json();
  appendMessage(data.response, 'bot-message');
}

document.getElementById('user-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});
