import React, { useRef, useState } from 'react';
import './RiskAnalysisSection.css';
import ObesityIcon from '../../../images/Obesity.png';
import ThyroidHealthIcon from '../../../images/ThyroidHealth.png';
import NAFLDIcon from '../../../images/NAFLD.png';
import Type2Icon from '../../../images/Type2.png';
import PCOSIcon from '../../../images/PCOS.png';
import HyperTensionIcon from '../../../images/HyperTension.png';
import MetabolicIcon from '../../../images/Metabolic.png';
import CardiacHealthIcon from '../../../images/Cardiac Health.png';
import DyslipidemiaIcon from '../../../images/Dyslipidemia.png';
import OxidativeIcon from '../../../images/Oxidative.png';
import HealthRankSpark from '../../../images/HealthRankSpark.svg';

const PositiveWinsHeaderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M11.6081 9.66748L12.7443 16.062C12.7704 16.2162 12.698 16.3703 12.5628 16.4488C12.4275 16.5273 12.2578 16.5136 12.1368 16.4145L9.45182 14.3992C9.18561 14.2004 8.82028 14.2004 8.55407 14.3992L5.86457 16.4137C5.74374 16.5127 5.57422 16.5264 5.43907 16.4481C5.30391 16.3699 5.2314 16.216 5.25707 16.062L6.39257 9.66748" stroke="#E95D5C" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.5 6C4.5 8.48362 6.51638 10.5 9 10.5C11.4836 10.5 13.5 8.48362 13.5 6C13.5 3.51638 11.4836 1.5 9 1.5C6.51638 1.5 4.5 3.51638 4.5 6H4.5" stroke="#E95D5C" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SwipeArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 11.3334L7.33333 8.00008L4 4.66675M8.66667 11.3334L12 8.00008L8.66667 4.66675" stroke="#9A9A9A" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MarkerTrendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <g clipPath="url(#clip0_2394_17328)">
      <path d="M11.787 3.65514L12.9743 4.78469L8.99102 8.57417L6.30999 6.02356C6.00359 5.69562 5.46738 5.69562 5.16098 6.02356L0.258528 10.6875C-0.0861759 10.979 -0.0861759 11.4891 0.258528 11.7806C0.564931 12.0721 1.10114 12.0721 1.40754 11.7806L5.73549 7.66324L8.41652 10.2138C8.72292 10.5418 9.25913 10.5418 9.56553 10.2138L14.1233 5.87781L15.3106 7.00736C15.5787 7.22599 16 7.08024 16 6.71587V3.40008C16 3.18145 15.8468 2.99927 15.617 2.99927H12.0934C11.7487 2.99927 11.5572 3.43651 11.787 3.65514Z" fill="#EF4444"/>
    </g>
    <defs>
      <clipPath id="clip0_2394_17328">
        <rect width="16" height="16" fill="white" transform="translate(0 -0.000732422)"/>
      </clipPath>
    </defs>
  </svg>
);

const DISEASES_DATA = [
  { id: 1, name: 'Obesity', icon: ObesityIcon, score: 55 },
  { id: 2, name: 'Oxidative Stress', icon: OxidativeIcon, score: 85 },
  { id: 3, name: 'Metabolic Syndrome', icon: MetabolicIcon, score: 78 },
  { id: 4, name: 'Hypertension', icon: HyperTensionIcon, score: 45 },
  { id: 5, name: 'PCOS/PCOD', icon: PCOSIcon, score: 30 },
  { id: 6, name: 'Type 2 Diabetes', icon: Type2Icon, score: 24 },
  { id: 7, name: 'Dyslipidemia', icon: DyslipidemiaIcon, score: 55 },
  { id: 8, name: 'Cardiac Health', icon: CardiacHealthIcon, score: 65 },
  { id: 9, name: 'NAFLD', icon: NAFLDIcon, score: 38 },
  { id: 10, name: 'Thyroid Health', icon: ThyroidHealthIcon, score: 20 },
];

