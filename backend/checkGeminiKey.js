const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("API key not found! Make sure GEMINI_API_KEY is set in your .env file.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function checkKey() {
  try {
    // List all available models
    const models = await genAI.listModels();
    console.log("✅ Gemini API key works! Available models:");
    console.log(models);
  } catch (error) {
    console.error("❌ Gemini API key test failed:");
    console.error(JSON.stringify(error, null, 2));
  }
}

checkKey();
