require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const webchatRoutes = require("./routes/webchat");
const telegramRoutes = require("./routes/telegram");
const facebookRoutes = require("./routes/facebook");

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Rutas
app.use("/chat", webchatRoutes);
app.use("/telegram", telegramRoutes);
app.use("/facebook", facebookRoutes);

// Ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Conexión a MongoDB y arranque del servidor
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🔥 Scarlett está activa en http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("Error de conexión MongoDB:", err));
