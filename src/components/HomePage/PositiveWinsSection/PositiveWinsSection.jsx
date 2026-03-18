import React, { useRef, useState } from 'react';
import './PositiveWinsSection.css';

const PositiveWinsHeaderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M11.6081 9.66748L12.7443 16.062C12.7704 16.2162 12.698 16.3703 12.5628 16.4488C12.4275 16.5273 12.2578 16.5136 12.1368 16.4145L9.45182 14.3992C9.18561 14.2004 8.82028 14.2004 8.55407 14.3992L5.86457 16.4137C5.74374 16.5127 5.57422 16.5264 5.43907 16.4481C5.30391 16.3699 5.2314 16.216 5.25707 16.062L6.39257 9.66748" stroke="#90DF9E" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.5 6C4.5 8.48362 6.51638 10.5 9 10.5C11.4836 10.5 13.5 8.48362 13.5 6C13.5 3.51638 11.4836 1.5 9 1.5C6.51638 1.5 4.5 3.51638 4.5 6H4.5" stroke="#90DF9E" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LowRiskIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M17.8126 10.9376C17.1876 14.0626 14.8315 17.0046 11.5242 17.6625C8.21702 18.3203 4.86092 16.782 3.20046 13.8471C1.54 10.9123 1.94992 7.24324 4.21716 4.74721C6.4844 2.25118 10.3126 1.56258 13.4376 2.81258" stroke="#90DF9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.1875 9.6875L10.3125 12.8125L17.8125 4.6875" stroke="#90DF9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HealthyHabitsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="22" viewBox="0 0 18 22" fill="none" aria-hidden="true">
    <path d="M14.4045 2.75002H3.60298C3.4912 2.74919 3.38058 2.77773 3.27861 2.83372C3.17664 2.88971 3.08571 2.97183 3.01198 3.07452C2.93737 3.17764 2.88153 3.29895 2.84817 3.43043C2.81481 3.56192 2.80469 3.70056 2.81848 3.83718L4.04998 16.6779C4.11748 17.3901 4.39498 18.0455 4.82998 18.5204C5.26268 18.9941 5.82408 19.2542 6.40498 19.25H11.6325C12.2134 19.2542 12.7748 18.9941 13.2075 18.5204C13.6425 18.0455 13.92 17.3901 13.9875 16.6779L15.1807 3.83718C15.194 3.70143 15.1839 3.56378 15.1511 3.43307C15.1183 3.30236 15.0635 3.18148 14.9902 3.07818C14.917 2.9761 14.827 2.89408 14.7261 2.83753C14.6251 2.78097 14.5155 2.75115 14.4045 2.75002Z" stroke="#90DF9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.28125 8.57365C5.409 7.6029 7.66875 6.7394 9.43575 8.44715C11.202 10.1558 12.8978 9.86432 14.6558 9.41882M5.86425 13.3586L6.04425 14.9216C6.0945 15.3047 6.24975 15.6549 6.4845 15.9125C6.7178 16.1707 7.01757 16.3211 7.332 16.3378L8.11725 16.3864" stroke="#90DF9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HealthyProfilesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M10.5423 1.86674C10.3912 1.73753 10.1989 1.6666 10.0001 1.66675C9.80126 1.6669 9.60905 1.73813 9.45815 1.86758L9.38398 1.93174C9.08538 2.19791 8.79281 2.47075 8.50648 2.75008C7.77815 3.45969 7.08854 4.20799 6.44065 4.99174C5.68898 5.90341 4.92148 6.96924 4.33898 8.09341C3.75982 9.21008 3.33398 10.4401 3.33398 11.6667C3.33398 13.4349 4.03636 15.1305 5.28661 16.3808C6.53685 17.631 8.23254 18.3334 10.0007 18.3334C11.7688 18.3334 13.4645 17.631 14.7147 16.3808C15.9649 15.1305 16.6673 13.4349 16.6673 11.6667C16.6673 10.4401 16.2415 9.21008 15.6623 8.09341C15.079 6.96841 14.3123 5.90341 13.5606 4.99091C12.7131 3.96591 11.7945 3.00186 10.8115 2.10591L10.5432 1.86758L10.5423 1.86674ZM5.00065 11.6667C5.00065 10.8101 5.30398 9.85258 5.81815 8.86008C6.32982 7.87508 7.02065 6.90924 7.72648 6.05091C8.43334 5.19578 9.19287 4.38559 10.0007 3.62508C10.8081 4.38508 11.5673 5.19471 12.274 6.04924C12.9807 6.90758 13.6715 7.87424 14.1823 8.85924C14.6973 9.85174 15.0007 10.8092 15.0007 11.6659C15.0007 12.992 14.4739 14.2638 13.5362 15.2014C12.5985 16.1391 11.3267 16.6659 10.0007 16.6659C8.67457 16.6659 7.4028 16.1391 6.46512 15.2014C5.52744 14.2638 5.00065 12.992 5.00065 11.6659V11.6667Z" fill="#90DF9E"/>
    <path d="M6.96717 11.7017C6.75535 11.7646 6.57719 11.9091 6.47186 12.1033C6.36653 12.2976 6.34266 12.5257 6.4055 12.7375C6.58401 13.3346 6.90816 13.8778 7.34878 14.3184C7.7894 14.7591 8.33266 15.0832 8.92967 15.2617C9.03482 15.2938 9.14529 15.3048 9.25471 15.294C9.36412 15.2832 9.47032 15.2509 9.56718 15.1989C9.66405 15.1469 9.74966 15.0762 9.8191 14.991C9.88853 14.9057 9.94041 14.8076 9.97174 14.7022C10.0031 14.5968 10.0132 14.4863 10.0017 14.3769C9.99009 14.2676 9.957 14.1616 9.90428 14.0652C9.85157 13.9687 9.78029 13.8836 9.69454 13.8148C9.6088 13.7459 9.51028 13.6948 9.40467 13.6642C9.07334 13.5647 8.77187 13.3846 8.52725 13.14C8.28263 12.8953 8.10251 12.5939 8.003 12.2625C7.93992 12.0509 7.79538 11.8729 7.60116 11.7678C7.40693 11.6626 7.1789 11.6388 6.96717 11.7017Z" fill="#90DF9E"/>
  </svg>
);

const SwipeArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 11.3334L7.33333 8.00008L4 4.66675M8.66667 11.3334L12 8.00008L8.66667 4.66675" stroke="#9A9A9A" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const barSegments = [
  'is-strong',
  'is-strong',
  'is-medium',
  'is-soft',
  'is-faint',
  'is-low',
];

const defaultCards = [
  {
    title: 'Healthy\nHabits',
    Icon: HealthyHabitsIcon,
    aspects: [
      { label: 'Improved Sleep' },
      { label: 'Better Hydration' },
      { label: 'Good Exercise' },
    ],
  },
  {
    title: 'Healthy\nProfiles',
    Icon: HealthyProfilesIcon,
    aspects: [
      { label: 'Liver Profile' },
      { label: 'Thyroid Profile' },
      { label: 'Heart Profile' },
    ],
  },
  {
    title: 'Low Risk',
    Icon: LowRiskIcon,
    aspects: [
      { label: 'Thyroid', percent: '12%' },
      { label: 'Cardiac Health', percent: '12%' },
      { label: 'Obesity', percent: '12%' },
    ],
  },
  {
    title: 'Healthy\nHabits',
    Icon: HealthyHabitsIcon,
    aspects: [
      { label: 'Improved Sleep' },
      { label: 'Better Hydration' },
      { label: 'Good Exercise' },
    ],
  },
  {
    title: 'Healthy\nProfiles',
    Icon: HealthyProfilesIcon,
    aspects: [
      { label: 'Liver Profile' },
      { label: 'Thyroid Profile' },
      { label: 'Heart Profile' },
    ],
  },
  {
    title: 'Low Risk',
    Icon: LowRiskIcon,
    aspects: [
      { label: 'Thyroid', percent: '12%' },
      { label: 'Cardiac Health', percent: '12%' },
      { label: 'Obesity', percent: '12%' },
    ],
  },
];

