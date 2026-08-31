import History from '../models/History.js';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

/*
 * Gemini resilience layer
 * -----------------------
 * The generative API frequently returns transient 503 ("high demand") and 429
 * (rate-limit) errors when a model is overloaded, so a single call fails often.
 * We defend against that with two independent strategies:
 *   1. Model fallback  – try a chain of models; each has its own capacity pool,
 *                        so if the primary is overloaded the next usually works.
 *   2. Backoff retries – retry transient failures on the same model with
 *                        exponential backoff + jitter.
 * Every model below supports generateContent + a JSON response mime type.
 */
const MODEL_CHAIN = [
  "gemini-flash-latest",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-flash-lite-latest",
];

const MAX_ATTEMPTS_PER_MODEL = 2;   // initial try + 1 retry
const BASE_BACKOFF_MS = 500;        // grows exponentially with jitter
const GLOBAL_DEADLINE_MS = 30000;   // stop launching new attempts after this

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Transient failures worth retrying / falling back on.
const isTransientError = (err) => {
  const status = Number(err?.status ?? err?.statusCode);
  if ([429, 500, 502, 503, 504].includes(status)) return true;
  const msg = String(err?.message || "").toLowerCase();
  return (
    msg.includes("503") || msg.includes("overloaded") ||
    msg.includes("high demand") || msg.includes("service unavailable") ||
    msg.includes("unavailable") || msg.includes("429") ||
    msg.includes("rate limit") || msg.includes("quota") ||
    msg.includes("500") || msg.includes("internal") ||
    msg.includes("502") || msg.includes("504") ||
    msg.includes("fetch failed") || msg.includes("network") ||
    msg.includes("timeout") || msg.includes("etimedout") || msg.includes("econnreset")
  );
};

// Fatal config problems (bad/missing key, no access): retrying never helps and
// we must not leak the raw reason to the client.
const isAuthError = (err) => {
  const status = Number(err?.status ?? err?.statusCode);
  if ([401, 403].includes(status)) return true;
  const msg = String(err?.message || "").toLowerCase();
  return (
    msg.includes("api key not valid") || msg.includes("api_key_invalid") ||
    msg.includes("permission denied") || msg.includes("unauthenticated") ||
    (msg.includes("api key") && msg.includes("invalid"))
  );
};

// Models sometimes wrap JSON in ```json fences or add stray prose despite the
// responseMimeType hint. Pull out the JSON object before parsing.
const extractJson = (text) => {
  if (!text || !text.trim()) throw new Error("Empty response from model");
  let t = text.trim();
  const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) t = fenced[1].trim();
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first !== -1 && last > first) t = t.slice(first, last + 1);
  return JSON.parse(t);
};

// Shape guard so we never persist / return garbage that merely parsed as JSON.
const isValidPlan = (plan) =>
  plan && typeof plan === "object" &&
  Array.isArray(plan.days) && plan.days.length > 0;

// Run the whole model chain with backoff; resolve to parsed plan JSON or throw.
const generatePlan = async (prompt) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const startedAt = Date.now();
  let lastError;

  for (const modelName of MODEL_CHAIN) {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
    });

    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const plan = extractJson(result.response.text());
        if (!isValidPlan(plan)) {
          throw new SyntaxError("Model returned JSON without a valid 'days' array");
        }
        return plan;
      } catch (err) {
        lastError = err;
        console.error(`[Gemini] ${modelName} attempt ${attempt}/${MAX_ATTEMPTS_PER_MODEL} failed: ${err.message}`);

        if (isAuthError(err)) throw err; // fatal — stop everything

        const canRetrySameModel =
          attempt < MAX_ATTEMPTS_PER_MODEL &&
          (isTransientError(err) || err instanceof SyntaxError);
        const withinDeadline = Date.now() - startedAt < GLOBAL_DEADLINE_MS;

        if (canRetrySameModel && withinDeadline) {
          const delay = BASE_BACKOFF_MS * 2 ** (attempt - 1) + Math.floor(Math.random() * 250);
          await sleep(delay);
          continue; // retry same model
        }
        break; // give up on this model → fall through to the next one
      }
    }

    if (Date.now() - startedAt >= GLOBAL_DEADLINE_MS) break;
  }

  throw lastError || new Error("All model attempts failed");
};

// Map an internal error to a safe, friendly client message + HTTP status.
const toClientError = (err) => {
  if (isAuthError(err)) {
    // Don't reveal configuration issues to end users.
    return { status: 503, message: "The travel planner is temporarily unavailable. Please try again in a little while." };
  }
  if (isTransientError(err)) {
    return { status: 503, message: "Our travel planner is experiencing high demand right now. Please wait a few seconds and try again." };
  }
  if (err instanceof SyntaxError || String(err?.message || "").toLowerCase().includes("json")) {
    return { status: 502, message: "We couldn't quite build your itinerary this time. Please try again." };
  }
  return { status: 500, message: "Something went wrong while creating your itinerary. Please try again." };
};

