const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Calls the Gemini API with a prompt and returns the raw text response.
 * Throws if the API key is missing or the request fails.
 */
const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, responseMimeType: "application/json" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini API returned no content");
  return text;
};

/** Strips markdown code fences if Gemini wraps JSON in ```json ... ``` */
const cleanJson = (text) => text.replace(/```json|```/g, "").trim();

/** Local fallback question bank so the app still works without a Gemini key */
const fallbackQuestions = (mode, difficulty, company) => {
  const banks = {
    HR: [
      "Tell me about yourself and your career journey so far.",
      "Why do you want to work with our company?",
      "Where do you see yourself in five years?",
      "How do you handle stress and pressure at work?",
      "What are your salary expectations for this role?",
    ],
    Technical: [
      "Explain the difference between SQL and NoSQL databases.",
      "What is the time complexity of binary search and why?",
      "How does garbage collection work in modern programming languages?",
      "Explain REST APIs and how they differ from GraphQL.",
      "What are the SOLID principles of object-oriented design?",
    ],
    Behavioral: [
      "Describe a time you disagreed with a teammate and how you resolved it.",
      "Tell me about a project where you had to meet a tight deadline.",
      "Describe a situation where you failed and what you learned from it.",
      "How do you prioritize tasks when everything feels urgent?",
      "Tell me about a time you had to learn something new quickly.",
    ],
    Coding: [
      "Write a function to check if a given string is a palindrome.",
      "How would you find the second largest number in an array?",
      "Explain your approach to reversing a linked list.",
      "How would you detect a cycle in a graph?",
      "Describe how you would design a URL-shortening service.",
    ],
  };
  const list = banks[mode] || banks.HR;
  const prefix = company && company !== "General" ? `[${company} style] ` : "";
  return list.map((q) => `${prefix}${q} (${difficulty} level)`);
};

/**
 * Generates `count` interview questions using Gemini, tailored to
 * mode / difficulty / company. Falls back to a static bank on failure.
 */
const generateQuestions = async (mode, difficulty, company, count = 5) => {
  const companyLine =
    company && company !== "General"
      ? `Tailor the questions to match the interview style commonly used by ${company}.`
      : "Keep the questions general and broadly applicable.";

  const prompt = `You are an expert interview coach. Generate exactly ${count} ${difficulty}-level ${mode} interview questions.
${companyLine}
Return ONLY a JSON array of strings, e.g. ["Question 1", "Question 2"]. No extra text, no markdown.`;

  try {
    const raw = await callGemini(prompt);
    const parsed = JSON.parse(cleanJson(raw));
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, count);
    }
    throw new Error("Malformed question list from Gemini");
  } catch (error) {
    console.warn("⚠️ Falling back to static question bank:", error.message);
    return fallbackQuestions(mode, difficulty, company).slice(0, count);
  }
};

/** Simple heuristic fallback feedback generator (no API key required) */
const fallbackFeedback = (answerText) => {
  const wordCount = answerText.trim().split(/\s+/).filter(Boolean).length;
  const score = Math.min(9, Math.max(3, Math.round(wordCount / 12) + 3));
  return {
    score,
    strengths:
      wordCount > 20
        ? ["Provided a reasonably detailed answer", "Attempted to structure the response"]
        : ["Attempted to answer the question directly"],
    weaknesses:
      wordCount < 20
        ? ["Answer is quite brief and could use more detail", "Missing concrete examples"]
        : ["Could include more specific, quantifiable examples"],
    tips: [
      "Use the STAR method (Situation, Task, Action, Result) for structured answers",
      "Back up claims with specific numbers or outcomes where possible",
    ],
  };
};

/**
 * Scores a single answer using Gemini and returns structured feedback.
 * Falls back to a heuristic scorer if Gemini is unavailable.
 */
const generateFeedback = async (question, answerText, mode) => {
  if (!answerText || !answerText.trim()) {
    return {
      score: 0,
      strengths: [],
      weaknesses: ["No answer was provided"],
      tips: ["Try to answer every question, even partially, to get useful feedback"],
    };
  }

  const prompt = `You are an expert ${mode} interview evaluator.
Question: "${question}"
Candidate's answer: "${answerText}"

Evaluate the answer and return ONLY a JSON object in this exact shape (no extra text, no markdown):
{
  "score": <integer 0-10>,
  "strengths": ["short point 1", "short point 2"],
  "weaknesses": ["short point 1", "short point 2"],
  "tips": ["short actionable tip 1", "short actionable tip 2"]
}`;

  try {
    const raw = await callGemini(prompt);
    const parsed = JSON.parse(cleanJson(raw));
    return {
      score: Math.min(10, Math.max(0, Number(parsed.score) || 0)),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      tips: Array.isArray(parsed.tips) ? parsed.tips : [],
    };
  } catch (error) {
    console.warn("⚠️ Falling back to heuristic feedback:", error.message);
    return fallbackFeedback(answerText);
  }
};

module.exports = { generateQuestions, generateFeedback };