const TOP_LINE_BY_DISEASE = {
  obesity: 'Excess body fat accumulation that increases long-term metabolic and cardiovascular risk.',
  'metabolic syndrome': 'Cluster of high blood pressure, blood sugar, fat around waist and abnormal lipids that together raise heart risk.',
  dyslipidemia: 'Unhealthy blood fat levels that increase artery clogging risk.',
  'pcos/pcod': 'Hormonal imbalance in women causing irregular periods, acne and ovarian cysts.',
  'oxidative stress': 'When harmful molecules damage cells faster than antioxidants can repair them.',
  nafld: 'Fat build-up in liver not due to alcohol, linked to overweight.',
  hypertension: 'Persistently high blood pressure that strains the heart and vessels.',
  'thyroid health': 'Thyroid hormones control metabolism, energy and temperature.',
  'type 2 diabetes': 'Body resists insulin causing high blood sugar over time.',
  'cardiac health': 'Overall state of heart and blood vessels influenced by lifestyle and genes.',
};

const normalizeDiseaseKey = (name = '') => name.replace(/\s+/g, ' ').trim().toLowerCase();
const HEALTH_RANK_SCORE_FROM_DISEASE_DETAIL = 55;

const defaultCards = DISEASES_DATA
  .slice()
  .sort((a, b) => b.score - a.score)
  .slice(0, 3)
  .map((disease) => ({
    ...disease,
    action: TOP_LINE_BY_DISEASE[normalizeDiseaseKey(disease.name)] || TOP_LINE_BY_DISEASE['oxidative stress'],
    healthRankLabel: `${HEALTH_RANK_SCORE_FROM_DISEASE_DETAIL}th`,
  }));

const BLOOD_MARKERS_DATA = [
  { id: 1, name: 'Albumin', value: '23.5 mg/dL', profile: 'Liver Profile', risk: 'High Risk' },
  { id: 2, name: 'Albumin', value: '23.5 mg/dL', profile: 'Liver Profile', risk: 'High Risk' },
  { id: 3, name: 'Albumin', value: '23.5 mg/dL', profile: 'Liver Profile', risk: 'High Risk' },
];

const GaugeDial = ({ score }) => {
  const safeScore = Math.max(0, Math.min(100, score ?? 0));
  const pathD = 'M4 40 A36 36 0 0 1 76 40';
  const approxLength = 113.1;
  const dashOffset = approxLength * (1 - safeScore / 100);

  return (
    <div className="risk-analysis-wins__dial-wrap" aria-label={`Risk score ${safeScore} out of 100`}>
      <svg className="risk-analysis-wins__dial" width="80" height="44" viewBox="0 0 80 44" fill="none" aria-hidden="true">
        <path d={pathD} className="risk-analysis-wins__dial-track" />
        <path
          d={pathD}
          className="risk-analysis-wins__dial-progress"
          style={{ strokeDasharray: approxLength, strokeDashoffset: dashOffset }}
        />
      </svg>
      <div className="risk-analysis-wins__dial-score">
        <span className="risk-analysis-wins__dial-score-value">{safeScore}</span>
        <span className="risk-analysis-wins__dial-score-max">/100</span>
      </div>
    </div>
  );
};

