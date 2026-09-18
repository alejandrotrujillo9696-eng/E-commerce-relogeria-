import 'dotenv/config';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import { ensureSocialAuthColumns, verifyDatabaseConnection } from './config/db.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import {
  ensureCsrfCookie,
  getCsrfToken,
  validateCsrfToken,
} from './middleware/csrfMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import { authenticate } from './middleware/authMiddleware.js';
import cartRoutes from './routes/cartRoutes.js';
import homeSectionPublicRoutes from './routes/homeSectionPublicRoutes.js';
import homeSectionRoutes from './routes/homeSectionRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const requiredVariables = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];
const missingVariables = requiredVariables.filter(
  (variable) => !process.env[variable]
);

if (missingVariables.length) {
  throw new Error(`Faltan variables de entorno: ${missingVariables.join(', ')}`);
}

const app = express();
const port = Number(process.env.PORT || 3001);

app.set('trust proxy', 1);

app.disable('x-powered-by');

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL
      ?.split(',')
      .map((url) => url.trim()),
    credentials: true,
  })
);

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.get('/api/health', ensureCsrfCookie, async (_req, res, next) => {
  try {
    await ensureSocialAuthColumns();
    await verifyDatabaseConnection();

    res.json({
      success: true,
      data: { status: 'ok' },
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/csrf-token', (req, res) => {
  const token = getCsrfToken(req, res);

  res.json({
    success: true,
    data: { token },
  });
});

app.use('/api/auth', authRoutes);

app.use('/api/products', ensureCsrfCookie, productRoutes);

app.use('/api/home-section', homeSectionPublicRoutes);

app.use('/api/cart', authenticate, validateCsrfToken, cartRoutes);

app.use('/api/orders', authenticate, validateCsrfToken, orderRoutes);

app.use('/api/admin/home-section', validateCsrfToken, homeSectionRoutes);

app.use('/api/admin', validateCsrfToken, adminRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

const isTest = process.env.NODE_ENV === 'test';

const startServer = async () => {
  if (isTest) return;

  try {
    await verifyDatabaseConnection();

    app.listen(port, () => {
      console.log(`API disponible en http://localhost:${port}`);
    });
  } catch (error) {
    console.error('No fue posible conectar con MySQL al iniciar la API.');
    console.error(error.message);
    process.exit(1);
  }
};

export { app };

startServer();