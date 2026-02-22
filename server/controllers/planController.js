import History from '../models/History.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

export const createPlan = async (req, res) => {
  const { place, checkIn, checkOut, historyId } = req.body;
  const userId = req.user ? req.user._id : null; // Optionally linked to user

  if (!place || !checkIn || !checkOut) {
    return res.status(400).json({ error: "place, checkIn and checkOut are required" });
  }

  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API key is missing" });
  }

  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  const numDays = Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)));

  const prompt = `You are a professional travel planner AI. Create a ${numDays}-day travel itinerary for ${place}.
Check-in: ${checkIn}, Check-out: ${checkOut}.

RULES:
- Use REAL place names, real hotel names, real attractions specific to ${place}.
- Each day must have 4-5 activities with morning, afternoon, and evening slots.
- Include specific timings like "9:00 AM", "2:00 PM".
- Use appropriate emojis: 🏨 hotel, 🍽️ food, 🏛️ monument, 🛍️ shopping, etc.

Return ONLY valid JSON in this format:
{
  "hotel": { "name": "Real Hotel Name", "area": "Locality", "rating": "4.5", "highlight": "Why it is ideal" },
  "days": [
    {
      "day": 1,
      "date": "${checkIn}",
      "title": "Day Theme",
      "activities": [
        { "emoji": "🏨", "title": "Check-in", "time": "10:00 AM", "description": "Welcome" }
      ]
    }
  ]
}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Attempt to parse the AI output
    const planData = JSON.parse(text);

    // Save to history if user is logged in
    if (userId) {
      if (historyId) {
        // Update existing history by ID
        await History.findByIdAndUpdate(historyId, {
          checkIn,
          checkOut,
          plan: planData
        });
      } else {
        // Check if a record with the same destination exists for this user to update it
        // Or just create a new one if you want to keep destination-based history separate
        // The user said: "when im going in the history chat and then changing the dates ... it is making another history do not do this as update that history"
        // If we have historyId, we use it. If not, we could try to find one by destination, but usually historyId is better.
        
        await History.create({
          userId,
          destination: place,
          checkIn,
          checkOut,
          plan: planData
        });
      }
    }

    res.json(planData);
  } catch (err) {
    console.error("SERVER ERROR:", err.message);
    res.status(500).json({ error: `Failure: ${err.message}` });
  }
};

export const deleteHistory = async (req, res) => {
  try {
    const history = await History.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!history) {
      return res.status(404).json({ message: 'History item not found' });
    }

    res.json({ message: 'History item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    const history = await History.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const saveExistingPlan = async (req, res) => {
  const { destination, checkIn, checkOut, plan } = req.body;
  const userId = req.user._id;

  if (!destination || !checkIn || !checkOut || !plan) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newHistory = await History.create({
      userId,
      destination,
      checkIn,
      checkOut,
      plan
    });
    res.json(newHistory);
  } catch (err) {
    console.error("SAVE ERROR:", err.message);
    res.status(500).json({ error: `Failure: ${err.message}` });
  }
};
