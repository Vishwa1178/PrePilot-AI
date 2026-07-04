const ScoreBadge = ({ score, size = "md" }) => {
  const getColor = (s) => {
    if (s === null || s === undefined) return "bg-slate-100 text-slate-500";
    if (s >= 7) return "bg-green-100 text-green-700";
    if (s >= 4) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";

  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${getColor(score)} ${sizeClasses}`}>
      {score !== null && score !== undefined ? `${score}/10` : "—"}
    </span>
  );
};

export default ScoreBadge;
