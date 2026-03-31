import React, { useState } from 'react';
import './DoctorsPage.css';
import NavBar from '../../components/NavBar';
import doctorAvatar from '../../images/doc.svg';
import nutritionistAvatar from '../../images/nutritionist.svg';
import sarahPhoto from '../../images/sarah.svg';
import verifiedBadge from '../../images/verified.svg';
import lizzyPhoto from '../../images/lizzy.png';

const PILLS = ['All', 'General Physician', 'Nutritionist', 'Combined'];

const SearchIcon = ({ stroke = 'rgba(255, 255, 255, 0.72)' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 21L16.65 16.65" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M17 18C17.5304 18 18.0391 18.2107 18.4142 18.5858C18.7893 18.9609 19 19.4696 19 20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22C16.4696 22 15.9609 21.7893 15.5858 21.4142C15.2107 21.0391 15 20.5304 15 20C15 18.89 15.89 18 17 18ZM1 2H4.27L5.21 4H20C20.2652 4 20.5196 4.10536 20.7071 4.29289C20.8946 4.48043 21 4.73478 21 5C21 5.17 20.95 5.34 20.88 5.5L17.3 11.97C16.96 12.58 16.3 13 15.55 13H8.1L7.2 14.63L7.17 14.75C7.17 14.8163 7.19634 14.8799 7.24322 14.9268C7.29011 14.9737 7.3537 15 7.42 15H19V17H7C6.46957 17 5.96086 16.7893 5.58579 16.4142C5.21071 16.0391 5 15.5304 5 15C5 14.65 5.09 14.32 5.24 14.04L6.6 11.59L3 4H1V2ZM7 18C7.53043 18 8.03914 18.2107 8.41421 18.5858C8.78929 18.9609 9 19.4696 9 20C9 20.5304 8.78929 21.0391 8.41421 21.4142C8.03914 21.7893 7.53043 22 7 22C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20C5 18.89 5.89 18 7 18Z" fill="white" />
  </svg>
);

const RatingStarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2.23125 11.0833L3.17917 6.98542L0 4.22917L4.2 3.86458L5.83333 0L7.46667 3.86458L11.6667 4.22917L8.4875 6.98542L9.43542 11.0833L5.83333 8.91042L2.23125 11.0833Z" fill="#90DF9E"/>
  </svg>
);

const shouldShowCard = (activePill, cardType) => {
  if (activePill === 'All') {
    return true;
  }

  if (activePill === 'General Physician') {
    return cardType === 'general';
  }

  if (activePill === 'Nutritionist') {
    return cardType === 'nutritionist';
  }

  if (activePill === 'Combined') {
    return cardType === 'combined';
  }

  return false;
};

