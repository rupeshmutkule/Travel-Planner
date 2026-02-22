import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { sendOTPEmail } from '../utils/emailService.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const sendOTP = async (req, res) => {
  try {
    const { email, mobileNumber, purpose } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const userExists = await User.findOne({ $or: [{ email }, { mobileNumber }] });
    
    // If purpose is register, user should NOT exist
    if (purpose === 'register' && userExists) {
      return res.status(400).json({ message: 'User with this email or mobile number already exists' });
    }

    // Default or formal check: if we are trying to login/identify, user SHOULD exist
    if ((purpose === 'login' || !purpose) && !userExists) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`OTP for ${email}: ${otp}`); // Temporary log for testing
    
    // Save OTP to DB
    await OTP.create({ email, otp });

    // Send Email
    const emailSent = await sendOTPEmail(email, otp);

    if (emailSent) {
      res.status(200).json({ message: 'OTP sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send OTP' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const register = async (req, res) => {
  try {
    const { name, email, mobileNumber, password, otp } = req.body;

    // Verify OTP
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const userExists = await User.findOne({ $or: [{ email }, { mobileNumber }] });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email or mobile number already exists' });
    }

    const user = await User.create({ name, email, mobileNumber, password });

    if (user) {
      // Delete OTP after successful registration
      await OTP.deleteOne({ _id: otpRecord._id });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { loginIdentifier, password } = req.body; // loginIdentifier can be email or mobileNumber

    const user = await User.findOne({ 
      $or: [{ email: loginIdentifier }, { mobileNumber: loginIdentifier }] 
    });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
