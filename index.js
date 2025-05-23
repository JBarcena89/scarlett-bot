const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

require('./telegram')(app);
require('./webchat')(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Scarlett está en línea 💖 en el puerto ${PORT}`);
});

