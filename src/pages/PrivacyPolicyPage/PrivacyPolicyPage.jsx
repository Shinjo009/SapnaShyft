import React from 'react';
import introIcon from '../../images/Intropp.svg';
import personsIcon from '../../images/PFWIC.svg';
import purposeIcon from '../../images/POC.svg';
import typesIcon from '../../images/TOPI.svg';
import tickIcon from '../../images/tickpp.svg';
import grievanceIcon from '../../images/grievance-officer-pp.svg';
import dataProtectionIcon from '../../images/data-protection-pp.svg';
import './PrivacyPolicyPage.css';

const purposeItems = [
  'Enable Visitors to partially access SuperShyft features and enable Members to access the complete SuperShyft platform, including personalized health reports, biometric insights, and wellness recommendations.',
  'Integrate and analyze wearable/biometric data (from smartwatches, smart rings, and similar devices) to provide deeper health and performance insights.',
  'Facilitate doctor and nutritionist consultations.',
  'Prepare suitable diet plans, activity recommendations, and lifestyle optimization guidance.',
  'Enable participation in Super Club community events (running, cycling, sports activities).',
  'Serve corporate/B2B partners by providing aggregate or individual wellness insights as per the applicable service agreement.',
];

const PrivacyPolicyPage = ({ onBack }) => {
  return (
    <div className="privacy-page">
      <div className="privacy-page__main">
        <div className="privacy-page__header">
          <button
            className="privacy-page__back-btn"
            onClick={onBack}
            aria-label="Go back"
            type="button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <h1 className="privacy-page__title">Privacy Policy</h1>
        </div>

        <div className="privacy-page__cards">
          <section className="privacy-page__card">
            <div className="privacy-page__card-header">
              <img src={introIcon} alt="" aria-hidden="true" className="privacy-page__icon" />
              <h2>Introduction</h2>
            </div>

            <p className="privacy-page__body-text">
              Welcome to SuperShyft - by Fitnastic Health Private Limited. This Privacy Policy is subject to the Terms of Use displayed on www.supershyft.com ("The Website") and the SuperShyft web and mobile application ("SuperShyft/App"). The said Website and App are owned and operated by Fitnastic Health Private Limited, a company incorporated under the provisions of the Companies Act, 2013 ("The Company", "we", "us"). The Website and App function as an intermediary as per Section 2 of the Information Technology Act, 2000.
            </p>

            <p className="privacy-page__body-text privacy-page__body-text--stacked">
              We at SuperShyft are strongly committed to your right to privacy. We have drawn out this privacy statement with regard to the information we collect from you in accordance with the provisions of Rule 3(1) of the Information Technology (Intermediaries Guidelines) Rules, 2011. By accessing/using this Website/App and/or by providing your information, you consent to the collection and use of the information you disclose on the Website/App in accordance with this Privacy Policy.
            </p>
          </section>

          <section className="privacy-page__card">
            <div className="privacy-page__card-header">
              <img src={personsIcon} alt="" aria-hidden="true" className="privacy-page__icon" />
              <h2>Persons From Whom Information Is Collected</h2>
            </div>

            <p className="privacy-page__body-text">
              <strong>SuperShyft/Website</strong> shall collect Personal Information from:
            </p>

            <ul className="privacy-page__list">
              <li>Free Membership/Visitor to the Website/App or any pages thereof ("Visitor").</li>
              <li>A person who has a One-time Paid Membership or Paid Subscription Membership ("Member") to avail our products and Services.</li>
              <li>Corporate employees enrolled through their employer/corporate partner under a B2B arrangement.</li>
            </ul>

            <p className="privacy-page__body-text privacy-page__body-text--stacked">
              In the event the aforementioned Visitors/Members are under the age of 18, they must seek the consent and assistance of their parents before providing any personal information.
            </p>
          </section>

          <section className="privacy-page__card">
            <div className="privacy-page__card-header">
              <img src={purposeIcon} alt="" aria-hidden="true" className="privacy-page__icon" />
              <h2>Purpose of Collection and Usage of Information</h2>
            </div>

            <p className="privacy-page__body-text">We collect information from you to:</p>

            <ul className="privacy-page__list">
              {purposeItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="privacy-page__card">
            <div className="privacy-page__card-header">
              <img src={typesIcon} alt="" aria-hidden="true" className="privacy-page__icon" />
              <h2>Types of Personal Information Gathered</h2>
            </div>

            <div className="privacy-page__sub-card">
              <div className="privacy-page__card-header">
                <img src={tickIcon} alt="" aria-hidden="true" className="privacy-page__icon" />
                <h3>Information Submitted by You</h3>
              </div>
              <p className="privacy-page__body-text">We collect information from you to:</p>
              <ul className="privacy-page__list">
                {purposeItems.map((item) => (
                  <li key={`submitted-${item}`}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="privacy-page__sub-card">
              <div className="privacy-page__card-header">
                <img src={tickIcon} alt="" aria-hidden="true" className="privacy-page__icon" />
                <h3>Information Not Directly Submitted by You</h3>
              </div>
              <p className="privacy-page__body-text">We collect information from you to:</p>
              <ul className="privacy-page__list">
                {purposeItems.map((item) => (
                  <li key={`not-submitted-${item}`}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="privacy-page__card privacy-page__card--last">
            <div className="privacy-page__card-header">
              <img src={grievanceIcon} alt="" aria-hidden="true" className="privacy-page__icon" />
              <h2>Grievance Officer</h2>
            </div>

            <p className="privacy-page__body-text">
              The Grievance Officer is appointed as per Section 5(9) of the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.
              <br />
              If you have any complaints, concerns, or grievances in relation to the use and/or processing of your Personal Information, or wish to report any fraudulent activity, you may send your complaints via email to:
            </p>

            <div className="privacy-page__tick-list">
              <div className="privacy-page__tick-item">
                <img src={tickIcon} alt="" aria-hidden="true" className="privacy-page__tick-icon" />
                <span>support@supershyft.com</span>
              </div>
              <div className="privacy-page__tick-item">
                <img src={tickIcon} alt="" aria-hidden="true" className="privacy-page__tick-icon" />
                <span>www.supershyft.com</span>
              </div>
              <div className="privacy-page__tick-item">
                <img src={tickIcon} alt="" aria-hidden="true" className="privacy-page__tick-icon" />
                <span>Fitnastic Health Private Limited</span>
              </div>
            </div>
          </section>

          <section className="privacy-page__card privacy-page__card--last">
            <div className="privacy-page__card-header">
              <img src={dataProtectionIcon} alt="" aria-hidden="true" className="privacy-page__icon" />
              <h2>Data Protection, Security &amp; User Rights</h2>
            </div>

            <p className="privacy-page__body-text">
              SuperShyft takes reasonable technical, administrative, and organizational measures to protect personal and health-related information from unauthorized access, misuse, loss, or disclosure, in accordance with applicable laws including the Information Technology Act, 2000, SPDI Rules, and Digital Personal Data Protection Act, 2023 where applicable.
              <br />
              Users may request access, correction, or updates to their personal information, withdraw certain consents where legally applicable, or raise concerns regarding data handling practices through official support channels, subject to operational and legal requirements.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;