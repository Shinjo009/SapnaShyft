import React, { useMemo, useState } from 'react';
import './PackagesPage.css';
import NavBar from '../../components/NavBar';

const FILTERS = ['All', 'Male', 'Female', 'Cancer', 'Popular'];

const PACKAGE_CARDS = [
  { id: 1, theme: 'teal' },
  { id: 2, theme: 'pink' },
  { id: 3, theme: 'glow' },
  { id: 4, theme: 'teal' },
];

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M13.9988 13.9998L11.1055 11.1064" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 7.33333C2 10.2769 4.38979 12.6667 7.33333 12.6667C10.2769 12.6667 12.6667 10.2769 12.6667 7.33333C12.6667 4.38979 10.2769 2 7.33333 2C4.38979 2 2 4.38979 2 7.33333V7.33333" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CustomPackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M10.6683 6.66646C10.6683 8.13823 9.47342 9.33313 8.00165 9.33313C6.52987 9.33313 5.33498 8.13823 5.33498 6.66646M2.07031 4.02246H13.933" stroke="#E6F6F4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.26667 3.64434C2.09357 3.87514 2 4.15585 2 4.44434V13.333C2 14.0689 2.59745 14.6663 3.33333 14.6663H12.6667C13.4026 14.6663 14 14.0689 14 13.333V4.44434C14 4.15585 13.9064 3.87514 13.7333 3.64434L12.4 1.86634C12.1482 1.5306 11.753 1.33301 11.3333 1.33301H4.66667C4.24699 1.33301 3.85181 1.5306 3.6 1.86634L2.26667 3.64434" stroke="#E6F6F4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M17 18C17.5304 18 18.0391 18.2107 18.4142 18.5858C18.7893 18.9609 19 19.4696 19 20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22C16.4696 22 15.9609 21.7893 15.5858 21.4142C15.2107 21.0391 15 20.5304 15 20C15 18.89 15.89 18 17 18ZM1 2H4.27L5.21 4H20C20.2652 4 20.5196 4.10536 20.7071 4.29289C20.8946 4.48043 21 4.73478 21 5C21 5.17 20.95 5.34 20.88 5.5L17.3 11.97C16.96 12.58 16.3 13 15.55 13H8.1L7.2 14.63L7.17 14.75C7.17 14.8163 7.19634 14.8799 7.24322 14.9268C7.29011 14.9737 7.3537 15 7.42 15H19V17H7C6.46957 17 5.96086 16.7893 5.58579 16.4142C5.21071 16.0391 5 15.5304 5 15C5 14.65 5.09 14.32 5.24 14.04L6.6 11.59L3 4H1V2ZM7 18C7.53043 18 8.03914 18.2107 8.41421 18.5858C8.78929 18.9609 9 19.4696 9 20C9 20.5304 8.78929 21.0391 8.41421 21.4142C8.03914 21.7893 7.53043 22 7 22C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20C5 18.89 5.89 18 7 18ZM16 11L18.78 6H6.14L8.5 11H16Z" fill="white"/>
  </svg>
);

const OpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M5.83203 5.8335H14.1654V14.1668M5.83203 14.1668L14.1654 5.8335" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FeatureChips = ['Biological Age', 'Kidney', 'Heart', '+ More'];

const PackagesPage = ({ onNavigateHome, onOpenPackageDetails }) => {
  const [activeFilter, setActiveFilter] = useState('All');

  const visibleCards = useMemo(() => PACKAGE_CARDS, []);

  const handleNav = (itemId) => {
    if (itemId === 'home' && onNavigateHome) {
      onNavigateHome();
    }
  };

  return (
    <div className="packages-page">
      <div className="packages-page__content">
        <header className="packages-page__header">
          <h1 className="packages-page__title">Explore Packages</h1>
          <button type="button" className="packages-page__cart-btn" aria-label="Open cart">
            <CartIcon />
          </button>
        </header>

        <section className="packages-page__search-row" aria-label="Package search and custom package">
          <button type="button" className="packages-page__search-btn" aria-label="Search packages">
            <SearchIcon />
          </button>
          <button type="button" className="packages-page__custom-btn" aria-label="Create custom package">
            <span>Create Custom Package</span>
            <CustomPackageIcon />
          </button>
        </section>

        <section className="packages-page__filters" aria-label="Package filters">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`packages-page__filter-pill${activeFilter === filter ? ' is-active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </section>

        <section className="packages-page__cards" aria-label="Packages list">
          {visibleCards.map((pkg) => (
            <article
              key={pkg.id}
              className={`packages-card packages-card--${pkg.theme}`}
              onClick={() => onOpenPackageDetails && onOpenPackageDetails(pkg)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  if (onOpenPackageDetails) {
                    onOpenPackageDetails(pkg);
                  }
                }
              }}
            >
              <div className="packages-card__badges">
                <span className="packages-card__badge packages-card__badge--popular">Most Popular</span>
                <span className="packages-card__badge packages-card__badge--type">Male</span>
                <span className="packages-card__badge packages-card__badge--type">Female</span>
              </div>

              <div className="packages-card__title-row">
                <h2 className="packages-card__title">Comprehensive Health Check</h2>
                <button
                  type="button"
                  className="packages-card__open-btn"
                  aria-label="Open package details"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (onOpenPackageDetails) {
                      onOpenPackageDetails(pkg);
                    }
                  }}
                >
                  <OpenIcon />
                </button>
              </div>

              <div className="packages-card__feature-chips">
                {FeatureChips.map((chip) => (
                  <span key={chip} className="packages-card__feature-chip">{chip}</span>
                ))}
              </div>

              <div className="packages-card__metrics">
                <div className="packages-card__metric">
                  <span className="packages-card__metric-value">150</span>
                  <span className="packages-card__metric-label">Parameters</span>
                </div>
                <div className="packages-card__metric-separator" aria-hidden="true" />
                <div className="packages-card__metric">
                  <span className="packages-card__metric-value">12 hrs</span>
                  <span className="packages-card__metric-label">Reports in</span>
                </div>
                <div className="packages-card__metric-separator" aria-hidden="true" />
                <div className="packages-card__metric">
                  <span className="packages-card__metric-value">8-12 hrs</span>
                  <span className="packages-card__metric-label">fasting</span>
                </div>
              </div>

              <div className="packages-card__book-row">
                <div className="packages-card__price-wrap">
                  <div className="packages-card__price-top">
                    <span className="packages-card__price-now">₹2,499</span>
                    <span className="packages-card__off-pill">44% OFF</span>
                  </div>
                  <span className="packages-card__price-old">₹4,498</span>
                </div>
                <button type="button" className="packages-card__book-btn">BOOK</button>
              </div>
            </article>
          ))}
        </section>
      </div>

      <NavBar defaultActive="packages" onNavigate={handleNav} />
    </div>
  );
};

export default PackagesPage;