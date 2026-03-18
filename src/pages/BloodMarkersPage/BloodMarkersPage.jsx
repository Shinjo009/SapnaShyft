import React, { useRef, useState } from 'react';
import './BloodMarkersPage.css';

const FILTERS = ['Optimal', 'Marginal', 'Critical'];

const RISK_META = {
  low: {
    label: 'LOW RISK',
    color: '#4ADE80',
  },
  moderate: {
    label: 'MODERATE RISK',
    color: '#DAC15A',
  },
  increased: {
    label: 'INCREASED RISK',
    color: '#EE8B48',
  },
  high: {
    label: 'HIGH RISK',
    color: '#EF4444',
  },
};

const METER_SEGMENTS = {
  low: [
    { background: '#4ADE80', boxShadow: '0 0 12px 0 rgba(144, 223, 158, 0.40)' },
    { background: '#4ADE80', boxShadow: '0 0 12px 0 rgba(144, 223, 158, 0.40)' },
    { background: 'rgba(74, 222, 128, 0.75)', boxShadow: '0 0 12px 0 rgba(144, 223, 158, 0.40)' },
    { background: 'rgba(74, 222, 128, 0.50)' },
    { background: 'rgba(74, 222, 128, 0.40)' },
    { background: 'rgba(74, 222, 128, 0.30)' },
    { background: 'rgba(74, 222, 128, 0.25)' },
    { background: 'rgba(74, 222, 128, 0.20)' },
    { background: 'rgba(74, 222, 128, 0.15)' },
    { background: 'rgba(74, 222, 128, 0.10)' },
  ],
  moderate: [
    { background: 'rgba(218, 193, 90, 0.10)' },
    { background: 'rgba(218, 193, 90, 0.25)' },
    { background: 'rgba(218, 193, 90, 0.30)' },
    { background: '#DAC15A', boxShadow: '0 0 12px 0 rgba(218, 193, 90, 0.40)' },
    { background: '#DAC15A', boxShadow: '0 0 12px 0 rgba(218, 193, 90, 0.40)' },
    { background: 'rgba(218, 193, 90, 0.75)', boxShadow: '0 0 12px 0 rgba(218, 193, 90, 0.40)' },
    { background: 'rgba(218, 193, 90, 0.50)' },
    { background: 'rgba(218, 193, 90, 0.40)' },
    { background: 'rgba(218, 193, 90, 0.20)' },
    { background: 'rgba(218, 193, 90, 0.15)' },
  ],
  increased: [
    { background: 'rgba(238, 139, 72, 0.10)' },
    { background: 'rgba(238, 139, 72, 0.25)' },
    { background: 'rgba(238, 139, 72, 0.30)' },
    { background: 'rgba(238, 139, 72, 0.50)' },
    { background: 'rgba(238, 139, 72, 0.75)', boxShadow: '0 0 12px 0 rgba(238, 139, 72, 0.40)' },
    { background: 'rgba(238, 139, 72, 0.75)', boxShadow: '0 0 12px 0 rgba(238, 139, 72, 0.40)' },
    { background: '#EE8B48', boxShadow: '0 0 12px 0 rgba(238, 139, 72, 0.40)' },
    { background: 'rgba(238, 139, 72, 0.40)' },
    { background: 'rgba(238, 139, 72, 0.20)' },
    { background: 'rgba(238, 139, 72, 0.15)' },
  ],
  high: [
    { background: 'rgba(239, 68, 68, 0.10)' },
    { background: 'rgba(239, 68, 68, 0.15)' },
    { background: 'rgba(239, 68, 68, 0.20)' },
    { background: 'rgba(239, 68, 68, 0.25)' },
    { background: 'rgba(239, 68, 68, 0.30)' },
    { background: 'rgba(239, 68, 68, 0.40)' },
    { background: 'rgba(239, 68, 68, 0.50)' },
    { background: 'rgba(239, 68, 68, 0.75)', boxShadow: '0 0 12px 0 rgba(239, 68, 68, 0.40)' },
    { background: '#EF4444', boxShadow: '0 0 12px 0 rgba(239, 68, 68, 0.40)' },
    { background: '#EF4444', boxShadow: '0 0 12px 0 rgba(239, 68, 68, 0.40)' },
  ],
};

