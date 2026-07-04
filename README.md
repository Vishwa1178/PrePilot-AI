# PrepPilot AI 🎯

An AI-powered interview preparation platform — HR, Technical, Behavioral & Coding rounds, company-specific practice (TCS, Zoho, Amazon, Infosys, Accenture), voice-to-text answers, AI-scored feedback, and performance analytics.

**Status: Complete ✅** — Auth, Dashboard, AI Interview Engine (Gemini), Voice-to-Text, and Analytics all working.

---

## ✨ Features

- **Authentication** — JWT-based register/login, protected routes, persisted sessions
- **Dashboard** — quick-start cards per interview mode, stats, and interview history table
- **AI Interview Engine** — HR / Technical / Behavioral / Coding modes, 3 difficulty levels, 5 company-specific styles, questions generated live via the **Gemini API**
- **Voice-to-Text Answers** — built-in browser mic input (Web Speech API), works alongside typing
- **AI Feedback** — each answer scored 0–10 with strengths, weaknesses, and improvement tips (Gemini API)
- **Result Summary** — overall score + full per-question breakdown after each session
- **Performance Analytics** — Chart.js line chart (score trend) and bar charts (avg score by mode / by difficulty)
- **Graceful fallback** — if `GEMINI_API_KEY` isn't set (or a request fails), the app automatically falls back to a static question bank and a heuristic answer scorer, so the whole demo still works without any API key

---

## 📁 Project Structure

```
preppilot-ai/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── interviewController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Interview.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── interviewRoutes.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── geminiService.js       # Gemini question generation + feedback scoring
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js
│   │   │   ├── authService.js
│   │   │   └── interviewService.js
│   │   ├── components/
│   │   │   ├── FormInput.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── ScoreBadge.jsx
│   │   │   └── StatCard.jsx
│   │   ├── context/AuthContext.jsx
│   │   ├── hooks/useSpeechToText.js  # Web Speech API wrapper
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── InterviewSetup.jsx
│   │   │   ├── InterviewSession.jsx
│   │   │   ├── InterviewResult.jsx
│   │   │   └── Analytics.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json / tailwind.config.js / vite.config.js
│
└── .gitignore
```

---

## 🔌 REST API Reference

| Method | Route                          | Auth | Description                                  |
|--------|---------------------------------|------|-----------------------------------------------|
| POST   | `/api/auth/register`            | No   | Create an account                            |
| POST   | `/api/auth/login`               | No   | Log in, receive JWT                          |
| GET    | `/api/auth/me`                  | Yes  | Get current user profile                     |
| PUT    | `/api/auth/me`                  | Yes  | Update name / target role                    |
| POST   | `/api/interviews/start`         | Yes  | Generate questions, create a session         |
| POST   | `/api/interviews/:id/answer`    | Yes  | Submit an answer, get AI feedback            |
| POST   | `/api/interviews/:id/complete`  | Yes  | Finalize session, compute overall score      |
| GET    | `/api/interviews/:id`           | Yes  | Get full session (questions + feedback)      |
| GET    | `/api/interviews/history`       | Yes  | Get completed interview history              |
| GET    | `/api/interviews/analytics`     | Yes  | Get aggregated score analytics               |

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev              # http://localhost:5000
```

Fill in `.env`:
- `MONGO_URI` — local Mongo (`mongodb://127.0.0.1:27017/preppilot_ai`) or an Atlas connection string
- `JWT_SECRET` — any long random string
- `GEMINI_API_KEY` — get a free key at https://aistudio.google.com/app/apikey (**optional** — app works without it via fallback logic)

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

### 3. Try it out

1. Register an account → lands on Dashboard.
2. Click any mode card (HR / Technical / Behavioral / Coding) → pick difficulty + company → Start Interview.
3. Answer by typing or clicking the mic (Chrome recommended for Web Speech API support) → Submit → see AI feedback per question.
4. Finish all 5 questions → land on the Result page with overall score + breakdown.
5. Visit **Analytics** in the navbar to see score trend and mode/difficulty comparison charts.

---

## 🧠 Notes on the Gemini Integration

- Model used: `gemini-1.5-flash` via the REST `generateContent` endpoint (no SDK dependency — plain `fetch`).
- If `GEMINI_API_KEY` is missing/invalid or a Gemini request fails for any reason, `utils/geminiService.js` automatically falls back to:
  - A static question bank per mode/difficulty/company, and
  - A heuristic word-count-based scorer for feedback.
- This means the entire app is demoable end-to-end even with zero API cost/setup — useful for a resume/portfolio showcase.
