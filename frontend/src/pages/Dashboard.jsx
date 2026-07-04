import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiTarget, FiTrendingUp, FiAward, FiPlay } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { getHistoryApi, getAnalyticsApi } from "../api/interviewService";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import ScoreBadge from "../components/ScoreBadge";

const MODES = [
  { key: "HR", label: "HR Round", desc: "Common HR & fit questions" },
  { key: "Technical", label: "Technical", desc: "Core CS & role-specific" },
  { key: "Behavioral", label: "Behavioral", desc: "STAR-method scenarios" },
  { key: "Coding", label: "Coding", desc: "DSA & problem solving" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ totalInterviews: 0, averageScore: 0, bestMode: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, analyticsRes] = await Promise.all([getHistoryApi(), getAnalyticsApi()]);
        setHistory(historyRes.data.interviews);
        setStats(analyticsRes.data);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here's a snapshot of your interview prep progress.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Interviews Completed" value={stats.totalInterviews} icon={FiTarget} accent="primary" />
          <StatCard
            label="Average Score"
            value={stats.totalInterviews ? `${stats.averageScore}/10` : "—"}
            icon={FiTrendingUp}
            accent="green"
          />
          <StatCard label="Strongest Mode" value={stats.bestMode || "—"} icon={FiAward} accent="amber" />
        </div>

        {/* Quick start */}
        <div className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Start a New Interview</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MODES.map((mode) => (
              <button
                key={mode.key}
                onClick={() => navigate("/interview/setup", { state: { mode: mode.key } })}
                className="group rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white">
                  <FiPlay size={16} />
                </div>
                <h3 className="font-semibold text-slate-900">{mode.label}</h3>
                <p className="mt-1 text-xs text-slate-500">{mode.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* History */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Interview History</h2>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-sm text-slate-500">Loading history...</div>
            ) : history.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No interviews yet — start your first one above!
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Mode</th>
                    <th className="px-5 py-3">Difficulty</th>
                    <th className="px-5 py-3">Company</th>
                    <th className="px-5 py-3">Score</th>
                    <th className="px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((item) => (
                    <tr
                      key={item._id}
                      onClick={() => navigate(`/interview/${item._id}/result`)}
                      className="cursor-pointer hover:bg-slate-50"
                    >
                      <td className="px-5 py-3 font-medium text-slate-800">{item.mode}</td>
                      <td className="px-5 py-3 text-slate-600">{item.difficulty}</td>
                      <td className="px-5 py-3 text-slate-600">{item.company}</td>
                      <td className="px-5 py-3">
                        <ScoreBadge score={item.overallScore} size="sm" />
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {new Date(item.completedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
