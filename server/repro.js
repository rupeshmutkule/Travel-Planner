import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const k = process.env.GEMINI_API_KEY;
const prompt = "Say 'Test Successful'";

async function test() {
    console.log("Testing with key:", k ? "EXISTS" : "MISSING");
    const modelName = "gemini-2.5-flash"; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${k}`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.7,
                }
            })
        });

        console.log("Status:", response.status);
        const data = await response.json();
        console.log("Response:", JSON.stringify(data));
    } catch (e) {
        console.error("Error:", e.message);
    }
}
test();

