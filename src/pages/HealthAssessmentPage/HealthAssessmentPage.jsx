import React from 'react';
import ques1Icon from '../../images/ques-1.svg';
import ques2Icon from '../../images/ques-2.svg';
import ques3Icon from '../../images/ques-3.svg';
import ques4Icon from '../../images/ques-4.svg';
import ques5Icon from '../../images/ques-5.svg';
import quesArrow from '../../images/ques-arrow.svg';
import quesElongated from '../../images/ques-elon.svg';
import './HealthAssessmentPage.css';

const steps = [
  { id: 'anthropometry', label: 'Anthropometry', detail: 'Track your\nheight, weight\n& BMI', icon: ques1Icon, side: 'center' },
  { id: 'family-history', label: 'Family\nHistory', detail: 'Record\nhereditary\nhealth\nconditions', icon: ques2Icon, side: 'left' },
  { id: 'lifestyle-habits', label: 'Lifestyle &\nHabits', detail: 'Your daily\nroutine &\nactivities', icon: ques3Icon, side: 'right' },
  { id: 'nutrition-log', label: 'Nutrition\nLog', detail: 'Monitor\nyour\ndietary\nintake', icon: ques4Icon, side: 'left' },
  { id: 'vitals', label: 'Vitals', detail: 'Blood\npressure\n& more', icon: ques5Icon, side: 'center' },
];

const DOT_LEVELS = [1, 2, 3];
const SEGMENT_GLOW_DOT_LEVELS = [0, 1, 2, 3];

const getCirclePositionStyle = (side, index) => {
  const y = `var(--y${index})`;
  if (side === 'left') {
    return { top: y, left: 'calc(50% - var(--side-offset))' };
  }
  if (side === 'right') {
    return { top: y, left: 'calc(50% + var(--side-offset))' };
  }
  return { top: y, left: '50%' };
};

const getPillPositionStyle = () => ({
  top: '0',
  left: '50%',
});

