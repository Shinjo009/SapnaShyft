import React, { useState } from 'react';
import whatsappIcon from '../../images/whatsapp.svg';
import { submitSupportTicket } from '../../services/usersService';
import './CustomerSupportPage.css';

/**
 * CustomerSupportPage - Contact support form
 */
const CustomerSupportPage = ({ onBack }) => {
  const [contact, setContact] = useState('');
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const contactInput = contact.trim();
    const queryText = query.trim();

    if (!contactInput || !queryText || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await submitSupportTicket({
        contact_input: contactInput,
        query_text: queryText,
      });
      setContact('');
      setQuery('');
      window.alert('Your ticket has been submitted successfully.');
    } catch (error) {
      window.alert(error?.message || 'Failed to submit your ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="customer-support-page">
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

        <input
          className="customer-support-page__input"
          placeholder="Your Email/ Phone No."
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />

        <textarea
          className="customer-support-page__query"
          placeholder="Type your query here ..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button className="customer-support-page__submit" type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>

        <p className="customer-support-page__text customer-support-page__or">OR</p>

        <div className="customer-support-page__contact-box">
          <div className="customer-support-page__contact-inner">
            <img src={whatsappIcon} alt="WhatsApp" className="customer-support-page__whatsapp" />
            <div className="customer-support-page__contact-copy">
              <p className="customer-support-page__contact-title">Contact us on WhatsApp</p>
              <p className="customer-support-page__contact-number">+91 1234556789</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupportPage;
