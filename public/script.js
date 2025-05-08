const formContainer = document.getElementById('form-container');
const chatContainer = document.getElementById('chat-container');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const registerBtn = document.getElementById('register-btn');
const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

let user = {
  name: localStorage.getItem('name') || '',
  email: localStorage.getItem('email') || ''
};

// Mostrar formulario si no hay datos guardados
if (!user.name || !user.email) {
  formContainer.style.display = 'block';
  chatContainer.style.display = 'none';
} else {
  formContainer.style.display = 'none';
  chatContainer.style.display = 'block';
}

// Guardar nombre y correo
registerBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();

  if (name && email) {
    localStorage.setItem('name', name);
    localStorage.setItem('email', email);
    user = { name, email };
    formContainer.style.display = 'none';
    chatContainer.style.display = 'block';
  } else {
    alert('Por favor, ingresa tu nombre y correo 💖');
  }
});

// Enviar mensaje
sendBtn.addEventListener('click', async () => {
  const message = messageInput.value.trim();
  if (!message) return;

  appendMessage(user.name, message);
  messageInput.value = '';

  // Mostrar que Scarlett está escribiendo
  const typingMsg = document.createElement('div');
  typingMsg.classList.add('message');
  typingMsg.innerHTML = `<strong>Scarlett:</strong> <em>escribiendo...</em>`;
  chatBox.appendChild(typingMsg);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Espera 5 segundos
  await new Promise(resolve => setTimeout(resolve, 5000));

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    chatBox.removeChild(typingMsg);
    appendMessage('Scarlett', data.response);
  } catch (err) {
    chatBox.removeChild(typingMsg);
    appendMessage('Scarlett', "Ups... no pude responderte, bebé 😢");
  }
});

function appendMessage(sender, text) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message');
  msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}
