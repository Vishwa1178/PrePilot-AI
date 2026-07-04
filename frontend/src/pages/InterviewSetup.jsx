import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiPlay } from "react-icons/fi";
import Navbar from "../components/Navbar";
import { startInterviewApi } from "../api/interviewService";

const MODES = ["HR", "Technical", "Behavioral", "Coding"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const COMPANIES = ["General", "TCS", "Zoho", "Amazon", "Infosys", "Accenture"];

const InterviewSetup = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [mode, setMode] = useState(location.state?.mode || "HR");
  const [difficulty, setDifficulty] = useState("Medium");
  const [company, setCompany] = useState("General");
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const { data } = await startInterviewApi({ mode, difficulty, company });
      toast.success("Interview session ready!");
      navigate(`/interview/${data.interview._id}/session`, { state: { interview: data.interview } });
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to start interview. Try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const OptionGroup = ({ title, options, selected, onSelect }) => (
    <div className="mb-6">
      <p className="label-text">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              selected === opt
                ? "border-primary-600 bg-primary-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-primary-300"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Set up your interview</h1>
          <p className="mt-1 mb-6 text-sm text-slate-500">
            Choose your interview mode, difficulty, and target company. Questions are
            generated fresh by AI for each session.
          </p>

          <OptionGroup title="Interview Mode" options={MODES} selected={mode} onSelect={setMode} />
          <OptionGroup
            title="Difficulty"
            options={DIFFICULTIES}
            selected={difficulty}
            onSelect={setDifficulty}
          />
          <OptionGroup
            title="Target Company"
            options={COMPANIES}
            selected={company}
            onSelect={setCompany}
          />

          <button onClick={handleStart} disabled={loading} className="btn-primary mt-2">
            {loading ? (
              "Generating questions..."
            ) : (
              <>
                <FiPlay size={16} /> Start Interview
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default InterviewSetup;
