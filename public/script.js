// Variables globales
let userName = '';
let userEmail = '';
let userId = '';

// Cargar datos del localStorage si existen
window.onload = function() {
  const savedName = localStorage.getItem("name");
  const savedEmail = localStorage.getItem("email");
  const savedUserId = localStorage.getItem("userId");

  if (savedName && savedEmail && savedUserId) {
    userName = savedName;
    userEmail = savedEmail;
    userId = savedUserId;
    document.getElementById("form-screen").style.display = "none";
    document.getElementById("chat-screen").style.display = "block";
    loadChatHistory(userEmail);
    appendMessage("Scarlett", `Hola de nuevo ${userName}, ¡cuánto te he extrañado! 😘 ¿En qué puedo ayudarte hoy?`);
  }
};

// Iniciar chat
async function startChat() {
  userName = document.getElementById("name").value.trim();
  userEmail = document.getElementById("email").value.trim();

  if (!userName || !userEmail) {
    showError("Por favor ingresa tu nombre y correo.");
    return;
  }

  if (!validateEmail(userEmail)) {
    showError("Por favor ingresa un correo electrónico válido.");
    return;
  }

  userId = `web_${userEmail}_${Date.now()}`;
  localStorage.setItem("name", userName);
  localStorage.setItem("email", userEmail);
  localStorage.setItem("userId", userId);

  document.getElementById("form-screen").style.display = "none";
  document.getElementById("chat-screen").style.display = "block";

  // Mostrar mensaje de bienvenida con efecto de escritura
  typeWriterEffect(`Hola ${userName}, soy Scarlett 💋 Estoy aquí para lo que necesites...`, "Scarlett");
  
  // Cargar historial si existe
  await loadChatHistory(userEmail);
}

// Validar email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Mostrar errores
function showError(message) {
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  
  const form = document.getElementById("form-screen");
  const existingError = form.querySelector('.error-message');
  if (existingError) {
    form.removeChild(existingError);
  }
  
  form.insertBefore(errorElement, form.querySelector('button'));
  
  // Eliminar el mensaje después de 3 segundos
  setTimeout(() => {
    if (errorElement.parentNode) {
      errorElement.parentNode.removeChild(errorElement);
    }
  }, 3000);
}

// Efecto de máquina de escribir
function typeWriterEffect(text, sender, callback) {
  let i = 0;
  const speed = 20;
  const chatBox = document.getElementById("chat-box");
  const messageElement = document.createElement('div');
  messageElement.className = `message ${sender === 'Scarlett' ? 'bot' : 'user'}`;
  chatBox.appendChild(messageElement);
  
  function type() {
    if (i < text.length) {
      messageElement.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
      chatBox.scrollTop = chatBox.scrollHeight;
    } else if (callback) {
      callback();
    }
  }
  
  type();
}

// Enviar mensaje
async function sendMessage() {
  const userInput = document.getElementById("user-input");
  const message = userInput.value.trim();
  
  if (!message) return;
  
  // Mostrar mensaje del usuario inmediatamente
  appendMessage("Tú", message);
  userInput.value = '';
  
  try {
    // Mostrar indicador de que Scarlett está escribiendo
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot typing';
    typingIndicator.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    document.getElementById("chat-box").appendChild(typingIndicator);
    document.getElementById("chat-box").scrollTop = document.getElementById("chat-box").scrollHeight;
    
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: userName,
        email: userEmail,
        message: message
      })
    });
    
    // Eliminar indicador de escritura
    document.getElementById("chat-box").removeChild(typingIndicator);
    
    const data = await response.json();
    // Mostrar respuesta con efecto de escritura
    typeWriterEffect(data.response, "Scarlett");
    
  } catch (error) {
    console.error('Error:', error);
    appendMessage("Scarlett", "Ups, algo salió mal 💔 Por favor inténtalo de nuevo.");
  }
}

// Respuestas rápidas
function sendQuickReply(message) {
  const userInput = document.getElementById("user-input");
  userInput.value = message;
  sendMessage();
}

// Añadir mensaje al chat
function appendMessage(sender, message) {
  const chatBox = document.getElementById("chat-box");
  const messageElement = document.createElement('div');
  messageElement.className = `message ${sender === 'Tú' ? 'user' : 'bot'}`;
  
  // Formatear URLs como enlaces
  const formattedMessage = message.replace(
    /(https?:\/\/[^\s]+)/g, 
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  
  messageElement.innerHTML = `
    <strong>${sender}:</strong> ${formattedMessage}
  `;
  
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Cargar historial de chat
async function loadChatHistory(email) {
  try {
    const res = await fetch(`/chat/history/${email}`);
    if (!res.ok) throw new Error('Error al cargar historial');
    
    const history = await res.json();
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = ''; // Limpiar chat antes de cargar historial
    
    history.forEach((msg) => {
      const sender = msg.sender === "user" ? "Tú" : "Scarlett";
      const messageElement = document.createElement('div');
      messageElement.className = `message ${sender === 'Tú' ? 'user' : 'bot'}`;
      messageElement.innerHTML = `<strong>${sender}:</strong> ${msg.message}`;
      chatBox.appendChild(messageElement);
    });
    
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (error) {
    console.error("Error cargando historial:", error);
  }
}

// PayPal Integration
function initiatePaypalPayment() {
  // Mostrar mensaje mientras se carga PayPal
  appendMessage("Scarlett", "Estoy preparando todo para que puedas hacerme un regalo... 💕");
  
  paypal.Buttons({
    style: {
      color: 'gold',
      shape: 'pill',
      label: 'pay',
      height: 40
    },
    createOrder: function(data, actions) {
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: '10.00',
            currency_code: 'USD'
          },
          description: 'Donación para contenido especial de Scarlett'
        }],
        application_context: {
          shipping_preference: 'NO_SHIPPING'
        }
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(function(details) {
        // Mostrar mensaje de agradecimiento
        appendMessage("Scarlett", `¡Gracias por tu generosidad, ${details.payer.name.given_name}! 💋`);
        appendMessage("Scarlett", "Ahora tendrás acceso especial a mi contenido VIP 😘");
        
        // Opcional: Registrar la donación en tu backend
        fetch('/record-donation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            amount: 10.00,
            payer: details.payer,
            paypalId: data.orderID
          })
        }).catch(e => console.error('Error registrando donación:', e));
      });
    },
    onError: function(err) {
      console.error('Error en PayPal:', err);
      appendMessage("Scarlett", "Ups, algo salió mal con el pago 💔 ¿Podrías intentarlo de nuevo?");
    }
  }).render('.paypal-btn');
}

// Permitir enviar mensaje con Enter
document.getElementById("user-input").addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
});
