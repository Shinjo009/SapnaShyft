import React, { useRef, useState } from 'react';
import './AnthropometryFollowupPage.css';

const TriangleArrow = ({ direction = 'up' }) => {
  const rotation = direction === 'down' ? '90deg' : '-90deg';
  return (
    <svg style={{ transform: `rotate(${rotation})` }} xmlns="http://www.w3.org/2000/svg" width="13" height="15" viewBox="0 0 13 15" fill="none" aria-hidden="true">
      <path d="M12.2341 8.12403C12.8956 7.73815 12.8956 6.78235 12.2341 6.39647L1.50443 0.137513C0.837772 -0.251371 0.000557121 0.229501 0.000557112 1.00129L0.000556966 13.5192C0.000556957 14.291 0.837771 14.7719 1.50443 14.383L12.2341 8.12403Z" fill="#CC203B"/>
    </svg>
  );
};

const AnthropometryFollowupPage = ({ onBack, onDone }) => {
  const [hipSize, setHipSize] = useState(33);
  const [bodyFat, setBodyFat] = useState(45);
  const touchStartRef = useRef(null);

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const handleWheelAdjust = (e, setter, min, max) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;
    setter((prev) => clamp(prev + delta, min, max));
  };

  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientY;
  };

  const handleTouchEndAdjust = (e, setter, min, max) => {
    if (touchStartRef.current == null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current;
    if (Math.abs(deltaY) > 18) {
      setter((prev) => clamp(prev + (deltaY < 0 ? 1 : -1), min, max));
    }
    touchStartRef.current = null;
  };

  return (
    <div className="anthropometry-followup-page">
      <div className="anthropometry-followup-page__header">
        <button className="anthropometry-followup-page__back" type="button" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="anthropometry-followup-page__title">Anthropometry</h1>
        <div className="anthropometry-followup-page__header-spacer" aria-hidden="true" />
      </div>

      <p className="anthropometry-followup-page__subtitle">
        Your measurements power our AI to generate accurate metabolic and wellness scores.
      </p>

      <p className="anthropometry-followup-page__question anthropometry-followup-page__question--hip">What is you hip size ?</p>
      <div
        className="anthropometry-followup-page__box anthropometry-followup-page__hip-box"
        onWheel={(e) => handleWheelAdjust(e, setHipSize, 20, 60)}
        onTouchStart={handleTouchStart}
        onTouchEnd={(e) => handleTouchEndAdjust(e, setHipSize, 20, 60)}
      >
        <div className="anthropometry-followup-page__unit">In <span>▼</span></div>
        <div className="anthropometry-followup-page__arrow-vertical anthropometry-followup-page__arrow-vertical--top"><TriangleArrow direction="down" /></div>
        <div className="anthropometry-followup-page__hip-row">
          <span className="anthropometry-followup-page__faded">{hipSize - 2}</span>
          <span className="anthropometry-followup-page__faded">{hipSize - 1}</span>
          <div className="anthropometry-followup-page__selected-box">
            <span className="anthropometry-followup-page__selected-value">{hipSize}</span>
          </div>
          <span className="anthropometry-followup-page__faded">{hipSize + 1}</span>
          <span className="anthropometry-followup-page__faded">{hipSize + 2}</span>
        </div>
        <div className="anthropometry-followup-page__arrow-below"><TriangleArrow direction="up" /></div>
      </div>

      <p className="anthropometry-followup-page__question anthropometry-followup-page__question--fat">What is you body-fat percent ?</p>
      <div className="anthropometry-followup-page__box anthropometry-followup-page__fat-box">
        <div className="anthropometry-followup-page__fat-value">{bodyFat}%</div>
        <input
          className="anthropometry-followup-page__fat-slider"
          type="range"
          min="5"
          max="70"
          value={bodyFat}
          onChange={(e) => setBodyFat(Number(e.target.value))}
          style={{ '--val': bodyFat }}
          aria-label="Body fat percentage"
        />
      </div>

      <button type="button" className="anthropometry-followup-page__skip" onClick={onDone}>Skip</button>
      <button type="button" className="anthropometry-followup-page__done" onClick={onDone}>Done</button>
    </div>
  );
};

export default AnthropometryFollowupPage;