export const createPlan = async (req, res) => {
  const { place, checkIn, checkOut, budget, historyId } = req.body;
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

  // Budget-specific instructions
  let budgetInstructions = '';
  if (budget === 'low') {
    budgetInstructions = `
BUDGET: LOW (Budget-Friendly Travel)
- Hotels: Recommend ONLY 2-star or budget hotels, hostels, guesthouses (₹500-1500/night or $10-30/night)
- Food: Local street food, budget restaurants, food courts (₹100-300/meal or $2-5/meal)
- Transport: Public buses, metro, shared auto-rickshaws, walking
- Activities: FREE or low-cost attractions (parks, temples, beaches, markets, walking tours)
- Avoid: Luxury hotels, fine dining, expensive tours, private transport
- Examples: Budget hotels like OYO, Zostel hostels, local dhabas, street food stalls`;
  } else if (budget === 'medium') {
    budgetInstructions = `
BUDGET: MEDIUM (Comfortable Travel)
- Hotels: 3-star hotels, good quality accommodations (₹2000-4000/night or $40-80/night)
- Food: Mix of local restaurants and popular eateries (₹300-800/meal or $5-15/meal)
- Transport: Mix of public transport, Uber/Ola, occasional private cabs
- Activities: Mix of paid attractions and free experiences (museums, guided tours, popular sites)
- Balance: Comfort without overspending
- Examples: Hotels like Treebo, Lemon Tree, popular restaurants, standard tours`;
  } else if (budget === 'high') {
    budgetInstructions = `
BUDGET: HIGH (Luxury Travel)
- Hotels: 4-5 star luxury hotels, resorts, boutique properties (₹8000+/night or $150+/night)
- Food: Fine dining, premium restaurants, hotel dining (₹1000+/meal or $20+/meal)
- Transport: Private cars, premium cabs, first-class travel
- Activities: Premium experiences (spa, private tours, exclusive access, adventure sports)
- Focus: Luxury, comfort, exclusive experiences
- Examples: Taj, Oberoi, ITC hotels, fine dining restaurants, premium tours`;
  }

  const prompt = `You are a professional travel planner AI. Create a ${numDays}-day travel itinerary for ${place}.
Check-in: ${checkIn}, Check-out: ${checkOut}.
${budgetInstructions}

CRITICAL RULES:
1. Use REAL place names, REAL hotel names, REAL attractions specific to ${place}
2. ${budget ? `STRICTLY follow the ${budget.toUpperCase()} budget guidelines above` : 'Provide balanced recommendations'}
3. Each day must have 4-5 activities with specific timings (9:00 AM, 2:00 PM, etc.)
4. Use appropriate emojis: 🏨 hotel, 🍽️ food, 🏛️ monument, 🛍️ shopping, 🎭 entertainment
5. For EVERY activity and hotel, provide a working website URL:
   - Hotels: Use format "https://www.google.com/search?q=Hotel+Name+${place.replace(/ /g, '+')}"
   - Restaurants: Use format "https://www.google.com/search?q=Restaurant+Name+${place.replace(/ /g, '+')}"
   - Attractions: Use format "https://www.google.com/search?q=Attraction+Name+${place.replace(/ /g, '+')}"
6. Make sure EVERY activity object has a "website" field with a valid URL

Return ONLY valid JSON in this format:
{
  "hotel": { 
    "name": "Real Hotel Name matching budget", 
    "area": "Locality", 
    "rating": "4.5", 
    "highlight": "Why it fits the budget",
    "website": "https://www.google.com/search?q=Hotel+Name+${place.replace(/ /g, '+')}"
  },
  "days": [
    {
      "day": 1,
      "date": "${checkIn}",
      "title": "Day Theme",
      "activities": [
        { 
          "emoji": "🏨", 
          "title": "Real Place Name", 
          "time": "10:00 AM", 
          "description": "Brief description",
          "website": "https://www.google.com/search?q=Place+Name+${place.replace(/ /g, '+')}"
        }
      ]
    }
  ]
}`;

  try {
    const planData = await generatePlan(prompt);

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
    console.error("SERVER ERROR:", err?.message);
    const { status, message } = toClientError(err);
    res.status(status).json({ error: message });
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

export const updateHistory = async (req, res) => {
  try {
    const updates = {};
    if (req.body.isPinned !== undefined) updates.isPinned = req.body.isPinned;
    if (req.body.isArchived !== undefined) updates.isArchived = req.body.isArchived;

    const history = await History.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updates },
      { new: true }
    );

    if (!history) {
      return res.status(404).json({ message: 'History item not found or unauthorized' });
    }

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
