const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  updateMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiters");
const {
  registerValidator,
  loginValidator,
  updateMeValidator,
} = require("../middleware/validators");

// Public routes (rate-limited to slow down brute-force / credential stuffing)
router.post("/register", authLimiter, registerValidator, registerUser);
router.post("/login", authLimiter, loginValidator, loginUser);

// Private routes
router.get("/me", protect, getMe);
router.put("/me", protect, updateMeValidator, updateMe);

module.exports = router;
