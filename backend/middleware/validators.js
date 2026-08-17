const { body, validationResult } = require("express-validator");

/** Runs after any validator chain — returns a 400 with all messages if validation failed */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const registerValidator = [
  body("name").trim().isLength({ min: 2, max: 60 }).withMessage("Name must be 2-60 characters"),
  body("email").trim().isEmail().withMessage("Please provide a valid email").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("targetRole").optional().trim().isLength({ max: 100 }),
  handleValidation,
];

const loginValidator = [
  body("email").trim().isEmail().withMessage("Please provide a valid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidation,
];

const updateMeValidator = [
  body("name").optional().trim().isLength({ min: 2, max: 60 }),
  body("targetRole").optional().trim().isLength({ max: 100 }),
  handleValidation,
];

const startInterviewValidator = [
  body("mode").isIn(["HR", "Technical", "Behavioral", "Coding"]).withMessage("Invalid interview mode"),
  body("difficulty").isIn(["Easy", "Medium", "Hard"]).withMessage("Invalid difficulty level"),
  body("company")
    .optional()
    .isIn(["General", "TCS", "Zoho", "Amazon", "Infosys", "Accenture"]),
  handleValidation,
];

const submitAnswerValidator = [
  body("questionIndex").isInt({ min: 0 }).withMessage("questionIndex must be a non-negative integer"),
  body("answerText").optional().isString().isLength({ max: 5000 }),
  handleValidation,
];

module.exports = {
  registerValidator,
  loginValidator,
  updateMeValidator,
  startInterviewValidator,
  submitAnswerValidator,
};
