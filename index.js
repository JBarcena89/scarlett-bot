import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import winston from 'winston';

// Importación de rutas
import webchatRoutes from './routes/webchat.js';
import telegramRoutes from './routes/telegram.js';
import whatsappRoutes from './routes/whatsapp.js';  // Nueva ruta WhatsApp
import adminRoutes from './routes/admin.js';

// Configuración inicial
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

// Configuración de logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.simple()
      })
    ] : [])
  ]
});

// Inicializar Express
const app = express();

// Middlewares de seguridad
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Demasiadas solicitudes desde esta IP, por favor intenta más tarde'
});
app.use(limiter);

// Configuración de rutas
app.use('/chat', webchatRoutes);
app.use('/telegram', telegramRoutes);
app.use('/whatsapp', whatsappRoutes);  // Ruta WhatsApp
app.use('/admin', adminRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Conexión a MongoDB con manejo de errores
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: 'majority'
    });
    logger.info('✅ Conectado a MongoDB');
  } catch (err) {
    logger.error('❌ Error de conexión a MongoDB:', err);
    process.exit(1);
  }
};

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ 
    error: 'Algo salió mal',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    logger.info(`🚀 Servidor escuchando en el puerto ${PORT}`);
    logger.info(`🔗 URL: ${process.env.DOMAIN || `http://localhost:${PORT}`}`);
    
    // Verificar variables de entorno críticas
    const requiredVars = ['MONGODB_URI', 'OPENAI_API_KEY', 'TELEGRAM_BOT_TOKEN'];
    requiredVars.forEach(varName => {
      logger.info(`🔧 ${varName}: ${process.env[varName] ? '✅ configurada' : '❌ faltante'}`);
    });
    
    // Verificar integraciones opcionales
    if (process.env.WHATSAPP_TOKEN) {
      logger.info('🔧 WhatsApp: ✅ integración configurada');
    } else {
      logger.warn('🔧 WhatsApp: ⚠️ integración no configurada');
    }
  });
};

startServer();

// Manejo de cierre limpio
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('🛑 Servidor detenido correctamente');
  process.exit(0);
});
