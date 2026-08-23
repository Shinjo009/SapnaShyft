import React from 'react';
import './Header.css';

const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <path d="M24.5 14C24.5033 16.0846 23.8833 18.1225 22.7197 19.852C21.76 21.2835 20.4623 22.4565 18.9415 23.2672C17.4206 24.0779 15.7234 24.5013 14 24.5C12.2766 24.5013 10.5794 24.0779 9.05852 23.2672C7.53766 22.4565 6.24001 21.2835 5.28033 19.852C4.36652 18.4898 3.78455 16.9325 3.58109 15.3049C3.37763 13.6772 3.55833 12.0246 4.10871 10.4793C4.65908 8.93412 5.56383 7.53935 6.75041 6.40682C7.937 5.27429 9.37241 4.43552 10.9416 3.95774C12.5108 3.47995 14.1701 3.37645 15.7865 3.65553C17.4028 3.93461 18.9314 4.5885 20.2495 5.5648C21.5676 6.54109 22.6387 7.81262 23.3768 9.27746C24.1149 10.7423 24.4996 12.3597 24.5 14Z" stroke="white" strokeWidth="1.75" />
    <path d="M15.4574 10.4998C15.4574 11.3048 14.8041 11.9582 13.9991 11.9582V13.7082C14.85 13.7082 15.6661 13.3702 16.2677 12.7685C16.8694 12.1668 17.2074 11.3507 17.2074 10.4998H15.4574ZM13.9991 11.9582C13.1941 11.9582 12.5408 11.3048 12.5408 10.4998H10.7908C10.7908 11.3507 11.1288 12.1668 11.7305 12.7685C12.3322 13.3702 13.1482 13.7082 13.9991 13.7082V11.9582ZM12.5408 10.4998C12.5408 9.69484 13.1941 9.0415 13.9991 9.0415V7.2915C13.1482 7.2915 12.3322 7.62952 11.7305 8.2312C11.1288 8.83288 10.7908 9.64893 10.7908 10.4998H12.5408ZM13.9991 9.0415C14.8041 9.0415 15.4574 9.69484 15.4574 10.4998H17.2074C17.2074 9.64893 16.8694 8.83288 16.2677 8.2312C15.6661 7.62952 14.85 7.2915 13.9991 7.2915V9.0415ZM6.02611 20.8318L5.18728 20.5822L5.05078 21.0395L5.36228 21.4012L6.02611 20.8318ZM21.9721 20.8318L22.6371 21.4023L22.9474 21.0407L22.8109 20.5822L21.9721 20.8318ZM10.4991 18.3748H17.4991V16.6248H10.4991V18.3748ZM10.4991 16.6248C9.30564 16.6245 8.14395 17.0095 7.18687 17.7225C6.2298 18.4356 5.52849 19.4385 5.18728 20.5822L6.86495 21.0815C7.09857 20.2992 7.57845 19.6132 8.23323 19.1256C8.888 18.6379 9.68269 18.3746 10.4991 18.3748V16.6248ZM13.9991 23.6248C12.6101 23.6264 11.2373 23.3266 9.97538 22.7461C8.71348 22.1657 7.59255 21.3183 6.68995 20.2625L5.36228 21.4012C6.42915 22.6483 7.75376 23.6504 9.24482 24.3363C10.7359 25.0221 12.3579 25.3764 13.9991 25.3748V23.6248ZM17.4991 18.3748C19.2141 18.3748 20.6666 19.5158 21.1333 21.0815L22.8109 20.5822C22.4697 19.4385 21.7684 18.4356 20.8114 17.7225C19.8543 17.0095 18.6926 16.6245 17.4991 16.6248V18.3748ZM21.3083 20.2625C20.4057 21.3183 19.2847 22.1657 18.0228 22.7461C16.761 23.3266 15.3881 23.6264 13.9991 23.6248V25.3748C15.6403 25.3764 17.2624 25.0221 18.7534 24.3363C20.2445 23.6504 21.5702 22.6495 22.6371 21.4023L21.3083 20.2625Z" fill="white" />
  </svg>
);

const BackArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M15 18L9 12L15 6"
      stroke="white"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Header Component - HomePage header with greeting and menu
 *
 * Props:
 * - name: User name to display in greeting
 * - onMenuClick: Callback when profile/menu control is clicked
 * - showGreeting: When false, only the leading control is shown
 * - leadingMode: 'profile' (default) | 'back' — back is for returning-user journey overlay only
 * - onBackClick: Used when leadingMode is 'back'
 */
const Header = ({
  name = 'User',
  onMenuClick,
  showGreeting = true,
  leadingMode = 'profile',
  onBackClick,
}) => {
  const isBack = leadingMode === 'back';

  return (
    <header className="header">
      <div className="header__container">
        <button
          className="header__menu-btn"
          type="button"
          onClick={isBack ? onBackClick : onMenuClick}
          aria-label={isBack ? 'Go back' : 'Menu'}
          data-tour={isBack ? 'home-journey-back' : 'home-profile'}
        >
          {isBack ? <BackArrowIcon /> : <ProfileIcon />}
        </button>

        {showGreeting ? <h1 className="header__greeting">Hello {name}!</h1> : null}

        <span className="header__side-spacer" aria-hidden="true" />
      </div>
    </header>
  );
};

export default Header;
