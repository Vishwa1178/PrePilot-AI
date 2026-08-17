const rateLimit = require("express-rate-limit");

/**
 * Strict limiter for login/register — protects against brute-force
 * and credential-stuffing attempts.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in a few minutes." },
});

/**
 * Looser limiter for the general API surface — mostly guards against
 * accidental hammering (e.g. a frontend bug) and abusive scripts, while
 * staying invisible to normal usage.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please slow down." },
});

module.exports = { authLimiter, apiLimiter };
