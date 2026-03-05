import React from 'react';
import './MetabolicAgeCard.css';

/**
 * MetabolicAgeCard Component - Displays user's metabolic age
 * 
 * Props:
 * - age: Metabolic age value (e.g., 28)
 * - label: Description of metabolic age (e.g., "Metabolic age")
 * - detail: Additional detail (e.g., "5 years older")
 */
const MetabolicAgeCard = ({ age = 28, label = 'Metabolic age', detail = '5 years older' }) => {
  return (
    <div className="metabolic-card">
      <div className="metabolic-card__content">
        <h2 className="metabolic-card__age">{age}</h2>
        <p className="metabolic-card__label">{label}</p>
        <p className="metabolic-card__detail">{detail}</p>
      </div>
    </div>
  );
};

export default MetabolicAgeCard;
