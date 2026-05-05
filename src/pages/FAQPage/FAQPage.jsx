import React, { useState } from 'react';
import './FAQPage.css';

const faqItems = [
  {
    id: 'book-appointment',
    question: 'How do I book an appointment?',
    answer:
      'Open the Supershyft app and go to the Home section. Choose your preferred service or specialist, select a suitable time slot, and confirm your details. Once booked, you will receive a confirmation.',
  },
  {
    id: 'reschedule',
    question: 'Can I reschedule my appointment?',
    answer:
      'Yes, you can reschedule your appointment from your Health Wallet, then go to the My Appointments section, select your existing booking, and choose a new available date and time.',
  },
  {
    id: 'cancel',
    question: 'How do I cancel an appointment?',
    answer:
      'Go to your appointment details Health Wallet, then go to My Appointments section, select your existing booking, and select Cancel. You will be able to review the final status and refund eligibility (if applicable) before confirming.',
  },
  {
    id: 'reports',
    question: 'How do I download my reports?',
    answer:
      'You can download your reports directly from the Home screen. Use the floating button at the bottom right-hand side to access and download them instantly.',
  },
];

const FAQPage = ({ onBack }) => {
  const [openId, setOpenId] = useState('book-appointment');

  const toggleItem = (id) => {
    setOpenId((prev) => (prev === id ? '' : id));
  };

  return (
    <div className="faq-page">
      <div className="faq-page__header">
        <button
          className="faq-page__back-btn"
          onClick={onBack}
          aria-label="Go back"
          type="button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <h1 className="faq-page__title">FAQ's</h1>
      </div>

      <div className="faq-page__content">
        <div className="faq-page__list">
          {faqItems.map((item) => {
            const isOpen = openId === item.id;

            return (
              <div key={item.id} className="faq-page__item">
                <button
                  type="button"
                  className="faq-page__question-row"
                  onClick={() => toggleItem(item.id)}
                >
                  <span className="faq-page__question">{item.question}</span>

                  {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="5" viewBox="0 0 8 5" fill="none" aria-hidden="true">
                      <path d="M0.75 3.75L3.75 0.75L6.75 3.75" stroke="#E4FFFE" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="5" viewBox="0 0 8 5" fill="none" aria-hidden="true">
                      <path d="M0.749999 0.75L3.75 3.75L6.75 0.75" stroke="#E4FFFE" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                {isOpen && <p className="faq-page__answer">{item.answer}</p>}

                <div className="faq-page__divider" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
