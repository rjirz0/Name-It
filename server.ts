import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware to parse JSON and url-encoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let mongoClient: MongoClient | null = null;
let dbInstance: Db | null = null;

// Lazy initialization of MongoDB to prevent startup crashes when keys are missing
async function getMongoDb(): Promise<Db> {
  if (dbInstance) {
    return dbInstance;
  }

  const url = process.env.MONGODB_URl || process.env.MONGODB_URL;
  if (!url) {
    throw new Error("MONGODB_URl environment variable is missing. Please add it to your secrets or environment variables.");
  }

  // Use a 5-second timeout so it fails fast instead of hanging if there are network issues
  mongoClient = new MongoClient(url, {
    connectTimeoutMS: 5000,
    socketTimeoutMS: 5000,
  });
  
  await mongoClient.connect();
  // Set the database name to "ContactUs" if it is not specified or defaults to "test"
  let dbName = mongoClient.options.dbName;
  if (!dbName || dbName === "test" || dbName === "capybara_website") {
    dbName = "ContactUs";
  }
  dbInstance = mongoClient.db(dbName);
  console.log(`Connected to MongoDB Atlas database: ${dbName}`);
  return dbInstance;
}

// API Health route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Capybara Website API is running smoothly." });
});

// POST Route for Contact Form submissions
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "Please fill in all required fields (Name, Email, Subject, Message)." });
    }

    // Try to get DB and insert the submission
    const db = await getMongoDb();
    const collection = db.collection("contact_submissions");

    const submission = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      submittedAt: new Date()
    };

    const result = await collection.insertOne(submission);

    return res.status(201).json({
      success: true,
      message: "Message successfully saved to MongoDB!",
      id: result.insertedId
    });
  } catch (error: any) {
    console.error("Database submission failed:", error);
    return res.status(500).json({
      error: error.message || "An error occurred while saving your message to the database."
    });
  }
});

// Setup Vite Dev server / Serve built static files
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode serving static files from dist/...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve index.html as a fallback for SPA/unhandled static routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Capybara Website server running at http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});