const DoctorsPage = ({ onBack, onOpenPackages, onOpenDoctorProfile, onOpenNutritionistProfile, onOpenIntegratedProfile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activePill, setActivePill] = useState('All');

  return (
    <div className="doctors-page">
      <div className="doctors-page__fixed-top">
        <header className="doctors-page__header">
          <div className="doctors-page__header-left">
            <h1 className="doctors-page__title">Consult Experts</h1>
          </div>

          <div className="doctors-page__header-actions">
            <button type="button" className="doctors-page__icon-btn" aria-label="Open cart">
              <CartIcon />
            </button>
          </div>
        </header>

        <div className="doctors-page__search-row">
          <SearchIcon />
          <input
            type="text"
            className="doctors-page__search-input"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search doctors, nutritionists,..."
            aria-label="Search doctors"
          />
        </div>

        <div className="doctors-page__pills" role="tablist" aria-label="Specialist filters">
          {PILLS.map((pill) => {
            const isActive = pill === activePill;
            return (
              <button
                key={pill}
                type="button"
                className={`doctors-page__pill ${isActive ? 'is-active' : ''}`}
                onClick={() => setActivePill(pill)}
                role="tab"
                aria-selected={isActive}
              >
                {pill}
              </button>
            );
          })}
        </div>
      </div>

      <div className="doctors-page__content">
        <div className="doctors-page__cards">
        {shouldShowCard(activePill, 'combined') ? (
        <article className="doctors-card" aria-label="Integrated health experts">
          <div className="doctors-card__top">
            <div className="doctors-card__rating" aria-label="Rating 4.9">
              <RatingStarIcon />
              <span className="doctors-card__rating-text">4.9</span>
            </div>

            <div className="doctors-card__avatars" aria-hidden="true">
              <img className="doctors-card__avatar" src={doctorAvatar} alt="" />
              <img className="doctors-card__avatar" src={nutritionistAvatar} alt="" />
            </div>

            <h2 className="doctors-card__title">Integrated Health Program</h2>
            <p className="doctors-card__subtitle">Doctor + Nutritionist care plan</p>
          </div>

          <div className="doctors-card__bottom">
            <div className="doctors-card__tags" aria-label="Program tags">
              <span className="doctors-card__tag">Custom</span>
              <span className="doctors-card__tag">Personalized</span>
            </div>

            <div className="doctors-card__metrics">
              <div className="doctors-card__metric">
                <span className="doctors-card__metric-value">Mon- Sat</span>
                <span className="doctors-card__metric-label">Available</span>
              </div>
              <div className="doctors-card__metric-separator" aria-hidden="true" />
              <div className="doctors-card__metric">
                <span className="doctors-card__metric-value">10 AM - 6 PM</span>
                <span className="doctors-card__metric-label">Timings</span>
              </div>
              <div className="doctors-card__metric-separator" aria-hidden="true" />
              <div className="doctors-card__metric">
                <span className="doctors-card__metric-value">Flexible</span>
                <span className="doctors-card__metric-label">Appointment</span>
              </div>
            </div>

            <button type="button" className="doctors-card__cta" onClick={onOpenIntegratedProfile}>View Profile</button>
          </div>
        </article>
        ) : null}

        {shouldShowCard(activePill, 'general') ? (
        <article className="doctors-card doctors-card--sarah" aria-label="Dr. Sarah Jenkins card">
          <div className="doctors-card__doctor-top">
            <div className="doctors-card__photo-wrap">
              <img className="doctors-card__photo" src={sarahPhoto} alt="Dr. Sarah Jenkins" />
              <img className="doctors-card__verified" src={verifiedBadge} alt="Verified" />
            </div>

            <div className="doctors-card__doctor-info">
              <h3 className="doctors-card__doctor-name">Dr. Sarah Jenkins</h3>
              <p className="doctors-card__doctor-role">General Physician</p>
              <p className="doctors-card__doctor-exp">8+ years experience</p>
            </div>

            <div className="doctors-card__rating" aria-label="Rating 4.9">
              <RatingStarIcon />
              <span className="doctors-card__rating-text">4.9</span>
            </div>
          </div>

          <div className="doctors-card__tags" aria-label="Specialization tags">
            <span className="doctors-card__tag">Diabetes</span>
            <span className="doctors-card__tag">Hypertension</span>
            <span className="doctors-card__tag">Thyroid</span>
            <span className="doctors-card__tag">+ More</span>
          </div>

          <div className="doctors-card__metrics">
            <div className="doctors-card__metric">
              <span className="doctors-card__metric-value">Mon- Fri</span>
              <span className="doctors-card__metric-label">Available</span>
            </div>
            <div className="doctors-card__metric-separator" aria-hidden="true" />
            <div className="doctors-card__metric">
              <span className="doctors-card__metric-value">5 - 9 PM</span>
              <span className="doctors-card__metric-label">Timings</span>
            </div>
            <div className="doctors-card__metric-separator" aria-hidden="true" />
            <div className="doctors-card__metric">
              <span className="doctors-card__metric-value">20 mins</span>
              <span className="doctors-card__metric-label">Appointment</span>
            </div>
          </div>

          <button type="button" className="doctors-card__cta" onClick={onOpenDoctorProfile}>View Profile</button>
        </article>
        ) : null}

        {shouldShowCard(activePill, 'nutritionist') ? (
        <article className="doctors-card doctors-card--sarah" aria-label="Nutritionist card">
          <div className="doctors-card__doctor-top">
            <div className="doctors-card__photo-wrap">
              <img className="doctors-card__photo doctors-card__photo--nutritionist" src={lizzyPhoto} alt="Dr. Anaya Mehta" />
              <img className="doctors-card__verified" src={verifiedBadge} alt="Verified" />
            </div>

            <div className="doctors-card__doctor-info">
              <h3 className="doctors-card__doctor-name">Anaya Mehta</h3>
              <p className="doctors-card__doctor-role">Nutritionist</p>
              <p className="doctors-card__doctor-exp">7+ years experience</p>
            </div>

            <div className="doctors-card__rating" aria-label="Rating 4.9">
              <RatingStarIcon />
              <span className="doctors-card__rating-text">4.9</span>
            </div>
          </div>

          <div className="doctors-card__tags" aria-label="Specialization tags">
            <span className="doctors-card__tag">Weight Loss</span>
            <span className="doctors-card__tag">PCOS</span>
            <span className="doctors-card__tag">Thyroid</span>
            <span className="doctors-card__tag">+ More</span>
          </div>

          <div className="doctors-card__metrics">
            <div className="doctors-card__metric">
              <span className="doctors-card__metric-value">Mon- Sat</span>
              <span className="doctors-card__metric-label">Available</span>
            </div>
            <div className="doctors-card__metric-separator" aria-hidden="true" />
            <div className="doctors-card__metric">
              <span className="doctors-card__metric-value">8 AM - 2 PM</span>
              <span className="doctors-card__metric-label">Timings</span>
            </div>
            <div className="doctors-card__metric-separator" aria-hidden="true" />
            <div className="doctors-card__metric">
              <span className="doctors-card__metric-value">25 mins</span>
              <span className="doctors-card__metric-label">Appointment</span>
            </div>
          </div>

          <button type="button" className="doctors-card__cta" onClick={onOpenNutritionistProfile}>View Profile</button>
        </article>
        ) : null}
        </div>
      </div>

      <NavBar defaultActive="super-sync" onNavigate={(itemId) => {
        if (itemId === 'home') {
          onBack();
        }
        if (itemId === 'packages') {
          if (onOpenPackages) {
            onOpenPackages();
          }
        }
      }} />
    </div>
  );
};

export default DoctorsPage;
