import React, { useEffect, useMemo, useRef, useState } from 'react';
import './DiseaseDetailPage.css';
import lifestyleTick from '../../images/tick(lifestyle).svg';

const DEFAULT_DESCRIPTION =
  'Oxidative stress is an imbalance in your body where there are too many unstable molecules called free radicals and not enough antioxidants to neutralize them.';

const DISEASE_CONTENT = {
  obesity: {
    topLine: 'Excess body fat accumulation that increases long-term metabolic and cardiovascular risk.',
    causes: ['caloric excess', 'sedentary lifestyle', 'genetics'],
    effects: ['increased risk of diabetes', 'heart disease', 'NAFLD'],
    actionableInsights: ['gradual weight loss', 'balanced diet', '150 min/week exercise', 'behavioral support']
  },
  'metabolic syndrome': {
    topLine: 'Cluster of high blood pressure, blood sugar, fat around waist and abnormal lipids that together raise heart risk.',
    causes: ['insulin resistance', 'poor diet', 'inactivity'],
    effects: ['higher diabetes risk', 'higher heart disease risk'],
    actionableInsights: ['diet changes', 'exercise', 'weight loss', 'treat BP/lipids/glucose']
  },
  dyslipidemia: {
    topLine: 'Unhealthy blood fat levels that increase artery clogging risk.',
    causes: ['diet', 'obesity', 'genetics'],
    effects: ['higher risk of heart attack', 'higher risk of stroke'],
    actionableInsights: ['reduce saturated fats', 'exercise', 'consider statins (if high risk)']
  },
  'pcos/pcod': {
    topLine: 'Hormonal imbalance in women causing irregular periods, acne and ovarian cysts.',
    causes: ['insulin resistance', 'genetics'],
    effects: ['fertility issues', 'metabolic risk'],
    actionableInsights: ['weight loss', 'regulate cycles with meds', 'insulin-sensitizing strategies']
  },
  'oxidative stress': {
    topLine: 'When harmful molecules damage cells faster than antioxidants can repair them.',
    causes: ['smoking', 'poor diet', 'pollution'],
    effects: ['contributes to aging', 'contributes to chronic diseases'],
    actionableInsights: ['antioxidant-rich diet', 'quit smoking', 'exercise', 'manage stress']
  },
  nafld: {
    topLine: 'Fat build-up in liver not due to alcohol, linked to overweight.',
    causes: ['obesity', 'insulin resistance'],
    effects: ['can progress to inflammation', 'can progress to liver scarring'],
    actionableInsights: ['weight loss', 'control diabetes', 'avoid alcohol', 'monitor LFTs/imaging']
  },
  hypertension: {
    topLine: 'Persistently high blood pressure that strains the heart and vessels.',
    causes: ['high salt intake', 'obesity', 'stress', 'genetics'],
    effects: ['heart attack risk', 'stroke risk', 'kidney disease risk'],
    actionableInsights: ['reduce salt', 'lose weight', 'exercise', 'home BP monitoring']
  },
  'thyroid health': {
    topLine: 'Thyroid hormones control metabolism, energy and temperature.',
    causes: ['autoimmune disease', 'iodine imbalance'],
    effects: ['weight changes', 'fatigue', 'mood problems'],
    actionableInsights: ['test TSH/T4', 'treat with specialist guidance', 'routine thyroid follow-up']
  },
  'type 2 diabetes': {
    topLine: 'Body resists insulin causing high blood sugar over time.',
    causes: ['obesity', 'inactivity', 'genetics'],
    effects: ['nerve complications', 'eye complications', 'kidney complications', 'heart complications'],
    actionableInsights: ['lifestyle changes', 'monitor glucose', 'medications/insulin as advised']
  },
  'cardiac health': {
    topLine: 'Overall state of heart and blood vessels — influenced by lifestyle and genes.',
    causes: ['smoking', 'poor diet', 'high BP', 'diabetes'],
    effects: ['heart attack risk', 'heart failure risk'],
    actionableInsights: ['control BP/lipids/diabetes', 'quit smoking', 'exercise', 'cardiology follow-up']
  }
};

const RISK_ZONES = [
  { range: '0-25', label: 'Healthy', color: '#90DF9E' },
  { range: '26-50', label: 'Increased Risk', color: '#DAC15A' },
  { range: '51-75', label: 'High Risk', color: '#EE8B48' },
  { range: '76-100', label: 'Very High Risk', color: '#E95D5C' }
];

