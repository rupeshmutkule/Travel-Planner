import dotenv from 'dotenv';
import fs from 'fs';
import fetch from 'node-fetch';
dotenv.config();

const k = process.env.GEMINI_API_KEY;

async function listModels() {
  try {
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + k);
    const d = await r.json();
    if (d.error) {
      console.error("API Error:", d.error);
      return;
    }
    fs.writeFileSync('models_full.json', JSON.stringify(d, null, 2));
    const models = d.models.map(m => `${m.name} [${m.supportedGenerationMethods.join(', ')}]`);
    fs.writeFileSync('models_list_clean.txt', models.join('\n'));
    console.log("Wrote", models.length, "models to models_list_clean.txt and full data to models_full.json");
  } catch (e) {
    console.error("Fetch Error:", e.message);
  }
}

listModels();
