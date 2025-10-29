const { GoogleGenerativeAI } = require("@google/generative-ai");
const https = require("https"); // Import the 'https' module
require("dotenv").config();

console.log(">> Checking for loaded API Key:", process.env.GEMINI_API_KEY);

// --- THE FIX: Create a custom agent to bypass SSL validation ---
// This is a common solution when a local firewall or proxy
// interferes with SSL certificate verification.
const agent = new https.Agent({
  rejectUnauthorized: false,
});
// ------------------------------------------------------------

async function testGemini() {
  if (!process.env.GEMINI_API_KEY) {
    console.error(
      ">> Test failed: The GEMINI_API_KEY was not found in the environment variables."
    );
    return;
  }

  const modelName = process.env.GEMINI_MODEL_NAME || "gemini-pro";
  console.log(`>> Attempting to connect with model: ${modelName}`);

  try {
    // Pass the custom agent into the client's request options
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, {
      fetch: (url, init) => fetch(url, { ...init, agent }),
    });

    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = "Say hello in a friendly way";
    const result = await model.generateContent(prompt);
    const text = await result.response.text();

    console.log(">> Gemini API test successful!");
    console.log(">> Response:", text);
  } catch (error) {
    console.error(">> Gemini API test failed:", error);
  }
}

testGemini();
    

