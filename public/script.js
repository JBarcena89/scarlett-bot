async function sendMessage() {
  const input = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');
  const typing = document.getElementById('typing-indicator');

  if (!input.value.trim()) return;

  const userMsg = document.createElement('div');
  userMsg.className = 'message user';
  userMsg.innerText = input.value;
  chatBox.appendChild(userMsg);

  const userText = input.value;
  input.value = '';

  typing.style.display = 'block';
  chatBox.scrollTop = chatBox.scrollHeight;

  const response = await fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userText })
  });

  const result = await response.json();
  setTimeout(() => {
    typing.style.display = 'none';
    const botMsg = document.createElement('div');
    botMsg.className = 'message bot';
    botMsg.innerHTML = result.response.replace(/\n/g, '<br/>');
    chatBox.appendChild(botMsg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }, Math.floor(Math.random() * 2000) + 3000); // 3-5 segundos
}
