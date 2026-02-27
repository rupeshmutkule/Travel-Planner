import SibApiV3Sdk from "sib-api-v3-sdk";

/**
 * Brevo (Sendinblue) Email Service
 * - Uses HTTPS API (Render-safe)
 * - Free: 300 emails/day
 * - Production-ready
 */

// Configure API client
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Transactional email instance
const transactionalApi = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendOTPEmail = async (email, otp) => {
  try {
    const response = await transactionalApi.sendTransacEmail({
      sender: {
        email: process.env.EMAIL_FROM_ADDRESS || "rupeshmutkule2005@gmail.com",
        name: process.env.EMAIL_APP_NAME || "Travel Planner",
      },
      to: [{ email }],
      subject: "Your OTP for Travel Planner",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; line-height:1.6">
          <h2>Email Verification</h2>
          <p>Your OTP is:</p>
          <h1 style="letter-spacing:5px;color:#0ea5e9">${otp}</h1>
          <p>This OTP will expire in <strong>5 minutes</strong>.</p>
          <p>If you didn’t request this, please ignore this email.</p>
        </div>
      `,
    });

    console.log(" Brevo Email Sent:", response.messageId);
    return true;
  } catch (error) {
    console.error(
      "BREVO EMAIL ERROR:",
      error.response?.text || error.message
    );
    return false;
  }
};