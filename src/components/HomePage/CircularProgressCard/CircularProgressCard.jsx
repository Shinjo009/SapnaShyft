import React, { useMemo } from 'react';
import './CircularProgressCard.css';

/**
 * CircularProgressCard Component - Reusable circular progress card with SVG ring indicator
 * 
 * Props:
 * - percentage: The percentage value to display (e.g., 75)
 * - label: Label text below the card (e.g., "Lifestyle score")
 */
const CircularProgressCard = ({ percentage = 75, label = 'Score' }) => {
  // SVG circle properties - stroke-based progress ring
  const RADIUS = 40; // Circle radius for 82px outer diameter with 2px stroke
  const CIRCUMFERENCE = useMemo(() => 2 * Math.PI * RADIUS, []);
  
  // Calculate stroke dasharray for progress
  const strokeDasharray = useMemo(() => {
    const filledLength = (percentage / 100) * CIRCUMFERENCE;
    return filledLength;
  }, [percentage, CIRCUMFERENCE]);

  const progressStyle = useMemo(() => {
    if (percentage >= 0 && percentage <= 25) return { color: '#90DF9E', rgb: '144 223 158' };
    if (percentage >= 26 && percentage <= 50) return { color: '#DAC15A', rgb: '218 193 90' };
    if (percentage >= 51 && percentage <= 75) return { color: '#EE8B48', rgb: '238 139 72' };
    if (percentage >= 76 && percentage <= 100) return { color: '#E95D5C', rgb: '233 93 92' };
    return { color: '#E95D5C', rgb: '233 93 92' };
  }, [percentage]);

  return (
    <div className="circular-progress-card">
      {/* SVG Progress Ring */}
      <svg 
        className="circular-progress-card__ring"
        width="85"
        height="85"
        viewBox="0 0 85 85"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background ring (unfilled) */}
        <circle
          cx="42.5"
          cy="42.5"
          r={RADIUS}
          fill="none"
          stroke="rgba(0, 0, 0, 0.25)"
          strokeWidth="2"
        />
        
        {/* Progress ring (filled) */}
        <circle
          cx="42.5"
          cy="42.5"
          r={RADIUS}
          fill="none"
          stroke={progressStyle.color}
          strokeWidth="2"
          strokeDasharray={`${strokeDasharray} ${CIRCUMFERENCE}`}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dasharray 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: 'rotate(-90deg)',
            transformOrigin: '42.5px 42.5px'
          }}
        />
      </svg>
      
      {/* Inner circle with radial gradient glow */}
      <div
        className="circular-progress-card__inner-circle"
        style={{ '--glow-rgb': progressStyle.rgb }}
      />
      
      {/* Content - percentage inside circle */}
      <div className="circular-progress-card__content">
        <span className="circular-progress-card__percentage">{percentage}</span>
      </div>

      {/* Card label */}
      <p className="circular-progress-card__label">{label}</p>

      {/* Fraction (below label with 0px gap) */}
      <div className="circular-progress-card__fraction">
        <span
          className="circular-progress-card__fraction-value"
          style={{ color: progressStyle.color }}
        >
          {percentage}
        </span>
        <span className="circular-progress-card__fraction-separator">/100</span>
      </div>
    </div>
  );
};

export default CircularProgressCard;
