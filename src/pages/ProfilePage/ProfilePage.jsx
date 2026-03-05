import React, { useState } from 'react';
import Button from '../../components/Button';
import './ProfilePage.css';
import bgImage from '../../images/BG-2.png';
import profileAvatarIcon from '../../images/profileavatar.svg';
import editIcon from '../../images/Edit.svg';
import profileDetailIcon from '../../images/ProfileDetails.svg';
import healthRecordsIcon from '../../images/HealthRecords.svg';
import supportIcon from '../../images/Support.svg';
import settingsIcon from '../../images/Settings.svg';
import policyIcon from '../../images/Policy.svg';
import phonecallIcon from '../../images/Phonecall.svg';
import bgImage1 from '../../images/BG-1.png';

/**
 * ProfilePage - User profile management screen
 */
const ProfilePage = ({ onBack }) => {
  const [isProfileDetailsOpen, setIsProfileDetailsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isCustomerSupportOpen, setIsCustomerSupportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [supportEmail, setSupportEmail] = useState('');
  const [supportQuery, setSupportQuery] = useState('');

  return (
    <div className="profile-page">
      {/* Background Image */}
      <div className="profile-page__background">
        <img src={bgImage} alt="" className="profile-page__bg-image" />
      </div>

      {/* Content */}
      <div className={`profile-page__content ${isDeleteModalOpen ? 'profile-page__content--blurred' : ''}`}>
        {/* Back Button Header */}
        <div className="profile-page__header">
          <button
            className="profile-page__back-btn"
            onClick={onBack}
            aria-label="Go back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="profile-page__header-title">My Profile</h1>
          <div className="profile-page__header-spacer"></div>
        </div>

        {/* Account Card */}
        <div className="profile-page__account-card">
          <div className="profile-page__account-header">
            <div className="profile-page__avatar">
              <img src={profileAvatarIcon} alt="" aria-hidden="true" />
            </div>
            <div className="profile-page__account-info">
              <h2 className="profile-page__full-name">Full Name</h2>
            </div>
            <button className="profile-page__edit-btn" aria-label="Edit profile">
              <img src={editIcon} alt="" aria-hidden="true" />
            </button>
          </div>

          <div className="profile-page__contact-row">
            <span>+91 1234567889</span>
            <span className="profile-page__separator"></span>
            <span>abc.xyz@gmail.com</span>
          </div>

          <div className="profile-page__card-divider" />

          <button className="profile-page__add-account">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9.16699 10.8334H4.16699V9.16669H9.16699V4.16669H10.8337V9.16669H15.8337V10.8334H10.8337V15.8334H9.16699V10.8334Z" fill="white"/>
            </svg>
            <span>Add Account</span>
          </button>
        </div>

        {/* Menu Sections */}
        <div className="profile-page__menu">
          {/* Profile Details */}
          <div className="profile-page__menu-section profile-page__menu-section--profile-details">
            <button
              className="profile-page__menu-header profile-page__menu-header--clickable"
              type="button"
              onClick={() => setIsProfileDetailsOpen((prev) => !prev)}
            >
              <img src={profileDetailIcon} alt="" aria-hidden="true" />
              <h2>Profile Details</h2>
            </button>
            {isProfileDetailsOpen ? (
              <div className="profile-page__details-list">
                <div className="profile-page__details-row">
                  <span className="profile-page__details-text">Name</span>
                  <span className="profile-page__details-text">Full Name</span>
                </div>
                <div className="profile-page__details-row">
                  <span className="profile-page__details-text">Date of Birth</span>
                  <span className="profile-page__details-text">24-11-2004</span>
                </div>
                <div className="profile-page__details-row">
                  <span className="profile-page__details-text">City</span>
                  <span className="profile-page__details-text">Mumbai</span>
                </div>
                <div className="profile-page__details-row">
                  <span className="profile-page__details-text">Email</span>
                  <span className="profile-page__details-text">abc.xyz@gmail.com</span>
                </div>
                <div className="profile-page__details-row">
                  <span className="profile-page__details-text">Phone No.</span>
                  <span className="profile-page__details-text">+91 1234567889</span>
                </div>
              </div>
            ) : (
              <div className="profile-page__menu-items-row">
                <span className="profile-page__menu-item">Address</span>
                <svg className="profile-page__menu-dot" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 4 4" fill="none">
                  <circle cx="2" cy="2" r="2" fill="#999999"/>
                </svg>
                <span className="profile-page__menu-item">Email</span>
                <svg className="profile-page__menu-dot" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 4 4" fill="none">
                  <circle cx="2" cy="2" r="2" fill="#999999"/>
                </svg>
                <span className="profile-page__menu-item">Phone</span>
              </div>
            )}
          </div>

          {/* Health Records */}
          <div className="profile-page__menu-section">
            <div className="profile-page__menu-header">
              <img src={healthRecordsIcon} alt="" aria-hidden="true" />
              <h2>Health Records</h2>
            </div>
            <div className="profile-page__menu-items-row">
              <span className="profile-page__menu-item">Reports</span>
              <svg className="profile-page__menu-dot" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 4 4" fill="none">
                <circle cx="2" cy="2" r="2" fill="#999999"/>
              </svg>
              <span className="profile-page__menu-item">Nutrition</span>
            </div>
          </div>

          {/* Support */}
          <div className="profile-page__menu-section profile-page__menu-section--support">
            <button
              className="profile-page__menu-header profile-page__menu-header--clickable"
              type="button"
              onClick={() => setIsSupportOpen((prev) => !prev)}
            >
              <img src={supportIcon} alt="" aria-hidden="true" />
              <h2>Support</h2>
            </button>
            {isSupportOpen ? (
              <div className="profile-page__support-content">
                {/* FAQ's Section */}
                <div className="profile-page__support-section">
                  <h3 className="profile-page__support-subtitle">FAQ's</h3>
                  <div className="profile-page__faq-list">
                    <div className="profile-page__faq-item">
                      <span className="profile-page__faq-question">How to book an appointment?</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="5" height="8" viewBox="0 0 5 8" fill="none">
                        <path d="M0.75 6.75L3.75 3.75L0.75 0.75" stroke="#E4FFFE" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="profile-page__faq-item">
                      <span className="profile-page__faq-question">When will I receive my Bio-AI reports?</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="5" height="8" viewBox="0 0 5 8" fill="none">
                        <path d="M0.75 6.75L3.75 3.75L0.75 0.75" stroke="#E4FFFE" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="profile-page__faq-item">
                      <span className="profile-page__faq-question">Can my appointment be rescheduled?</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="5" height="8" viewBox="0 0 5 8" fill="none">
                        <path d="M0.75 6.75L3.75 3.75L0.75 0.75" stroke="#E4FFFE" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="profile-page__faq-item">
                      <span className="profile-page__faq-question">Can my appointment be cancelled?</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="5" height="8" viewBox="0 0 5 8" fill="none">
                        <path d="M0.75 6.75L3.75 3.75L0.75 0.75" stroke="#E4FFFE" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="profile-page__faq-item">
                      <span className="profile-page__faq-question">Are any documents required to undergo the tests?</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="5" height="8" viewBox="0 0 5 8" fill="none">
                        <path d="M0.75 6.75L3.75 3.75L0.75 0.75" stroke="#E4FFFE" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Customer Support Section */}
                <div className="profile-page__support-section">
                  <button
                    className="profile-page__support-dropdown-header"
                    type="button"
                    onClick={() => setIsCustomerSupportOpen((prev) => !prev)}
                  >
                    <span className="profile-page__support-subtitle">Customer Support</span>
                    <svg
                      className={`profile-page__support-chevron ${isCustomerSupportOpen ? 'profile-page__support-chevron--open' : ''}`}
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="8"
                      viewBox="0 0 12 8"
                      fill="none"
                    >
                      <path d="M1 1L6 6L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {isCustomerSupportOpen && (
                    <div className="profile-page__customer-support-form">
                      <input
                        type="text"
                        className="profile-page__support-input"
                        placeholder="Your Email/ Phone No."
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                      />
                      <input
                        type="text"
                        className="profile-page__support-input"
                        placeholder="Your Query"
                        value={supportQuery}
                        onChange={(e) => setSupportQuery(e.target.value)}
                      />
                      <button className="profile-page__submit-btn" type="button">
                        Submit
                      </button>
                      <div className="profile-page__or-divider">OR</div>
                      <div className="profile-page__call-us">
                        <img src={phonecallIcon} alt="" aria-hidden="true" className="profile-page__call-us-icon" />
                        <span className="profile-page__call-us-text">Call Us At : </span>
                        <span className="profile-page__call-us-number">+91 1234556789</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="profile-page__menu-items-row">
                <span className="profile-page__menu-item">FAQ's</span>
                <svg className="profile-page__menu-dot" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 4 4" fill="none">
                  <circle cx="2" cy="2" r="2" fill="#999999"/>
                </svg>
                <span className="profile-page__menu-item">Customer Support</span>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="profile-page__menu-section profile-page__menu-section--settings">
            <button
              className="profile-page__menu-header profile-page__menu-header--clickable"
              type="button"
              onClick={() => setIsSettingsOpen((prev) => !prev)}
            >
              <img src={settingsIcon} alt="" aria-hidden="true" />
              <h2>Settings</h2>
            </button>
            {isSettingsOpen ? (
              <div className="profile-page__settings-list">
                <div className="profile-page__settings-item">
                  <span className="profile-page__settings-text">Payment & Subscription</span>
                </div>
                <div className="profile-page__settings-item">
                  <span className="profile-page__settings-text">Permissions</span>
                </div>
                <button
                  className="profile-page__settings-item profile-page__settings-item--clickable"
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  <span className="profile-page__settings-text">Delete Account</span>
                </button>
              </div>
            ) : (
              <div className="profile-page__menu-items-row">
                <span className="profile-page__menu-item">Payment & Subscription</span>
                <svg className="profile-page__menu-dot" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 4 4" fill="none">
                  <circle cx="2" cy="2" r="2" fill="#999999"/>
                </svg>
                <span className="profile-page__menu-item">Permissions</span>
                <svg className="profile-page__menu-dot" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 4 4" fill="none">
                  <circle cx="2" cy="2" r="2" fill="#999999"/>
                </svg>
                <span className="profile-page__menu-item">Delete Account</span>
              </div>
            )}
          </div>

          {/* Policy */}
          <div className="profile-page__menu-section profile-page__menu-section--policy">
            <button
              className="profile-page__menu-header profile-page__menu-header--clickable"
              type="button"
              onClick={() => setIsPolicyOpen((prev) => !prev)}
            >
              <img src={policyIcon} alt="" aria-hidden="true" />
              <h2>Policy</h2>
            </button>
            {isPolicyOpen ? (
              <div className="profile-page__policy-list">
                <div className="profile-page__policy-list-item">
                  <span className="profile-page__policy-list-text">Terms & Conditions</span>
                </div>
                <div className="profile-page__policy-list-item">
                  <span className="profile-page__policy-list-text">Privacy Policy</span>
                </div>
              </div>
            ) : (
              <div className="profile-page__menu-items-row">
                <span className="profile-page__menu-item">Terms & Conditions</span>
                <svg className="profile-page__menu-dot" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 4 4" fill="none">
                  <circle cx="2" cy="2" r="2" fill="#999999"/>
                </svg>
                <span className="profile-page__menu-item">Privacy Policy</span>
              </div>
            )}
          </div>
        </div>

        <div className="profile-page__logout">
          <Button
            icon={(
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M1.616 16C1.15533 16 0.771 15.846 0.463 15.538C0.155 15.23 0.000666667 14.8453 0 14.384V1.616C0 1.15533 0.154333 0.771 0.463 0.463C0.771667 0.155 1.156 0.000666667 1.616 0H8.019V1H1.616C1.462 1 1.32067 1.064 1.192 1.192C1.06333 1.32 0.999333 1.46133 1 1.616V14.385C1 14.5383 1.064 14.6793 1.192 14.808C1.32 14.9367 1.461 15.0007 1.615 15H8.019V16H1.616ZM12.462 11.539L11.76 10.819L14.079 8.5H5.192V7.5H14.079L11.759 5.18L12.461 4.462L16 8L12.462 11.539Z" fill="white"/>
              </svg>
            )}
          >
            Log Out
          </Button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="profile-page__modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="profile-page__delete-modal" onClick={(e) => e.stopPropagation()} style={{ backgroundImage: `url(${bgImage1})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <button
              className="profile-page__modal-close"
              onClick={() => setIsDeleteModalOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="profile-page__modal-title">Leaving so soon?</h3>
            <p className="profile-page__modal-description">
              Your progress is too good to delete. Are you sure you're ready to say goodbye?
            </p>
            <div className="profile-page__modal-buttons">
              <button
                className="profile-page__modal-btn profile-page__modal-btn--no"
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                NO
              </button>
              <button
                className="profile-page__modal-btn profile-page__modal-btn--yes"
                type="button"
                onClick={() => {
                  // Handle account deletion
                  console.log('Account deletion confirmed');
                  setIsDeleteModalOpen(false);
                }}
              >
                YES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
