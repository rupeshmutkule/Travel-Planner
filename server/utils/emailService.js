import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // MUST include spaces
  },
});

export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"${process.env.EMAIL_APP_NAME || "Travel Planner"}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP for Travel Planner",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif">
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <h1 style="letter-spacing: 5px; color: #0ea5e9">${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
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