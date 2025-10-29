require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    try {
        console.log("Checking your API key...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const models = await genAI.listModels();
        console.log("Success! Your API key has access to these models:");
        for await (const m of models) {
            if (m.supportedGenerationMethods.includes("generateContent")) {
                console.log("* ", m.name);
            }
        }
    } catch (error) {
        console.error("\nError listing models:", error.message);
        console.log("\nThis error usually means your API key is invalid, expired, or your Google Cloud Project is not set up correctly (e.g., billing not enabled or the Generative Language API is not enabled).");
    }
}

listModels();