# PrepPilot AI 🎯

[![CI](https://github.com/<your-username>/<your-repo>/actions/workflows/ci.yml/badge.svg)](https://github.com/<your-username>/<your-repo>/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

An AI-powered interview preparation platform — HR, Technical, Behavioral & Coding rounds, company-specific practice (TCS, Zoho, Amazon, Infosys, Accenture), voice-to-text answers, AI-scored feedback, and performance analytics.

**🔗 Live demo:** _add your deployed URL here once hosted (see [Deployment](#-deployment))_

**Status: Complete ✅** — Auth, Dashboard, AI Interview Engine (Gemini), Voice-to-Text, and Analytics all working, with automated tests and CI.

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

## 🛡️ Security & Reliability

- **Rate limiting** on auth endpoints (protects against brute-force/credential stuffing) and the general API surface
- **Input validation** on every route via `express-validator` (rejects malformed requests before they hit the DB)
- **Security headers** via `helmet`
- **Request logging** via `morgan`
- **Fail-fast startup** — the server refuses to boot with a clear error if required env vars are missing, instead of failing cryptically later
- **Automated tests** — 27 backend tests (Jest + Supertest) and a frontend test suite (Vitest + React Testing Library), both run automatically in CI on every push

---

## 📁 Project Structure

```
preppilot-ai/
├── .github/workflows/ci.yml   # GitHub Actions: lint + test + build
├── docker-compose.yml         # mongo + backend + frontend, one command
├── backend/
│   ├── config/db.js
│   ├── config/validateEnv.js  # fail-fast env var validation
│   ├── controllers/
│   │   ├── authController.js
│   │   └── interviewController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   ├── rateLimiters.js
│   │   └── validators.js      # express-validator rule sets
│   ├── models/
│   │   ├── User.js
│   │   └── Interview.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── interviewRoutes.js
│   ├── tests/                 # Jest + Supertest
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── geminiService.js   # Gemini question generation + feedback scoring
│   ├── Dockerfile
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
│   │   ├── tests/              # Vitest + React Testing Library
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
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

### Option A — Docker (fastest, one command)

Requires [Docker](https://docs.docker.com/get-docker/) and Docker Compose.

```bash
cp .env.example .env        # fill in JWT_SECRET (and optionally GEMINI_API_KEY)
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- MongoDB runs in its own container with a persistent volume — no local Mongo install needed.

### Option B — Run locally

#### 1. Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev              # http://localhost:5000
```

Fill in `.env`:
- `MONGO_URI` — local Mongo (`mongodb://127.0.0.1:27017/preppilot_ai`) or an Atlas connection string
- `JWT_SECRET` — any long random string (e.g. `openssl rand -hex 32`)
- `GEMINI_API_KEY` — get a free key at https://aistudio.google.com/app/apikey (**optional** — app works without it via fallback logic)

#### 2. Frontend Setup

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

## 🧪 Testing

```bash
# Backend (Jest + Supertest, DB layer mocked — no MongoDB required to run tests)
cd backend
npm test
npm run lint

# Frontend (Vitest + React Testing Library)
cd frontend
npm test
npm run lint
```

Both suites run automatically on every push/PR via [GitHub Actions](.github/workflows/ci.yml).

---

## 🐳 Deployment

**Backend** — any Node host works well: [Render](https://render.com), [Railway](https://railway.app), or [Fly.io](https://fly.io). Point it at the `backend/` folder (or use `backend/Dockerfile` directly), set `MONGO_URI` (e.g. a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster), `JWT_SECRET`, and `CLIENT_URL` to your deployed frontend URL.

**Frontend** — [Vercel](https://vercel.com) or [Netlify](https://netlify.com) both auto-detect Vite. Set `VITE_API_BASE_URL` to your deployed backend's `/api` URL. Alternatively, deploy the `frontend/Dockerfile` (nginx-served build) anywhere that runs containers.

Once deployed, drop the live URL at the top of this README — a clickable demo link is the single biggest thing that gets a portfolio project actually looked at.

---

## 🧠 Notes on the Gemini Integration

- Model used: `gemini-1.5-flash` via the REST `generateContent` endpoint (no SDK dependency — plain `fetch`).
- If `GEMINI_API_KEY` is missing/invalid or a Gemini request fails for any reason, `utils/geminiService.js` automatically falls back to:
  - A static question bank per mode/difficulty/company, and
  - A heuristic word-count-based scorer for feedback.
- This means the entire app is demoable end-to-end even with zero API cost/setup — useful for a resume/portfolio showcase.

---

## 📄 License

MIT — see [LICENSE](./LICENSE).
