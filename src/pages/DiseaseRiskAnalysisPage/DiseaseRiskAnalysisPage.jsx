import React, { useRef, useEffect, useState } from 'react';
import './DiseaseRiskAnalysisPage.css';

// Import disease icons
import ObesityIcon from '../../images/Obesity.png';
import ThyroidHealthIcon from '../../images/ThyroidHealth.png';
import NAFLDIcon from '../../images/NAFLD.png';
import Type2Icon from '../../images/Type2.png';
import PCOSIcon from '../../images/PCOS.png';
import HyperTensionIcon from '../../images/HyperTension.png';
import MetabolicIcon from '../../images/Metabolic.png';
import CardiacHealthIcon from '../../images/Cardiac Health.png';
import DyslipidemiaIcon from '../../images/Dyslipidemia.png';
import OxidativeIcon from '../../images/Oxidative.png';

// Import ellipses
import E1 from '../../images/E1.png';
import E2 from '../../images/E2.png';
import E3 from '../../images/E3.png';
import E4 from '../../images/E4.png';
import E5 from '../../images/E5.png';

const DISEASES_DATA = [
  { id: 1, name: 'Obesity', icon: ObesityIcon, score: 55 },
  { id: 2, name: 'Oxidative Stress', icon: OxidativeIcon, score: 85 },
  { id: 3, name: 'Metabolic\nSyndrome', icon: MetabolicIcon, score: 78 },
  { id: 4, name: 'Hypertension', icon: HyperTensionIcon, score: 45 },
  { id: 5, name: 'PCOS/PCOD', icon: PCOSIcon, score: 30 },
  { id: 6, name: 'Type 2 Diabetes', icon: Type2Icon, score: 24 },
  { id: 7, name: 'Dyslipidemia', icon: DyslipidemiaIcon, score: 55 },
  { id: 8, name: 'Cardiac Health', icon: CardiacHealthIcon, score: 65 },
  { id: 9, name: 'NAFLD', icon: NAFLDIcon, score: 38 },
  { id: 10, name: 'Thyroid Health', icon: ThyroidHealthIcon, score: 20 }
];

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

  // Get risk color based on score
  const getRiskColor = (score) => {
    if (score <= 25) return '#90DF9E'; // Green - Healthy
    if (score <= 50) return '#FFB800'; // Yellow - Increased Risk
    if (score <= 75) return '#FF8C42'; // Orange - High Risk
    return '#FF4444'; // Red - Very High Risk
  };

  // Calculate position on ellipse with custom radii for each direction
  const getPosition = (index, radii, centerX, centerY, rotationOffset) => {
    const { top, right, bottom, left } = radii;
    const totalDiseases = DISEASES_DATA.length;
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

    return DISEASES_DATA.map((disease, index) => {
      const position = getPosition(index, radii, centerX, centerY, rotationRef.current);
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

  // Calculate average metabolic score (for center display)
  const metabolicScore = Math.round(
    DISEASES_DATA.reduce((sum, disease) => sum + disease.score, 0) / DISEASES_DATA.length
  );

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
            <span className="score-number" style={{ color: getRiskColor(metabolicScore) }}>
              {metabolicScore}
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
