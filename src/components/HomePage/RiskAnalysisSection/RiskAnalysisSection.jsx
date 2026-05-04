import React, { useEffect, useMemo, useRef, useState } from 'react';
import './RiskAnalysisSection.css';
import { fetchLatestAssessmentReport } from '../../../services/reportService';
import ObesityIcon from '../../../images/Obesity-RA.svg';
import ThyroidHealthIcon from '../../../images/Thyroid-RA.svg';
import NAFLDIcon from '../../../images/NAFLD-RA.svg';
import Type2Icon from '../../../images/Type2-RA.svg';
import PCOSIcon from '../../../images/PCOS-RA.svg';
import HyperTensionIcon from '../../../images/Hypertension-RA.svg';
import MetabolicIcon from '../../../images/Metabolic-RA.svg';
import CardiacHealthIcon from '../../../images/Cardiac-RA.svg';
import DyslipidemiaIcon from '../../../images/Dyslipidemia-RA.svg';
import OxidativeIcon from '../../../images/Oxidative-RA.svg';
import HealthRankSpark from '../../../images/HealthRankSpark.svg';

const PositiveWinsHeaderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none" aria-hidden="true">
    <path d="M4.5 3.5V14.5C4.5 15.0304 4.71071 15.5391 5.08579 15.9142C5.46086 16.2893 5.96957 16.5 6.5 16.5H17.5" stroke="#E95D5C" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.5 12.5L9.5 9.5L11.5 11.5L16.5 6.5" stroke="#E95D5C" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.5 9.5V6.5H13.5" stroke="#E95D5C" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SwipeArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 11.3334L7.33333 8.00008L4 4.66675M8.66667 11.3334L12 8.00008L8.66667 4.66675" stroke="#9A9A9A" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MarkerTrendIcon = ({ color = '#EF4444' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <g clipPath="url(#clip0_2394_17328)">
      <path d="M11.787 3.65514L12.9743 4.78469L8.99102 8.57417L6.30999 6.02356C6.00359 5.69562 5.46738 5.69562 5.16098 6.02356L0.258528 10.6875C-0.0861759 10.979 -0.0861759 11.4891 0.258528 11.7806C0.564931 12.0721 1.10114 12.0721 1.40754 11.7806L5.73549 7.66324L8.41652 10.2138C8.72292 10.5418 9.25913 10.5418 9.56553 10.2138L14.1233 5.87781L15.3106 7.00736C15.5787 7.22599 16 7.08024 16 6.71587V3.40008C16 3.18145 15.8468 2.99927 15.617 2.99927H12.0934C11.7487 2.99927 11.5572 3.43651 11.787 3.65514Z" fill={color}/>
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

const toClampedPercentile = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round(numeric)));
};

const defaultCards = DISEASES_DATA
  .slice()
  .sort((a, b) => b.score - a.score)
  .slice(0, 3)
  .map((disease) => ({
    ...disease,
    code: normalizeDiseaseKey(disease.name).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''),
    action: TOP_LINE_BY_DISEASE[normalizeDiseaseKey(disease.name)] || TOP_LINE_BY_DISEASE['oxidative stress'],
    healthRankLabel: '-',
  }));

const DISEASE_ICON_BY_CODE = {
  obesity: ObesityIcon,
  oxidative_stress: OxidativeIcon,
  metabolic_syndrome: MetabolicIcon,
  hypertension: HyperTensionIcon,
  pcos_pcod: PCOSIcon,
  diabetes: Type2Icon,
  type_2_diabetes: Type2Icon,
  dyslipidemia: DyslipidemiaIcon,
  cardiac_health: CardiacHealthIcon,
  nafld: NAFLDIcon,
  thyroid_health: ThyroidHealthIcon,
};

const normalizeCodeFromName = (name = '') => normalizeDiseaseKey(name)
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '');

