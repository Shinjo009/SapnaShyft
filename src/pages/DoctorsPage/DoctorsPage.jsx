import React from 'react';
import './DoctorsPage.css';
import NavBar from '../../components/NavBar';
import SuperCarePlanCard from '../../components/SuperCarePlanCard';
import priorityDoctorImage from '../../images/im2 2.svg';
import holisticNutritionImage from '../../images/im6 2.svg';

const PLAN_METRICS = [
  { value: 'Clinical', label: 'Experts' },
  { value: '30 Mins', label: 'Session' },
  { value: 'Personal', label: 'Support' },
];

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M17 18C17.5304 18 18.0391 18.2107 18.4142 18.5858C18.7893 18.9609 19 19.4696 19 20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22C16.4696 22 15.9609 21.7893 15.5858 21.4142C15.2107 21.0391 15 20.5304 15 20C15 18.89 15.89 18 17 18ZM1 2H4.27L5.21 4H20C20.2652 4 20.5196 4.10536 20.7071 4.29289C20.8946 4.48043 21 4.73478 21 5C21 5.17 20.95 5.34 20.88 5.5L17.3 11.97C16.96 12.58 16.3 13 15.55 13H8.1L7.2 14.63L7.17 14.75C7.17 14.8163 7.19634 14.8799 7.24322 14.9268C7.29011 14.9737 7.3537 15 7.42 15H19V17H7C6.46957 17 5.96086 16.7893 5.58579 16.4142C5.21071 16.0391 5 15.5304 5 15C5 14.65 5.09 14.32 5.24 14.04L6.6 11.59L3 4H1V2ZM7 18C7.53043 18 8.03914 18.2107 8.41421 18.5858C8.78929 18.9609 9 19.4696 9 20C9 20.5304 8.78929 21.0391 8.41421 21.4142C8.03914 21.7893 7.53043 22 7 22C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20C5 18.89 5.89 18 7 18Z" fill="white" />
  </svg>
);

const DoctorsPage = ({
  onBack,
  onOpenPackages,
  onNavigateToSuperClub,
  onOpenDoctorProfile,
  onOpenNutritionistProfile,
}) => {
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
      </div>

      <div className="doctors-page__content">
        <div className="doctors-page__cards">
          <SuperCarePlanCard
            title="Priority Doctor Connect"
            subtitle="Focused Health Guidance Session"
            imageSrc={priorityDoctorImage}
            metrics={PLAN_METRICS}
            priceNow={499}
            priceOld={998}
            discountLabel="44% OFF"
            onViewPlan={onOpenDoctorProfile}
            ariaLabel="Priority Doctor Connect plan"
          />

          <SuperCarePlanCard
            title="Holistic Nutrition Consult"
            subtitle="Focused Wellness Guidance Session"
            imageSrc={holisticNutritionImage}
            metrics={PLAN_METRICS}
            priceNow={499}
            priceOld={998}
            discountLabel="44% OFF"
            onViewPlan={onOpenNutritionistProfile}
            ariaLabel="Holistic Nutrition Consult plan"
          />
        </div>
      </div>

      <NavBar
        defaultActive="super-sync"
        onNavigate={(itemId) => {
          if (itemId === 'home') {
            onBack();
          }
          if (itemId === 'packages') {
            if (onOpenPackages) {
              onOpenPackages();
            }
          }
          if (itemId === 'super-club' && onNavigateToSuperClub) {
            onNavigateToSuperClub();
          }
        }}
      />
    </div>
  );
};

export default DoctorsPage;
