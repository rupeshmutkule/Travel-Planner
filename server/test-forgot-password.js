import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api';
const TEST_EMAIL = 'test@example.com'; // Replace with a real email in your database

async function testForgotPassword() {
  console.log('🧪 Testing Forgot Password Flow...\n');

  try {
    // Step 1: Send OTP
    console.log('1️⃣ Sending OTP...');
    const sendOtpRes = await fetch(`${API_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, purpose: 'forgot-password' }),
    });
    const sendOtpData = await sendOtpRes.json();
    console.log('Response:', sendOtpData);
    console.log('Status:', sendOtpRes.status, '\n');

    if (!sendOtpRes.ok) {
      console.error('❌ Failed to send OTP');
      return;
    }

    // Step 2: Verify OTP (you'll need to get the OTP from email or database)
    const testOtp = '123456'; // Replace with actual OTP
    console.log('2️⃣ Verifying OTP...');
    const verifyRes = await fetch(`${API_URL}/auth/verify-forgot-password-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, otp: testOtp }),
    });
    const verifyData = await verifyRes.json();
    console.log('Response:', verifyData);
    console.log('Status:', verifyRes.status, '\n');

    if (!verifyRes.ok) {
      console.error('❌ Failed to verify OTP');
      return;
    }

    // Step 3: Reset Password
    console.log('3️⃣ Resetting password...');
    const resetRes = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, otp: testOtp, newPassword: 'newpass123' }),
    });
    const resetData = await resetRes.json();
    console.log('Response:', resetData);
    console.log('Status:', resetRes.status, '\n');

    if (resetRes.ok) {
      console.log('✅ Forgot password flow completed successfully!');
    } else {
      console.error('❌ Failed to reset password');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testForgotPassword();