const toRiskAnalysisCardsFromApi = (riskAnalysis) => {
  const rows = Array.isArray(riskAnalysis) ? riskAnalysis : [];

  const mapped = rows.map((item, index) => {
    const code = String(item?.code || '').trim().toLowerCase() || normalizeCodeFromName(item?.name);
    const name = String(item?.name || '').trim() || '-';
    const scoreNumeric = Number(item?.risk_score_scaled);
    const hasScore = Number.isFinite(scoreNumeric);
    const score = hasScore ? Math.max(0, Math.min(100, Math.round(scoreNumeric))) : 0;
    // Disease detail screen computes health rank from disease_percentile.
    const percentile = toClampedPercentile(item?.disease_percentile ?? item?.healthy_percentile);
    const hasHealthRank = percentile !== null;
    const keyFromName = normalizeDiseaseKey(name);

    return {
      id: `api-risk-${index}-${code || 'row'}`,
      code,
      name,
      icon: DISEASE_ICON_BY_CODE[code] || MetabolicIcon,
      score,
      scoreDisplay: hasScore ? String(score) : '-',
      action: TOP_LINE_BY_DISEASE[keyFromName] || '-',
      healthRankLabel: hasHealthRank ? `${percentile}th` : '-',
      isPlaceholder: false,
    };
  });

  if (mapped.length > 0) {
    return mapped.slice(0, 3);
  }

  return [
    {
      id: 'api-risk-placeholder',
      code: '',
      name: '-',
      icon: MetabolicIcon,
      score: 0,
      scoreDisplay: '-',
      action: '-',
      healthRankLabel: '-',
      isPlaceholder: true,
    },
  ];
};

const BLOOD_MARKER_RISK_PRIORITY = {
  'high risk': 0,
  'critical': 0,
  high: 0,
  'low risk': 1,
  'marginal': 1,
  low: 1,
  optimal: 2,
};

const getBloodMarkerRiskPriority = (risk = '') => {
  const key = String(risk).trim().toLowerCase();
  return BLOOD_MARKER_RISK_PRIORITY[key] ?? Number.MAX_SAFE_INTEGER;
};

const BLOOD_MARKER_COLOR_BY_RISK = {
  high: '#EF4444',
  low: '#DAC15A',
  optimal: '#4ADE80',
};

const extractArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  return [];
};

const getRiskTypeFromBounds = (value, lowerRange, upperRange) => {
  const numericValue = Number(value);
  const lower = Number(lowerRange);
  const upper = Number(upperRange);

  if (!Number.isFinite(numericValue) || !Number.isFinite(lower) || !Number.isFinite(upper)) {
    return 'optimal';
  }

  if (numericValue >= lower && numericValue <= upper) {
    return 'optimal';
  }

  const isBelowRange = numericValue < lower;
  const boundary = isBelowRange ? lower : upper;
  const deviation = isBelowRange ? (lower - numericValue) : (numericValue - upper);
  const deviationPercent = (deviation / Math.max(Math.abs(boundary), 1e-6)) * 100;

  if (deviationPercent <= 15) {
    return 'low';
  }

  return 'high';
};

const formatValue = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value ?? '--');
  return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(2).replace(/\.00$/, '');
};

const toDiseaseName = (groupName = '') => {
  const raw = String(groupName).trim();
  return raw.replace(/\s*profile\s*$/i, '').trim() || 'General';
};

const toRiskLabel = (riskKey) => {
  if (riskKey === 'high') return 'High Risk';
  if (riskKey === 'low') return 'Low Risk';
  return 'Optimal';
};

const buildBloodMarkersFromGroups = (groups) => {
  const rows = [];

  (Array.isArray(groups) ? groups : []).forEach((group, groupIndex) => {
    const disease = toDiseaseName(group?.group_name);
    const tests = Array.isArray(group?.tests) ? group.tests : [];

    tests.forEach((test, testIndex) => {
      if (test?.value === null || test?.value === undefined) {
        return;
      }

      const value = Number(test?.value);
      const lower = Number(test?.lower_range);
      const upper = Number(test?.higher_range);
      const hasClassifiableData = Number.isFinite(value) && Number.isFinite(lower) && Number.isFinite(upper);

      // Homepage list should only show actual report parameters with usable ranges.
      if (!hasClassifiableData) {
        return;
      }

      const unit = String(test?.unit || '').trim();
      const riskKey = getRiskTypeFromBounds(value, lower, upper);

      rows.push({
        id: `api-bm-${groupIndex}-${testIndex}`,
        name: String(test?.test_name || 'Test'),
        value: `${formatValue(value)}${unit ? ` ${unit}` : ''}`,
        profile: String(group?.group_name || 'Blood Marker'),
        disease,
        risk: toRiskLabel(riskKey),
        riskKey,
      });
    });
  });

  return rows;
};

