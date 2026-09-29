import React from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showSubtitle?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 'md',
  label = 'Overall Score',
  showSubtitle = true,
}) => {
  const safeScore = Math.min(100, Math.max(0, Math.round(score)));

  // Color selection
  let strokeColor = '#10b981'; // emerald-500
  let bgColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let ratingText = 'Good';

  if (safeScore < 60) {
    strokeColor = '#f43f5e'; // rose-500
    bgColor = 'bg-rose-50 text-rose-700 border-rose-200';
    ratingText = 'Needs Work';
  } else if (safeScore < 80) {
    strokeColor = '#f59e0b'; // amber-500
    bgColor = 'bg-amber-50 text-amber-700 border-amber-200';
    ratingText = 'Fair';
  } else if (safeScore >= 90) {
    ratingText = 'Excellent';
  }

  const dimensions = {
    sm: { radius: 36, stroke: 6, width: 88, text: 'text-xl', sub: 'text-[10px]' },
    md: { radius: 54, stroke: 9, width: 132, text: 'text-3xl', sub: 'text-xs' },
    lg: { radius: 76, stroke: 12, width: 180, text: 'text-5xl', sub: 'text-sm' },
  }[size];

  const circumference = 2 * Math.PI * dimensions.radius;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative flex items-center justify-center">
        <svg
          width={dimensions.width}
          height={dimensions.width}
          viewBox={`0 0 ${dimensions.width} ${dimensions.width}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.width / 2}
            r={dimensions.radius}
            fill="transparent"
            stroke="#e2e8f0"
            strokeWidth={dimensions.stroke}
          />
          {/* Progress circle */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.width / 2}
            r={dimensions.radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-extrabold tracking-tight text-slate-900 ${dimensions.text}`}>
            {safeScore}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            / 100
          </span>
        </div>
      </div>

      {showSubtitle && (
        <div className="mt-2.5 flex flex-col items-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </span>
          <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bgColor}`}>
            {ratingText}
          </span>
        </div>
      )}
    </div>
  );
};
