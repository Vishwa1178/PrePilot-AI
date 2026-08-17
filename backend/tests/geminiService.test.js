const { generateQuestions, generateFeedback } = require("../utils/geminiService");

// No GEMINI_API_KEY is set in the test environment, so these calls should
// always exercise the static fallback path — this is exactly the code path
// that runs for anyone demoing the app without an API key.
describe("geminiService (fallback path, no API key)", () => {
  beforeAll(() => {
    delete process.env.GEMINI_API_KEY;
  });

  test.each([
    ["HR", "Easy", "General"],
    ["Technical", "Hard", "Amazon"],
    ["Behavioral", "Medium", "TCS"],
    ["Coding", "Medium", "General"],
  ])("generateQuestions returns %s fallback questions for %s/%s", async (mode, difficulty, company) => {
    const questions = await generateQuestions(mode, difficulty, company, 5);
    expect(Array.isArray(questions)).toBe(true);
    expect(questions).toHaveLength(5);
    questions.forEach((q) => expect(typeof q).toBe("string"));
  });

  test("generateQuestions falls back gracefully for an unknown mode", async () => {
    const questions = await generateQuestions("Unknown", "Easy", "General", 3);
    expect(questions.length).toBeGreaterThan(0);
  });

  test("generateFeedback returns a zero score with no answer provided", async () => {
    const feedback = await generateFeedback("Tell me about yourself", "", "HR");
    expect(feedback.score).toBe(0);
    expect(feedback.weaknesses).toContain("No answer was provided");
  });

  test("generateFeedback heuristic score scales with answer length", async () => {
    const shortAnswer = await generateFeedback("Q", "A brief answer.", "HR");
    const longAnswer = await generateFeedback(
      "Q",
      "This is a much longer, more detailed answer that goes into specifics, gives examples, and explains reasoning thoroughly across many words.",
      "HR"
    );
    expect(shortAnswer.score).toBeGreaterThanOrEqual(0);
    expect(shortAnswer.score).toBeLessThanOrEqual(10);
    expect(longAnswer.score).toBeGreaterThanOrEqual(shortAnswer.score);
  });
});
