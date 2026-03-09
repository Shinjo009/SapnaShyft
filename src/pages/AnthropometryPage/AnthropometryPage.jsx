import React, { useRef, useState } from 'react';
import AnthInd from '../../images/Anth-Ind.svg';
import './AnthropometryPage.css';

const TriangleArrow = ({ direction = 'right' }) => {
  const rotation = direction === 'left' ? '180deg' : direction === 'up' ? '-90deg' : direction === 'down' ? '90deg' : '0deg';
  return (
    <svg style={{ transform: `rotate(${rotation})` }} xmlns="http://www.w3.org/2000/svg" width="13" height="15" viewBox="0 0 13 15" fill="none" aria-hidden="true">
      <path d="M12.2341 8.12403C12.8956 7.73815 12.8956 6.78235 12.2341 6.39647L1.50443 0.137513C0.837772 -0.251371 0.000557121 0.229501 0.000557112 1.00129L0.000556966 13.5192C0.000556957 14.291 0.837771 14.7719 1.50443 14.383L12.2341 8.12403Z" fill="#CC203B"/>
    </svg>
  );
};

const DialIndicator = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="25" viewBox="0 0 36 25" fill="none" aria-hidden="true">
    <path d="M19.7802 0L22.9881 23H36H0H16.1292L19.7802 0Z" fill="#CC203B"/>
    <circle cx="19.5" cy="19.5" r="5.5" fill="#CC203B"/>
  </svg>
);

const AnthropometryPage = ({ onBack, onContinue }) => {
  const [height, setHeight] = useState(172);
  const [weight, setWeight] = useState(55);
  const [waist, setWaist] = useState(33);

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
    <div className="anthropometry-page">
      <div className="anthropometry-page__header">
        <button className="anthropometry-page__back" type="button" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="anthropometry-page__title">Anthropometry</h1>
        <div className="anthropometry-page__header-spacer" aria-hidden="true" />
      </div>

      <p className="anthropometry-page__subtitle">
        Your measurements power our AI to generate accurate metabolic and wellness scores.
      </p>

      <p className="anthropometry-page__question">What is you height ?</p>
      <div
        className="anthropometry-page__box anthropometry-page__height-box"
        onWheel={(e) => handleWheelAdjust(e, setHeight, 120, 230)}
        onTouchStart={handleTouchStart}
        onTouchEnd={(e) => handleTouchEndAdjust(e, setHeight, 120, 230)}
      >
        <div className="anthropometry-page__unit">Cm <span>▼</span></div>
        <div className="anthropometry-page__faded">{height - 1}</div>
        <div className="anthropometry-page__row-centered">
          <div className="anthropometry-page__arrow-wrap"><TriangleArrow direction="right" /></div>
          <div className="anthropometry-page__selected-box">
            <span className="anthropometry-page__selected-value">{height}</span>
          </div>
          <div className="anthropometry-page__arrow-wrap"><TriangleArrow direction="left" /></div>
        </div>
        <div className="anthropometry-page__faded">{height + 1}</div>
      </div>

      <p className="anthropometry-page__question anthropometry-page__question--mid">What is your body weight ?</p>
      <div
        className="anthropometry-page__box anthropometry-page__weight-box"
        onWheel={(e) => handleWheelAdjust(e, setWeight, 20, 250)}
        onTouchStart={handleTouchStart}
        onTouchEnd={(e) => handleTouchEndAdjust(e, setWeight, 20, 250)}
      >
        <div className="anthropometry-page__unit">Kg <span>▼</span></div>
        <img src={AnthInd} alt="" aria-hidden="true" className="anthropometry-page__dial" />
        <div className="anthropometry-page__selected-box anthropometry-page__selected-box--weight">
          <span className="anthropometry-page__selected-value">{weight}</span>
        </div>
        <div className="anthropometry-page__indicator">
          <DialIndicator />
        </div>
      </div>

      <p className="anthropometry-page__question anthropometry-page__question--low">What is your waist size ?</p>
      <div
        className="anthropometry-page__box anthropometry-page__waist-box"
        onWheel={(e) => handleWheelAdjust(e, setWaist, 20, 60)}
        onTouchStart={handleTouchStart}
        onTouchEnd={(e) => handleTouchEndAdjust(e, setWaist, 20, 60)}
      >
        <div className="anthropometry-page__unit">In <span>▼</span></div>
        <div className="anthropometry-page__arrow-vertical anthropometry-page__arrow-vertical--top"><TriangleArrow direction="down" /></div>
        <div className="anthropometry-page__waist-row">
          <span className="anthropometry-page__faded anthropometry-page__faded--inline">{waist - 2}</span>
          <span className="anthropometry-page__faded anthropometry-page__faded--inline">{waist - 1}</span>
          <div className="anthropometry-page__selected-box">
            <span className="anthropometry-page__selected-value">{waist}</span>
          </div>
          <span className="anthropometry-page__faded anthropometry-page__faded--inline">{waist + 1}</span>
          <span className="anthropometry-page__faded anthropometry-page__faded--inline">{waist + 2}</span>
        </div>
        <div className="anthropometry-page__arrow-below"><TriangleArrow direction="up" /></div>
      </div>

      <button type="button" className="anthropometry-page__continue" onClick={onContinue}>Continue</button>
    </div>
  );
};

export default AnthropometryPage;
