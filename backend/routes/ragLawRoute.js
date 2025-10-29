// routes/ragLawRoute.js
const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Or OpenAI client
const Law = require("../models/Law");
const { auth } = require('../middleware/authMiddleware'); // 1. Import auth middleware
const guestLimiter = require('../middleware/guestLimiter'); // 2. Import guest limiter
require("dotenv").config();

// Initialize the AI Client (Example: Google Gemini)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL_NAME || "gemini-pro" });

// @route   POST api/rag-laws/laws
// @desc    Get legal information based on user problem (RAG)
// @access  Private (Requires valid token - user or guest)
// Apply 'auth' first to decode token, then 'guestLimiter' to check guest usage
router.post("/laws", auth, guestLimiter, async (req, res) => { // 3. Added 'auth' and 'guestLimiter'
  try {
    const { userProblem } = req.body;
    if (!userProblem) {
      return res.status(400).json({ message: "User problem description is required." });
    }

    // Optional: Log query details
    console.log(`RAG query received from user ID: ${req.user.id}, Role: ${req.user.role}`);

    // --- RAG Logic (Retrieval, Augmentation, Generation) ---
    // 1. Retrieval
    const foundLaws = await Law.find(
      { $text: { $search: userProblem } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(5); // Limit context size for performance/cost

    if (!foundLaws.length) {
      return res
        .status(404)
        .json({ message: "No relevant laws found matching your description in our database." });
    }

    // 2. Prepare context (Augmentation)
    const contextFromDB = foundLaws.map((law) => ({
      law_code: law.law_code,
      section_number: law.section_number,
      title: law.title,
      simplified_description: law.simplified_description,
      description: law.description,
      punishment: law.punishment,
      category: law.category,
      act_name: law.act_name,
    }));

    // 3. Create Prompt (Augmentation) - Ensure clear instructions for JSON ONLY output
    const generationPrompt = `
      You are Nyayasathi, a legal information API for India. Based ONLY on the User Problem and Relevant Sections (from BNS database context), generate a single, valid JSON object matching the schema below. Output ONLY the raw JSON, nothing else. Do NOT give legal advice.

      User Problem: "${userProblem}"

      Relevant Sections (Context):
      ${JSON.stringify(contextFromDB, null, 2)}

      JSON Output Schema:
      {
        "legalInformation": "string (Simple, empathetic explanation referencing BNS)",
        "relevantSections": [ { "section_number": "string", "section_title": "string", "simple_explanation": "string (from context)", "legal_text": "string (from context)", "punishment": "string (from context)" } ],
        "nextSteps": { "suggestions": "string (2-3 safe, general next steps in India)", "disclaimer": "This is informational only, not legal advice. Consult a qualified legal professional." }
      }
    `;

    // 4. Call AI (Generation)
    const generationResult = await model.generateContent(generationPrompt);
    const generatedText = await generationResult.response.text();

    // 5. Parse and Send Response
    try {
      // Basic cleanup (remove markdown)
      const cleanJsonText = generatedText.replace(/```json/g, "").replace(/```/g, "").trim();
      if (!cleanJsonText.startsWith('{') || !cleanJsonText.endsWith('}')) {
          throw new Error("AI response is not valid JSON format.");
      }
      const structuredResponse = JSON.parse(cleanJsonText);
      res.status(200).json(structuredResponse);
    } catch (parseError) {
      console.error("Failed to parse JSON from AI:", parseError);
      console.error("AI Response causing error (first 500 chars):", generatedText.substring(0, 500)); // Log problematic response carefully
      res.status(500).json({ message: "Error processing the AI response. Please try again." });
    }
  } catch (error) {
    // Log error with user context if available
    const userId = req.user ? req.user.id : 'N/A';
    console.error(`Error in /laws route for user ${userId}:`, error);
    res.status(500).json({ message: "An internal server error occurred while processing your request." });
  }
});

module.exports = router;