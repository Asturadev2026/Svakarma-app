import { Router } from 'express';
import { authController } from './auth.controller';

const router = Router();

router.post('/send-otp', (req, res, next) => {
  authController.sendOtp(req, res, next);
});

router.post('/verify-otp', (req, res, next) => {
  authController.verifyOtp(req, res, next);
});

export default router;
