import React from 'react';
import './AllAppointmentsPage.css';

const AllAppointmentsPage = ({ onBack }) => {
  return (
    <div className="all-appointments-page">
      <div className="all-appointments-page__header">
        <button
          className="all-appointments-page__back-btn"
          onClick={onBack}
          aria-label="Go back"
          type="button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <h1 className="all-appointments-page__title">All Appointments</h1>
      </div>

      <div className="all-appointments-page__content">
        <p className="all-appointments-page__placeholder">No appointments yet.</p>
      </div>
    </div>
  );
};

export default AllAppointmentsPage;