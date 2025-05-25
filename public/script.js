let userName = '';
let userEmail = '';

const loginForm = document.getElementById('login-form');
const chatSection = document.getElementById('chat-section');
const chatForm = document.getElementById('chat-form');
const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('user-input');
const typingIndicator = document.getElementById('typing');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  userName = document.getElementById('name').value;
  userEmail = document.getElementById('email').value;
  loginForm.style.display = 'none';
  chatSection.style.display = 'block';
  appendMessage('bot', `Hola ${userName} 💖... Qué rico tenerte aquí. ¿Listo para jugar y conocernos más profundamente? 😘`);
});

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (message === '') return;

  appendMessage('user', message);
  userInput.value = '';
  typingIndicator.style.display = 'block';

  try {
    const res = await fetch('/webchat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: userName,
        email: userEmail,
        message: message
      })
    });

    const data = await res.json();
    setTimeout(() => {
      typingIndicator.style.display = 'none';
      appendMessage('bot', data.reply);
    }, 3000); // Simula 3 segundos "escribiendo..."
  } catch (error) {
    typingIndicator.style.display = 'none';
    appendMessage('bot', 'Ups... algo falló. Pero no te preocupes, amor, vuelve a intentarlo. 💋');
  }
});

function appendMessage(sender, text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;
  messageDiv.innerText = text;
  chatbox.appendChild(messageDiv);
  chatbox.scrollTop = chatbox.scrollHeight;
}

function sendLink(type) {
  let url = '';
  let flirt = '';

  switch (type) {
    case 'vip':
      url = 'https://tulink.com/vip'; // 🔁 Cambia por tu link real
      flirt = 'Aquí tienes mi 🔥 contenido VIP, solo para mis amores más intensos... 💋';
      break;
    case 'canal':
      url = 'https://t.me/scarlettchannel'; // 🔁 Tu canal real
      flirt = 'Mi canal está lleno de sorpresas... ¿Te atreves a entrar? 😈';
      break;
    case 'redes':
      url = 'https://linktr.ee/scarlett'; // 🔁 Tus redes o Linktree
      flirt = 'Estas son mis redes, bebé... sígueme y juguemos más 💕';
      break;
    case 'paypal':
      url = 'https://paypal.me/tulink'; // 🔁 Tu PayPal
      flirt = 'Si quieres consentirme... aquí puedes hacerlo 💸💋';
      break;
  }

  window.open(url, '_blank');
  appendMessage('bot', flirt);
}
