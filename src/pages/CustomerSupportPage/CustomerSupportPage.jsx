import React, { useState } from 'react';
import { submitSupportTicket } from '../../services/usersService';
import './CustomerSupportPage.css';

/**
 * CustomerSupportPage - Contact support form
 */
const CustomerSupportPage = ({ onBack }) => {
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async () => {
    const queryText = query.trim();

    if (!queryText || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await submitSupportTicket({
        contact_input: 'Not Provided',
        query_text: queryText,
      });
      setQuery('');
      setShowSuccessModal(true);
    } catch (error) {
      window.alert(error?.message || 'Failed to submit your ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`customer-support-page${showSuccessModal ? ' customer-support-page--modal-open' : ''}`}>
      <div className="customer-support-page__header">
        <button
          className="customer-support-page__back-btn"
          onClick={onBack}
          aria-label="Go back"
          type="button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <h1 className="customer-support-page__title">Customer Support</h1>
      </div>

      <div className="customer-support-page__content">
        <p className="customer-support-page__text customer-support-page__text--left">Tell us about your issue</p>

        <textarea
          className="customer-support-page__query"
          placeholder="Type your query here ..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button className="customer-support-page__submit" type="button" onClick={handleSubmit} disabled={isSubmitting || !query.trim()}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      {showSuccessModal ? (
        <div className="customer-support-page__success-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="customer-support-page__success-card" onClick={(e) => e.stopPropagation()}>
            <div className="customer-support-page__success-icon-box" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path d="M14.3333 1L5.16667 10.1667L1 6" stroke="#90DF9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="customer-support-page__success-title">Request Submitted Successfully</p>
            <p className="customer-support-page__success-text">Thanks for reaching out! We've received your query and our team will get back to you shortly.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CustomerSupportPage;