const SCENARIOS = {
  Optimal: [
    { id: 'optimal-liver-low', organ: 'Liver', parameters: '3 parameters', theme: 'low' },
    { id: 'optimal-liver-increased', organ: 'Liver', parameters: '3 parameters', theme: 'increased' },
    { id: 'optimal-thyroid-moderate', organ: 'Thyroid', parameters: '4 parameters', theme: 'moderate' },
  ],
  Marginal: [
    { id: 'marginal-liver-moderate', organ: 'Liver', parameters: '3 parameters', theme: 'moderate' },
    { id: 'marginal-liver-low', organ: 'Liver', parameters: '3 parameters', theme: 'low' },
    { id: 'marginal-thyroid-high', organ: 'Thyroid', parameters: '4 parameters', theme: 'high' },
  ],
  Critical: [
    { id: 'critical-liver-low', organ: 'Liver', parameters: '3 parameters', theme: 'low' },
    { id: 'critical-liver-high', organ: 'Liver', parameters: '3 parameters', theme: 'high' },
    { id: 'critical-thyroid-high', organ: 'Thyroid', parameters: '4 parameters', theme: 'high' },
  ],
};

const SwipeArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 11.3334L7.33333 8.00008L4 4.66675M8.66667 11.3334L12 8.00008L8.66667 4.66675" stroke="#9A9A9A" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CardChevron = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden="true">
    <path d="M0.765298 10.7501L6.79252 5.74121L0.750564 0.750102" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LiverGlyph = ({ color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="21" height="15" viewBox="0 0 21 15" fill="none" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M7.00011 10.3295C6.47592 10.5494 5.91255 10.6607 5.34411 10.6565C4.42661 10.6565 4.12311 11.391 3.80061 12.1715C3.43511 13.056 3.04461 14 1.70661 14C-0.811893 14 -0.190393 6.25 1.30961 3.25C2.80961 0.25 4.86261 0 9.05961 0C11.6311 0 12.2831 0.392 12.7881 0.696C13.1076 0.888 13.3681 1.0445 14.0186 1.0445C14.6901 1.0445 15.6306 0.8445 16.5706 0.6435C17.9806 0.3425 19.3916 0.0419998 19.8951 0.418C20.7346 1.0445 18.2161 5.6415 15.6976 5.6415C14.4016 5.6415 13.6241 6.571 12.8696 7.473C12.1586 8.323 11.4676 9.149 10.3811 9.149C9.33511 9.149 8.65561 9.4785 8.00011 9.829V14.75H7.00011V10.3295ZM2.34661 12.779C2.23661 12.8915 2.07861 13 1.70661 13H1.70561C1.67911 13 1.65911 13 1.60661 12.9485C1.53211 12.8755 1.42161 12.7145 1.31461 12.41C1.09861 11.797 0.987607 10.87 1.00111 9.762C1.02811 7.5405 1.54411 5.017 2.20411 3.697C2.86211 2.382 3.57161 1.777 4.50911 1.442C5.54561 1.072 6.93361 1 9.05961 1C9.21794 1 9.36794 1.0015 9.50961 1.0045C9.06811 1.569 8.82761 2.1895 8.69861 2.727C8.61298 3.08697 8.5639 3.45467 8.55211 3.8245C8.54732 3.96885 8.54949 4.11335 8.55861 4.2575L8.56011 4.277L8.56111 4.2855L8.56161 4.2945V4.2975L8.56211 4.299L9.05961 4.25L9.55711 4.2005L9.55611 4.1855L9.55261 4.1195C9.54894 4.03138 9.54861 3.94315 9.55161 3.855C9.55861 3.627 9.58661 3.31 9.67061 2.96C9.82211 2.3295 10.1471 1.617 10.8326 1.0915C11.5226 1.18 11.8376 1.314 12.0246 1.4105C12.1081 1.454 12.1796 1.4965 12.2751 1.554L12.3041 1.5715C12.4071 1.6335 12.5476 1.717 12.7126 1.792C13.0781 1.958 13.4806 2.0445 14.0186 2.0445C14.5396 2.0445 15.1436 1.95 15.7146 1.841C16.0774 1.77005 16.4394 1.69538 16.8006 1.617C17.0336 1.567 17.2611 1.519 17.4711 1.476C18.0451 1.359 18.5376 1.274 18.9226 1.2495L18.9786 1.246C18.8536 1.641 18.5956 2.166 18.2301 2.7005C17.8546 3.2495 17.4001 3.758 16.9271 4.119C16.4451 4.487 16.0256 4.6415 15.6976 4.6415C13.9356 4.6415 12.8901 5.891 12.1976 6.718L12.1321 6.796C11.7601 7.2405 11.4781 7.5775 11.1731 7.8235C10.8881 8.0545 10.6481 8.149 10.3811 8.149C9.36161 8.149 8.61111 8.4125 8.00011 8.7055V6.5C8.00011 6.3025 8.09761 6.118 8.26711 5.97C8.44561 5.8135 8.64511 5.75 8.75011 5.75V4.75C8.35511 4.75 7.93011 4.9365 7.60861 5.2175C7.28661 5.499 7.01511 5.924 7.00061 6.456H4.45361C3.25861 6.456 1.82561 6.9815 3.25861 8.0325C4.29861 8.7955 6.09311 8.1885 7.00011 7.7975V9.2275C6.49061 9.4855 6.02761 9.6565 5.34411 9.6565C4.49411 9.6565 3.90011 10.0525 3.50511 10.5775C3.21411 10.963 3.01411 11.452 2.87061 11.802L2.81311 11.942C2.63561 12.3655 2.50461 12.617 2.34661 12.779Z" fill={color}/>
  </svg>
);

const RiskTrendIcon = ({ type }) => {
  const color = RISK_META[type].color;

  if (type === 'low') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="7" viewBox="0 0 12 7" fill="none" aria-hidden="true">
        <path d="M8.41504 6.26172L9.2627 5.41406L6.41895 2.57031L4.50488 4.48438C4.28613 4.73047 3.90332 4.73047 3.68457 4.48438L0.18457 0.984375C-0.0615234 0.765625 -0.0615234 0.382812 0.18457 0.164062C0.40332 -0.0546875 0.786133 -0.0546875 1.00488 0.164062L4.09473 3.25391L6.00879 1.33984C6.22754 1.09375 6.61035 1.09375 6.8291 1.33984L10.083 4.59375L10.9307 3.74609C11.1221 3.58203 11.4229 3.69141 11.4229 3.96484V6.45312C11.4229 6.61719 11.2861 6.75391 11.1221 6.75391H8.63379C8.3877 6.75391 8.25098 6.42578 8.41504 6.26172Z" fill={color}/>
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="7" viewBox="0 0 12 7" fill="none" aria-hidden="true">
      <path d="M8.41504 0.492188L9.2627 1.33984L6.41895 4.18359L4.50488 2.26953C4.28613 2.02344 3.90332 2.02344 3.68457 2.26953L0.18457 5.76953C-0.0615234 5.98828 -0.0615234 6.37109 0.18457 6.58984C0.40332 6.80859 0.786133 6.80859 1.00488 6.58984L4.09473 3.5L6.00879 5.41406C6.22754 5.66016 6.61035 5.66016 6.8291 5.41406L10.083 2.16016L10.9307 3.00781C11.1221 3.17188 11.4229 3.0625 11.4229 2.78906V0.300781C11.4229 0.136719 11.3135 0 11.1494 0H8.63379C8.3877 0 8.25098 0.328125 8.41504 0.492188V0.492188" fill={color}/>
    </svg>
  );
};

