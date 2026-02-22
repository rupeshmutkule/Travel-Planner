import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-flash-latest"];
const endpoints = ["v1", "v1beta"];

async function diagnostic() {
  for (const endpoint of endpoints) {
    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/${endpoint}/models/${model}:generateContent?key=${apiKey}`;
      console.log(`Testing: ${endpoint} / ${model}`);
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
        });
        console.log(`  Result: ${res.status}`);
        if (res.status === 200) {
          console.log(`  SUCCESS with ${endpoint} / ${model}`);
          return;
        }
      } catch (e) {
        console.log(`  Error: ${e.message}`);
      }
    }
  }
}

diagnostic();