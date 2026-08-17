const Interview = require("../models/Interview");
const { generateQuestions, generateFeedback } = require("../utils/geminiService");

const VALID_MODES = ["HR", "Technical", "Behavioral", "Coding"];
const VALID_DIFFICULTIES = ["Easy", "Medium", "Hard"];
const VALID_COMPANIES = ["General", "TCS", "Zoho", "Amazon", "Infosys", "Accenture"];

/**
 * @desc    Start a new interview session (generates questions via Gemini)
 * @route   POST /api/interviews/start
 * @access  Private
 */
const startInterview = async (req, res, next) => {
  try {
    const { mode, difficulty, company } = req.body;

    if (!VALID_MODES.includes(mode)) {
      return res.status(400).json({ message: "Invalid interview mode" });
    }
    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({ message: "Invalid difficulty level" });
    }
    const selectedCompany = VALID_COMPANIES.includes(company) ? company : "General";

    const questionTexts = await generateQuestions(mode, difficulty, selectedCompany, 5);

    const interview = await Interview.create({
      user: req.user._id,
      mode,
      difficulty,
      company: selectedCompany,
      questions: questionTexts.map((q) => ({ questionText: q })),
    });

    res.status(201).json({
      message: "Interview started",
      interview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit an answer for a specific question, get AI feedback
 * @route   POST /api/interviews/:id/answer
 * @access  Private
 */
const submitAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questionIndex, answerText } = req.body;

    const interview = await Interview.findOne({ _id: id, user: req.user._id });
    if (!interview) {
      return res.status(404).json({ message: "Interview session not found" });
    }
    if (
      questionIndex === undefined ||
      questionIndex < 0 ||
      questionIndex >= interview.questions.length
    ) {
      return res.status(400).json({ message: "Invalid question index" });
    }

    const question = interview.questions[questionIndex];
    const feedback = await generateFeedback(question.questionText, answerText, interview.mode);

    question.answerText = answerText || "";
    question.score = feedback.score;
    question.strengths = feedback.strengths;
    question.weaknesses = feedback.weaknesses;
    question.tips = feedback.tips;

    await interview.save();

    res.status(200).json({
      message: "Answer evaluated",
      questionIndex,
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark an interview as completed and compute the overall score
 * @route   POST /api/interviews/:id/complete
 * @access  Private
 */
const completeInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const interview = await Interview.findOne({ _id: id, user: req.user._id });
    if (!interview) {
      return res.status(404).json({ message: "Interview session not found" });
    }

    const scoredQuestions = interview.questions.filter((q) => q.score !== null);
    const overallScore = scoredQuestions.length
      ? Number(
          (
            scoredQuestions.reduce((sum, q) => sum + q.score, 0) / scoredQuestions.length
          ).toFixed(1)
        )
      : 0;

    interview.overallScore = overallScore;
    interview.status = "completed";
    interview.completedAt = new Date();
    await interview.save();

    res.status(200).json({ message: "Interview completed", interview });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single interview's full details
 * @route   GET /api/interviews/:id
 * @access  Private
 */
const getInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) {
      return res.status(404).json({ message: "Interview session not found" });
    }
    res.status(200).json({ interview });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get the logged-in user's interview history (completed sessions)
 * @route   GET /api/interviews/history
 * @access  Private
 */
const getHistory = async (req, res, next) => {
  try {
    const interviews = await Interview.find({
      user: req.user._id,
      status: "completed",
    })
      .sort({ completedAt: -1 })
      .select("mode difficulty company overallScore completedAt createdAt");

    res.status(200).json({ interviews });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregated analytics for the logged-in user
 * @route   GET /api/interviews/analytics
 * @access  Private
 */
const getAnalytics = async (req, res, next) => {
  try {
    const interviews = await Interview.find({
      user: req.user._id,
      status: "completed",
    }).sort({ completedAt: 1 });

    const totalInterviews = interviews.length;
    const averageScore = totalInterviews
      ? Number(
          (interviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) / totalInterviews).toFixed(1)
        )
      : 0;

    // Score trend over time (for line chart)
    const scoreTrend = interviews.map((i) => ({
      date: i.completedAt,
      score: i.overallScore,
      mode: i.mode,
    }));

    // Average score grouped by mode (for bar chart)
    const modeMap = {};
    interviews.forEach((i) => {
      if (!modeMap[i.mode]) modeMap[i.mode] = { total: 0, count: 0 };
      modeMap[i.mode].total += i.overallScore || 0;
      modeMap[i.mode].count += 1;
    });
    const scoreByMode = Object.entries(modeMap).map(([mode, { total, count }]) => ({
      mode,
      averageScore: Number((total / count).toFixed(1)),
      count,
    }));

    // Average score grouped by difficulty
    const diffMap = {};
    interviews.forEach((i) => {
      if (!diffMap[i.difficulty]) diffMap[i.difficulty] = { total: 0, count: 0 };
      diffMap[i.difficulty].total += i.overallScore || 0;
      diffMap[i.difficulty].count += 1;
    });
    const scoreByDifficulty = Object.entries(diffMap).map(([difficulty, { total, count }]) => ({
      difficulty,
      averageScore: Number((total / count).toFixed(1)),
      count,
    }));

    const bestMode =
      scoreByMode.length > 0
        ? scoreByMode.reduce((a, b) => (a.averageScore >= b.averageScore ? a : b)).mode
        : null;

    res.status(200).json({
      totalInterviews,
      averageScore,
      bestMode,
      scoreTrend,
      scoreByMode,
      scoreByDifficulty,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterview,
  getHistory,
  getAnalytics,
};