const PositiveWinsSection = ({ cards = defaultCards }) => {
  const [activeIndex, setActiveIndex] = useState(cards.length - 1);
  const [swipeDirection, setSwipeDirection] = useState('next');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const stackRef = useRef(null);
  const touchStartXRef = useRef(null);
  const latestDragXRef = useRef(0);

  const resetDragOffset = () => {
    latestDragXRef.current = 0;
    if (stackRef.current) {
      stackRef.current.style.setProperty('--positive-wins-drag-x', '0px');
    }
  };

  const applyDragOffset = (value) => {
    latestDragXRef.current = value;
    if (stackRef.current) {
      stackRef.current.style.setProperty('--positive-wins-drag-x', `${value}px`);
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
    if (isAnimating) {
      return;
    }
    touchStartXRef.current = event.touches[0].clientX;
    setIsDragging(true);
    resetDragOffset();
  };

  const handleTouchMove = (event) => {
    if (touchStartXRef.current == null || isAnimating) {
      return;
    }

    const deltaX = event.touches[0].clientX - touchStartXRef.current;
    const clamped = Math.max(-28, Math.min(28, deltaX));
    applyDragOffset(clamped);
  };

  const handleTouchEnd = (event) => {
    if (touchStartXRef.current == null) {
      return;
    }

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
    if (!event.target.classList.contains('positive-wins__stack-card--front')) return;
    if (event.propertyName !== 'transform') return;

    setIsResetting(true);
    // Treat swipe as dismiss action: the immediate stacked card behind comes forward.
    setActiveIndex((prev) => (prev + 1) % cards.length);
    setIsAnimating(false);
    resetDragOffset();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsResetting(false);
      });
    });
  };

  return (
    <section className="positive-wins">
      <div className="positive-wins__header">
        <div className="positive-wins__header-icon-box">
          <PositiveWinsHeaderIcon />
        </div>
        <div className="positive-wins__header-copy">
          <h2 className="positive-wins__title">Positive Wins</h2>
          <p className="positive-wins__subtitle">Your strongest health signals right now</p>
        </div>
      </div>

      <div
        ref={stackRef}
        className={`positive-wins__stack${isAnimating ? ` positive-wins__stack--moving-${swipeDirection}` : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onTransitionEnd={handleStackTransitionEnd}
        data-dragging={isDragging ? 'true' : 'false'}
        data-resetting={isResetting ? 'true' : 'false'}
      >
        {cards.map((card, index) => {
          const CardIcon = card.Icon;
          const distance = (index - activeIndex + cards.length) % cards.length;
          const role = distance === 0
            ? 'front'
            : distance === 1
              ? 'back-one'
              : distance === 2
                ? 'back-two'
                : 'hidden';

          return (
            <article
              key={`${card.title}-${index}`}
              className={`positive-wins__stack-card positive-wins__stack-card--${role}`}
            >
              <div className="positive-wins__card-top-row">
                <div className="positive-wins__badge-icon">
                  <CardIcon />
                </div>
                <span className="positive-wins__status-pill">Optimal</span>
              </div>

              <div className="positive-wins__card-content">
                <div className="positive-wins__left-column">
                  <h3 className="positive-wins__risk-title">{card.title}</h3>
                  <div className="positive-wins__meter" aria-hidden="true">
                    {barSegments.map((segmentClass, barIndex) => (
                      <span key={`${card.title}-${segmentClass}-${barIndex}`} className={`positive-wins__meter-pill ${segmentClass}`} />
                    ))}
                  </div>
                </div>

                <div className="positive-wins__aspect-list">
                  {card.aspects.map((aspect) => (
                    <div key={`${card.title}-${aspect.label}`} className="positive-wins__aspect-item">
                      <span className="positive-wins__aspect-label">{aspect.label}</span>
                      {aspect.percent ? <span className="positive-wins__aspect-value">{aspect.percent}</span> : null}
                    </div>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="positive-wins__swipe-hint" aria-hidden="true">
        <span className="positive-wins__swipe-arrow positive-wins__swipe-arrow--left"><SwipeArrow /></span>
        <span className="positive-wins__swipe-text">Swipe to explore</span>
        <span className="positive-wins__swipe-arrow"><SwipeArrow /></span>
      </div>
    </section>
  );
};

export default PositiveWinsSection;