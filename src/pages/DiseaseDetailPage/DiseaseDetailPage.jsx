import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './DiseaseDetailPage.css';
import lifestyleTick from '../../images/tick(lifestyle).svg';
import { fetchLatestAssessmentReport } from '../../services/reportService';
import { formatOrdinal } from '../../utils/formatOrdinal';
import { formatApiContentDisplay } from '../../utils/formatApiContentDisplay';
import TrendsChart from '../../components/TrendsChart';

const RISK_ZONES = [
  {
    range: '0-25',
    label: 'Healthy',
    color: '#90DF9E',
    dotFill: 'linear-gradient(180deg, #90DF9E 0%, #4E7956 100%), #90DF9E'
  },
  {
    range: '26-50',
    label: 'Increased Risk',
    color: '#DAC15A',
    dotFill: 'linear-gradient(180deg, #DAC15A 0%, #746730 100%), #90DF9E'
  },
  {
    range: '51-75',
    label: 'High Risk',
    color: '#EE8B48',
    dotFill: 'linear-gradient(90deg, #EE8B48 0%, #884F29 100%), #90DF9E'
  },
  {
    range: '76-100',
    label: 'Very High Risk',
    color: '#E95D5C',
    dotFill: 'linear-gradient(180deg, #E95D5C 0%, #833434 100%)'
  }
];

const DOT_GAP = 2;
const RISK_ZONE_COUNT = 4;
const BASE_DOTS_PER_ZONE = 11;
const LIFESTYLE_BANDS = ['LOW', 'MODERATE', 'INCREASED', 'HIGH', 'VERY HIGH'];


const resolveRiskPayloadRoot = (payload) => {
  if (!payload || typeof payload !== 'object') return null;
  if (payload.data && typeof payload.data === 'object') return payload.data;
  if (payload.result && typeof payload.result === 'object') return payload.result;
  if (payload.item && typeof payload.item === 'object') return payload.item;
  return payload;
};

const normalizeDiseaseCode = (code) => String(code || '')
  .trim()
  .toLowerCase();

const diseaseCodeFromName = (name = '') => {
  const key = String(name).replace(/\n/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

  if (!key) return '';
  if (key === 'type 2 diabetes') return 'diabetes';
  if (key === 'metabolic syndrome') return 'metabolic_syndrome';
  if (key === 'oxidative stress') return 'oxidative_stress';
  if (key === 'thyroid health') return 'thyroid_health';
  if (key === 'cardiac health') return 'cardiac_health';
  if (key === 'pcos/pcod' || key === 'pcos' || key === 'pcod') return 'pcos_pcod';

  return key.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
};

const toStringArray = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') {
          return item.trim();
        }

        if (item && typeof item === 'object') {
          const text = item.text || item.label || item.title || item.description || item.value;
          return typeof text === 'string' ? text.trim() : '';
        }

        return '';
      })
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  return [];
};

const toClampedScore = (value, fallback = 0) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(100, Math.round(numeric)));
};

const lifestyleBandFromPercent = (value) => {
  if (value <= 20) return 'LOW';
  if (value <= 40) return 'MODERATE';
  if (value <= 60) return 'INCREASED';
  if (value <= 80) return 'HIGH';
  return 'VERY HIGH';
};

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

const LifestyleInfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path d="M6.67895 1.21077C6.73788 0.895239 7.01329 0.666504 7.33428 0.666504C7.65526 0.666504 7.93068 0.895239 7.98961 1.21077L8.69028 4.9161C8.79212 5.45522 9.21382 5.87692 9.75295 5.97877L13.4583 6.67943C13.7738 6.73837 14.0025 7.01378 14.0025 7.33477C14.0025 7.65575 13.7738 7.93117 13.4583 7.9901L9.75295 8.69077C9.21382 8.79261 8.79212 9.21431 8.69028 9.75343L7.98961 13.4588C7.93068 13.7743 7.65526 14.003 7.33428 14.003C7.01329 14.003 6.73788 13.7743 6.67895 13.4588L5.97828 9.75343C5.87644 9.21431 5.45474 8.79261 4.91561 8.69077L1.21028 7.9901C0.894751 7.93117 0.666016 7.65575 0.666016 7.33477C0.666016 7.01378 0.894751 6.73837 1.21028 6.67943L4.91561 5.97877C5.45474 5.87692 5.87644 5.45522 5.97828 4.9161L6.67895 1.21077M12.6676 0.6681V3.33477M14.0009 2.00143H11.3343" stroke="#90DF9E" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HealthRankInfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none" aria-hidden="true">
    <path d="M6.58333 17.4171V13.2504C6.58333 12.4646 6.58333 12.0721 6.33917 11.8279C6.095 11.5838 5.7025 11.5838 4.91667 11.5838H4.5C3.32083 11.5838 2.73167 11.5837 2.36667 11.9504C2 12.3162 2 12.9054 2 14.0838V17.4171H6.58333ZM6.58333 17.4171H11.5833M6.58333 17.4171V12.4171C6.58333 11.2388 6.58333 10.6496 6.95 10.2837C7.315 9.91708 7.90417 9.91708 9.08333 9.91708C10.2625 9.91708 10.8508 9.91708 11.2167 10.2837C11.5833 10.6496 11.5833 11.2388 11.5833 12.4171V17.4171M11.5833 17.4171H16.1667V15.7504C16.1667 14.5721 16.1667 13.9829 15.8 13.6171C15.4342 13.2504 14.845 13.2504 13.6667 13.2504H13.25C12.4642 13.2504 12.0717 13.2504 11.8275 13.4946C11.5833 13.7387 11.5833 14.1313 11.5833 14.9171V17.4171ZM0.75 17.4171H17.4167M9.65917 1.23208L10.2458 2.41542C10.2956 2.50408 10.3635 2.58128 10.445 2.64201C10.5266 2.70274 10.62 2.74564 10.7192 2.76792L11.7825 2.94542C12.4625 3.05958 12.6225 3.55708 12.1325 4.04792L11.3058 4.88125C11.2334 4.96329 11.1802 5.0605 11.1502 5.16577C11.1202 5.27103 11.1142 5.38168 11.1325 5.48958L11.3692 6.52125C11.5558 7.33792 11.1258 7.65375 10.4092 7.22708L9.4125 6.63208C9.31054 6.57919 9.19736 6.55159 9.0825 6.55159C8.96764 6.55159 8.85446 6.57919 8.7525 6.63208L7.75583 7.22708C7.0425 7.65375 6.60917 7.33458 6.79583 6.52125L7.0325 5.48958C7.05084 5.38168 7.04479 5.27103 7.0148 5.16577C6.9848 5.0605 6.93163 4.96329 6.85917 4.88125L6.03333 4.04792C5.54667 3.55708 5.70333 3.05958 6.38333 2.94542L7.44583 2.76792C7.54451 2.74512 7.63731 2.70189 7.71826 2.64104C7.79921 2.58018 7.86652 2.50304 7.91583 2.41458L8.5025 1.23125C8.8225 0.589583 9.3425 0.589583 9.65917 1.23125" stroke="#90DF9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DiseaseDetailPage = ({ disease, onBack }) => {
  const riskStripRef = useRef(null);
  const descriptionRef = useRef(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isDescriptionTruncated, setIsDescriptionTruncated] = useState(false);
  const [collapsedPreview, setCollapsedPreview] = useState(null);
  const [dotsAnimated, setDotsAnimated] = useState(false);
  const [riskStripWidth, setRiskStripWidth] = useState(0);
  const [animatedLifestyleLeftPercent, setAnimatedLifestyleLeftPercent] = useState(0);
  const [activeInfoPopup, setActiveInfoPopup] = useState(null);
  const [animatedHealthRankScore, setAnimatedHealthRankScore] = useState(0);
  const [apiDetail, setApiDetail] = useState(null);
  const [expandedPill, setExpandedPill] = useState(null);
  const title = disease?.name?.replace('\n', ' ') || 'Oxidative Stress';
  const diseaseCode = useMemo(() => {
    const rawCode = normalizeDiseaseCode(disease?.code);
    if (rawCode) return rawCode;
    return diseaseCodeFromName(title);
  }, [disease?.code, title]);
  const hasScore = apiDetail?.risk_score_scaled !== null && apiDetail?.risk_score_scaled !== undefined;
  const score = hasScore ? toClampedScore(apiDetail?.risk_score_scaled, 0) : 0;
  const scoreLabel = hasScore ? String(score) : '-';
  const hasHealthRank = apiDetail?.disease_percentile !== null && apiDetail?.disease_percentile !== undefined;
  const healthRankScore = hasHealthRank ? toClampedScore(apiDetail?.disease_percentile, 0) : 0;
  const scoreZoneIndex = getZoneIndexForScore(score);
  const healthRankZoneIndex = getZoneIndexForScore(healthRankScore);
  const [animatedMarkerLeftPercent, setAnimatedMarkerLeftPercent] = useState(0);
  const targetPercent = score;
  const dotsPerZone = useMemo(() => {
    if (!riskStripWidth) return BASE_DOTS_PER_ZONE;
    return Math.max(BASE_DOTS_PER_ZONE, Math.round((riskStripWidth / RISK_ZONE_COUNT) / 9));
  }, [riskStripWidth]);
  const totalDots = dotsPerZone * RISK_ZONE_COUNT;
  const initialMarkerIndex = Math.round((score / 100) * (totalDots - 1));

  const riskLayout = useMemo(() => {
    const buildLayoutForMarker = (candidateMarkerIndex) => {
      const rawDotSizes = Array.from({ length: totalDots }, (_, index) =>
        getDotSizeForMarker(index, candidateMarkerIndex)
      );

      const totalRawDotWidth = rawDotSizes.reduce((sum, size) => sum + size, 0);
      const totalGapWidth = DOT_GAP * (totalDots - 1);
      const availableDotWidth = riskStripWidth ? Math.max(0, riskStripWidth - totalGapWidth) : totalRawDotWidth;
      const dotSizeScale = totalRawDotWidth > 0 ? (availableDotWidth / totalRawDotWidth) : 1;

      const adjustedDotSizes = rawDotSizes.map((size) => size * dotSizeScale);
      const dotsTrackWidth = adjustedDotSizes.reduce((sum, size) => sum + size, 0) + totalGapWidth;

      const dotCenterPercents = [];
      let runningX = 0;
      for (let index = 0; index < totalDots; index += 1) {
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
      markerLineHeight: 21,
      adjustedDotSizes: layout.adjustedDotSizes,
      dotsTrackWidth: layout.dotsTrackWidth,
      dotCenterPercents: layout.dotCenterPercents
    };
  }, [initialMarkerIndex, riskStripWidth, scoreZoneIndex, targetPercent, totalDots]);

  const {
    markerLeftPercent,
    markerLineHeight,
    adjustedDotSizes,
    dotsTrackWidth,
    dotCenterPercents
  } = riskLayout;

  // Place separators in the gap between the last dot of one zone and the first of the next
  // (hardcoded 25/50/75 sits on a dot center and draws through it).
  const zoneBoundaryPercents = useMemo(() => {
    const boundaries = [25, 50, 75];
    if (!Array.isArray(dotCenterPercents) || dotCenterPercents.length === 0) {
      return boundaries;
    }

    return boundaries.map((boundary) => {
      let leftCenter = null;
      let rightCenter = null;

      for (let index = 0; index < dotCenterPercents.length; index += 1) {
        const center = dotCenterPercents[index];
        if (center < boundary) {
          leftCenter = center;
        } else {
          rightCenter = center;
          break;
        }
      }

      if (leftCenter != null && rightCenter != null) {
        return (leftCenter + rightCenter) / 2;
      }

      return boundary;
    });
  }, [dotCenterPercents]);

  const zoneCenterPercents = useMemo(() => [12.5, 37.5, 62.5, 87.5], []);

  const currentZoneIndex = scoreZoneIndex;
  const currentZone = RISK_ZONES[currentZoneIndex];
  const currentZoneColor = RISK_ZONES[currentZoneIndex].color;
  const healthRankColor = RISK_ZONES[healthRankZoneIndex].color;
  const lifestyleContributionRaw = apiDetail?.lifestyle_contribution;
  const hasLifestyle = apiDetail != null && lifestyleContributionRaw !== undefined;
  const lifestyleTargetPercent = hasLifestyle
    ? (lifestyleContributionRaw === null ? 0 : toClampedScore(lifestyleContributionRaw, 0))
    : 0;
  const lifestyleBand = !hasLifestyle
    ? '-'
    : lifestyleTargetPercent === 0
      ? '0'
      : lifestyleBandFromPercent(lifestyleTargetPercent);
  const healthRankLabel = hasHealthRank ? formatOrdinal(healthRankScore) : '-';
  const currentZoneDisplayColor = hasScore ? currentZoneColor : '#C4C4C4';
  const currentZoneLabel = hasScore ? currentZone.label : '-';
  const healthRankDisplayColor = hasHealthRank ? healthRankColor : '#C4C4C4';
  const healthRankScoreLabel = hasHealthRank ? String(animatedHealthRankScore) : '-';
  const detailTopLine = (typeof apiDetail?.meaning === 'string' && apiDetail.meaning.trim())
    ? apiDetail.meaning.trim()
    : '-';

  const causes = useMemo(() => {
    const highValues = toStringArray(apiDetail?.causes_when_high);
    const lowValues = toStringArray(apiDetail?.causes_when_low);
    const sideSpecific = hasScore
      ? (score > 50 ? highValues : lowValues)
      : [];
    const fallbackValues = highValues.length > 0 ? highValues : lowValues;

    if (sideSpecific.length > 0) {
      return sideSpecific;
    }

    if (fallbackValues.length > 0) {
      return fallbackValues;
    }

    return ['-'];
  }, [apiDetail?.causes_when_high, apiDetail?.causes_when_low, hasScore, score]);

  const effects = useMemo(() => {
    const highValues = toStringArray(apiDetail?.effects_when_high);
    const lowValues = toStringArray(apiDetail?.effects_when_low);
    const sideSpecific = hasScore
      ? (score > 50 ? highValues : lowValues)
      : [];
    const fallbackValues = highValues.length > 0 ? highValues : lowValues;

    if (sideSpecific.length > 0) {
      return sideSpecific;
    }

    if (fallbackValues.length > 0) {
      return fallbackValues;
    }

    return ['-'];
  }, [apiDetail?.effects_when_high, apiDetail?.effects_when_low, hasScore, score]);

  const actionableInsights = useMemo(() => {
    const highValues = toStringArray(apiDetail?.what_to_do_when_high);
    const lowValues = toStringArray(apiDetail?.what_to_do_when_low);
    const sideSpecific = hasScore
      ? (score > 50 ? highValues : lowValues)
      : [];
    const fallbackValues = highValues.length > 0 ? highValues : lowValues;

    if (sideSpecific.length > 0) {
      return sideSpecific;
    }

    if (fallbackValues.length > 0) {
      return fallbackValues;
    }

    return ['-'];
  }, [apiDetail?.what_to_do_when_high, apiDetail?.what_to_do_when_low, hasScore, score]);

  const infoPopupContent = {
    lifestyle: {
      title: 'Lifestyle Contribution',
      description: 'Your daily habits like activity, sleep, stress, and diet affect your health risk. This scale shows how much your lifestyle contributes to your health risk. Lower is better.',
      Icon: LifestyleInfoIcon
    },
    rank: {
      title: 'Health Rank',
      description: 'Your health score is compared with people in similar age group. Lower rank means better health compared to others.',
      Icon: HealthRankInfoIcon
    }
  };

  const popupData = activeInfoPopup ? infoPopupContent[activeInfoPopup] : null;

  useLayoutEffect(() => {
    const element = descriptionRef.current;
    if (!element || isDescriptionExpanded) {
      setIsDescriptionTruncated(false);
      setCollapsedPreview(null);
      return;
    }

    const fullText = String(detailTopLine || '');
    const fits = (value) => {
      element.textContent = value;
      return element.scrollHeight <= element.clientHeight + 1;
    };

    if (fits(fullText)) {
      setIsDescriptionTruncated(false);
      setCollapsedPreview(null);
      element.textContent = fullText;
      return;
    }

    setIsDescriptionTruncated(true);

    let low = 0;
    let high = fullText.length;
    let best = 0;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const candidate = fullText.slice(0, mid).replace(/\s+\S*$/, '').trimEnd();
      if (!candidate) {
        high = mid - 1;
        continue;
      }

      if (fits(`${candidate} ...`)) {
        best = candidate.length;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    const preview = fullText.slice(0, best).replace(/\s+\S*$/, '').trimEnd();
    setCollapsedPreview(preview || fullText.slice(0, Math.max(0, best)).trimEnd());
  }, [detailTopLine, isDescriptionExpanded]);

  useEffect(() => {
    let isActive = true;

    const loadDiseaseRiskDetail = async () => {
      if (!diseaseCode) {
        if (isActive) {
          setApiDetail(null);
        }
        return;
      }

      try {
        const { response } = await fetchLatestAssessmentReport(
          (assessmentId) => `/reports/${assessmentId}/risk-analysis?disease=${encodeURIComponent(diseaseCode)}`
        );
        const detail = resolveRiskPayloadRoot(response);

        if (detail && isActive) {
          setApiDetail(detail);
          return;
        }

        if (isActive) {
          setApiDetail(null);
        }
      } catch {
        if (isActive) {
          setApiDetail(null);
        }
      }
    };

    loadDiseaseRiskDetail();

    return () => {
      isActive = false;
    };
  }, [diseaseCode]);

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
    let markerTimeout;

    // Split start/end updates across frames so CSS left-transition is always visible.
    const animationFrame = requestAnimationFrame(() => {
      setDotsAnimated(true);

      markerTimeout = window.setTimeout(() => {
        setAnimatedMarkerLeftPercent(markerLeftPercent);
      }, 120);
    });

    return () => {
      cancelAnimationFrame(animationFrame);
      if (markerTimeout) {
        window.clearTimeout(markerTimeout);
      }
    };
  }, [markerLeftPercent]);

  useEffect(() => {
    setAnimatedLifestyleLeftPercent(0);
    let lifestyleTimeout;

    const animationFrame = requestAnimationFrame(() => {
      lifestyleTimeout = window.setTimeout(() => {
        setAnimatedLifestyleLeftPercent(lifestyleTargetPercent);
      }, 120);
    });

    return () => {
      cancelAnimationFrame(animationFrame);
      if (lifestyleTimeout) {
        window.clearTimeout(lifestyleTimeout);
      }
    };
  }, [lifestyleTargetPercent]);

  useEffect(() => {
    setAnimatedHealthRankScore(0);
    const durationMs = 1200;
    let animationFrame;
    let startTime;

    const animateScore = (timestamp) => {
      if (startTime === undefined) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / durationMs, 1);
      const nextValue = Math.round(progress * healthRankScore);
      setAnimatedHealthRankScore(nextValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animateScore);
      }
    };

    animationFrame = requestAnimationFrame(animateScore);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [healthRankScore]);

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
      </div>

      <div className={`disease-detail-content${activeInfoPopup ? ' disease-detail-content--blurred' : ''}`}>
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
              {Array.from({ length: totalDots }, (_, index) => {
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
                    background: zone.dotFill,
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
                    borderLeftColor: currentZoneDisplayColor
                }}
              />

              <div className="disease-detail-risk-score-row">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <g clipPath="url(#clip0_1404_7240)">
                    <path d="M8.66792 5.21802V13.3327H7.33459V5.21802L3.75858 8.79401L2.81592 7.85135L8.00125 2.66602L13.1866 7.85135L12.2439 8.79401L8.66792 5.21802Z" fill={currentZoneDisplayColor} />
                  </g>
                  <defs>
                    <clipPath id="clip0_1404_7240">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <span className="disease-detail-risk-score-value">{scoreLabel}</span>
              </div>

              <div className="disease-detail-risk-level-row">
                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                  <path d="M4 8C6.20914 8 8 6.20914 8 4C8 1.79086 6.20914 0 4 0C1.79086 0 0 1.79086 0 4C0 6.20914 1.79086 8 4 8Z" fill={currentZoneDisplayColor} />
                </svg>
                <span className="disease-detail-risk-level-text">{currentZoneLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="disease-detail-lifestyle-section">
        <div className="disease-detail-lifestyle-header-row">
          <div className="disease-detail-lifestyle-title-wrap">
            <h2 className="disease-detail-lifestyle-title">Lifestyle Contribution</h2>
            <button
              type="button"
              className="disease-detail-info-trigger"
              onClick={() => setActiveInfoPopup('lifestyle')}
              aria-label="Open lifestyle contribution info"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M5.5 8.5H6.5V5.5H5.5V8.5ZM6 4.5C6.14167 4.5 6.2605 4.452 6.3565 4.356C6.4525 4.26 6.50033 4.14133 6.5 4C6.49967 3.85867 6.45167 3.74 6.356 3.644C6.26033 3.548 6.14167 3.5 6 3.5C5.85833 3.5 5.73967 3.548 5.644 3.644C5.54833 3.74 5.50033 3.85867 5.5 4C5.49967 4.14133 5.54767 4.26017 5.644 4.3565C5.74033 4.45283 5.859 4.50067 6 4.5ZM6 11C5.30833 11 4.65833 10.8687 4.05 10.606C3.44167 10.3433 2.9125 9.98717 2.4625 9.5375C2.0125 9.08783 1.65633 8.55867 1.394 7.95C1.13167 7.34133 1.00033 6.69133 1 6C0.999667 5.30867 1.131 4.65867 1.394 4.05C1.657 3.44133 2.01317 2.91217 2.4625 2.4625C2.91183 2.01283 3.441 1.65667 4.05 1.394C4.659 1.13133 5.309 1 6 1C6.691 1 7.341 1.13133 7.95 1.394C8.559 1.65667 9.08817 2.01283 9.5375 2.4625C9.98683 2.91217 10.3432 3.44133 10.6065 4.05C10.8698 4.65867 11.001 5.30867 11 6C10.999 6.69133 10.8677 7.34133 10.606 7.95C10.3443 8.55867 9.98817 9.08783 9.5375 9.5375C9.08683 9.98717 8.55767 10.3435 7.95 10.6065C7.34233 10.8695 6.69233 11.0007 6 11ZM6 10C7.11667 10 8.0625 9.6125 8.8375 8.8375C9.6125 8.0625 10 7.11667 10 6C10 4.88333 9.6125 3.9375 8.8375 3.1625C8.0625 2.3875 7.11667 2 6 2C4.88333 2 3.9375 2.3875 3.1625 3.1625C2.3875 3.9375 2 4.88333 2 6C2 7.11667 2.3875 8.0625 3.1625 8.8375C3.9375 9.6125 4.88333 10 6 10Z" fill="#C4C4C4"/>
              </svg>
            </button>
          </div>
          <button
            type="button"
            className="disease-detail-lifestyle-status disease-detail-tap-value"
            onClick={() => setActiveInfoPopup('lifestyle')}
          >
            {lifestyleBand}
          </button>
        </div>

        <div className="disease-detail-lifestyle-bar-wrap">
          <div className="disease-detail-lifestyle-bar" />
          <img
            src={lifestyleTick}
            alt=""
            className="disease-detail-lifestyle-knob"
            style={{ left: `${animatedLifestyleLeftPercent}%` }}
            aria-hidden="true"
          />
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
            <button
              type="button"
              className="disease-detail-info-trigger"
              onClick={() => setActiveInfoPopup('rank')}
              aria-label="Open health rank info"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M5.5 8.5H6.5V5.5H5.5V8.5ZM6 4.5C6.14167 4.5 6.2605 4.452 6.3565 4.356C6.4525 4.26 6.50033 4.14133 6.5 4C6.49967 3.85867 6.45167 3.74 6.356 3.644C6.26033 3.548 6.14167 3.5 6 3.5C5.85833 3.5 5.73967 3.548 5.644 3.644C5.54833 3.74 5.50033 3.85867 5.5 4C5.49967 4.14133 5.54767 4.26017 5.644 4.3565C5.74033 4.45283 5.859 4.50067 6 4.5ZM6 11C5.30833 11 4.65833 10.8687 4.05 10.606C3.44167 10.3433 2.9125 9.98717 2.4625 9.5375C2.0125 9.08783 1.65633 8.55867 1.394 7.95C1.13167 7.34133 1.00033 6.69133 1 6C0.999667 5.30867 1.131 4.65867 1.394 4.05C1.657 3.44133 2.01317 2.91217 2.4625 2.4625C2.91183 2.01283 3.441 1.65667 4.05 1.394C4.659 1.13133 5.309 1 6 1C6.691 1 7.341 1.13133 7.95 1.394C8.559 1.65667 9.08817 2.01283 9.5375 2.4625C9.98683 2.91217 10.3432 3.44133 10.6065 4.05C10.8698 4.65867 11.001 5.30867 11 6C10.999 6.69133 10.8677 7.34133 10.606 7.95C10.3443 8.55867 9.98817 9.08783 9.5375 9.5375C9.08683 9.98717 8.55767 10.3435 7.95 10.6065C7.34233 10.8695 6.69233 11.0007 6 11ZM6 10C7.11667 10 8.0625 9.6125 8.8375 8.8375C9.6125 8.0625 10 7.11667 10 6C10 4.88333 9.6125 3.9375 8.8375 3.1625C8.0625 2.3875 7.11667 2 6 2C4.88333 2 3.9375 2.3875 3.1625 3.1625C2.3875 3.9375 2 4.88333 2 6C2 7.11667 2.3875 8.0625 3.1625 8.8375C3.9375 9.6125 4.88333 10 6 10Z" fill="#C4C4C4"/>
              </svg>
            </button>
          </div>
          <button
            type="button"
            className="disease-detail-health-rank-rank disease-detail-tap-value"
            onClick={() => setActiveInfoPopup('rank')}
          >
            {healthRankLabel}
          </button>
        </div>

        <div className="disease-detail-health-rank-score-row">
          <span className="disease-detail-health-rank-score-value" style={{ color: healthRankDisplayColor }}>{healthRankScoreLabel}</span>
          <span className="disease-detail-health-rank-score-max">/100</span>
        </div>
      </section>

      <section className="disease-detail-description-section">
        <button
          type="button"
          className={`disease-detail-description${isDescriptionExpanded ? ' disease-detail-description--expanded' : ''}`}
          onClick={() => setIsDescriptionExpanded((prev) => !prev)}
          aria-expanded={isDescriptionExpanded}
          aria-label={isDescriptionExpanded ? 'Collapse description' : 'Expand description'}
        >
          <span ref={descriptionRef} className="disease-detail-description__text">
            {isDescriptionExpanded || !collapsedPreview ? (
              detailTopLine
            ) : (
              <>
                {collapsedPreview}
                <span className="disease-detail-description-dots">{' ...'}</span>
              </>
            )}
          </span>
        </button>
      </section>

      <TrendsChart
        className="disease-detail-trends-section"
        variant="disease"
        diseaseCode={diseaseCode}
      />

      <section className="disease-detail-info-section">
        {[
          { key: 'causes', label: 'Causes', items: causes, accentClass: 'disease-detail-pill-accent--causes' },
          { key: 'effects', label: 'Effects', items: effects, accentClass: 'disease-detail-pill-accent--effects' },
          { key: 'insights', label: 'Actionable Insights', items: actionableInsights, accentClass: 'disease-detail-pill-accent--insights' }
        ].map(({ key, label, items, accentClass }) => (
          <button
            key={key}
            type="button"
            className="disease-detail-pill"
            onClick={() => setExpandedPill(expandedPill === key ? null : key)}
            aria-expanded={expandedPill === key}
          >
            <div className="disease-detail-pill-header">
              <span className={`disease-detail-pill-accent ${accentClass}`} />
              <span className="disease-detail-pill-title">{label}</span>
              <svg
                className={`disease-detail-pill-chevron${expandedPill === key ? ' disease-detail-pill-chevron--open' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path d="M5 7.5L10 12.5L15 7.5" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {expandedPill === key && (
              <p className="disease-detail-pill-body">
                {formatApiContentDisplay(items)}
              </p>
            )}
          </button>
        ))}

      </section>
      </div>

      {popupData ? (
        <div className="disease-detail-info-overlay" onClick={() => setActiveInfoPopup(null)}>
          <div className="disease-detail-info-card" onClick={(event) => event.stopPropagation()}>
            <div className="disease-detail-info-icon-box" aria-hidden="true">
              <popupData.Icon />
            </div>
            <p className="disease-detail-info-popup-title">{popupData.title}</p>
            <p className="disease-detail-info-popup-text">{popupData.description}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DiseaseDetailPage;