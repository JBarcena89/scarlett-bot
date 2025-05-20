// Configuración inicial
let userName, userEmail, userId;
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');

// Utilidades
const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

const formatMessage = (text) => {
  return escapeHtml(text)
    .replace(/\n/g, '<br>')
    .replace(/:\)/g, '😊')
    .replace(/:\(/g, '😢')
    .replace(/:D/g, '😃')
    .replace(/<3/g, '❤️');
};

// Funciones principales
const appendMessage = (sender, message) => {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender === 'Tú' ? 'user' : 'bot'}`;
  
  messageDiv.innerHTML = `
    <div class="message-sender">${sender}</div>
    <div class="message-content">${formatMessage(message)}</div>
    <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
  `;
  
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
};

const showTypingIndicator = () => {
  const typingDiv = document.createElement('div');
  typingDiv.id = 'typing-indicator';
  typingDiv.className = 'typing-indicator';
  typingDiv.innerHTML = `
    <div class="typing-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="typing-text">Scarlett está escribiendo...</div>
  `;
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
};

const hideTypingIndicator = () => {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) indicator.remove();
};

const sendMessage = async () => {
  const message = userInput.value.trim();
  if (!message) return;
  
  appendMessage('Tú', message);
  userInput.value = '';
  showTypingIndicator();
  
  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userName,
        email: userEmail,
        message
      })
    });
    
    if (!response.ok) throw new Error('Error en la respuesta');
    
    const data = await response.json();
    hideTypingIndicator();
    
    if (data.response) {
      setTimeout(() => {
        appendMessage('Scarlett', data.response);
      }, 1000);
    } else {
      throw new Error('Respuesta vacía');
    }
  } catch (error) {
    hideTypingIndicator();
    appendMessage('Scarlett', 'Ups, algo salió mal. Inténtalo de nuevo, cariño 😘');
    console.error('Error:', error);
  }
};

const sendQuickReply = (message) => {
  userInput.value = message;
  sendMessage();
};

const loadChatHistory = async (userId) => {
  try {
    const response = await fetch(`/chat/history/${userId}`);
    if (!response.ok) return;
    
    const history = await response.json();
    history.forEach(msg => {
      const sender = msg.role === 'user' ? 'Tú' : 'Scarlett';
      appendMessage(sender, msg.content);
    });
  } catch (error) {
    console.error('Error cargando historial:', error);
  }
};

const startChat = async () => {
  userName = document.getElementById('name').value.trim();
  userEmail = document.getElementById('email').value.trim();

  if (!userName || !userEmail) {
    alert('Por favor ingresa tu nombre y un correo válido.');
    return;
  }

  userId = `${userEmail}_${Date.now()}`;
  localStorage.setItem('name', userName);
  localStorage.setItem('email', userEmail);
  localStorage.setItem('userId', userId);

  document.getElementById('form-screen').style.display = 'none';
  document.getElementById('chat-screen').style.display = 'flex';

  // Mensaje de bienvenida con retardo
  setTimeout(() => {
    appendMessage('Scarlett', `Hola ${userName} 💋`);
    setTimeout(() => {
      appendMessage('Scarlett', '¿En qué puedo ayudarte hoy, amor?');
    }, 1000);
  }, 1500);

  await loadChatHistory(userId);
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Cargar datos guardados
  const savedName = localStorage.getItem('name');
  const savedEmail = localStorage.getItem('email');
  
  if (savedName && savedEmail) {
    document.getElementById('name').value = savedName;
    document.getElementById('email').value = savedEmail;
  }
  
  // Enviar mensaje con Enter
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
  
  // Botón de enviar
  document.querySelector('.send-button').addEventListener('click', sendMessage);
});
