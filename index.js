// Importación del framework Express
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Inicializa la aplicación de Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para analizar el cuerpo de las solicitudes
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Inicializa la integración con Telegram
require('./telegram')(app);

// Ruta principal para servir la interfaz web
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor en funcionamiento en el puerto ${PORT}`);
});
