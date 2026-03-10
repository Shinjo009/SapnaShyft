import React, { useRef, useState } from 'react';
import ques3Icon from '../../images/ques-3.svg';
import tickIcon from '../../images/ques-tick.svg';
import './LifestyleHabitsPage.css';

const cards = [
  {
    key: 'sit-continuously',
    title: 'How long do you sit continuously every day due to work or lifestyle?',
    helper: '',
    options: [
      { label: 'Less than 1 hour' },
      { label: '1-4 hours' },
      { label: 'More than 4 hours' },
    ],
    defaultSelected: [],
    multi: false,
  },
  {
    key: 'physical-activity-daily',
    title: 'How much time do you spend engaging in physical activity or exercise daily?',
    helper: '(Brisk Walking or Bicycling or Heavy Lifting or Games or Yoga Or Meditation or Cleaning)',
    options: [
      { label: '30-60 minutes a day' },
      { label: 'Rarely or never' },
      { label: 'Less than 30 minutes a day', fullWidth: true },
      { label: 'More than 60 minutes a day', fullWidth: true },
    ],
    defaultSelected: [],
    multi: false,
  },
  {
    key: 'weekly-leisure-workout',
    title: 'On a typical week, how much time do you dedicate to leisure activities, workouts or sports?',
    helper: '',
    options: [
      { label: '1-3 hours' },
      { label: '4-8 hours' },
      { label: 'Rarely or never' },
      { label: 'Less than 1 hour' },
      { label: 'More than 8 hours' },
    ],
    defaultSelected: [],
    multi: false,
  },
  {
    key: 'intensity-average',
    title: 'On an average week, how would you rate the intensity of your activities or workouts?',
    helper: '',
    infoLines: [
      'Low : Walking, gentle stretching, low-impact aerobics',
      'Moderate : Brisk walking, cycling, casual cricket/ badminton games, moderate weightlifting',
      'High : Running, football, competitive cricket/ badminton games, HIIT workouts, intense weightlifting',
    ],
    options: [
      { label: 'Low-intensity' },
      { label: 'Moderate-intensity' },
      { label: 'High-intensity' },
    ],
    defaultSelected: [],
    multi: false,
  },
  {
    key: 'active-walking',
    title: 'How much time do you spend actively walking each day?',
    helper: '(Includes commuting to work, breaks at work and household chores)',
    options: [
      { label: 'Less than 15 mins' },
      { label: 'Between 15-30 mins' },
      { label: 'Between 30-60 mins' },
      { label: 'Between 1-2 hours' },
      { label: 'More than 2 hours' },
    ],
    defaultSelected: [],
    multi: false,
  },
  {
    key: 'sleep-duration',
    title: 'What is your average duration of good-quality sleep?',
    helper: '',
    options: [
      { label: 'Less than 5 hours' },
      { label: 'Between 5-7 hours' },
      { label: 'Between 7-9 hours' },
      { label: 'More than 9 hours' },
    ],
    defaultSelected: [],
    multi: false,
  },
  {
    key: 'alcohol-consumption',
    title: 'What is your alcohol consumption?',
    helper: '(1 serving = 125 ml wine or 330 ml of beer or 40 ml of hard liquor)',
    options: [
      { label: '3 servings per week or less', fullWidth: true },
      { label: 'I quit alcohol' },
      { label: 'I do not drink alcohol' },
      { label: '1-2 times in 3 months' },
      { label: '1-2 times in 6 months' },
      { label: 'More than 3 servings per week', fullWidth: true },
    ],
    defaultSelected: [],
    multi: false,
  },
  {
    key: 'smoke-tobacco',
    title: 'How often do you smoke cigarettes or tobacco?',
    helper: '',
    options: [
      { label: 'I do not smoke' },
      { label: 'I quit smoking' },
      { label: '1-2 times a month' },
      { label: '1-3 times a week' },
      { label: '4-5 times a month' },
      { label: '5-7 times a week' },
      { label: 'More than 7 times a week', fullWidth: true },
    ],
    defaultSelected: [],
    multi: false,
  },
  {
    key: 'wellness-priorities',
    title: 'What are your primary health and wellness priorities?',
    helper: '(Choose your top two priority)',
    options: [
      { label: 'Weight Loss' },
      { label: 'Building Muscle Mass' },
      { label: 'Improving Metabolic Health', fullWidth: true },
      { label: 'Increase Energy Levels', fullWidth: true },
      { label: 'Improving Physical Endurance', fullWidth: true },
      { label: 'Increasing Strength' },
    ],
    defaultSelected: [],
    multi: true,
    maxSelections: 2,
  },
  {
    key: 'lifestyle-priority',
    title: 'What aspect of your lifestyle changes would you like to prioritize?',
    helper: '',
    options: [
      { label: 'Reducing daily diet intake', fullWidth: true },
      { label: 'Forming healthy habits', fullWidth: true },
      { label: 'Increasing physical activity', fullWidth: true },
    ],
    defaultSelected: [],
    multi: false,
  },
];