const RiskAnalysisSection = ({ cards = defaultCards, onDiseaseSelect, onSeeMore, onBloodMarkersSeeMore }) => {
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
      stackRef.current.style.setProperty('--risk-analysis-wins-drag-x', '0px');
    }
  };

  const applyDragOffset = (value) => {
    latestDragXRef.current = value;
    if (stackRef.current) {
      stackRef.current.style.setProperty('--risk-analysis-wins-drag-x', `${value}px`);
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
    if (!event.target.classList.contains('risk-analysis-wins__stack-card--front')) return;
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

  const handleCardClick = (card) => {
    if (onDiseaseSelect) {
      onDiseaseSelect(card);
    }
  };

  return (
    <section className="risk-analysis-wins">
      <div className="risk-analysis-wins__header">
        <div className="risk-analysis-wins__header-icon-box">
          <PositiveWinsHeaderIcon />
        </div>
        <div className="risk-analysis-wins__header-copy">
          <h2 className="risk-analysis-wins__title">Risk Analysis</h2>
          <p className="risk-analysis-wins__subtitle">Tap the card to know more</p>
        </div>
        <button
          type="button"
          className="risk-analysis-wins__see-more"
          onClick={onSeeMore}
        >
          See more
        </button>
      </div>

      <div
        ref={stackRef}
        className={`risk-analysis-wins__stack${isAnimating ? ` risk-analysis-wins__stack--moving-${swipeDirection}` : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onTransitionEnd={handleStackTransitionEnd}
        data-dragging={isDragging ? 'true' : 'false'}
        data-resetting={isResetting ? 'true' : 'false'}
      >
        {cards.map((card, index) => {
          const CardIcon = card.icon;
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
              key={`${card.id}-${index}`}
              className={`risk-analysis-wins__stack-card risk-analysis-wins__stack-card--${role}`}
              onClick={() => handleCardClick(card)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleCardClick(card);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="risk-analysis-wins__card-top-row">
                <div className="risk-analysis-wins__badge-icon">
                  <img src={CardIcon} alt="" aria-hidden="true" />
                </div>
                <h3 className="risk-analysis-wins__risk-title">{card.name}</h3>
                <span className="risk-analysis-wins__status-pill">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="7" viewBox="0 0 12 7" fill="none" aria-hidden="true">
                    <path d="M8.41504 0.492188L9.2627 1.33984L6.41895 4.18359L4.50488 2.26953C4.28613 2.02344 3.90332 2.02344 3.68457 2.26953L0.18457 5.76953C-0.0615234 5.98828 -0.0615234 6.37109 0.18457 6.58984C0.40332 6.80859 0.786133 6.80859 1.00488 6.58984L4.09473 3.5L6.00879 5.41406C6.22754 5.66016 6.61035 5.66016 6.8291 5.41406L10.083 2.16016L10.9307 3.00781C11.1221 3.17188 11.4229 3.0625 11.4229 2.78906V0.300781C11.4229 0.136719 11.3135 0 11.1494 0H8.63379C8.3877 0 8.25098 0.328125 8.41504 0.492188Z" fill="#EF4444"/>
                  </svg>
                </span>
              </div>

              <div className="risk-analysis-wins__card-content">
                <div className="risk-analysis-wins__left-column">
                  <div className="risk-analysis-wins__gauge-rank-row">
                    <GaugeDial score={card.score} />
                    <div className="risk-analysis-wins__health-rank-box" aria-hidden="true">
                      <span className="risk-analysis-wins__health-rank-text">Health Rank</span>
                      <span className="risk-analysis-wins__health-rank-value">{card.healthRankLabel}</span>
                      <img className="risk-analysis-wins__health-rank-spark" src={HealthRankSpark} alt="" />
                    </div>
                  </div>
                </div>

                <div className="risk-analysis-wins__action-box">
                  <span className="risk-analysis-wins__action-title">Action</span>
                  <p className="risk-analysis-wins__action-text">{card.action}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="risk-analysis-wins__swipe-hint" aria-hidden="true">
        <span className="risk-analysis-wins__swipe-arrow risk-analysis-wins__swipe-arrow--left"><SwipeArrow /></span>
        <span className="risk-analysis-wins__swipe-text">Swipe to explore</span>
        <span className="risk-analysis-wins__swipe-arrow"><SwipeArrow /></span>
      </div>

      <section className="risk-analysis-wins__blood-markers" aria-label="Blood Markers">
        <div className="risk-analysis-wins__blood-markers-header">
          <div className="risk-analysis-wins__blood-markers-copy">
            <h3 className="risk-analysis-wins__blood-markers-title">Blood Markers</h3>
            <p className="risk-analysis-wins__blood-markers-subtitle">Tap the card to know more</p>
          </div>
          <button
            type="button"
            className="risk-analysis-wins__blood-markers-see-more"
            onClick={onBloodMarkersSeeMore}
          >
            See more
          </button>
        </div>

        <div className="risk-analysis-wins__blood-markers-list">
          {BLOOD_MARKERS_DATA.map((marker) => (
            <article className="risk-analysis-wins__blood-marker-card" key={marker.id}>
              <div className="risk-analysis-wins__blood-marker-left">
                <div className="risk-analysis-wins__blood-marker-main-row">
                  <span className="risk-analysis-wins__blood-marker-name">{marker.name}</span>
                  <span className="risk-analysis-wins__blood-marker-divider" aria-hidden="true">|</span>
                  <span className="risk-analysis-wins__blood-marker-value">{marker.value}</span>
                  <span className="risk-analysis-wins__blood-marker-trend" aria-hidden="true"><MarkerTrendIcon /></span>
                </div>
                <span className="risk-analysis-wins__blood-marker-profile">{marker.profile}</span>
              </div>

              <span className="risk-analysis-wins__blood-marker-risk-pill">{marker.risk}</span>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
};

export default RiskAnalysisSection;
