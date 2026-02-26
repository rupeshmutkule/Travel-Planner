import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * 🔐 IMPORTANT FIXES INCLUDED
 * - Force IPv4 (family: 4) → REQUIRED for Render
 * - Explicit SMTP host/port (more reliable than `service`)
 * - Timeouts added to avoid hanging requests
 */

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,          // SSL
  family: 4,             // ⭐ FORCE IPv4 (CRITICAL FIX)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // ✅ MUST KEEP SPACES
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Optional but VERY useful (remove later if you want)
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP VERIFY FAILED:", err.message);
  } else {
    console.log("✅ SMTP SERVER READY (IPv4)");
  }
});

export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"${process.env.EMAIL_APP_NAME || "Travel Planner"}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP for Travel Planner",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height:1.6">
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <h1 style="letter-spacing:5px;color:#0ea5e9">${otp}</h1>
        <p>This OTP will expire in <strong>5 minutes</strong>.</p>
        <p>If you didn’t request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent:", info.response);
    return true;
  } catch (error) {
    console.error("❌ NODEMAILER ERROR:", error.message);
    return false;
  }
};