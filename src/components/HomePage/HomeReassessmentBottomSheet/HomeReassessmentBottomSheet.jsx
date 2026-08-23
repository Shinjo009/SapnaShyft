import React, { useEffect, useState } from 'react';
import './HomeReassessmentBottomSheet.css';

const BloodVialIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d="M5.25 1.166H8.75M5.833 1.166V3.208L3.792 6.417C3.354 7.117 3.208 7.933 3.208 8.75V10.792C3.208 11.913 4.12 12.833 5.25 12.833H8.75C9.88 12.833 10.792 11.913 10.792 10.792V8.75C10.792 7.933 10.646 7.117 10.208 6.417L8.167 3.208V1.166"
      stroke="white"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M4.083 9.333H9.917" stroke="white" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="8" height="16" viewBox="0 0 8 16" fill="none" aria-hidden="true">
    <path
      d="M1.5 3.5L5.5 8L1.5 12.5"
      stroke="#9A9A9A"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path
      d="M8.25 12.75H9.75V8.25H8.25V12.75ZM9 6.75C9.2125 6.75 9.39075 6.678 9.53475 6.534C9.67875 6.39 9.7505 6.212 9.75 6C9.7495 5.788 9.6775 5.61 9.534 5.466C9.3905 5.322 9.2125 5.25 9 5.25C8.7875 5.25 8.6095 5.322 8.466 5.466C8.3225 5.61 8.2505 5.788 8.25 6C8.2495 6.212 8.3215 6.39025 8.466 6.53475C8.6105 6.67925 8.7885 6.751 9 6.75ZM9 16.5C7.9625 16.5 6.9875 16.303 6.075 15.909C5.1625 15.515 4.36875 14.9808 3.69375 14.3063C3.01875 13.6318 2.4845 12.838 2.091 11.925C1.6975 11.012 1.5005 10.037 1.5 9C1.4995 7.963 1.6965 6.988 2.091 6.075C2.4855 5.162 3.01975 4.36825 3.69375 3.69375C4.36775 3.01925 5.1615 2.485 6.075 2.091C6.9885 1.697 7.9635 1.5 9 1.5C10.0365 1.5 11.0115 1.697 11.925 2.091C12.8385 2.485 13.6323 3.01925 14.3063 3.69375C14.9803 4.36825 15.5148 5.162 15.9098 6.075C16.3048 6.988 16.5015 7.963 16.5 9C16.4985 10.037 16.3015 11.012 15.909 11.925C15.5165 12.838 14.9823 13.6318 14.3063 14.3063C13.6303 14.9808 12.8365 15.5153 11.925 15.9097C11.0135 16.3042 10.0385 16.501 9 16.5ZM9 15C10.675 15 12.0938 14.4187 13.2563 13.2562C14.4188 12.0938 15 10.675 15 9C15 7.325 14.4188 5.90625 13.2563 4.74375C12.0938 3.58125 10.675 3 9 3C7.325 3 5.90625 3.58125 4.74375 4.74375C3.58125 5.90625 3 7.325 3 9C3 10.675 3.58125 12.0938 4.74375 13.2562C5.90625 14.4187 7.325 15 9 15Z"
      fill="#C4C4C4"
    />
  </svg>
);

/**
 * Bottom sheet for returning users on a new assessment cycle.
 * Scenario 1 (questionnaire done): blood-collection row only.
 * Scenario 2 (questionnaire pending): blood-collection row + Update Health Assessment + info toggle.
 */
const HomeReassessmentBottomSheet = ({
  visible,
  collectionDateLabel = '',
  showUpdateAssessment = false,
  onUpdateAssessment,
  onViewDetails,
}) => {
  const [infoExpanded, setInfoExpanded] = useState(false);

  useEffect(() => {
    if (!visible || !showUpdateAssessment) {
      setInfoExpanded(false);
    }
  }, [visible, showUpdateAssessment]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={`home-reassessment-sheet${showUpdateAssessment ? ' home-reassessment-sheet--with-update' : ''}${infoExpanded ? ' home-reassessment-sheet--expanded' : ''}`}
      role="region"
      aria-label="Blood collection and health assessment"
    >
      <div className="home-reassessment-sheet__blood-row">
        <div className="home-reassessment-sheet__blood-main">
          <div className="home-reassessment-sheet__vial" aria-hidden="true">
            <BloodVialIcon />
          </div>
          <div className="home-reassessment-sheet__blood-copy">
            <p className="home-reassessment-sheet__blood-title">Blood Collection Scheduled</p>
            {collectionDateLabel ? (
              <p className="home-reassessment-sheet__blood-date">{collectionDateLabel}</p>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          className="home-reassessment-sheet__view-details"
          onClick={() => onViewDetails?.()}
        >
          <span>View Details</span>
          <ChevronRightIcon />
        </button>
      </div>

      {showUpdateAssessment ? (
        <>
          <div className="home-reassessment-sheet__actions">
            <button
              type="button"
              className="home-reassessment-sheet__update-btn"
              onClick={onUpdateAssessment}
            >
              Update Health Assessment
            </button>
            <button
              type="button"
              className="home-reassessment-sheet__icon-btn"
              onClick={() => setInfoExpanded((prev) => !prev)}
              aria-label={infoExpanded ? 'Hide assessment information' : 'Show assessment information'}
              aria-expanded={infoExpanded}
            >
              <InfoIcon />
            </button>
          </div>

          {infoExpanded ? (
            <p className="home-reassessment-sheet__info-text">
              Your Bio-AI Report will be generated only after you update the Health Assessment
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
};

export default HomeReassessmentBottomSheet;
