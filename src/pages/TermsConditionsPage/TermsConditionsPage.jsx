import React from 'react';
import infoIcon from '../../images/info-terms.svg';
import eligibilityIcon from '../../images/Eligibility-terms.svg';
import servicesIcon from '../../images/Services-terms.svg';
import './TermsConditionsPage.css';

const TermsConditionsPage = ({ onBack }) => {
  return (
    <div className="terms-page">
      <div className="terms-page__main">
        <div className="terms-page__header">
          <button
            className="terms-page__back-btn"
            onClick={onBack}
            aria-label="Go back"
            type="button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <h1 className="terms-page__title">Terms &amp; Conditions</h1>
        </div>

        <div className="terms-page__cards">
          <section className="terms-page__card">
            <div className="terms-page__card-header">
              <img src={infoIcon} alt="" aria-hidden="true" className="terms-page__icon" />
              <h2>Introduction</h2>
            </div>

            <p className="terms-page__body-text">
              Welcome to Super Shyft.
              <br />
              Super Shyft is a preventive healthcare platform that enables users to access health assessments, diagnostic testing through partner laboratories, health insights, and lifestyle recommendations through its mobile application and associated services.
              <br />
              By accessing or using the Super Shyft application, website, or services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you should not use the platform.
            </p>
          </section>

          <section className="terms-page__card">
            <div className="terms-page__card-header">
              <img src={eligibilityIcon} alt="" aria-hidden="true" className="terms-page__icon" />
              <h2>Eligibility</h2>
            </div>

            <p className="terms-page__body-text">
              To use the Super Shyft platform:
              <br />
              •  You must be at least 18 years old.
              <br />
              •  Users under 18 may only use the platform through a parent or legal guardian.
              <br />
              •  You agree to provide accurate and complete information when creating an account or using the services.
              <br />
              Super Shyft reserves the right to suspend or terminate accounts that provide false or misleading information.
            </p>
          </section>

          <section className="terms-page__card">
            <div className="terms-page__card-header">
              <img src={servicesIcon} alt="" aria-hidden="true" className="terms-page__icon" />
              <h2>Services Provided</h2>
            </div>

            <p className="terms-page__body-text">
              Super Shyft provides a preventive healthcare platform that may include:
              <br />
              • Preventive health assessments
              <br />
              • Diagnostic blood tests facilitated through certified partner laboratories
              <br />
              • Home sample collection services
              <br />
              • Corporate health camp participation
              <br />
              • Health reports and analytics
              <br />
              • Preventive health insights and lifestyle recommendations
              <br />
              • Access to healthcare professionals when applicable
              <br />
              Super Shyft does not operate its own diagnostic laboratory and acts as a technology platform connecting users with certified healthcare service providers.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsConditionsPage;
