const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    answerText: { type: String, default: "" },
    score: { type: Number, default: null, min: 0, max: 10 },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    tips: { type: [String], default: [] },
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mode: {
      type: String,
      enum: ["HR", "Technical", "Behavioral", "Coding"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    company: {
      type: String,
      enum: ["General", "TCS", "Zoho", "Amazon", "Infosys", "Accenture"],
      default: "General",
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
    overallScore: {
      type: Number,
      default: null,
      min: 0,
      max: 10,
    },
    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);
