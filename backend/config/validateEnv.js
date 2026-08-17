const REQUIRED_VARS = ["MONGO_URI", "JWT_SECRET"];

/**
 * Fails fast with a clear message if required env vars are missing,
 * instead of letting the app crash later with a cryptic Mongoose/JWT error.
 */
const validateEnv = () => {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error("\nCopy backend/.env.example to backend/.env and fill in the values.");
    process.exit(1);
  }

  if (process.env.JWT_SECRET.length < 16) {
    console.warn(
      "⚠️  JWT_SECRET is short. Use a long, random string in production (e.g. `openssl rand -hex 32`)."
    );
  }
};

module.exports = validateEnv;
