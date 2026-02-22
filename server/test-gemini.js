import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

console.log("--- DEBUG INFO ---");
console.log("CWD:", process.cwd());
console.log("GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
if (process.env.GEMINI_API_KEY) {
    console.log("Key length:", process.env.GEMINI_API_KEY.length);
    console.log("Key starts with:", process.env.GEMINI_API_KEY.substring(0, 7));
}
console.log("-------------------");

const key = process.env.GEMINI_API_KEY;

async function run() {
  if (!key) {
    console.error("ERROR: No API key found in process.env. Check your .env file.");
    return;
  }
  
  try {
    const genAI = new GoogleGenerativeAI(key);
    // Using a model confirmed to be in the list
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    console.log("Model object created. Calling generateContent...");
    
    // Set a timeout for the API call
    const generateTask = model.generateContent("Say 'Test Successful'");
    const result = await generateTask;
    console.log("generateContent promise resolved.");
    
    console.log("Awaiting response...");
    const response = await result.response;
    const text = response.text();
    console.log("GENERATED TEXT:", text);
  } catch (error) {
    console.error("GEMINI API ERROR:", error.message);
    if (error.response) {
        try {
            console.error("API RESPONSE ERROR:", await error.response.json());
        } catch (e) {
            console.error("Could not parse error response json");
        }
    }
  }
}

run();
