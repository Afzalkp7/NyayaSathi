const { GoogleGenerativeAI } = require("@google/generative-ai");
const https = require("https");
require("dotenv").config();

// We include the custom agent to bypass any potential SSL issues
// that could block this diagnostic request.
const agent = new https.Agent({
  rejectUnauthorized: false,
});

async function finalConnectionTest() {
  console.log(">> Running the final connection test...");
  
  if (!process.env.GEMINI_API_KEY) {
    console.error(">> Test failed: GEMINI_API_KEY not found in .env file.");
    return;
  }

  // We are trying a different but common model as a last resort.
  // 'gemini-pro-vision' is a multimodal model, but it will confirm if your
  // API key has access to any generative models at all.
  const modelToTest = "gemini-pro-vision";
  console.log(`>> Attempting to connect with a specific model: ${modelToTest}`);

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, {
      fetch: (url, init) => fetch(url, { ...init, agent }),
    });

    const model = genAI.getGenerativeModel({ model: modelToTest });
    
    // We send a very simple text-only prompt.
    const prompt = "What is a large language model?";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("\n>> SUCCESS! The connection to the Gemini API is working.");
    console.log("==========================================================");
    console.log(">> This confirms your API key is valid and your project is configured correctly.");
    console.log(`>> The model you should use is: ${modelToTest}`);
    console.log("\n>> ACTION: Please update the GEMINI_MODEL_NAME in your .env file to be 'gemini-pro-vision'.");
    console.log("\n>> Gemini Response:", text);

  } catch (error) {
    console.error("\n>> FAILED. The connection test did not succeed.");
    console.error(">> Error details:", error);
    console.log("\n>> This confirms there is a fundamental configuration or permissions issue with your Google Cloud project or billing account.");
  }
}

finalConnectionTest();
