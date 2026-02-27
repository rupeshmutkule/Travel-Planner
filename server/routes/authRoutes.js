import express from 'express';
import { register, login, sendOTP, verifyForgotPasswordOTP, resetPassword, verifyEmailExists } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOTP);
router.post('/verify-email-exists', verifyEmailExists);
router.post('/verify-forgot-password-otp', verifyForgotPasswordOTP);
router.post('/reset-password', resetPassword);

export default router;