export const buildHomeBloodMarkersFromBloodParametersResponse = (response) => (
  buildBloodMarkersFromGroups(extractArray(response))
);

const setStackDraggingAttr = (stackEl, isDragging) => {
  if (!stackEl) return;
  if (isDragging) {
    stackEl.setAttribute('data-dragging', 'true');
  } else {
    stackEl.removeAttribute('data-dragging');
  }
};

const orderByHierarchy = (markers) => {
  const source = Array.isArray(markers) ? markers : [];
  const high = source.filter((item) => item.riskKey === 'high');
  const low = source.filter((item) => item.riskKey === 'low');
  const optimal = source.filter((item) => item.riskKey === 'optimal');

  if (high.length === 0 && low.length === 0) {
    return optimal;
  }

  return [...high, ...low, ...optimal];
};

const GaugeDial = React.memo(function GaugeDial({ score, scoreDisplay }) {
  const safeScore = Math.max(0, Math.min(100, score ?? 0));
  const pathD = 'M4 40 A36 36 0 0 1 76 40';
  const approxLength = 113.1;
  const dashOffset = approxLength * (1 - safeScore / 100);

  return (
    <div className="risk-analysis-wins__dial-wrap" aria-label={`Risk score ${safeScore} out of 100`}>
      <svg className="risk-analysis-wins__dial-dots" xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
        <path d="M0.707031 35.7063C0.707031 55.0233 16.39 70.7063 35.707 70.7063C55.0241 70.7063 70.707 55.0233 70.707 35.7063C70.707 16.3893 55.0241 0.706299 35.707 0.706299C16.39 0.706299 0.707031 16.3893 0.707031 35.7063Z" stroke="url(#paint0_linear_1860_15381)" strokeOpacity="0.2" strokeWidth="1.4125" strokeDasharray="1.88 3.77"/>
        <defs>
          <linearGradient id="paint0_linear_1860_15381" x1="35.707" y1="0.706299" x2="35.707" y2="70.7063" gradientUnits="userSpaceOnUse">
            <stop stopColor="white"/>
            <stop offset="0.554351" stopColor="white" stopOpacity="0"/>
          </linearGradient>
        </defs>
      </svg>
      <svg className="risk-analysis-wins__dial" width="80" height="44" viewBox="0 0 80 44" fill="none" aria-hidden="true">
        <path d={pathD} className="risk-analysis-wins__dial-track" />
        <path
          d={pathD}
          className="risk-analysis-wins__dial-progress"
          style={{ strokeDasharray: approxLength, strokeDashoffset: dashOffset }}
        />
      </svg>
      <div className="risk-analysis-wins__dial-score">
        <span className="risk-analysis-wins__dial-score-value">{scoreDisplay ?? safeScore}</span>
        <span className="risk-analysis-wins__dial-score-max">/100</span>
      </div>
    </div>
  );
});

