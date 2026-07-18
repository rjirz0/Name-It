import express from "express";
import { handleContactSubmission } from "../controllers/contactController.js";
import { contactRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

/**
 * Route: POST /api/contact
 * Description: Submit the Contact Us form securely
 * Security: Limited to 5 requests per 15 minutes to prevent spam
 */
router.post("/", contactRateLimiter, handleContactSubmission);

export default router;
