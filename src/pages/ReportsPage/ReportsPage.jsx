import React from 'react';
import './ReportsPage.css';

/**
 * ReportsPage - Lists uploaded reports (API-backed later)
 */
const ReportsPage = ({ onBack }) => {
  const reports = [
    { id: '1', name: '15985465jhb6548', date: '7 sept 2025' },
    { id: '2', name: '15985465jhb6548', date: '7 sept 2025' },
  ];

  return (
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

        <button className="reports-page__add-btn" type="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none" aria-hidden="true">
            <rect y="2.40039" width="6" height="1.2" fill="white" />
            <rect x="3.59961" width="6" height="1.2" transform="rotate(90 3.59961 0)" fill="white" />
          </svg>
          <span>ADD</span>
        </button>
      </div>

      <div className="reports-page__list">
        {reports.map((report) => (
          <div key={report.id} className="reports-page__row">
            <div className="reports-page__pdf-icon" aria-hidden="true">
              <span>PDF</span>
            </div>

            <div className="reports-page__meta">
              <p className="reports-page__name">{report.name}</p>
              <p className="reports-page__date">{report.date}</p>
            </div>

            <button className="reports-page__delete-btn" type="button" aria-label="Delete report">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M4.08268 2.33335C4.08268 2.02393 4.2056 1.72719 4.42439 1.5084C4.64318 1.2896 4.93993 1.16669 5.24935 1.16669H8.74935C9.05877 1.16669 9.35551 1.2896 9.57431 1.5084C9.7931 1.72719 9.91602 2.02393 9.91602 2.33335V3.50002H12.2493C12.4041 3.50002 12.5524 3.56148 12.6618 3.67088C12.7712 3.78027 12.8327 3.92864 12.8327 4.08335C12.8327 4.23806 12.7712 4.38644 12.6618 4.49583C12.5524 4.60523 12.4041 4.66669 12.2493 4.66669H11.6258L11.12 11.7495C11.0991 12.0439 10.9674 12.3193 10.7514 12.5204C10.5355 12.7215 10.2514 12.8334 9.95627 12.8334H4.04185C3.74676 12.8334 3.46264 12.7215 3.2467 12.5204C3.03076 12.3193 2.89905 12.0439 2.8781 11.7495L2.37352 4.66669H1.74935C1.59464 4.66669 1.44627 4.60523 1.33687 4.49583C1.22747 4.38644 1.16602 4.23806 1.16602 4.08335C1.16602 3.92864 1.22747 3.78027 1.33687 3.67088C1.44627 3.56148 1.59464 3.50002 1.74935 3.50002H4.08268V2.33335ZM5.24935 3.50002H8.74935V2.33335H5.24935V3.50002ZM3.54252 4.66669L4.04243 11.6667H9.95685L10.4568 4.66669H3.54252ZM5.83268 5.83335C5.98739 5.83335 6.13577 5.89481 6.24516 6.00421C6.35456 6.1136 6.41602 6.26198 6.41602 6.41669V9.91669C6.41602 10.0714 6.35456 10.2198 6.24516 10.3292C6.13577 10.4386 5.98739 10.5 5.83268 10.5C5.67797 10.5 5.5296 10.4386 5.4202 10.3292C5.31081 10.2198 5.24935 10.0714 5.24935 9.91669V6.41669C5.24935 6.26198 5.31081 6.1136 5.4202 6.00421C5.5296 5.89481 5.67797 5.83335 5.83268 5.83335ZM8.16602 5.83335C8.32073 5.83335 8.4691 5.89481 8.5785 6.00421C8.68789 6.1136 8.74935 6.26198 8.74935 6.41669V9.91669C8.74935 10.0714 8.68789 10.2198 8.5785 10.3292C8.4691 10.4386 8.32073 10.5 8.16602 10.5C8.01131 10.5 7.86293 10.4386 7.75354 10.3292C7.64414 10.2198 7.58268 10.0714 7.58268 9.91669V6.41669C7.58268 6.26198 7.64414 6.1136 7.75354 6.00421C7.86293 5.89481 8.01131 5.83335 8.16602 5.83335Z" fill="#CCCCCC" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;
