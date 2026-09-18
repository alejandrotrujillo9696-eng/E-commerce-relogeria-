import {
  requestPasswordReset as requestPasswordResetService,
  resetPassword as resetPasswordService,
} from '../services/passwordResetService.js';

const genericResponse = {
  message: 'Si el correo está registrado, recibirás un enlace de recuperación.',
};

export const requestPasswordReset = async (req, res) => {
  try {
    await requestPasswordResetService(req.body?.email);
    res.json({
      success: true,
      data: genericResponse,
    });
  } catch (error) {
    console.error('No fue posible procesar la solicitud de recuperación.');
    res.json({
      success: true,
      data: genericResponse,
    });
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    await resetPasswordService(req.body?.token, req.body?.password);
    res.json({
      success: true,
      data: { message: 'Contraseña actualizada correctamente.' },
    });
  } catch (error) {
    next(error);
  }
};