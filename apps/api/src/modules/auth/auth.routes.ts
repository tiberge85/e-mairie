import { Router } from 'express';
import { asyncHandler } from '../../http/asyncHandler';
import { authController } from './auth.controller';

export const authRoutes = Router();

authRoutes.post('/inscription', asyncHandler(authController.inscription));
authRoutes.post('/otp', asyncHandler(authController.verificationOtp));
authRoutes.post('/connexion', asyncHandler(authController.connexion));