const RiskAnalysisSection = ({
  cards = defaultCards,
  apiRiskAnalysis,
  onDiseaseSelect,
  onSeeMore,
  onBloodMarkersSeeMore,
  prefetchedHomeBloodMarkers,
}) => {
  const stackCards = useMemo(() => {
    const raw = apiRiskAnalysis !== undefined
      ? toRiskAnalysisCardsFromApi(apiRiskAnalysis)
      : (Array.isArray(cards) ? cards : defaultCards).slice(0, 3);

    return raw.map((card, index) => ({
      ...card,
      id: card.id != null ? String(card.id) : `risk-slot-${index}`,
    }));
  }, [apiRiskAnalysis, cards]);
  const [apiBloodMarkers, setApiBloodMarkers] = useState([]);
  const bloodMarkers = useMemo(() => {
    const normalized = apiBloodMarkers.map((item) => {
      const normalizedRiskKey = item.riskKey
        || (getBloodMarkerRiskPriority(item.risk) === 0 ? 'high' : getBloodMarkerRiskPriority(item.risk) === 1 ? 'low' : 'optimal');

      return {
        ...item,
        riskKey: normalizedRiskKey,
      };
    });

    return orderByHierarchy(normalized).slice(0, 3);
  }, [apiBloodMarkers]);
  const cardCount = stackCards.length;
  const [activeIndex, setActiveIndex] = useState(Math.max(cardCount - 1, 0));
  const [swipeDirection, setSwipeDirection] = useState('next');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const stackRef = useRef(null);
  const touchStartXRef = useRef(null);
  const touchStartYRef = useRef(null);
  const isHorizontalSwipeRef = useRef(false);
  const pointerStartXRef = useRef(null);
  const pointerStartYRef = useRef(null);
  const pointerIsHorizontalSwipeRef = useRef(false);
  const activePointerIdRef = useRef(null);
  const pendingDragXRef = useRef(0);
  const dragFrameRef = useRef(null);
  const didMoveRef = useRef(false);
  /** True after startAnimation until we settle once (left and/or transform both fire on the front card). */
  const stackSwapAwaitingSettleRef = useRef(false);

  const commitDragOffset = (value) => {
    if (stackRef.current) {
      stackRef.current.style.setProperty('--risk-analysis-wins-drag-x', `${value}px`);
    }
  };

  const resetDragOffset = () => {
    pendingDragXRef.current = 0;
    if (dragFrameRef.current !== null) {
      cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }
    commitDragOffset(0);
  };

  const applyDragOffset = (value) => {
    pendingDragXRef.current = value;
    if (dragFrameRef.current !== null) {
      return;
    }

    dragFrameRef.current = requestAnimationFrame(() => {
      dragFrameRef.current = null;
      commitDragOffset(pendingDragXRef.current);
    });
  };

  useEffect(() => {
    const stackEl = stackRef.current;
    return () => {
      if (dragFrameRef.current !== null) {
        cancelAnimationFrame(dragFrameRef.current);
      }
      stackSwapAwaitingSettleRef.current = false;
      setStackDraggingAttr(stackEl, false);
    };
  }, []);

  useEffect(() => {
    setActiveIndex((prev) => Math.min(prev, Math.max(cardCount - 1, 0)));
  }, [cardCount]);

  const startAnimation = (direction) => {
    if (cardCount <= 1) return;
    stackSwapAwaitingSettleRef.current = true;
    setStackDraggingAttr(stackRef.current, false);
    resetDragOffset();
    setSwipeDirection(direction);
    setIsAnimating(true);
  };

  const goPrev = () => {
    if (isAnimating || cardCount <= 1) return;
    startAnimation('prev');
  };

  const goNext = () => {
    if (isAnimating || cardCount <= 1) return;
    startAnimation('next');
  };

  const handleTouchStart = (event) => {
    if (isAnimating) {
      return;
    }

    touchStartXRef.current = event.touches[0].clientX;
    touchStartYRef.current = event.touches[0].clientY;
    isHorizontalSwipeRef.current = false;
    didMoveRef.current = false;
    setStackDraggingAttr(stackRef.current, false);
    resetDragOffset();
  };

  const handleTouchMove = (event) => {
    if (touchStartXRef.current == null || touchStartYRef.current == null || isAnimating) {
      return;
    }

    const deltaX = event.touches[0].clientX - touchStartXRef.current;
    const deltaY = event.touches[0].clientY - touchStartYRef.current;

    if (!isHorizontalSwipeRef.current) {
      const hasEnoughMovement = Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6;
      if (!hasEnoughMovement) {
        return;
      }

      isHorizontalSwipeRef.current = Math.abs(deltaX) > Math.abs(deltaY);
      if (!isHorizontalSwipeRef.current) {
        return;
      }

      setStackDraggingAttr(stackRef.current, true);
    }

    didMoveRef.current = true;
    event.preventDefault();

    const stackWidth = stackRef.current?.clientWidth || 260;
    const softLimit = Math.max(120, stackWidth * 0.55);
    const absDelta = Math.abs(deltaX);
    const direction = deltaX < 0 ? -1 : 1;

    // Apply soft resistance after the primary drag range to avoid abrupt edge sticking.
    const dragValue = absDelta <= softLimit
      ? deltaX
      : direction * (softLimit + (absDelta - softLimit) * 0.18);

    applyDragOffset(dragValue);
  };

  const handleTouchEnd = (event) => {
    if (touchStartXRef.current == null) {
      return;
    }

    if (!isHorizontalSwipeRef.current) {
      touchStartXRef.current = null;
      touchStartYRef.current = null;
      setStackDraggingAttr(stackRef.current, false);
      resetDragOffset();
      didMoveRef.current = false;
      return;
    }

    const stackWidth = stackRef.current?.clientWidth || 260;
    const swipeThreshold = Math.max(30, stackWidth * 0.14);
    const deltaX = event.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(deltaX) > swipeThreshold) {
      if (deltaX < 0) {
        goNext();
      } else {
        goPrev();
      }
    } else {
      setStackDraggingAttr(stackRef.current, false);
      resetDragOffset();
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
    isHorizontalSwipeRef.current = false;
    didMoveRef.current = false;
  };

  const handleTouchCancel = () => {
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    isHorizontalSwipeRef.current = false;
    setStackDraggingAttr(stackRef.current, false);
    resetDragOffset();
    didMoveRef.current = false;
  };

  const handlePointerDown = (event) => {
    if (isAnimating) {
      return;
    }

    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    pointerStartXRef.current = event.clientX;
    pointerStartYRef.current = event.clientY;
    pointerIsHorizontalSwipeRef.current = false;
    activePointerIdRef.current = event.pointerId;
    didMoveRef.current = false;
    setStackDraggingAttr(stackRef.current, false);
    resetDragOffset();

    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (
      pointerStartXRef.current == null
      || pointerStartYRef.current == null
      || activePointerIdRef.current !== event.pointerId
      || isAnimating
    ) {
      return;
    }

    const deltaX = event.clientX - pointerStartXRef.current;
    const deltaY = event.clientY - pointerStartYRef.current;

    if (!pointerIsHorizontalSwipeRef.current) {
      const hasEnoughMovement = Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6;
      if (!hasEnoughMovement) {
        return;
      }

      pointerIsHorizontalSwipeRef.current = Math.abs(deltaX) > Math.abs(deltaY);
      if (!pointerIsHorizontalSwipeRef.current) {
        return;
      }

      setStackDraggingAttr(stackRef.current, true);
    }

    didMoveRef.current = true;
    event.preventDefault();

    const stackWidth = stackRef.current?.clientWidth || 260;
    const softLimit = Math.max(120, stackWidth * 0.55);
    const absDelta = Math.abs(deltaX);
    const direction = deltaX < 0 ? -1 : 1;
    const dragValue = absDelta <= softLimit
      ? deltaX
      : direction * (softLimit + (absDelta - softLimit) * 0.18);

    applyDragOffset(dragValue);
  };

  const finishPointerDrag = (event) => {
    if (pointerStartXRef.current == null || activePointerIdRef.current !== event.pointerId) {
      return;
    }

    if (!pointerIsHorizontalSwipeRef.current) {
      pointerStartXRef.current = null;
      pointerStartYRef.current = null;
      pointerIsHorizontalSwipeRef.current = false;
      activePointerIdRef.current = null;
      setStackDraggingAttr(stackRef.current, false);
      resetDragOffset();
      didMoveRef.current = false;
      return;
    }

    const stackWidth = stackRef.current?.clientWidth || 260;
    const swipeThreshold = Math.max(30, stackWidth * 0.14);
    const deltaX = event.clientX - pointerStartXRef.current;

    if (Math.abs(deltaX) > swipeThreshold) {
      if (deltaX < 0) {
        goNext();
      } else {
        goPrev();
      }
    } else {
      setStackDraggingAttr(stackRef.current, false);
      resetDragOffset();
    }

    pointerStartXRef.current = null;
    pointerStartYRef.current = null;
    pointerIsHorizontalSwipeRef.current = false;
    activePointerIdRef.current = null;
    didMoveRef.current = false;

    if (event.currentTarget?.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handlePointerCancel = (event) => {
    if (activePointerIdRef.current !== event.pointerId) {
      return;
    }

    pointerStartXRef.current = null;
    pointerStartYRef.current = null;
    pointerIsHorizontalSwipeRef.current = false;
    activePointerIdRef.current = null;
    setStackDraggingAttr(stackRef.current, false);
    resetDragOffset();
    didMoveRef.current = false;

    if (event.currentTarget?.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleStackTransitionEnd = (event) => {
    if (!stackSwapAwaitingSettleRef.current) return;
    if (!event.target.classList.contains('risk-analysis-wins__stack-card--front')) return;
    if (event.propertyName !== 'left' && event.propertyName !== 'transform') return;

    stackSwapAwaitingSettleRef.current = false;

    setIsResetting(true);
    setActiveIndex((prev) => (prev + 1) % cardCount);
    setIsAnimating(false);
    resetDragOffset();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsResetting(false);
      });
    });
  };

  const handleCardClick = (card) => {
    if (didMoveRef.current) {
      return;
    }

    if (card?.isPlaceholder) {
      return;
    }

    if (onDiseaseSelect) {
      onDiseaseSelect(card);
    }
  };

  useEffect(() => {
    if (prefetchedHomeBloodMarkers == null) {
      return;
    }
    setApiBloodMarkers(Array.isArray(prefetchedHomeBloodMarkers) ? prefetchedHomeBloodMarkers : []);
  }, [prefetchedHomeBloodMarkers]);

  useEffect(() => {
    if (prefetchedHomeBloodMarkers != null) {
      return undefined;
    }

    let isActive = true;

    const loadHomepageBloodMarkers = async () => {
      try {
        const { response } = await fetchLatestAssessmentReport(
          (assessmentId) => `/reports/${assessmentId}/blood-parameters`,
        );
        const groups = extractArray(response);

        if (isActive) {
          setApiBloodMarkers(buildBloodMarkersFromGroups(groups));
        }
      } catch (error) {
        console.error('Failed to load homepage blood markers:', error);
        if (isActive) {
          setApiBloodMarkers([]);
        }
      }
    };

    void loadHomepageBloodMarkers();

    return () => {
      isActive = false;
    };
  }, [prefetchedHomeBloodMarkers]);

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
          data-tour="home-risk-see-more"
        >
          See more
        </button>
      </div>

      <div
        ref={stackRef}
        className={`risk-analysis-wins__stack${isAnimating ? ` risk-analysis-wins__stack--moving-${swipeDirection}` : ''}`}
        style={cardCount === 2 ? {
          '--risk-analysis-wins-back-two-left': 'var(--risk-analysis-wins-back-one-left)',
          '--risk-analysis-wins-back-two-top': 'var(--risk-analysis-wins-back-one-top)',
          '--risk-analysis-wins-back-two-fade': 'var(--risk-analysis-wins-back-one-fade)',
        } : undefined}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointerDrag}
        onPointerCancel={handlePointerCancel}
        onLostPointerCapture={handlePointerCancel}
        onTransitionEnd={handleStackTransitionEnd}
        data-resetting={isResetting ? 'true' : 'false'}
        data-card-count={cardCount}
      >
        {stackCards.map((card, index) => {
          const CardIcon = card.icon;
          const distance = (index - activeIndex + cardCount) % cardCount;
          const role = distance === 0
            ? 'front'
            : distance === 1
              ? 'back-one'
              : distance === 2
                ? 'back-two'
                : 'hidden';

          return (
            <article
              key={card.id}
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
                    <GaugeDial score={card.score} scoreDisplay={card.scoreDisplay} />
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
            data-tour="home-blood-markers-see-more"
          >
            See more
          </button>
        </div>

        <div className="risk-analysis-wins__blood-markers-list">
          {bloodMarkers.map((marker) => (
            <article className={`risk-analysis-wins__blood-marker-card risk-analysis-wins__blood-marker-card--${marker.riskKey}`} key={marker.id}>
              <div className="risk-analysis-wins__blood-marker-left">
                <div className="risk-analysis-wins__blood-marker-main-row">
                  <span className="risk-analysis-wins__blood-marker-name">{marker.name}</span>
                  <span className={`risk-analysis-wins__blood-marker-divider risk-analysis-wins__blood-marker-divider--${marker.riskKey}`} aria-hidden="true" />
                  <span className="risk-analysis-wins__blood-marker-value">{marker.value}</span>
                  <span className="risk-analysis-wins__blood-marker-trend" aria-hidden="true"><MarkerTrendIcon color={BLOOD_MARKER_COLOR_BY_RISK[marker.riskKey] || '#EF4444'} /></span>
                </div>
                <span className="risk-analysis-wins__blood-marker-profile">{marker.disease || marker.profile}</span>
              </div>

              <span className={`risk-analysis-wins__blood-marker-risk-pill risk-analysis-wins__blood-marker-risk-pill--${marker.riskKey}`}>{marker.risk}</span>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
};

export default RiskAnalysisSection;
