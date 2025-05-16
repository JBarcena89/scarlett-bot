const express = require("express");
const router = express.Router();
const Click = require("../models/Click");

const BASIC_USER = process.env.ADMIN_USER;
const BASIC_PASS = process.env.ADMIN_PASS;

// Middleware de autenticación básica
router.use((req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Admin Area"');
    return res.status(401).send("Authentication required.");
  }

  const base64Credentials = auth.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
  const [username, password] = credentials.split(":");

  if (username === BASIC_USER && password === BASIC_PASS) {
    return next();
  }

  res.setHeader("WWW-Authenticate", 'Basic realm="Admin Area"');
  return res.status(401).send("Invalid credentials.");
});

// Página HTML del panel
router.get("/", (req, res) => {
  res.sendFile("admin.html", { root: "./public" });
});

// Datos para las gráficas
router.get("/stats", async (req, res) => {
  try {
    const clicks = await Click.find({});
    const stats = {};
    const uniqueUsers = new Set();

    clicks.forEach((click) => {
      stats[click.button] = (stats[click.button] || 0) + 1;
      uniqueUsers.add(click.userId);
    });

    res.json({
      stats,
      uniqueUsers: uniqueUsers.size,
    });
  } catch (err) {
    console.error("Error obteniendo estadísticas:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

module.exports = router;
