import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import contactRoutes from "./routes/contactRoutes.js";

// Load environment variables from your secure .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Establish database connection with MongoDB Atlas
connectDB();

// 2. Security Middlewares
// Helmet adds secure HTTP headers to shield your server from common web attacks
app.use(helmet());

// CORS allows your frontend hosted on GitHub Pages to safely talk to this backend
app.use(
  cors({
    origin: "*", // Allows any website during setup. You can change this to your specific GitHub Pages URL!
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// 3. Body Parsers (To read JSON payloads from frontend)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. API Endpoint routing
app.use("/api/contact", contactRoutes);

// Simple Health Check API
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    message: "Capybara Secure backend is fully operational!",
    time: new Date()
  });
});

// 5. Handle unregistered paths (404 Not Found)
app.use((req, res) => {
  res.status(404).json({ error: "API Route not found" });
});

// 6. Boot Up server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Secure Production Backend running on port ${PORT}`);
  console.log(`👉 Health check available at: http://localhost:${PORT}/api/health`);
});
