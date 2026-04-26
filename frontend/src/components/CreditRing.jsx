export default function CreditRing({ score, size = 120 }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const strokeDashoffset = circumference - progress;

  const getColor = () => {
    if (score >= 70) return '#16a34a';
    if (score >= 40) return '#ca8a04';
    return '#dc2626';
  };

  const getRisk = () => {
    if (score >= 70) return { label: 'Low Risk', color: 'text-green-600' };
    if (score >= 40) return { label: 'Medium Risk', color: 'text-yellow-600' };
    return { label: 'High Risk', color: 'text-red-600' };
  };

  const risk = getRisk();

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={getColor()} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
        <text x="50" y="46" textAnchor="middle" fontSize="18" fontWeight="700" fill={getColor()} fontFamily="Syne, sans-serif">{score}</text>
        <text x="50" y="60" textAnchor="middle" fontSize="8" fill="#6b7280" fontFamily="Plus Jakarta Sans, sans-serif">/ 100</text>
      </svg>
      <span className={`text-xs font-semibold mt-1 ${risk.color}`}>{risk.label}</span>
    </div>
  );
}
