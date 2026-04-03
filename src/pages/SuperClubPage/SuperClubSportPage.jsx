import React from 'react';
import './SuperClubSportPage.css';
import NavBar from '../../components/NavBar';
import { SUPER_CLUB_SPORTS } from './superClubSportImages';

/**
 * Placeholder route after tapping a sport tile — replace with real content when ready.
 */
export default function SuperClubSportPage({
  sportId,
  onBack,
  onNavigateHome,
  onNavigateToDoctors,
  onNavigateToPackages,
}) {
  const sport = SUPER_CLUB_SPORTS.find((s) => s.id === sportId);

  const handleNav = (itemId) => {
    if (itemId === 'home' && onNavigateHome) {
      onNavigateHome();
      return;
    }
    if (itemId === 'super-sync' && onNavigateToDoctors) {
      onNavigateToDoctors();
      return;
    }
    if (itemId === 'packages' && onNavigateToPackages) {
      onNavigateToPackages();
      return;
    }
    if (itemId === 'super-club' && onBack) {
      onBack();
    }
  };

  return (
    <div className="super-club-sport-page">
      <header className="super-club-sport-page__header">
        <button type="button" className="super-club-sport-page__back" onClick={onBack} aria-label="Back to Super Club">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="super-club-sport-page__title">{sport?.name || 'Sport'}</h1>
        <span className="super-club-sport-page__spacer" aria-hidden="true" />
      </header>
      <p className="super-club-sport-page__hint">Details for this sport will go here.</p>
      <NavBar defaultActive="super-club" onNavigate={handleNav} />
    </div>
  );
}
