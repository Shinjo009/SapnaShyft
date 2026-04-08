import React, { useRef, useEffect, useState } from 'react';
import './DiseaseRiskAnalysisPage.css';
import { fetchLatestAssessmentReport } from '../../services/reportService';

// Import disease icons
import ObesityIcon from '../../images/Obesity-RA.svg';
import ThyroidHealthIcon from '../../images/Thyroid-RA.svg';
import NAFLDIcon from '../../images/NAFLD-RA.svg';
import Type2Icon from '../../images/Type2-RA.svg';
import PCOSIcon from '../../images/PCOS-RA.svg';
import HyperTensionIcon from '../../images/Hypertension-RA.svg';
import MetabolicIcon from '../../images/Metabolic-RA.svg';
import CardiacHealthIcon from '../../images/Cardiac-RA.svg';
import DyslipidemiaIcon from '../../images/Dyslipidemia-RA.svg';
import OxidativeIcon from '../../images/Oxidative-RA.svg';

// Import ellipses
import E1 from '../../images/E1.png';
import E2 from '../../images/E2.svg';
import E3 from '../../images/E3.png';
import E4 from '../../images/E4.png';
import E5 from '../../images/E5.svg';

const DISEASE_ICON_BY_KEY = {
  obesity: ObesityIcon,
  'oxidative stress': OxidativeIcon,
  'metabolic syndrome': MetabolicIcon,
  hypertension: HyperTensionIcon,
  'pcos/pcod': PCOSIcon,
  pcos: PCOSIcon,
  pcod: PCOSIcon,
  'type 2 diabetes': Type2Icon,
  diabetes: Type2Icon,
  dyslipidemia: DyslipidemiaIcon,
  'cardiac health': CardiacHealthIcon,
  cardiac: CardiacHealthIcon,
  heart: CardiacHealthIcon,
  nafld: NAFLDIcon,
  'thyroid health': ThyroidHealthIcon,
  thyroid: ThyroidHealthIcon,
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

const normalizeDiseaseKey = (name = '') => String(name)
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

const normalizeDiseaseLabel = (name = '') => String(name)
  .replace(/\s+/g, ' ')
  .trim();

const toDiseaseScore = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.max(0, Math.min(100, Math.round(numeric)));
};

const getApiDiseaseScore = (item) => {
  if (item?.risk_score_scaled === null) {
    return 0;
  }

  const preferredScore = item?.risk_score_scaled;
  const fallbackScore = item?.score
    ?? item?.risk_score
    ?? item?.disease_score
    ?? item?.value
    ?? item?.percentage;

  const resolved = preferredScore ?? fallbackScore;
  return toDiseaseScore(resolved);
};

const resolveRiskPayloadRoot = (payload) => {
  if (!payload || typeof payload !== 'object') return null;
  if (payload.data && typeof payload.data === 'object') return payload.data;
  if (payload.result && typeof payload.result === 'object') return payload.result;
  if (payload.item && typeof payload.item === 'object') return payload.item;
  return payload;
};

const extractDiseaseRows = (payload) => {
  const root = resolveRiskPayloadRoot(payload);
  if (!root) return [];

  const candidates = [
    extractArray(root.diseases),
    extractArray(root.disease_scores),
    extractArray(root.risk_analysis),
    extractArray(root.scores),
    extractArray(root.conditions),
  ];

  const source = candidates.find((items) => Array.isArray(items) && items.length > 0) || [];

  const fallbackSource = source.length > 0 ? source : extractArray(payload);

  return fallbackSource
    .map((item, index) => {
      const rawName = item?.disease_name
        || item?.disease
        || item?.name
        || item?.condition
        || item?.title
        || '';
      const score = getApiDiseaseScore(item);

      const label = normalizeDiseaseLabel(rawName);
      if (!label || score === null) {
        return null;
      }

      const key = normalizeDiseaseKey(label);
      const icon = DISEASE_ICON_BY_KEY[key] || MetabolicIcon;
      const code = String(item?.code || '').trim().toLowerCase()
        || key.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

      return {
        id: Number(item?.id) || `api-${index}`,
        code,
        name: key === 'metabolic syndrome' ? 'Metabolic\nSyndrome' : label,
        icon,
        score,
      };
    })
    .filter(Boolean);
};

