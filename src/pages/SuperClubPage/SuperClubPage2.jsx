import React, { useEffect, useRef, useState } from 'react';
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
  onNavigateHome,
  onNavigateToDoctors,
  onNavigateToPackages,
  onStayUpdated,
  onSelectSport,
}) {
  const scrollRef = useRef(null);
  const [autoScrollPaused, setAutoScrollPaused] = useState(false);

  useEffect(() => {
    if (!likedSports.length) {
      return undefined;
    }

    const listNode = scrollRef.current;
    if (!listNode) {
      return undefined;
    }

    const step = () => {
      if (autoScrollPaused) {
        return;
      }

      const maxScrollLeft = Math.max(0, listNode.scrollWidth - listNode.clientWidth);
      if (maxScrollLeft <= 0) {
        return;
      }

      const nextLeft = listNode.scrollLeft + 156;
      if (nextLeft >= maxScrollLeft - 8) {
        listNode.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }

      listNode.scrollTo({ left: nextLeft, behavior: 'smooth' });
    };

    const intervalId = window.setInterval(step, 2600);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [autoScrollPaused, likedSports.length]);

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
      return;
    }
    onNavigateHome?.();
  };

  return (
    <div className="super-club-page">
      <div className="super-club-page__glow super-club-page__glow--tl" aria-hidden="true" />
      <div className="super-club-page__glow super-club-page__glow--br" aria-hidden="true" />

      <div className="super-club-page__header-wrap">
        <Header name={userName} onMenuClick={onMenuClick} showGreeting={false} />
      </div>

      <main className="super-club-page__main">
        <p className="super-club-page__kicker">You&apos;ll love what&apos;s coming</p>
        <h1 className="super-club-page__headline">Those were some Interesting Choices!</h1>
        <p className="super-club-page__lede">Something built for your active life is on its way.</p>

        <ul
          ref={scrollRef}
          className="super-club-page__cards-scroll"
          aria-label="Sports you liked"
          onMouseEnter={() => setAutoScrollPaused(true)}
          onMouseLeave={() => setAutoScrollPaused(false)}
          onTouchStart={() => setAutoScrollPaused(true)}
          onTouchEnd={() => setAutoScrollPaused(false)}
        >
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
                  <div
                    className={`super-club-tile-btn__art${
                      sport.xlCardGif
                        ? ' super-club-tile-btn__art--flush'
                        : sport.largeCardGif
                          ? ' super-club-tile-btn__art--tight'
                          : ''
                    }`}
                  >
                    <img
                      src={sport.image}
                      alt=""
                      className={`super-club-tile-btn__gif${
                        sport.xlCardGif
                          ? ' super-club-tile-btn__gif--xl'
                          : sport.largeCardGif
                            ? ' super-club-tile-btn__gif--large'
                            : ''
                      }`}
                      draggable={false}
                    />
                  </div>
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
