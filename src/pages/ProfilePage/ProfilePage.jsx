import React, { useState } from 'react';
import Button from '../../components/Button';
import './ProfilePage.css';
import bgImage from '../../images/BG-2.png';
import bgImage1 from '../../images/BG-1.png';
import profileAvatarMain from '../../images/TempH.png';
import profileAvatarAccount from '../../images/TempP.png';
import editIcon from '../../images/Edit.svg';
import healthRecordsIcon from '../../images/HealthRecords.svg';
import supportIcon from '../../images/Support.svg';
import settingsIcon from '../../images/Settings.svg';
import policyIcon from '../../images/Policy.svg';
import proPhoneIcon from '../../images/Pro-Phone.svg';
import proMailIcon from '../../images/Pro-Mail.svg';
import proLocIcon from '../../images/Pro-Loc.svg';
import proGenAgeIcon from '../../images/Pro-GenAge.svg';

/**
 * ProfilePage - User profile management screen
 */
const ProfilePage = ({ onBack, onOpenReports, onOpenNutrition, onOpenCustomerSupport }) => {
  const [activeModal, setActiveModal] = useState(null);

  const closeModal = () => setActiveModal(null);

  return (
    <div className="profile-page">
      {/* Background Image */}
      <div className="profile-page__background">
        <img src={bgImage} alt="" className="profile-page__bg-image" />
      </div>

      {/* Content */}
      <div className={`profile-page__content ${activeModal ? 'profile-page__content--blurred' : ''}`}>
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
              <img src={profileAvatarMain} alt="Profile avatar" />
            </div>
            <div className="profile-page__account-info">
              <h2 className="profile-page__full-name">Harsh Bedre</h2>
            </div>
            <button className="profile-page__edit-btn" aria-label="Edit profile">
              <img src={editIcon} alt="" aria-hidden="true" />
            </button>
          </div>

          <div className="profile-page__contact-list">
            <div className="profile-page__contact-item">
              <img src={proPhoneIcon} alt="" aria-hidden="true" />
              <span>+91 98765 43210</span>
            </div>
            <div className="profile-page__contact-item">
              <img src={proMailIcon} alt="" aria-hidden="true" />
              <span>aisha.sharma@example.com</span>
            </div>
            <div className="profile-page__contact-item profile-page__contact-item--split">
              <span className="profile-page__contact-segment profile-page__contact-segment--left">
                <img src={proLocIcon} alt="" aria-hidden="true" />
                <span>Marol, Mumbai</span>
              </span>
              <span className="profile-page__contact-segment profile-page__contact-segment--right">
                <img src={proGenAgeIcon} alt="" aria-hidden="true" />
                <span>Female, 23</span>
              </span>
            </div>
          </div>

          <div className="profile-page__accounts-title">ACCOUNTS</div>

          <div className="profile-page__linked-account-row">
            <img className="profile-page__linked-account-avatar" src={profileAvatarAccount} alt="Linked account avatar" />
            <div className="profile-page__linked-account-meta">
              <span className="profile-page__linked-account-name">Prateek Salunkhe</span>
              <span className="profile-page__linked-account-relation">Spouse</span>
            </div>
            <button className="profile-page__switch-btn" type="button">Switch</button>
          </div>

          <button className="profile-page__add-account" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3.75 9H14.25M9 3.75V14.25" stroke="#4B8D83" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Add Account</span>
          </button>
        </div>

        {/* Menu Sections */}
        <div className="profile-page__menu">
          <div className="profile-page__menu-group">
            <div className="profile-page__menu-header-static">
              <img src={healthRecordsIcon} alt="" aria-hidden="true" />
              <h2>Health Wallet</h2>
            </div>
            <div className="profile-page__menu-sub-list">
              <button type="button" className="profile-page__menu-sub-item" onClick={onOpenReports}>
                <span>Reports</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="5" height="8" viewBox="0 0 5 8" fill="none" aria-hidden="true">
                  <path d="M0.75 6.75L3.75 3.75L0.75 0.75" stroke="#9A9A9A" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button type="button" className="profile-page__menu-sub-item" onClick={onOpenNutrition}>
                <span>Nutrition</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="5" height="8" viewBox="0 0 5 8" fill="none" aria-hidden="true">
                  <path d="M0.75 6.75L3.75 3.75L0.75 0.75" stroke="#9A9A9A" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="profile-page__menu-divider" />

          <div className="profile-page__menu-group">
            <div className="profile-page__menu-header-static">
              <img src={supportIcon} alt="" aria-hidden="true" />
              <h2>Support</h2>
            </div>
            <div className="profile-page__menu-sub-list">
              <button type="button" className="profile-page__menu-sub-item">
                <span>FAQ's</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="5" height="8" viewBox="0 0 5 8" fill="none" aria-hidden="true">
                  <path d="M0.75 6.75L3.75 3.75L0.75 0.75" stroke="#9A9A9A" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button type="button" className="profile-page__menu-sub-item" onClick={onOpenCustomerSupport}>
                <span>Customer Support</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="5" height="8" viewBox="0 0 5 8" fill="none" aria-hidden="true">
                  <path d="M0.75 6.75L3.75 3.75L0.75 0.75" stroke="#9A9A9A" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="profile-page__menu-divider" />

          <div className="profile-page__menu-group">
            <div className="profile-page__menu-header-static">
              <img src={settingsIcon} alt="" aria-hidden="true" />
              <h2>Settings</h2>
            </div>
            <div className="profile-page__menu-sub-list">
              <button type="button" className="profile-page__menu-sub-item">
                <span>Permissions</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="5" height="8" viewBox="0 0 5 8" fill="none" aria-hidden="true">
                  <path d="M0.75 6.75L3.75 3.75L0.75 0.75" stroke="#9A9A9A" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button type="button" className="profile-page__menu-sub-item" onClick={() => setActiveModal('delete')}>
                <span>Delete Account</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="5" height="8" viewBox="0 0 5 8" fill="none" aria-hidden="true">
                  <path d="M0.75 6.75L3.75 3.75L0.75 0.75" stroke="#9A9A9A" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="profile-page__menu-divider" />

          <div className="profile-page__menu-group">
            <div className="profile-page__menu-header-static">
              <img src={policyIcon} alt="" aria-hidden="true" />
              <h2>Policy</h2>
            </div>
            <div className="profile-page__menu-sub-list">
              <button type="button" className="profile-page__menu-sub-item">
                <span>Terms &amp; Conditions</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="5" height="8" viewBox="0 0 5 8" fill="none" aria-hidden="true">
                  <path d="M0.75 6.75L3.75 3.75L0.75 0.75" stroke="#9A9A9A" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button type="button" className="profile-page__menu-sub-item">
                <span>Privacy Policy</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="5" height="8" viewBox="0 0 5 8" fill="none" aria-hidden="true">
                  <path d="M0.75 6.75L3.75 3.75L0.75 0.75" stroke="#9A9A9A" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="profile-page__logout">
          <Button
            onClick={() => setActiveModal('logout')}
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

      {activeModal && (
        <div className="profile-page__modal-overlay" onClick={closeModal}>
          <div
            className="profile-page__delete-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundImage: `url(${bgImage1})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <button
              className="profile-page__modal-close"
              onClick={closeModal}
              aria-label="Close"
              type="button"
            >
              ×
            </button>

            {activeModal === 'delete' ? (
              <>
                <h3 className="profile-page__modal-title">Leaving so soon?</h3>
                <p className="profile-page__modal-description">
                  Your progress is too good to delete. Are you sure you want to delete your account?
                </p>
              </>
            ) : (
              <>
                <h3 className="profile-page__modal-title">Log Out?</h3>
                <p className="profile-page__modal-description">
                  You will be signed out of your account. You can sign back in anytime to continue where you left off.
                </p>
              </>
            )}

            <div className="profile-page__modal-buttons">
              <button
                className="profile-page__modal-btn profile-page__modal-btn--no"
                type="button"
                onClick={closeModal}
              >
                NO
              </button>
              <button
                className="profile-page__modal-btn profile-page__modal-btn--yes"
                type="button"
                onClick={() => {
                  if (activeModal === 'delete') {
                    console.log('Delete account confirmation clicked');
                  } else {
                    console.log('Log out confirmation clicked');
                  }
                  closeModal();
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
