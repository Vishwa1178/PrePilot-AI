import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiHome, FiRefreshCw } from "react-icons/fi";
import Navbar from "../components/Navbar";
import ScoreBadge from "../components/ScoreBadge";
import { getInterviewApi } from "../api/interviewService";

const InterviewResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInterviewApi(id)
      .then(({ data }) => setInterview(data.interview))
      .catch(() => toast.error("Could not load interview result"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center text-sm text-slate-500">
          Loading result...
        </div>
      </div>
    );
  }

  if (!interview) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-10">
        {/* Summary card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            {interview.mode} · {interview.difficulty} · {interview.company}
          </p>
          <h1 className="mt-2 text-4xl font-extrabold text-slate-900">
            {interview.overallScore}
            <span className="text-lg font-medium text-slate-400">/10</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">Overall Interview Score</p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <FiHome size={15} /> Dashboard
            </button>
            <button
              onClick={() => navigate("/interview/setup", { state: { mode: interview.mode } })}
              className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              <FiRefreshCw size={15} /> Practice Again
            </button>
          </div>
        </div>

        {/* Per-question breakdown */}
        <div className="mt-8 space-y-5">
          <h2 className="text-lg font-semibold text-slate-900">Question Breakdown</h2>
          {interview.questions.map((q, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-medium text-slate-900">
                  {idx + 1}. {q.questionText}
                </h3>
                <ScoreBadge score={q.score} />
              </div>

              {q.answerText && (
                <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                  <span className="font-medium text-slate-500">Your answer: </span>
                  {q.answerText}
                </p>
              )}

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                    Strengths
                  </p>
                  <ul className="mt-1 list-inside list-disc text-xs text-slate-600">
                    {q.strengths.length ? q.strengths.map((s, i) => <li key={i}>{s}</li>) : <li>—</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Weaknesses
                  </p>
                  <ul className="mt-1 list-inside list-disc text-xs text-slate-600">
                    {q.weaknesses.length ? q.weaknesses.map((w, i) => <li key={i}>{w}</li>) : <li>—</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">Tips</p>
                  <ul className="mt-1 list-inside list-disc text-xs text-slate-600">
                    {q.tips.length ? q.tips.map((t, i) => <li key={i}>{t}</li>) : <li>—</li>}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default InterviewResult;
