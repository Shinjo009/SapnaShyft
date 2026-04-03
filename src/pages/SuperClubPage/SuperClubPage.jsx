import React from 'react';
import './SuperClubPage.css';
import Header from '../../components/HomePage/Header';
import NavBar from '../../components/NavBar';
import { SUPER_CLUB_SPORTS } from './superClubSportImages';

/**
 * Super Club — “You’ll love what’s coming” screen with horizontal sport carousel (Figma reference).
 */
export default function SuperClubPage({
  userName = 'there',
  onMenuClick,
  onSearchClick,
  onNavigateHome,
  onNavigateToDoctors,
  onNavigateToPackages,
  onStayUpdated,
}) {
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
    if (itemId === 'super-club') {
      return;
    }
  };

  const handleStayUpdated = () => {
    if (onStayUpdated) {
      onStayUpdated();
    }
  };

  return (
    <div className="super-club-page">
      <div className="super-club-page__glow super-club-page__glow--tl" aria-hidden="true" />
      <div className="super-club-page__glow super-club-page__glow--br" aria-hidden="true" />

      <div className="super-club-page__header-wrap">
        <Header name={userName} onMenuClick={onMenuClick} onSearchClick={onSearchClick} />
      </div>

      <main className="super-club-page__main">
        <p className="super-club-page__kicker">You&apos;ll love what&apos;s coming</p>
        <h1 className="super-club-page__headline">Those were some Interesting Choices!</h1>
        <p className="super-club-page__lede">Something built for your active life is on its way.</p>

        <div className="super-club-page__cards-scroll" role="list" aria-label="Sports">
          {SUPER_CLUB_SPORTS.map((sport) => (
            <div key={sport.id} className="super-club-card" role="listitem">
              <div className="super-club-card__art">
                <img src={sport.image} alt={sport.name} className="super-club-card__img" />
              </div>
              <span className="super-club-card__label">{sport.name}</span>
            </div>
          ))}
        </div>

        <button type="button" className="super-club-page__cta" onClick={handleStayUpdated}>
          Stay Updated
        </button>
      </main>

      <NavBar defaultActive="super-club" onNavigate={handleNav} />
    </div>
  );
}
