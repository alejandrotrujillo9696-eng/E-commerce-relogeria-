import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  login,
  logout,
  me,
  register,
  socialCallback,
  socialStart,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateCsrfToken } from '../middleware/csrfMiddleware.js';
import {
  requestPasswordReset,
  resetPassword,
} from '../controllers/passwordResetController.js';

const isTest = process.env.NODE_ENV === 'test';

const authLimiter = isTest
  ? (_req, _res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (_req, res) => {
        res.status(429).json({ success: false, message: 'Demasiados intentos de autenticación. Intenta de nuevo más tarde.' });
      },
    });

const loginLimiter = isTest
  ? (_req, _res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (_req, res) => {
        res.status(429).json({ success: false, message: 'Demasiados intentos de autenticación. Intenta de nuevo más tarde.' });
      },
    });

const passwordResetLimiter = isTest
  ? (_req, _res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (_req, res) => {
        res.status(429).json({ success: false, message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' });
      },
    });

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/logout', validateCsrfToken, logout);
router.get('/me', authenticate, me);
router.get('/social/:provider', socialStart);
router.get('/social/:provider/callback', socialCallback);
router.post('/forgot-password', passwordResetLimiter, requestPasswordReset);
router.post('/reset-password', passwordResetLimiter, resetPassword);

export default router;
