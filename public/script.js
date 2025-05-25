document.addEventListener('DOMContentLoaded', () => {
  const chatBox = document.getElementById('chat-box');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');
  const userNameInput = document.getElementById('user-name');
  const userEmailInput = document.getElementById('user-email');
  const userForm = document.getElementById('user-form');
  const chatContainer = document.getElementById('chat-container');

  let userName = '';
  let userEmail = '';

  function addMessage(sender, text) {
    const message = document.createElement('div');
    message.classList.add('message', sender);
    message.textContent = text;
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function addTyping() {
    const typing = document.createElement('div');
    typing.classList.add('message', 'assistant', 'typing');
    typing.textContent = 'Scarlett está escribiendo...';
    chatBox.appendChild(typing);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function removeTyping() {
    const typing = document.querySelector('.typing');
    if (typing) typing.remove();
  }

  function addButtons() {
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');

    const buttons = [
      { text: '💎 Contenido VIP', url: 'https://tu-vip-link.com' },
      { text: '📢 Mi Canal', url: 'https://t.me/tu_canal' },
      { text: '💖 Mis Redes', url: 'https://linktr.ee/ScarlettBot' },
      { text: '💸 Donaciones', url: 'https://paypal.me/tuenlace' }
    ];

    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.textContent = btn.text;
      button.onclick = () => {
        addMessage('user', btn.text);
        addTyping();
        setTimeout(() => {
          removeTyping();
          addMessage('assistant', `Aquí tienes, amor 💕: ${btn.url}`);
          window.open(btn.url, '_blank');
        }, 2000 + Math.random() * 3000);
      };
      buttonContainer.appendChild(button);
    });

    chatBox.appendChild(buttonContainer);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  userForm.addEventListener('submit', (e) => {
    e.preventDefault();
    userName = userNameInput.value.trim();
    userEmail = userEmailInput.value.trim();

    if (userName && userEmail) {
      userForm.style.display = 'none';
      chatContainer.style.display = 'flex';
      addMessage('assistant', `Hola ${userName} 💋, soy Scarlett, tu novia virtual. Estoy aquí para ti 24/7. ¿En qué estás pensando ahora, bebé?`);
      addButtons();
    }
  });

  sendButton.addEventListener('click', async () => {
    const message = userInput.value.trim();
    if (message) {
      addMessage('user', message);
      userInput.value = '';
      addTyping();

      try {
        const response = await fetch('/webchat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: userName, email: userEmail, message })
        });

        const data = await response.json();
        removeTyping();
        addMessage('assistant', data.reply);
      } catch (error) {
        removeTyping();
        addMessage('assistant', 'Lo siento, algo salió mal 😢. Inténtalo más tarde.');
      }
    }
  });
});