const markerCards = (theme) => [
  { id: `${theme}-1`, marker: 'ALBUMIN', value: '23.5', unit: 'mg/dL', riskType: theme },
  { id: `${theme}-2`, marker: 'ALBUMIN', value: '23.5', unit: 'mg/dL', riskType: theme },
  { id: `${theme}-3`, marker: 'ALBUMIN', value: '23.5', unit: 'mg/dL', riskType: theme },
];

const BloodMarkerStackSection = ({ section }) => {
  const cards = markerCards(section.theme);
  const [activeIndex, setActiveIndex] = useState(cards.length - 1);
  const [swipeDirection, setSwipeDirection] = useState('next');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const stackRef = useRef(null);
  const touchStartXRef = useRef(null);

  const resetDragOffset = () => {
    if (stackRef.current) {
      stackRef.current.style.setProperty('--blood-markers-drag-x', '0px');
    }
  };

  const applyDragOffset = (value) => {
    if (stackRef.current) {
      stackRef.current.style.setProperty('--blood-markers-drag-x', `${value}px`);
    }
  };

  const startAnimation = (direction) => {
    setIsDragging(false);
    resetDragOffset();
    setSwipeDirection(direction);
    setIsAnimating(true);
  };

  const goPrev = () => {
    if (isAnimating) return;
    startAnimation('prev');
  };

  const goNext = () => {
    if (isAnimating) return;
    startAnimation('next');
  };

  const handleTouchStart = (event) => {
    if (isAnimating) return;
    touchStartXRef.current = event.touches[0].clientX;
    setIsDragging(true);
    resetDragOffset();
  };

  const handleTouchMove = (event) => {
    if (touchStartXRef.current == null || isAnimating) return;
    const deltaX = event.touches[0].clientX - touchStartXRef.current;
    const clamped = Math.max(-28, Math.min(28, deltaX));
    applyDragOffset(clamped);
  };

  const handleTouchEnd = (event) => {
    if (touchStartXRef.current == null) return;

    const deltaX = event.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(deltaX) > 36) {
      if (deltaX < 0) {
        goNext();
      } else {
        goPrev();
      }
    } else {
      setIsDragging(false);
      resetDragOffset();
    }

    touchStartXRef.current = null;
  };

  const handleTouchCancel = () => {
    touchStartXRef.current = null;
    setIsDragging(false);
    resetDragOffset();
  };

  const handleStackTransitionEnd = (event) => {
    if (!isAnimating) return;
    if (!event.target.classList.contains('blood-markers-page__stack-card--front')) return;
    if (event.propertyName !== 'transform') return;

    setIsResetting(true);
    setActiveIndex((prev) => (prev + 1) % cards.length);
    setIsAnimating(false);
    resetDragOffset();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsResetting(false);
      });
    });
  };

  const iconColor = RISK_META[section.theme].color;

  return (
    <section className="blood-markers-page__section">
      <div className="blood-markers-page__organ-header">
        <div className={`blood-markers-page__organ-icon-box blood-markers-page__organ-icon-box--${section.theme}`}>
          <LiverGlyph color={iconColor} />
        </div>
        <div className="blood-markers-page__organ-copy">
          <h2 className="blood-markers-page__organ-title">{section.organ}</h2>
          <p className="blood-markers-page__organ-subtitle">{section.parameters}</p>
        </div>
      </div>

      <div
        ref={stackRef}
        className={`blood-markers-page__stack${isAnimating ? ` blood-markers-page__stack--moving-${swipeDirection}` : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onTransitionEnd={handleStackTransitionEnd}
        data-dragging={isDragging ? 'true' : 'false'}
        data-resetting={isResetting ? 'true' : 'false'}
      >
        {cards.map((card, index) => {
          const distance = (index - activeIndex + cards.length) % cards.length;
          const role = distance === 0
            ? 'front'
            : distance === 1
              ? 'back-one'
              : distance === 2
                ? 'back-two'
                : 'hidden';

          const riskMeta = RISK_META[card.riskType];
          const segments = METER_SEGMENTS[card.riskType];

          return (
            <article
              key={card.id}
              className={`blood-markers-page__stack-card blood-markers-page__stack-card--${role} blood-markers-page__stack-card--theme-${card.riskType}`}
            >
              <div className="blood-markers-page__card-top-row">
                <div className="blood-markers-page__marker-block">
                  <span className={`blood-markers-page__marker-line blood-markers-page__marker-line--${card.riskType}`} />
                  <div className="blood-markers-page__marker-copy">
                    <span className="blood-markers-page__marker-label">{card.marker}</span>
                    <div className="blood-markers-page__marker-value-row">
                      <span className="blood-markers-page__marker-value">{card.value}</span>
                      <span className="blood-markers-page__marker-unit">{card.unit}</span>
                    </div>
                  </div>
                </div>

                <span className="blood-markers-page__risk-chip">
                  <span className="blood-markers-page__risk-chip-text" style={{ color: riskMeta.color }}>{riskMeta.label}</span>
                  <RiskTrendIcon type={card.riskType} />
                </span>
              </div>

              <div className="blood-markers-page__card-bottom-row">
                <div className="blood-markers-page__meter" aria-hidden="true">
                  {segments.map((segment, segmentIndex) => (
                    <span
                      key={`${card.id}-seg-${segmentIndex}`}
                      className="blood-markers-page__meter-pill"
                      style={{ background: segment.background, boxShadow: segment.boxShadow || 'none' }}
                    />
                  ))}
                </div>
                <span className="blood-markers-page__card-chevron" aria-hidden="true">
                  <CardChevron />
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <div className="blood-markers-page__swipe-hint" aria-hidden="true">
        <span className="blood-markers-page__swipe-arrow blood-markers-page__swipe-arrow--left"><SwipeArrow /></span>
        <span className="blood-markers-page__swipe-text">Swipe to explore</span>
        <span className="blood-markers-page__swipe-arrow"><SwipeArrow /></span>
      </div>
    </section>
  );
};

const BloodMarkersPage = ({ onBack }) => {
  const [activeFilter, setActiveFilter] = useState('Optimal');

  const sections = SCENARIOS[activeFilter] || SCENARIOS.Optimal;

  return (
    <div className="blood-markers-page">
      <header className="blood-markers-page__header">
        <button
          type="button"
          className="blood-markers-page__back-btn"
          onClick={onBack}
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <h1 className="blood-markers-page__title">Blood Markers</h1>

        <button
          type="button"
          className="blood-markers-page__search-btn"
          aria-label="Search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 21L16.65 16.65" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </header>

      <div className="blood-markers-page__filters" role="tablist" aria-label="Risk filters">
        {FILTERS.map((filter) => {
          const isActive = filter === activeFilter;
          return (
            <button
              key={filter}
              type="button"
              className={`blood-markers-page__filter-pill ${isActive ? 'blood-markers-page__filter-pill--active' : ''}`}
              onClick={() => setActiveFilter(filter)}
              role="tab"
              aria-selected={isActive}
            >
              {filter}
            </button>
          );
        })}
      </div>

      <div className="blood-markers-page__sections">
        {sections.map((section) => (
          <BloodMarkerStackSection key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
};

export default BloodMarkersPage;