const LifestyleHabitsPage = ({ onBack, onDone }) => {
  const [cardIndex, setCardIndex] = useState(0);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [selections, setSelections] = useState(() => cards.reduce((acc, card) => {
    acc[card.key] = [...card.defaultSelected];
    return acc;
  }, {}));
  const touchStartXRef = useRef(null);
  const lastWheelAtRef = useRef(0);

  const activeCard = cards[cardIndex];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const activeSelections = selections[activeCard.key] || [];
  const progressNumerator = cardIndex + 1;
  const questionsLeft = cards.length - progressNumerator;
  const stackCardCount = questionsLeft >= 2 ? 2 : questionsLeft;
  const stackSpace = stackCardCount === 2 ? 36 : stackCardCount === 1 ? 18 : 0;

  const chipClass = (option) => {
    const selected = activeSelections.includes(option.label);
    return `lifestyle-habits-page__chip ${selected ? 'lifestyle-habits-page__chip--selected' : ''} ${option.fullWidth ? 'lifestyle-habits-page__chip--full' : ''}`;
  };

  const goPrev = () => {
    setShowInfoPopup(false);
    setCardIndex((prev) => Math.max(0, prev - 1));
  };

  const goNext = () => {
    setShowInfoPopup(false);
    setCardIndex((prev) => Math.min(cards.length - 1, prev + 1));
  };

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current == null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(deltaX) > 24) {
      if (deltaX < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
    touchStartXRef.current = null;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastWheelAtRef.current < 220) return;
    lastWheelAtRef.current = now;

    if (e.deltaY > 0) {
      goNext();
    } else if (e.deltaY < 0) {
      goPrev();
    }
  };

  const handleChipClick = (optionLabel) => {
    setSelections((prev) => {
      const current = prev[activeCard.key] || [];

      if (!activeCard.multi) {
        return {
          ...prev,
          [activeCard.key]: [optionLabel],
        };
      }

      const exists = current.includes(optionLabel);
      let next;

      if (exists) {
        next = current.filter((item) => item !== optionLabel);
      } else {
        next = [...current, optionLabel];
      }

      if (activeCard.maxSelections && next.length > activeCard.maxSelections) {
        next = next.slice(next.length - activeCard.maxSelections);
      }

      return {
        ...prev,
        [activeCard.key]: next,
      };
    });
  };

  return (
    <div className="lifestyle-habits-page">
      <div className="lifestyle-habits-page__header">
        <button className="lifestyle-habits-page__back" type="button" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="lifestyle-habits-page__title">Lifestyle &amp; Habits</h1>
        <img src={ques3Icon} alt="" aria-hidden="true" className="lifestyle-habits-page__header-icon" />
      </div>

      <p className="lifestyle-habits-page__subtitle">
        Your routines help our system decode how your habits influence your health.
      </p>

      <div
        className="lifestyle-habits-page__stack-wrap"
        style={{ '--stack-space': `${stackSpace}px` }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="lifestyle-habits-page__card">
          <div className="lifestyle-habits-page__progress">
            <span className="lifestyle-habits-page__progress-main">{progressNumerator}</span>
            <span className="lifestyle-habits-page__progress-sub">/10</span>
          </div>

          <div className="lifestyle-habits-page__question-row">
            <p className="lifestyle-habits-page__question">{activeCard.title}</p>
            {activeCard.infoLines?.length ? (
              <button
                type="button"
                className="lifestyle-habits-page__info-btn"
                onClick={() => setShowInfoPopup(true)}
                aria-label="Open intensity info"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 0C8.85652 0 10.637 0.737498 11.9497 2.05025C13.2625 3.36301 14 5.14348 14 7C14 8.85652 13.2625 10.637 11.9497 11.9497C10.637 13.2625 8.85652 14 7 14C5.14348 14 3.36301 13.2625 2.05025 11.9497C0.737498 10.637 0 8.85652 0 7C0 5.14348 0.737498 3.36301 2.05025 2.05025C3.36301 0.737498 5.14348 0 7 0ZM8.05 4.29688C8.57031 4.29688 8.99219 3.9375 8.99219 3.40156C8.99219 2.86563 8.57031 2.50625 8.05 2.50625C7.52969 2.50625 7.10938 2.86563 7.10938 3.40156C7.10938 3.9375 7.53125 4.29844 8.05 4.29844M8.23281 9.925C8.23281 9.81875 8.27031 9.54063 8.24844 9.38125L7.42656 10.3281C7.25625 10.5063 7.04375 10.6312 6.94375 10.5984C6.89862 10.5816 6.86096 10.5492 6.83749 10.5071C6.81403 10.4651 6.80627 10.416 6.81563 10.3687L8.18437 6.04063C8.29688 5.49062 7.98906 4.99062 7.33594 4.92656C6.64844 4.92656 5.63281 5.625 5.01562 6.5125C5.01562 6.61875 4.99531 6.88125 5.01562 7.04062L5.8375 6.09375C6.00938 5.91563 6.20625 5.79062 6.30625 5.825C6.35491 5.84336 6.39467 5.87968 6.41734 5.92648C6.44002 5.97328 6.44387 6.027 6.42812 6.07656L5.06875 10.3844C4.9125 10.8875 5.20937 11.3812 5.92969 11.4937C6.99062 11.4937 7.61719 10.8125 8.23438 9.925H8.23281Z" fill="white"/>
                </svg>
              </button>
            ) : null}
          </div>

          {activeCard.helper ? <p className="lifestyle-habits-page__helper">{activeCard.helper}</p> : null}

          <div className={`lifestyle-habits-page__chips ${activeCard.multi ? 'lifestyle-habits-page__chips--multi' : ''}`}>
            {activeCard.options.map((option) => {
              const selected = activeSelections.includes(option.label);
              return (
                <button
                  key={option.label}
                  type="button"
                  className={chipClass(option)}
                  onClick={() => handleChipClick(option.label)}
                >
                  {activeCard.multi && selected ? (
                    <img src={tickIcon} alt="" aria-hidden="true" className="lifestyle-habits-page__tick" />
                  ) : null}
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {stackCardCount >= 1 ? <div className="lifestyle-habits-page__stack-card lifestyle-habits-page__stack-card--one" aria-hidden="true" /> : null}
        {stackCardCount >= 2 ? <div className="lifestyle-habits-page__stack-card lifestyle-habits-page__stack-card--two" aria-hidden="true" /> : null}
      </div>

      <p className="lifestyle-habits-page__swipe-hint">Swipe to go back and forth</p>

      {cardIndex === cards.length - 1 ? (
        <button type="button" className="lifestyle-habits-page__done" onClick={onDone}>Done</button>
      ) : null}

      {showInfoPopup && activeCard.infoLines?.length ? (
        <div className="lifestyle-habits-page__info-popup" role="dialog" aria-label="Intensity information">
          <div className="lifestyle-habits-page__info-handle" aria-hidden="true" />
          <button
            type="button"
            className="lifestyle-habits-page__info-close"
            onClick={() => setShowInfoPopup(false)}
            aria-label="Close intensity information"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M12 4L4 12M4 4L12 12" stroke="#9A9A9A" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <ul className="lifestyle-habits-page__info-list">
            {activeCard.infoLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default LifestyleHabitsPage;
