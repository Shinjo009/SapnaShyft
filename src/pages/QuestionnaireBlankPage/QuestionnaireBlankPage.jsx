import React from 'react';
import './QuestionnaireBlankPage.css';

const QuestionnaireBlankPage = ({ onBack }) => {
  return (
    <div className="questionnaire-blank-page">
      <button type="button" className="questionnaire-blank-page__back" onClick={onBack} aria-label="Go back">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <p className="questionnaire-blank-page__text">Blank questionnaire page</p>
    </div>
  );
};

export default QuestionnaireBlankPage;
