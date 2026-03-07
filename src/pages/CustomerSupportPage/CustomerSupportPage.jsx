import React, { useState } from 'react';
import whatsappIcon from '../../images/whatsapp.svg';
import './CustomerSupportPage.css';

/**
 * CustomerSupportPage - Contact support form
 */
const CustomerSupportPage = ({ onBack }) => {
  const [contact, setContact] = useState('');
  const [query, setQuery] = useState('');

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

        <button className="customer-support-page__submit" type="button">
          Submit
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