const DOTS_PER_ZONE = [13, 13, 13, 13];
const TOTAL_DOTS = DOTS_PER_ZONE.reduce((sum, count) => sum + count, 0);
const DOT_GAP = 2;
const LIFESTYLE_BANDS = ['LOW', 'MODERATE', 'INCREASED', 'HIGH', 'VERY HIGH'];

const getZoneIndexForScore = (score) => {
  if (score <= 25) return 0;
  if (score <= 50) return 1;
  if (score <= 75) return 2;
  return 3;
};

const getDotSizeForMarker = (index, markerIndex) => {
  const distanceFromMarker = Math.abs(index - markerIndex);
  if (distanceFromMarker === 0) return 12;
  return Math.max(4, 11 - distanceFromMarker);
};

const getDiseaseKey = (name = '') => name.replace(/\s+/g, ' ').trim().toLowerCase();

const DiseaseDetailPage = ({ disease, onBack }) => {
  const riskStripRef = useRef(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [dotsAnimated, setDotsAnimated] = useState(false);
  const [riskStripWidth, setRiskStripWidth] = useState(0);
  const title = disease?.name?.replace('\n', ' ') || 'Oxidative Stress';
  const diseaseContent = DISEASE_CONTENT[getDiseaseKey(title)] || DISEASE_CONTENT['oxidative stress'];
  const score = Math.max(0, Math.min(100, disease?.score ?? 85));
  const healthRankScore = 55;
  const scoreZoneIndex = getZoneIndexForScore(score);
  const healthRankZoneIndex = getZoneIndexForScore(healthRankScore);
  const [animatedMarkerLeftPercent, setAnimatedMarkerLeftPercent] = useState(0);
  const targetPercent = score;
  const initialMarkerIndex = Math.round((score / 100) * (TOTAL_DOTS - 1));

  const riskLayout = useMemo(() => {
    const buildLayoutForMarker = (candidateMarkerIndex) => {
      const rawDotSizes = Array.from({ length: TOTAL_DOTS }, (_, index) =>
        getDotSizeForMarker(index, candidateMarkerIndex)
      );

      const totalRawDotWidth = rawDotSizes.reduce((sum, size) => sum + size, 0);
      const totalGapWidth = DOT_GAP * (TOTAL_DOTS - 1);
      const availableDotWidth = riskStripWidth ? Math.max(0, riskStripWidth - totalGapWidth) : totalRawDotWidth;
      const dotSizeScale = totalRawDotWidth > 0 ? Math.min(1, availableDotWidth / totalRawDotWidth) : 1;

      const adjustedDotSizes = rawDotSizes.map((size) => size * dotSizeScale);
      const dotsTrackWidth = adjustedDotSizes.reduce((sum, size) => sum + size, 0) + totalGapWidth;

      const dotCenterPercents = [];
      let runningX = 0;
      for (let index = 0; index < TOTAL_DOTS; index += 1) {
        const dotSize = adjustedDotSizes[index];
        const centerPx = runningX + dotSize / 2;
        dotCenterPercents.push(dotsTrackWidth > 0 ? (centerPx / dotsTrackWidth) * 100 : 0);
        runningX += dotSize + DOT_GAP;
      }

      return {
        adjustedDotSizes,
        dotsTrackWidth,
        dotCenterPercents
      };
    };

    let candidateMarkerIndex = initialMarkerIndex;
    let layout = buildLayoutForMarker(candidateMarkerIndex);

    const zoneMinPercent = scoreZoneIndex * 25;
    const zoneMaxPercent = (scoreZoneIndex + 1) * 25;

    for (let iteration = 0; iteration < 2; iteration += 1) {
      const currentLayout = layout;
      const eligibleIndexes = layout.dotCenterPercents
        .map((centerPercent, index) => ({ centerPercent, index }))
        .filter(({ centerPercent }) => {
          if (scoreZoneIndex === 0) {
            return centerPercent >= zoneMinPercent && centerPercent <= zoneMaxPercent;
          }
          return centerPercent > zoneMinPercent && centerPercent <= zoneMaxPercent;
        })
        .map(({ index }) => index);

      const candidateIndexes = eligibleIndexes.length > 0
        ? eligibleIndexes
        : currentLayout.dotCenterPercents.map((_, index) => index);

      const nearestIndex = candidateIndexes.reduce((closestIndex, index) => {
        const centerPercent = currentLayout.dotCenterPercents[index];
        const currentDistance = Math.abs(centerPercent - targetPercent);
        const closestDistance = Math.abs(currentLayout.dotCenterPercents[closestIndex] - targetPercent);
        return currentDistance < closestDistance ? index : closestIndex;
      }, candidateIndexes[0]);

      if (nearestIndex === candidateMarkerIndex) break;

      candidateMarkerIndex = nearestIndex;
      layout = buildLayoutForMarker(candidateMarkerIndex);
    }

    return {
      markerIndex: candidateMarkerIndex,
      markerLeftPercent: layout.dotCenterPercents[candidateMarkerIndex] ?? targetPercent,
      markerLineHeight: 21 + ((layout.adjustedDotSizes[candidateMarkerIndex] || 0) / 2),
      adjustedDotSizes: layout.adjustedDotSizes,
      dotsTrackWidth: layout.dotsTrackWidth,
      dotCenterPercents: layout.dotCenterPercents
    };
  }, [initialMarkerIndex, riskStripWidth, scoreZoneIndex, targetPercent]);

  const {
    markerLeftPercent,
    markerLineHeight,
    adjustedDotSizes,
    dotsTrackWidth,
    dotCenterPercents
  } = riskLayout;

  const zoneBoundaryPercents = useMemo(() => [25, 50, 75], []);
  const zoneCenterPercents = useMemo(() => [12.5, 37.5, 62.5, 87.5], []);

  const currentZoneIndex = scoreZoneIndex;
  const currentZone = RISK_ZONES[currentZoneIndex];
  const currentZoneColor = RISK_ZONES[currentZoneIndex].color;
  const healthRankColor = RISK_ZONES[healthRankZoneIndex].color;

  useEffect(() => {
    const element = riskStripRef.current;
    if (!element) return undefined;

    const updateWidth = () => {
      setRiskStripWidth(element.clientWidth);
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    setDotsAnimated(false);
    setAnimatedMarkerLeftPercent(0);

    const animationFrame = requestAnimationFrame(() => {
      setDotsAnimated(true);
      setAnimatedMarkerLeftPercent(markerLeftPercent);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [markerLeftPercent]);

  return (
    <div className="disease-detail-page">
      <div className="disease-detail-header">
        <div className="disease-detail-title-row">
          <button onClick={onBack} className="disease-detail-back-button" aria-label="Go back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <h1 className="disease-detail-title">{title}</h1>
        </div>

        <button
          type="button"
          className="disease-detail-description-toggle"
          onClick={() => setIsDescriptionExpanded((prev) => !prev)}
          aria-expanded={isDescriptionExpanded}
          aria-label="Toggle full description"
        >
          <p className={`disease-detail-description ${isDescriptionExpanded ? 'expanded' : ''}`}>
            {diseaseContent?.topLine || DEFAULT_DESCRIPTION}
          </p>
        </button>
      </div>

      <div className="disease-detail-risk-strip" ref={riskStripRef}>
        <div className="disease-detail-risk-scale-shell" style={{ width: `${dotsTrackWidth}px` }}>
          <div className="disease-detail-risk-labels">
            {RISK_ZONES.map((zone, index) => (
              <div
                key={zone.range}
                className="disease-detail-risk-label-group"
                style={{
                  left: `${zoneCenterPercents[index]}%`,
                  transform: 'translate(-50%, 38px)'
                }}
              >
              <span className="disease-detail-risk-range">{zone.range}</span>
              <span className="disease-detail-risk-label">{zone.label}</span>
              </div>
            ))}
          </div>

          <div className="disease-detail-risk-track-area">
            {zoneBoundaryPercents.map((boundaryPercent, index) => (
              <span
                key={`separator-${index + 1}`}
                className="disease-detail-risk-separator"
                style={{ left: `${boundaryPercent}%` }}
              />
            ))}

            <div className="disease-detail-risk-dots-track">
              {Array.from({ length: TOTAL_DOTS }, (_, index) => {
              const dotCenterPercent = dotCenterPercents[index] ?? 0;
              const zoneIndex = Math.min(3, Math.floor(dotCenterPercent / 25));
              const zone = RISK_ZONES[zoneIndex];
              const dotSize = adjustedDotSizes[index];

              return (
                <span
                  key={`risk-dot-${index}`}
                  className={`disease-detail-risk-dot ${dotsAnimated ? 'animated' : ''}`}
                  style={{
                    width: `${dotSize}px`,
                    height: `${dotSize}px`,
                    backgroundColor: zone.color,
                    transitionDelay: `${index * 12}ms`
                  }}
                />
              );
            })}
            </div>
          </div>

          <div className="disease-detail-risk-marker-zone">
            <div className="disease-detail-risk-marker" style={{ left: `${animatedMarkerLeftPercent}%` }}>
              <span
                className="disease-detail-risk-marker-line"
                style={{
                  height: `${markerLineHeight}px`,
                  borderLeftColor: currentZoneColor
                }}
              />

              <div className="disease-detail-risk-score-row">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <g clipPath="url(#clip0_1404_7240)">
                    <path d="M8.66792 5.21802V13.3327H7.33459V5.21802L3.75858 8.79401L2.81592 7.85135L8.00125 2.66602L13.1866 7.85135L12.2439 8.79401L8.66792 5.21802Z" fill={currentZoneColor} />
                  </g>
                  <defs>
                    <clipPath id="clip0_1404_7240">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <span className="disease-detail-risk-score-value">{score}</span>
              </div>

              <div className="disease-detail-risk-level-row">
                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                  <path d="M4 8C6.20914 8 8 6.20914 8 4C8 1.79086 6.20914 0 4 0C1.79086 0 0 1.79086 0 4C0 6.20914 1.79086 8 4 8Z" fill={currentZoneColor} />
                </svg>
                <span className="disease-detail-risk-level-text">{currentZone.label}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="disease-detail-lifestyle-section">
        <div className="disease-detail-lifestyle-header-row">
          <div className="disease-detail-lifestyle-title-wrap">
            <h2 className="disease-detail-lifestyle-title">Lifestyle Contribution</h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M5.5 8.5H6.5V5.5H5.5V8.5ZM6 4.5C6.14167 4.5 6.2605 4.452 6.3565 4.356C6.4525 4.26 6.50033 4.14133 6.5 4C6.49967 3.85867 6.45167 3.74 6.356 3.644C6.26033 3.548 6.14167 3.5 6 3.5C5.85833 3.5 5.73967 3.548 5.644 3.644C5.54833 3.74 5.50033 3.85867 5.5 4C5.49967 4.14133 5.54767 4.26017 5.644 4.3565C5.74033 4.45283 5.859 4.50067 6 4.5ZM6 11C5.30833 11 4.65833 10.8687 4.05 10.606C3.44167 10.3433 2.9125 9.98717 2.4625 9.5375C2.0125 9.08783 1.65633 8.55867 1.394 7.95C1.13167 7.34133 1.00033 6.69133 1 6C0.999667 5.30867 1.131 4.65867 1.394 4.05C1.657 3.44133 2.01317 2.91217 2.4625 2.4625C2.91183 2.01283 3.441 1.65667 4.05 1.394C4.659 1.13133 5.309 1 6 1C6.691 1 7.341 1.13133 7.95 1.394C8.559 1.65667 9.08817 2.01283 9.5375 2.4625C9.98683 2.91217 10.3432 3.44133 10.6065 4.05C10.8698 4.65867 11.001 5.30867 11 6C10.999 6.69133 10.8677 7.34133 10.606 7.95C10.3443 8.55867 9.98817 9.08783 9.5375 9.5375C9.08683 9.98717 8.55767 10.3435 7.95 10.6065C7.34233 10.8695 6.69233 11.0007 6 11ZM6 10C7.11667 10 8.0625 9.6125 8.8375 8.8375C9.6125 8.0625 10 7.11667 10 6C10 4.88333 9.6125 3.9375 8.8375 3.1625C8.0625 2.3875 7.11667 2 6 2C4.88333 2 3.9375 2.3875 3.1625 3.1625C2.3875 3.9375 2 4.88333 2 6C2 7.11667 2.3875 8.0625 3.1625 8.8375C3.9375 9.6125 4.88333 10 6 10Z" fill="#C4C4C4"/>
            </svg>
          </div>
          <span className="disease-detail-lifestyle-status">LOW</span>
        </div>

        <div className="disease-detail-lifestyle-bar-wrap">
          <div className="disease-detail-lifestyle-bar" />
          <img src={lifestyleTick} alt="" className="disease-detail-lifestyle-knob" aria-hidden="true" />
        </div>

        <div className="disease-detail-lifestyle-bands">
          {LIFESTYLE_BANDS.map((band) => (
            <div className="disease-detail-lifestyle-band-item" key={band}>
              <svg xmlns="http://www.w3.org/2000/svg" width="1" height="4" viewBox="0 0 1 4" fill="none" aria-hidden="true">
                <path d="M0.230469 0V3.6881" stroke="#888888" strokeWidth="0.461013" />
              </svg>
              <span>{band}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="disease-detail-health-rank-section">
        <div className="disease-detail-health-rank-header-row">
          <div className="disease-detail-health-rank-title-wrap">
            <h2 className="disease-detail-health-rank-title">Your Health Rank v/s Others</h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M5.5 8.5H6.5V5.5H5.5V8.5ZM6 4.5C6.14167 4.5 6.2605 4.452 6.3565 4.356C6.4525 4.26 6.50033 4.14133 6.5 4C6.49967 3.85867 6.45167 3.74 6.356 3.644C6.26033 3.548 6.14167 3.5 6 3.5C5.85833 3.5 5.73967 3.548 5.644 3.644C5.54833 3.74 5.50033 3.85867 5.5 4C5.49967 4.14133 5.54767 4.26017 5.644 4.3565C5.74033 4.45283 5.859 4.50067 6 4.5ZM6 11C5.30833 11 4.65833 10.8687 4.05 10.606C3.44167 10.3433 2.9125 9.98717 2.4625 9.5375C2.0125 9.08783 1.65633 8.55867 1.394 7.95C1.13167 7.34133 1.00033 6.69133 1 6C0.999667 5.30867 1.131 4.65867 1.394 4.05C1.657 3.44133 2.01317 2.91217 2.4625 2.4625C2.91183 2.01283 3.441 1.65667 4.05 1.394C4.659 1.13133 5.309 1 6 1C6.691 1 7.341 1.13133 7.95 1.394C8.559 1.65667 9.08817 2.01283 9.5375 2.4625C9.98683 2.91217 10.3432 3.44133 10.6065 4.05C10.8698 4.65867 11.001 5.30867 11 6C10.999 6.69133 10.8677 7.34133 10.606 7.95C10.3443 8.55867 9.98817 9.08783 9.5375 9.5375C9.08683 9.98717 8.55767 10.3435 7.95 10.6065C7.34233 10.8695 6.69233 11.0007 6 11ZM6 10C7.11667 10 8.0625 9.6125 8.8375 8.8375C9.6125 8.0625 10 7.11667 10 6C10 4.88333 9.6125 3.9375 8.8375 3.1625C8.0625 2.3875 7.11667 2 6 2C4.88333 2 3.9375 2.3875 3.1625 3.1625C2.3875 3.9375 2 4.88333 2 6C2 7.11667 2.3875 8.0625 3.1625 8.8375C3.9375 9.6125 4.88333 10 6 10Z" fill="#C4C4C4"/>
            </svg>
          </div>
          <span className="disease-detail-health-rank-rank">55th</span>
        </div>

        <div className="disease-detail-health-rank-score-row">
          <span className="disease-detail-health-rank-score-value" style={{ color: healthRankColor }}>{healthRankScore}</span>
          <span className="disease-detail-health-rank-score-max">/100</span>
        </div>
      </section>

      <section className="disease-detail-info-section">
        <h3 className="disease-detail-info-heading">Causes</h3>
        <div className="disease-detail-chip-row">
          {diseaseContent.causes.map((item) => (
            <span key={`cause-${item}`} className="disease-detail-chip">{item}</span>
          ))}
        </div>

        <h3 className="disease-detail-info-heading disease-detail-effects-heading">Effects</h3>
        <div className="disease-detail-effects-list">
          {diseaseContent.effects.map((item) => (
            <p key={`effect-${item}`} className="disease-detail-effect-text">{item}</p>
          ))}
        </div>

        <h3 className="disease-detail-info-heading disease-detail-insights-heading">Actionable Insights</h3>
        <div className="disease-detail-chip-row">
          {diseaseContent.actionableInsights.map((item) => (
            <span key={`insight-${item}`} className="disease-detail-chip">{item}</span>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DiseaseDetailPage;