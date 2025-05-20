import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import webchatRoutes from './routes/webchat.js';
import telegramRoutes from './routes/telegram.js';
import whatsappRoutes from './routes/whatsapp.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

// Configuración de logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares de seguridad
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Rutas
app.use('/chat', webchatRoutes);
app.use('/telegram', telegramRoutes);
app.use('/whatsapp', whatsappRoutes);
app.use('/admin', adminRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Conexión a MongoDB con reintentos
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => logger.info('✅ Conectado a MongoDB'))
  .catch(err => {
    logger.error('❌ Error de conexión a MongoDB:', err);
    setTimeout(connectWithRetry, 5000);
  });
};

connectWithRetry();

// Manejo de errores
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