const extractMetabolicScore = (payload, diseaseRows) => {
  const root = resolveRiskPayloadRoot(payload);
  const directScore = toDiseaseScore(
    root?.metabolic_score
    ?? root?.metabolicScore
    ?? root?.metabolic_risk_score
    ?? root?.metabolicRiskScore
    ?? root?.overall_score
    ?? root?.overallScore
  );

  if (directScore !== null) return directScore;

  if (diseaseRows.length === 0) {
    return null;
  }

  return Math.round(
    diseaseRows.reduce((sum, disease) => sum + disease.score, 0) / diseaseRows.length
  );
};

const VISIBLE_ARC_START = Math.PI * 0.5;
const VISIBLE_ARC_END = (Math.PI * 1.5) + (Math.PI / 9); // +20deg so bottom appears clearly earlier
const TOP_FADE_ZONE = Math.PI / 15; // 12deg (reduce early fading at top)
const BOTTOM_FADE_ZONE = Math.PI / 10; // 18deg

const DiseaseRiskAnalysisPage = ({ onBack, onDiseaseSelect }) => {
  const rotationRef = useRef(0);
  const animationFrameRef = useRef(null);
  const isDraggingRef = useRef(false);
  const lastAngleRef = useRef(0);
  const autoRotateSpeedRef = useRef(0.005); // 50% faster rotation
  const [, forceUpdate] = useState({});

  // Drag state
  const dragStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const scoreCenterRef = useRef(null);
  const e1Ref = useRef(null);
  const e3Ref = useRef(null);
  const [scoreAnchor, setScoreAnchor] = useState(null);
  const [diseasesData, setDiseasesData] = useState([]);
  const [metabolicScore, setMetabolicScore] = useState(null);

  // Get risk color based on score
  const getRiskColor = (score) => {
    if (score <= 25) return '#90DF9E'; // Green - Healthy
    if (score <= 50) return '#DAC15A'; // Yellow - Increased Risk
    if (score <= 75) return '#FF8C42'; // Orange - High Risk
    return '#FF4444'; // Red - Very High Risk
  };

  // Calculate position on ellipse with custom radii for each direction
  const getPosition = (index, totalDiseases, radii, centerX, centerY, rotationOffset) => {
    const { top, right, bottom, left } = radii;
    const baseAngle = (index / totalDiseases) * 2 * Math.PI;
    const angle = baseAngle + rotationOffset;
    
    // Normalize angle to 0-2π range
    let normalizedAngle = angle % (2 * Math.PI);
    if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;
    
    // Interpolate radius based on angle
    // At 0° (right), 90° (top), 180° (left), 270° (bottom)
    const radiusX = 
      (right * (1 + Math.cos(normalizedAngle)) / 2) + 
      (left * (1 - Math.cos(normalizedAngle)) / 2);
    
    const radiusY = 
      (bottom * (1 + Math.sin(normalizedAngle)) / 2) + 
      (top * (1 - Math.sin(normalizedAngle)) / 2);
    
    return {
      x: centerX + radiusX * Math.cos(angle),
      y: centerY + radiusY * Math.sin(angle),
      angle: angle
    };
  };

  // Check if icon is in visible arc (left side of circle, roughly 90° to 270°)
  const isInVisibleArc = (angle) => {
    // Normalize angle to 0-2π range
    let normalizedAngle = angle % (2 * Math.PI);
    if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;

    return normalizedAngle >= VISIBLE_ARC_START && normalizedAngle <= VISIBLE_ARC_END;
  };

  // Get opacity for smooth fade in/out at edges
  const getOpacity = (angle) => {
    if (!isInVisibleArc(angle)) return 0;
    
    let normalizedAngle = angle % (2 * Math.PI);
    if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;
    
    // Fade at top edge (around 90°)
    if (normalizedAngle >= VISIBLE_ARC_START && normalizedAngle <= VISIBLE_ARC_START + TOP_FADE_ZONE) {
      const distanceFromEdge = normalizedAngle - VISIBLE_ARC_START;
      return distanceFromEdge / TOP_FADE_ZONE;
    }
    
    // Fade at bottom edge
    if (normalizedAngle >= VISIBLE_ARC_END - BOTTOM_FADE_ZONE && normalizedAngle <= VISIBLE_ARC_END) {
      const distanceFromEdge = VISIBLE_ARC_END - normalizedAngle;
      return distanceFromEdge / BOTTOM_FADE_ZONE;
    }
    
    return 1;
  };

  // Animation loop
  const animate = () => {
    if (!isDraggingRef.current) {
      rotationRef.current += autoRotateSpeedRef.current;
    }
    forceUpdate({});
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Handle pointer down (mouse/touch start)
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    
    dragStartRef.current = {
      x: clientX - rect.left - centerX,
      y: clientY - rect.top - centerY
    };
    
    lastAngleRef.current = Math.atan2(dragStartRef.current.y, dragStartRef.current.x);
  };

  // Handle pointer move (mouse/touch move)
  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    
    const currentX = clientX - rect.left - centerX;
    const currentY = clientY - rect.top - centerY;
    
    const currentAngle = Math.atan2(currentY, currentX);
    const deltaAngle = currentAngle - lastAngleRef.current;
    
    rotationRef.current += deltaAngle;
    lastAngleRef.current = currentAngle;
    
    forceUpdate({});
  };

  // Handle pointer up (mouse/touch end)
  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Handle disease icon click
  const handleDiseaseClick = (disease) => {
    if (onDiseaseSelect) {
      onDiseaseSelect(disease);
    }
  };

  // Setup and cleanup
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate);
    
    // Add global event listeners for drag
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadRiskAnalysis = async () => {
      try {
        const { response } = await fetchLatestAssessmentReport(
          (assessmentId) => `/reports/${assessmentId}/risk-analysis`
        );

        const apiDiseases = extractDiseaseRows(response);
        const nextMetabolicScore = extractMetabolicScore(response, apiDiseases);

        if ((apiDiseases.length > 0 || nextMetabolicScore !== null) && isActive) {
          setDiseasesData(apiDiseases);
          setMetabolicScore(nextMetabolicScore);
          return;
        }

        if (isActive) {
          setDiseasesData([]);
          setMetabolicScore(null);
        }
      } catch (error) {
        console.error('Failed to load risk analysis:', error);
        if (isActive) {
          setDiseasesData([]);
          setMetabolicScore(null);
        }
      }
    };

    loadRiskAnalysis();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const updateScoreAnchor = () => {
      const e1Rect = e1Ref.current?.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();

      if (!e1Rect || !containerRect) return;

      const nextX = e1Rect.left - containerRect.left + (e1Rect.width / 2) + 30;
      const nextY = e1Rect.top - containerRect.top + (e1Rect.height / 2);

      setScoreAnchor((prev) => {
        if (prev && Math.abs(prev.x - nextX) < 0.5 && Math.abs(prev.y - nextY) < 0.5) {
          return prev;
        }
        return { x: nextX, y: nextY };
      });
    };

    updateScoreAnchor();

    const e1Element = e1Ref.current;
    if (e1Element) {
      e1Element.addEventListener('load', updateScoreAnchor);
    }

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateScoreAnchor);
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      if (e1Element) resizeObserver.observe(e1Element);
    }

    window.addEventListener('resize', updateScoreAnchor);

    return () => {
      window.removeEventListener('resize', updateScoreAnchor);
      if (e1Element) {
        e1Element.removeEventListener('load', updateScoreAnchor);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  // Render disease icons
  const renderDiseaseIcons = () => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    const scoreRect = scoreCenterRef.current?.getBoundingClientRect();
    const e3Rect = e3Ref.current?.getBoundingClientRect();

    const containerWidth = containerRect?.width || 375;
    const containerHeight = containerRect?.height || 600;
    const scaleX = containerWidth / 375;
    const scaleY = containerHeight / 600;
    
    const centerX = scoreRect && containerRect
      ? (scoreRect.left - containerRect.left + (scoreRect.width / 2))
      : e3Rect && containerRect
        ? (e3Rect.left - containerRect.left + (e3Rect.width / 2))
        : containerWidth / 2 + (160 * scaleX);
    const centerY = scoreRect && containerRect
      ? (scoreRect.top - containerRect.top + (scoreRect.height / 2))
      : e3Rect && containerRect
        ? (e3Rect.top - containerRect.top + (e3Rect.height / 2))
        : containerHeight / 2 - (29 * scaleY);

    // Custom radii (prefer e3-derived scaling so orbit follows e3 on all screens)
    const e3ScaleX = e3Rect ? e3Rect.width / 400 : scaleX;
    const e3ScaleY = e3Rect ? e3Rect.height / 480 : scaleY;
    const radii = {
      top: 250 * e3ScaleY,
      right: 450 * e3ScaleX,
      bottom: 239 * e3ScaleY,
      left: 365  * e3ScaleX
    };

    const totalDiseases = Math.max(1, diseasesData.length);

    return diseasesData.map((disease, index) => {
      const position = getPosition(index, totalDiseases, radii, centerX, centerY, rotationRef.current);
      const opacity = getOpacity(position.angle);
      const riskColor = getRiskColor(disease.score);

      if (opacity === 0) return null;

      return (
        <div
          key={disease.id}
          className="disease-icon-container"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            opacity: opacity,
            pointerEvents: opacity > 0.5 ? 'auto' : 'none'
          }}
          data-tour="risk-disease-item"
          onClick={() => handleDiseaseClick(disease)}
        >
          <div className="disease-icon-badge" style={{ '--glow-color': riskColor }}>
            <img src={disease.icon} alt={disease.name} className="disease-icon" />
          </div>
          <div className="disease-info">
            <div className={`disease-name ${disease.id === 3 ? 'multi-line' : ''}`}>{disease.name}</div>
            <div className="disease-score">
              <span className="score-value" style={{ color: riskColor }}>
                {disease.score}
              </span>
              <span className="score-max">/100</span>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="disease-risk-analysis-page">
      {/* Background Ellipses */}
      <div className="background-ellipses">
        <img ref={e1Ref} src={E1} alt="" className="ellipse e1" />
        <img src={E2} alt="" className="ellipse e2" />
        <img ref={e3Ref} src={E3} alt="" className="ellipse e3" />
        <img src={E4} alt="" className="ellipse e4" />
        <img src={E5} alt="" className="ellipse e5" />
      </div>

      {/* Header */}
      <div className="page-header">
        {onBack && (
          <button onClick={onBack} className="back-button" aria-label="Go back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <div className="header-content">
          <h1 className="page-title">Lifestyle Disease Risk Analysis</h1>
          <p className="page-subtitle">Tap the disease to know more</p>
        </div>
        <div className="header-spacer"></div>
      </div>

      {/* Circular Carousel Container */}
      <div
        ref={containerRef}
        className="carousel-container"
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        {/* Center Metabolic Score */}
        <div
          ref={scoreCenterRef}
          className="metabolic-score-center"
          style={scoreAnchor ? { left: `${scoreAnchor.x}px`, top: `${scoreAnchor.y}px` } : undefined}
        >
          <div className="metabolic-score-value">
            <span className="score-number" style={{ color: getRiskColor(metabolicScore ?? 0) }}>
              {metabolicScore ?? '--'}
            </span>
          </div>
          <div className="score-max-large">/100</div>
        </div>

        {/* Disease Icons */}
        {renderDiseaseIcons()}
      </div>

      {/* Risk Legend */}
      <div className="health-scan-page__legend">
                <div className="health-scan-page__legend-item">
                  <span className="health-scan-page__legend-dot health-scan-page__legend-dot--healthy" />
                  <span className="health-scan-page__legend-text">
                    <span>Healthy</span>
                    <span className="health-scan-page__legend-range">(0-25)</span>
                  </span>
                </div>
                <div className="health-scan-page__legend-item">
                  <span className="health-scan-page__legend-dot health-scan-page__legend-dot--increased" />
                  <span className="health-scan-page__legend-text">
                    <span>Increased Risk</span>
                    <span className="health-scan-page__legend-range">(26-50)</span>
                  </span>
                </div>
                <div className="health-scan-page__legend-item">
                  <span className="health-scan-page__legend-dot health-scan-page__legend-dot--high" />
                  <span className="health-scan-page__legend-text">
                    <span>High Risk</span>
                    <span className="health-scan-page__legend-range">(51-75)</span>
                  </span>
                </div>
                <div className="health-scan-page__legend-item">
                  <span className="health-scan-page__legend-dot health-scan-page__legend-dot--very-high" />
                  <span className="health-scan-page__legend-text">
                    <span>Very High Risk</span>
                    <span className="health-scan-page__legend-range">(76-100)</span>
                  </span>
                </div>
              </div>
    </div>
  );
};

export default DiseaseRiskAnalysisPage;