const HealthAssessmentPage = ({ progress = 0, expandedStep = null, onExpandStep, onOpenBlank }) => {
  const activeIndex = progress < steps.length ? progress : -1;
  const showPill = activeIndex !== -1 && expandedStep === activeIndex;
  const activeY = activeIndex !== -1 ? `var(--y${activeIndex})` : null;
  const lineEndY = progress >= 4 ? 'var(--line-bottom)' : `var(--y${Math.min(progress, 4)})`;
  const hideMiddleDotAtActivePill = showPill && activeIndex >= 1 && activeIndex <= 3;

  const isCompleted = (index) => index < progress;
  const isActive = (index) => index === activeIndex;

  return (
    <div className="health-assessment-page">
      <h1 className="health-assessment-page__title">Health Assessment</h1>

      <div className="health-assessment-page__timeline-wrap">
        <div className="health-assessment-page__timeline" role="list" aria-label="Health assessment steps">
        {!showPill && <div className="health-assessment-page__line-base" />}

        {showPill && activeIndex > 0 && (
          <div
            className="health-assessment-page__line-base health-assessment-page__line-segment"
            style={{
              top: 'var(--line-top)',
              height: `calc(${activeY} - var(--node-radius) - var(--line-top))`,
            }}
          />
        )}

        {showPill && activeIndex < 4 && (
          <div
            className="health-assessment-page__line-base health-assessment-page__line-segment"
            style={{
              top: `calc(${activeY} + var(--node-radius))`,
              height: `calc(var(--line-bottom) - (${activeY} + var(--node-radius)))`,
            }}
          />
        )}

        {progress > 0 && (
          <>
            {!showPill && (
              <div
                className="health-assessment-page__line-glow"
                style={{ '--line-end-y': lineEndY }}
              />
            )}

            {showPill && (
              <div
                className="health-assessment-page__line-glow health-assessment-page__line-segment"
                style={{
                  top: 'var(--line-top)',
                  '--line-end-y': `calc(${activeY} - var(--node-radius))`,
                }}
              />
            )}
          </>
        )}

        {!(hideMiddleDotAtActivePill && activeIndex === 1) && <div className="health-assessment-page__dot-base dot--1" />}
        {!(hideMiddleDotAtActivePill && activeIndex === 2) && <div className="health-assessment-page__dot-base dot--2" />}
        {!(hideMiddleDotAtActivePill && activeIndex === 3) && <div className="health-assessment-page__dot-base dot--3" />}

        {DOT_LEVELS.map((level) => (
          isCompleted(level) && !(hideMiddleDotAtActivePill && activeIndex === level) ? (
            <div key={level} className={`health-assessment-page__dot-glow dot--${level}`} />
          ) : null
        ))}

        {SEGMENT_GLOW_DOT_LEVELS.map((level) => (
          progress >= level + 1 ? (
            <div key={`segment-glow-${level}`} className={`health-assessment-page__segment-dot-glow seg-dot--${level}`} />
          ) : null
        ))}

        {!(hideMiddleDotAtActivePill && activeIndex === 1) && <div className="health-assessment-page__branch branch--left-1" />}
        {!(hideMiddleDotAtActivePill && activeIndex === 2) && <div className="health-assessment-page__branch branch--right-2" />}
        {!(hideMiddleDotAtActivePill && activeIndex === 3) && <div className="health-assessment-page__branch branch--left-3" />}

        {isCompleted(1) && !(hideMiddleDotAtActivePill && activeIndex === 1) && <div className="health-assessment-page__branch-glow branch--left-1" />}
        {isCompleted(2) && !(hideMiddleDotAtActivePill && activeIndex === 2) && <div className="health-assessment-page__branch-glow branch--right-2" />}
        {isCompleted(3) && !(hideMiddleDotAtActivePill && activeIndex === 3) && <div className="health-assessment-page__branch-glow branch--left-3" />}

        {steps.map((step, index) => {
          const completed = isCompleted(index);
          const active = isActive(index);
          if (active) {
            const activeCircleStyle = {
              top: '0',
              left: step.side === 'left'
                ? 'calc(50% - var(--side-offset))'
                : step.side === 'right'
                  ? 'calc(50% + var(--side-offset))'
                  : '50%',
            };

            return (
              <div
                key={step.id}
                className="health-assessment-page__active-layer"
                style={{ top: `var(--y${index})` }}
              >
                <button
                  type="button"
                  className={`health-assessment-page__circle health-assessment-page__circle--active-glow health-assessment-page__circle--button health-assessment-page__active-circle ${showPill ? 'is-hidden' : 'is-visible'}`}
                  style={activeCircleStyle}
                  onClick={() => onExpandStep?.(index)}
                  aria-label={`Expand ${step.label}`}
                >
                  <img src={step.icon} alt="" aria-hidden="true" className="health-assessment-page__icon" />
                  <span className="health-assessment-page__step-label">{step.label}</span>
                </button>

                <button
                  type="button"
                  className={`health-assessment-page__pill health-assessment-page__active-pill ${showPill ? 'is-visible' : 'is-hidden'}`}
                  onClick={() => onOpenBlank(index)}
                  style={{ ...getPillPositionStyle(), backgroundImage: `url(${quesElongated})` }}
                  aria-label={`Open ${step.label} questionnaire`}
                >
                  <div className="health-assessment-page__pill-left">
                    <img src={step.icon} alt="" aria-hidden="true" className="health-assessment-page__icon" />
                    <span className="health-assessment-page__step-label">{step.label}</span>
                  </div>

                  <span className="health-assessment-page__detail-text">{step.detail}</span>

                  <img src={quesArrow} alt="" aria-hidden="true" className="health-assessment-page__arrow" />
                </button>
              </div>
            );
          }

          return (
            <div
              key={step.id}
              role="listitem"
              className={`health-assessment-page__circle ${completed ? 'health-assessment-page__circle--completed' : ''}`}
              style={getCirclePositionStyle(step.side, index)}
            >
              <img src={step.icon} alt="" aria-hidden="true" className="health-assessment-page__icon" />
              <span className="health-assessment-page__step-label">{step.label}</span>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};

export default HealthAssessmentPage;
