import User from "../models/User.js";
import OTP from "../models/OTP.js";
import { sendOTPEmail } from "../utils/emailService.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// JWT

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};


// SEND OTP

export const sendOTP = async (req, res) => {
  console.log(" SEND OTP API HIT");

  try {
    const { email, mobileNumber, purpose } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check user existence based on purpose
    let userExists;
    
    if (purpose === "forgot-password") {
      // For forgot password, only check email
      userExists = await User.findOne({ email });
    } else {
      // For register/login, check both email and mobile
      userExists = await User.findOne({
        $or: [{ email }, { mobileNumber }],
      });
    }

    if (purpose === "register" && userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    if ((purpose === "login" || !purpose) && !userExists) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // ✅ CHECK USER EXISTS BEFORE SENDING EMAIL FOR FORGOT PASSWORD
    if (purpose === "forgot-password" && !userExists) {
      return res.status(404).json({ message: "User not found. Please create an account." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`OTP for ${email}: ${otp}`);

    // 🔴 DELETE OLD OTPs (IMPORTANT FIX)
    await OTP.deleteMany({ email });

    // ⏱ EMAIL TIMEOUT FIX (CRITICAL)
    const emailPromise = sendOTPEmail(email, otp);

    const emailSent = await Promise.race([
      emailPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("EMAIL_TIMEOUT")), 7000)
      ),
    ]);

    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send OTP" });
    }

    // Save OTP ONLY if email succeeded
    await OTP.create({ email, otp, purpose: purpose || 'register' });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("SEND OTP ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message:
        error.message === "EMAIL_TIMEOUT"
          ? "Email service timeout. Try again."
          : "Internal server error",
    });
  }
};


// REGISTER

export const register = async (req, res) => {
  try {
    const { name, email, mobileNumber, password, otp } = req.body;

    // Password validation
    if (!password || password.length < 6 || password.length > 14) {
      return res.status(400).json({ message: "Password must be between 6 and 14 characters" });
    }

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const userExists = await User.findOne({
      $or: [{ email }, { mobileNumber }],
    });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      mobileNumber,
      password,
    });

    await OTP.deleteMany({ email });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(" REGISTER ERROR:", error.message);
    res.status(500).json({ message: "Registration failed" });
  }
};


// LOGIN

export const login = async (req, res) => {
  try {
    const { loginIdentifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: loginIdentifier }, { mobileNumber: loginIdentifier }],
    });

    if (user && (await user.comparePassword(password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        token: generateToken(user._id),
      });
    }

    return res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    console.error(" LOGIN ERROR:", error.message);
    res.status(500).json({ message: "Login failed" });
  }
};


// VERIFY OTP FOR FORGOT PASSWORD

export const verifyForgotPasswordOTP = async (req, res) => {
  console.log("🔍 VERIFY FORGOT PASSWORD OTP API HIT");
  
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const otpRecord = await OTP.findOne({ email, otp, purpose: 'forgot-password' });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("🔴 VERIFY OTP ERROR:", error.message);
    res.status(500).json({ message: "OTP verification failed" });
  }
};


// RESET PASSWORD

export const resetPassword = async (req, res) => {
  console.log("🔐 RESET PASSWORD API HIT");
  
  try {
    const { email, otp, newPassword } = req.body;

    // Password validation
    if (!newPassword || newPassword.length < 6 || newPassword.length > 14) {
      return res.status(400).json({ message: "Password must be between 6 and 14 characters" });
    }

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const otpRecord = await OTP.findOne({ email, otp, purpose: 'forgot-password' });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = newPassword;
    await user.save();

    await OTP.deleteMany({ email });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("🔴 RESET PASSWORD ERROR:", error.message);
    res.status(500).json({ message: "Password reset failed" });
  }
};


// VERIFY EMAIL EXISTS (FOR FORGOT PASSWORD)

export const verifyEmailExists = async (req, res) => {
  console.log("📧 VERIFY EMAIL EXISTS API HIT");
  
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const userExists = await User.findOne({ email });

    if (!userExists) {
      return res.status(404).json({ 
        success: false,
        message: "User not found. Please create an account." 
      });
    }

    return res.status(200).json({
      success: true,
      message: "User verified successfully",
    });
  } catch (error) {
    console.error("🔴 VERIFY EMAIL ERROR:", error.message);
    res.status(500).json({ message: "Email verification failed" });
  }
};
