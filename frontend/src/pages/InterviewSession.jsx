import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiMic, FiMicOff, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import Navbar from "../components/Navbar";
import ScoreBadge from "../components/ScoreBadge";
import useSpeechToText from "../hooks/useSpeechToText";
import { getInterviewApi, submitAnswerApi, completeInterviewApi } from "../api/interviewService";

const InterviewSession = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(location.state?.interview || null);
  const [loadingInterview, setLoadingInterview] = useState(!location.state?.interview);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechToText();

  // Load interview if not passed via navigation state (e.g. page refresh)
  useEffect(() => {
    if (!interview) {
      getInterviewApi(id)
        .then(({ data }) => setInterview(data.interview))
        .catch(() => toast.error("Could not load interview session"))
        .finally(() => setLoadingInterview(false));
    }
  }, [id, interview]);

  // Append live transcript into the answer textarea
  useEffect(() => {
    if (transcript) {
      setAnswerText((prev) => (prev ? `${prev} ${transcript}`.trim() : transcript));
      resetTranscript();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  if (loadingInterview) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-2xl px-6 py-20 text-center text-sm text-slate-500">
          Loading interview session...
        </div>
      </div>
    );
  }

  if (!interview) return null;

  const totalQuestions = interview.questions.length;
  const currentQuestion = interview.questions[currentIndex];
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleMicToggle = () => {
    if (!isSupported) {
      toast.error("Voice input isn't supported in this browser. Try Chrome.");
      return;
    }
    isListening ? stopListening() : startListening();
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) {
      toast.error("Please provide an answer before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await submitAnswerApi(interview._id, {
        questionIndex: currentIndex,
        answerText,
      });
      setFeedback(data.feedback);
    } catch (error) {
      toast.error("Failed to evaluate answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      try {
        await completeInterviewApi(interview._id);
        toast.success("Interview completed!");
        navigate(`/interview/${interview._id}/result`);
      } catch {
        toast.error("Failed to finalize interview.");
      }
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setAnswerText("");
    setFeedback(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-10">
        {/* Progress */}
        <div className="mb-6 flex items-center justify-between text-sm text-slate-500">
          <span>
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="rounded-full bg-primary-50 px-3 py-1 font-medium text-primary-700">
            {interview.mode} · {interview.difficulty} · {interview.company}
          </span>
        </div>
        <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-primary-600 transition-all"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Question card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{currentQuestion.questionText}</h2>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <label className="label-text">Your answer</label>
              <button
                type="button"
                onClick={handleMicToggle}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  isListening
                    ? "bg-red-100 text-red-700 animate-pulse"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {isListening ? <FiMicOff size={14} /> : <FiMic size={14} />}
                {isListening ? "Stop recording" : "Speak answer"}
              </button>
            </div>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Type your answer, or use the mic to speak it..."
              rows={6}
              disabled={!!feedback}
              className="input-field mt-2 resize-none disabled:bg-slate-50"
            />
          </div>

          {!feedback ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={submitting}
              className="btn-primary mt-5"
            >
              {submitting ? "Evaluating with AI..." : "Submit Answer"}
            </button>
          ) : (
            <div className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <FiCheckCircle className="text-green-600" /> AI Feedback
                </h3>
                <ScoreBadge score={feedback.score} />
              </div>

              {feedback.strengths?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                    Strengths
                  </p>
                  <ul className="mt-1 list-inside list-disc text-sm text-slate-700">
                    {feedback.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.weaknesses?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Weaknesses
                  </p>
                  <ul className="mt-1 list-inside list-disc text-sm text-slate-700">
                    {feedback.weaknesses.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.tips?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
                    Improvement Tips
                  </p>
                  <ul className="mt-1 list-inside list-disc text-sm text-slate-700">
                    {feedback.tips.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button onClick={handleNext} className="btn-primary mt-2">
                {isLastQuestion ? "Finish Interview" : "Next Question"}{" "}
                <FiArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InterviewSession;
