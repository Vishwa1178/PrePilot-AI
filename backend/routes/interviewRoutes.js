const express = require("express");
const router = express.Router();
const {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterview,
  getHistory,
  getAnalytics,
} = require("../controllers/interviewController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect); // all interview routes require authentication

// IMPORTANT: specific routes before the dynamic "/:id" route
router.get("/history", getHistory);
router.get("/analytics", getAnalytics);

router.post("/start", startInterview);
router.post("/:id/answer", submitAnswer);
router.post("/:id/complete", completeInterview);
router.get("/:id", getInterview);

module.exports = router;
