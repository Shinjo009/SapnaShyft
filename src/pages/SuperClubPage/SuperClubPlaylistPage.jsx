import React from 'react';
import './SuperClubPlaylistPage.css';
import Header from '../../components/HomePage/Header';
import NavBar from '../../components/NavBar';
import Button from '../../components/Button';

const PLAYLIST_ITEMS = [
  { id: 1, title: '5v5 Football', location: 'Green Garden Arena', time: 'Tue, 6:00 PM' },
  { id: 2, title: 'Cricket', location: 'KQX Arena', time: 'Wed, 7:00 PM' },
  { id: 3, title: 'Pickleball', location: 'ZMW Club', time: 'Thu, 5:30 PM' },
  { id: 4, title: 'Badminton', location: 'RPD Courts', time: 'Fri, 12:00 PM' },
  { id: 5, title: 'Table Tennis', location: 'HJV Hall', time: 'Sat, 4:15 PM' },
];

const CARD_OPACITY_BY_INDEX = [1, 0.9, 0.8, 0.6, 0.4];
const CARD_BLUR_BY_INDEX = ['none', 'blur(1px)', 'blur(2px)', 'blur(3px)', 'blur(4px)'];

const SportsGlyph = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M18.6668 2.6665C17.9596 2.6665 17.2813 2.94746 16.7812 3.44755C16.2811 3.94765 16.0002 4.62593 16.0002 5.33317C16.0002 6.04041 16.2811 6.71869 16.7812 7.21879C17.2813 7.71889 17.9596 7.99984 18.6668 7.99984C19.3741 7.99984 20.0524 7.71889 20.5524 7.21879C21.0525 6.71869 21.3335 6.04041 21.3335 5.33317C21.3335 4.62593 21.0525 3.94765 20.5524 3.44755C20.0524 2.94746 19.3741 2.6665 18.6668 2.6665ZM8.00016 23.9998C7.29292 23.9998 6.61464 24.2808 6.11454 24.7809C5.61445 25.281 5.3335 25.9593 5.3335 26.6665C5.3335 27.3737 5.61445 28.052 6.11454 28.5521C6.61464 29.0522 7.29292 29.3332 8.00016 29.3332C8.70741 29.3332 9.38568 29.0522 9.88578 28.5521C10.3859 28.052 10.6668 27.3737 10.6668 26.6665C10.6668 25.9593 10.3859 25.281 9.88578 24.7809C9.38568 24.2808 8.70741 23.9998 8.00016 23.9998Z" fill="#3B82F6"/>
    <path d="M10.44 10.8132L8.14667 15.4132L10.5333 16.5998L12.8267 11.9998H15.3333L12.9067 17.8398L10.2 19.9998H4V22.6665H10.2C10.8 22.6665 11.4 22.4532 11.8667 22.0798L14.7333 19.7865L17.0133 23.7732L12.4 28.3865L14.28 30.2665L18.8933 25.6532C19.7467 24.7998 19.92 23.4932 19.32 22.4398L17.4933 19.2532L20.8533 11.9865H28V9.31982H12.8267C11.8133 9.31982 10.8933 9.87983 10.44 10.7998V10.8132Z" fill="#3B82F6"/>
  </svg>
);

export default function SuperClubPlaylistPage({
  userName = 'there',
  onMenuClick,
  onNavigateHome,
  onNavigateToDoctors,
  onNavigateToPackages,
  onJoinEarly,
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

  return (
    <div className="super-club-playlist">
      <div className="super-club-playlist__header-wrap">
        <Header name={userName} onMenuClick={onMenuClick} showGreeting={false} />
      </div>

      <main className="super-club-playlist__main">
        <h1 className="super-club-playlist__title">Sports Playlist of the week!</h1>
        <p className="super-club-playlist__subtitle">Explore the most popular sports events around you</p>

        <ul className="super-club-playlist__cards" aria-label="Sports playlist cards">
          {PLAYLIST_ITEMS.map((item, index) => (
            <li
              key={item.id}
              className="super-club-playlist__card"
              style={{
                opacity: CARD_OPACITY_BY_INDEX[index] || 1,
                filter: CARD_BLUR_BY_INDEX[index] || 'none',
              }}
            >
              <div className="super-club-playlist__icon-wrap">
                <SportsGlyph />
              </div>

              <div className="super-club-playlist__card-content">
                <div className="super-club-playlist__copy">
                  <h2 className="super-club-playlist__event">{item.title}</h2>
                  <p className="super-club-playlist__arena">{item.location}</p>
                  <p className="super-club-playlist__time">{item.time}</p>
                </div>

                <button type="button" className="super-club-playlist__join-btn" aria-label={`Join ${item.title}`}>
                  Join
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="super-club-playlist__cta-wrap">
          <Button onClick={onJoinEarly}>Join Early</Button>
        </div>
      </main>

      <NavBar defaultActive="super-club" onNavigate={handleNav} />
    </div>
  );
}
