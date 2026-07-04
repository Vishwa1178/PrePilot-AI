import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import { FiTarget, FiTrendingUp, FiAward } from "react-icons/fi";
import { getAnalyticsApi } from "../api/interviewService";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsApi()
      .then(({ data }) => setData(data))
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-5xl px-6 py-20 text-center text-sm text-slate-500">
          Loading analytics...
        </div>
      </div>
    );
  }

  if (!data || data.totalInterviews === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <p className="text-sm text-slate-500">
            No completed interviews yet. Finish an interview to see analytics here.
          </p>
        </div>
      </div>
    );
  }

  const trendData = {
    labels: data.scoreTrend.map((t) => new Date(t.date).toLocaleDateString()),
    datasets: [
      {
        label: "Score",
        data: data.scoreTrend.map((t) => t.score),
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.15)",
        tension: 0.35,
        fill: true,
        pointRadius: 4,
      },
    ],
  };

  const modeData = {
    labels: data.scoreByMode.map((m) => m.mode),
    datasets: [
      {
        label: "Average Score",
        data: data.scoreByMode.map((m) => m.averageScore),
        backgroundColor: "#818cf8",
        borderRadius: 6,
      },
    ],
  };

  const difficultyData = {
    labels: data.scoreByDifficulty.map((d) => d.difficulty),
    datasets: [
      {
        label: "Average Score",
        data: data.scoreByDifficulty.map((d) => d.averageScore),
        backgroundColor: "#6366f1",
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { min: 0, max: 10, ticks: { stepSize: 2 } } },
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Performance Analytics</h1>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total Interviews" value={data.totalInterviews} icon={FiTarget} accent="primary" />
          <StatCard label="Average Score" value={`${data.averageScore}/10`} icon={FiTrendingUp} accent="green" />
          <StatCard label="Strongest Mode" value={data.bestMode || "—"} icon={FiAward} accent="amber" />
        </div>

        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Score Trend Over Time</h2>
          <Line data={trendData} options={chartOptions} />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-700">Average Score by Mode</h2>
            <Bar data={modeData} options={chartOptions} />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-700">Average Score by Difficulty</h2>
            <Bar data={difficultyData} options={chartOptions} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
