import React from 'react';
import './SuperClubPage2.css';
import Header from '../../components/HomePage/Header';
import NavBar from '../../components/NavBar';

/**
 * Super Club post-onboarding — carousel shows only sports the user liked on page 1 (from storage / props).
 */
export default function SuperClubPage2({
  userName = 'there',
  likedSports = [],
  onMenuClick,
  onSearchClick,
  onNavigateHome,
  onNavigateToDoctors,
  onNavigateToPackages,
  onStayUpdated,
  onSelectSport,
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

        <ul className="super-club-page__cards-scroll" aria-label="Sports you liked">
          {likedSports.length === 0 ? (
            <li className="super-club-page__cards-empty">No sports saved from your likes — you can still stay updated below.</li>
          ) : (
            likedSports.map((sport) => (
              <li key={sport.id} className="super-club-page__cards-item">
                <button
                  type="button"
                  className="super-club-tile-btn"
                  aria-label={sport.name}
                  onClick={() => onSelectSport?.(sport)}
                >
                  <img src={sport.image} alt="" className="super-club-tile-btn__img" draggable={false} />
                  <span className="super-club-tile-btn__label">{sport.name}</span>
                </button>
              </li>
            ))
          )}
        </ul>

        <button type="button" className="super-club-page__cta" onClick={handleStayUpdated}>
          Stay Updated
        </button>
      </main>

      <NavBar defaultActive="super-club" onNavigate={handleNav} />
    </div>
  );
}
