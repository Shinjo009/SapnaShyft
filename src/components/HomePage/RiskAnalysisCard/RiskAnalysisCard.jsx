import React, { useMemo } from 'react';
import './RiskAnalysisCard.css';

/**
 * RiskAnalysisCard Component - Displays risk analysis parameters with icon and value
 * 
 * Props:
 * - value: The numerical value (e.g., 85)
 * - label: Label text below the icon (e.g., "Oxidative Stress")
 * - icon: Path to the icon image
 */
const RiskAnalysisCard = ({ value = 85, label = 'Parameter', icon, onClick }) => {
  // Determine color based on value range
  const valueColor = useMemo(() => {
    if (value >= 0 && value <= 25) return '#90DF9E'; // Green
    if (value >= 26 && value <= 50) return '#DAC15A'; // Yellow
    if (value >= 51 && value <= 75) return '#EE8B48'; // Orange
    if (value >= 76 && value <= 100) return '#E95D5C'; // Red
    return '#E95D5C'; // Default to red
  }, [value]);

  return (
    <div
      className="risk-analysis-card"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {/* Icon */}
      <div className="risk-analysis-card__icon">
        <img src={icon} alt={label} />
      </div>

      {/* Label */}
      <p className="risk-analysis-card__label">{label}</p>

      {/* Value (e.g., 85/100) */}
      <div className="risk-analysis-card__value">
        <span className="risk-analysis-card__value-number" style={{ color: valueColor }}>
          {value}
        </span>
        <span className="risk-analysis-card__value-separator">/100</span>
      </div>
    </div>
  );
};

export default RiskAnalysisCard;
