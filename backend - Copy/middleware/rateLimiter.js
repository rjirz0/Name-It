import rateLimit from "express-rate-limit";

/**
 * Configure rate limiter for the Contact Us form submission endpoint.
 * This ensures that a single IP address can only submit up to 5 contact requests
 * per 15-minute window, blocking automated spam bots.
 */
export const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: {
    error: "Too many contact submissions from this IP address. Please try again after 15 minutes."
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
