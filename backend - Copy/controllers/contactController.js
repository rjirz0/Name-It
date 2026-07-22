import { Submission } from "../models/Submission.js";
import { GoogleGenAI } from "@google/genai";

/**
 * Handles incoming contact form submissions.
 * Saves the submission to MongoDB Atlas and can perform optional Gemini AI sentiment/tagging.
 */
export const handleContactSubmission = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // 1. Basic validation (Mongoose also validates, but checking early is best practice!)
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: "All fields (name, email, subject, message) are required to submit."
      });
    }

    // 2. Build the database entry
    const newSubmission = new Submission({
      name,
      email,
      subject,
      message
    });

    // 3. Save the submission securely to MongoDB Atlas
    const savedData = await newSubmission.save();

    // 4. Securely call Gemini AI if the API key is present!
    // This allows you to do automatic spam analysis, sentiment categorization, or language detection
    // without ever revealing your API key to the client/browser!
    let aiResponse = null;
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log("🤖 Gemini API Key found. Categorizing contact submission...");
        
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            }
          }
        });

        const prompt = `Analyze this customer message and categorize it. Return a short JSON object with:
        "category" (Support, Sales, Feedback, or General),
        "sentiment" (Positive, Neutral, or Negative),
        "spamProbability" (Low, Medium, or High).
        
        Subject: "${subject}"
        Message: "${message}"`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });

        if (response.text) {
          aiResponse = JSON.parse(response.text.trim());
          console.log("✅ Message categorized successfully by Gemini:", aiResponse);
        }
      } catch (aiError) {
        // We log the AI error but we DO NOT fail the request, since saving to DB succeeded!
        console.warn("⚠️ Optional Gemini analysis skipped/failed:", aiError.message);
      }
    }

    // 5. Send a clean, friendly success message back to the frontend
    return res.status(201).json({
      success: true,
      message: "Your message has been successfully saved to our secure database!",
      submissionId: savedData._id,
      analysis: aiResponse
    });

  } catch (error) {
    console.error("❌ Submission Handler Error:", error);
    
    // Check if it's a validation error from Mongoose
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(", ") });
    }

    return res.status(500).json({
      error: "An internal server error occurred while trying to save your message. Please try again later."
    });
  }
};
