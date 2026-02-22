import fetch from 'node-fetch';

async function testRegistration() {
  const email = `test_${Date.now()}@example.com`;
  const body = {
    name: "Test User",
    email: email,
    password: "password123"
  };

  console.log(`Attempting to register user: ${email}`);
  try {
    const res = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}
testRegistration();
