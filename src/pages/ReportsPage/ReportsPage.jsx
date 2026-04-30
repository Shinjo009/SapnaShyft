import React from 'react';
import './ReportsPage.css';

/**
 * ReportsPage — uploaded reports (list will be API-backed when available).
 */
const ReportsPage = ({ onBack }) => (
  <div className="reports-page">
    <div className="reports-page__header">
      <button
        className="reports-page__back-btn"
        onClick={onBack}
        aria-label="Go back"
        type="button"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <h1 className="reports-page__title">Reports</h1>
    </div>

    <p className="reports-page__empty">No reports yet. They will appear here when available.</p>
  </div>
);

export default ReportsPage;
