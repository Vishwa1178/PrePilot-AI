require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const validateEnv = require("./config/validateEnv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { apiLimiter } = require("./middleware/rateLimiters");

// Fail fast if required config is missing
validateEnv();

// Connect to MongoDB (skipped automatically in test env — see config/db.js)
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

const app = express();

// Security headers
app.use(helmet());

// Request logging (skip in test to keep test output clean)
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// Core middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// General API rate limit (auth routes have their own, stricter limit)
app.use("/api", apiLimiter);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "PrepPilot AI API is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/interviews", interviewRoutes);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Don't call app.listen() when required by the test suite
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 PrepPilot AI backend running on port ${PORT}`);
  });
}

module.exports = app;
