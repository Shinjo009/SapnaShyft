import React, { useState } from 'react';
import ques5Icon from '../../images/ques-5.svg';
import './VitalsPage.css';

const formatTwoDigits = (value) => String(value).padStart(2, '0');

const VitalsPage = ({ onBack, onDone, onSkip }) => {
  const [systolic, setSystolic] = useState(0);
  const [diastolic, setDiastolic] = useState(80);

  const handleNumberInput = (setter) => (e) => {
    const next = Number(e.target.value || 0);
    const clamped = Math.max(0, Math.min(299, next));
    setter(clamped);
  };

  return (
    <div className="vitals-page">
      <div className="vitals-page__header">
        <button className="vitals-page__back" type="button" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="vitals-page__title">Vitals</h1>
        <img src={ques5Icon} alt="" aria-hidden="true" className="vitals-page__header-icon" />
      </div>

      <p className="vitals-page__subtitle">
        A healthy blood pressure range is typically around 120 mmHg systolic and 80 mmHg diastolic.
      </p>

      <p className="vitals-page__label vitals-page__label--first">Systolic Blood Pressure</p>
      <div className="vitals-page__box">
        <div className="vitals-page__score-box">
          <input
            className="vitals-page__score-input"
            type="number"
            min="0"
            max="299"
            value={systolic}
            onChange={handleNumberInput(setSystolic)}
            aria-label="Systolic blood pressure"
          />
          <span className={`vitals-page__score-value ${systolic === 0 ? 'vitals-page__score-value--empty' : ''}`} aria-hidden="true">
            {formatTwoDigits(systolic)}
          </span>
        </div>
        <span className="vitals-page__unit">mmHg</span>
      </div>

      <p className="vitals-page__label vitals-page__label--second">Diastolic Blood Pressure</p>
      <div className="vitals-page__box">
        <div className="vitals-page__score-box">
          <input
            className="vitals-page__score-input"
            type="number"
            min="0"
            max="299"
            value={diastolic}
            onChange={handleNumberInput(setDiastolic)}
            aria-label="Diastolic blood pressure"
          />
          <span className={`vitals-page__score-value ${diastolic === 0 ? 'vitals-page__score-value--empty' : ''}`} aria-hidden="true">
            {formatTwoDigits(diastolic)}
          </span>
        </div>
        <span className="vitals-page__unit">mmHg</span>
      </div>

      <button type="button" className="vitals-page__skip" onClick={onSkip}>Skip</button>
      <button type="button" className="vitals-page__done" onClick={onDone}>Done</button>
    </div>
  );
};

export default VitalsPage;
