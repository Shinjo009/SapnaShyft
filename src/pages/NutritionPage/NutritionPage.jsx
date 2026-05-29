import React from 'react';
import './NutritionPage.css';

/**
 * NutritionPage - Nutrition section from profile
 */
const NutritionPage = ({ onBack }) => {
  return (
    <div className="nutrition-page">
      <div className="nutrition-page__header">
        <button
          className="nutrition-page__back-btn"
          onClick={onBack}
          aria-label="Go back"
          type="button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <h1 className="nutrition-page__title">Nutrition</h1>
      </div>

      <div className="nutrition-page__empty">
        <p className="nutrition-page__empty-message">No nutrition plan available yet</p>
      </div>

      <button type="button" className="nutrition-page__done-btn" onClick={onBack}>
        Done
      </button>
    </div>
  );
};

export default NutritionPage;
