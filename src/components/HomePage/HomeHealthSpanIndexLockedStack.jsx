import React, { useId } from 'react';

const LockIcon = ({ maskId }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="29" height="29" viewBox="0 0 29 29" fill="none" aria-hidden="true">
    <mask id={maskId} maskUnits="userSpaceOnUse" x="3" y="1" width="23" height="27" style={{ maskType: 'luminance' }}>
      <path d="M23.5618 13.3208H5.43685C4.7695 13.3208 4.22852 13.8618 4.22852 14.5291V25.4041C4.22852 26.0715 4.7695 26.6125 5.43685 26.6125H23.5618C24.2292 26.6125 24.7702 26.0715 24.7702 25.4041V14.5291C24.7702 13.8618 24.2292 13.3208 23.5618 13.3208Z" fill="white" stroke="white" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8.45703 13.2916V8.46129C8.45401 5.3589 10.8272 2.75917 13.9465 2.44742C17.0658 2.13567 19.9163 4.2134 20.5404 7.25356" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 18.125V21.75" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </mask>
    <g mask={`url(#${maskId})`}>
      <path d="M0 0H29V29H0V0Z" fill="white" />
    </g>
  </svg>
);

const SubmittedSuccessTickIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="36"
    height="36"
    viewBox="0 0 36 36"
    fill="none"
    aria-hidden="true"
    className="home-page-no-data__submitted-tick-svg"
  >
    <circle cx="18" cy="18" r="16.5" fill="#4B8D83" stroke="rgba(255,255,255,0.85)" strokeWidth="1.25" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M24.2 12.35c.45.42.48 1.12.07 1.58l-8.4 9.5a1.1 1.1 0 01-1.62.02l-4.35-4.9a1.1 1.1 0 011.64-1.46l3.54 3.99 7.6-8.6a1.1 1.1 0 011.64.77z"
      fill="white"
    />
  </svg>
);

/**
 * Locked Health Span Index card + CTA (Basic/Pro without FitPrint, or welcome no-data).
 * Styles live in HomePage.css (`home-page-no-data__health-*`, `home-page-no-data__complete-assessment-btn`).
 */
const HomeHealthSpanIndexLockedStack = ({
  onCompleteAssessment,
  stackClassName = '',
  ariaLabel = 'Health Span Index locked until FitPrint assessment is completed',
  postSubmitAwaitingReports = false,
  showCompleteAssessmentButton = true,
  unlockMessage = 'Unlock your Health Scores after completing the health assessment',
}) => {
  const lockMaskId = `hsi-lock-${useId().replace(/:/g, '')}`;
  const submittedAria = postSubmitAwaitingReports
    ? 'Health Span Index: questionnaire submitted, reports in progress'
    : ariaLabel;

  return (
  <div className={`home-page-no-data__health-stack${stackClassName ? ` ${stackClassName}` : ''}`}>
    <section className="home-page-no-data__health-box" aria-label={submittedAria}>
      <div className="home-page-no-data__health-top">
        <p className="home-page-no-data__health-title">Health Span Index</p>
        <button
          type="button"
          className="home-page-no-data__see-more home-page-no-data__see-more--locked"
          aria-disabled="true"
          tabIndex={-1}
        >
          See more
        </button>
      </div>
      <p className="home-page-no-data__health-subtitle home-page-no-data__health-subtitle--locked">
        Tap the card to know more
      </p>

      <div className="home-page-no-data__health-body">
        <div className="home-page-no-data__health-blurred" aria-hidden="true">
          <div className="home-page-no-data__locked-circles">
            <span className="home-page-no-data__locked-circle home-page-no-data__locked-circle--red" />
            <span className="home-page-no-data__locked-circle home-page-no-data__locked-circle--yellow" />
            <span className="home-page-no-data__locked-circle home-page-no-data__locked-circle--green" />
          </div>
        </div>

        {postSubmitAwaitingReports ? (
          <div className="home-page-no-data__submitted-center">
            <p className="home-page-no-data__submitted-title">Submitted Successfully</p>
            <SubmittedSuccessTickIcon />
            <p className="home-page-no-data__submitted-subtitle">Your Reports are getting ready</p>
          </div>
        ) : (
          <div className="home-page-no-data__unlock-center">
            <LockIcon maskId={lockMaskId} />
            <p className="home-page-no-data__unlock-message">
              {unlockMessage}
            </p>
          </div>
        )}
      </div>
    </section>

    {!postSubmitAwaitingReports && showCompleteAssessmentButton ? (
      <button
        type="button"
        className="home-page-no-data__complete-assessment-btn"
        onClick={onCompleteAssessment}
      >
        Complete the Assessment
      </button>
    ) : null}
  </div>
  );
};

export default HomeHealthSpanIndexLockedStack;
