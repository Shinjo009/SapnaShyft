import React, { useRef, useState } from 'react';
import ques2Icon from '../../images/ques-2.svg';
import tickIcon from '../../images/ques-tick.svg';
import './FamilyHistoryPage.css';

const cards = [
  {
    key: 'lived-most',
    title: 'Where have you lived most of your life?',
    helper: '',
    options: ['Inland', 'Coastal'],
    defaultSelected: [],
    multi: false,
  },
  {
    key: 'family-blood',
    title: 'Do any of your close blood relatives (i.e., parents or siblings) have the following health conditions?',
    helper: '(Select multiple or None that apply)',
    infoLines: [
      'Fatty Liver : Non alcoholic fatty liver disorder',
      'Heart ailments : Heart disease, heart attack, stroke',
      'PCOS : Polycystic ovary syndrome',
      'Mental health : Stress, depression, other psychological disorders',
      'Hypertension : High blood pressure',
      'Lipid disorders : High cholesterol, triglycerides',
      'Thyroid disorders : Hypothyroidism',
    ],
    options: ['Type 2 Diabetes', 'Hypertension', 'Fatty Liver', 'Lipid Disorders', 'Heart Ailments', 'Thyroid Disorders', 'PCOS', 'Stroke', 'Mental Health', 'None', 'Other'],
    defaultSelected: [],
    multi: true,
  },
  {
    key: 'diagnosed',
    title: 'Are you diagnosed with the following diseases?',
    helper: '(Select multiple or None that apply)',
    infoLines: [
      'Fatty Liver : Non alcoholic fatty liver disorder',
      'Heart ailments : Heart disease, heart attack, stroke',
      'PCOS : Polycystic ovary syndrome',
      'Mental health : Stress, depression, other psychological disorders',
      'Hypertension : High blood pressure',
      'Lipid disorders : High cholesterol, triglycerides',
      'Thyroid disorders : Hypothyroidism',
    ],
    options: ['Type 2 Diabetes', 'Hypertension', 'Fatty Liver', 'Lipid Disorders', 'Heart Ailments', 'Thyroid Disorders', 'PCOS', 'Stroke', 'Mental Health', 'None', 'Other'],
    defaultSelected: [],
    multi: true,
  },
  {
    key: 'medication',
    title: 'Are you taking medications for the following diseases?',
    helper: '',
    options: ['Yes', 'No'],
    defaultSelected: [],
    multi: false,
  },
];

const FamilyHistoryPage = ({ onBack, onDone }) => {
  const [cardIndex, setCardIndex] = useState(0);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [selections, setSelections] = useState(() => cards.reduce((acc, card) => {
    acc[card.key] = [...card.defaultSelected];
    return acc;
  }, {}));
  const touchStartXRef = useRef(null);
  const lastWheelAtRef = useRef(0);

  const activeCard = cards[cardIndex];
  const activeSelections = selections[activeCard.key] || [];
  const progressNumerator = cardIndex + 1;
  const questionsLeft = cards.length - progressNumerator;
  const stackCardCount = questionsLeft >= 2 ? 2 : questionsLeft;
  const stackSpace = stackCardCount === 2 ? 36 : stackCardCount === 1 ? 18 : 0;

  const chipClass = (opt) => {
    const selected = activeSelections.includes(opt);
    return `family-history-page__chip ${selected ? 'family-history-page__chip--selected' : ''}`;
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

  const handleChipClick = (option) => {
    setSelections((prev) => {
      const current = prev[activeCard.key] || [];

      if (!activeCard.multi) {
        return {
          ...prev,
          [activeCard.key]: [option],
        };
      }

      // For multi-select cards, keep "None" mutually exclusive.
      if (option === 'None') {
        return {
          ...prev,
          [activeCard.key]: ['None'],
        };
      }

      const withoutNone = current.filter((item) => item !== 'None');
      const exists = withoutNone.includes(option);
      const next = exists ? withoutNone.filter((item) => item !== option) : [...withoutNone, option];

      return {
        ...prev,
        [activeCard.key]: next,
      };
    });
  };

  return (
    <div className="family-history-page">
      <div className="family-history-page__header">
        <button className="family-history-page__back" type="button" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="family-history-page__title">Family History</h1>
        <img src={ques2Icon} alt="" aria-hidden="true" className="family-history-page__header-icon" />
      </div>

      <p className="family-history-page__subtitle">
        Knowing your family's health patterns helps us predict risks more accurately.
      </p>

      <div
        className="family-history-page__stack-wrap"
        style={{ '--stack-space': `${stackSpace}px` }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="family-history-page__card">
          <div className="family-history-page__progress">
            <span className="family-history-page__progress-main">{progressNumerator}</span>
            <span className="family-history-page__progress-sub">/4</span>
          </div>

          <div className="family-history-page__question-row">
            <p className="family-history-page__question">{activeCard.title}</p>
            {activeCard.infoLines?.length ? (
              <button
                type="button"
                className="family-history-page__info-btn"
                onClick={() => setShowInfoPopup(true)}
                aria-label="Open condition info"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 0C8.85652 0 10.637 0.737498 11.9497 2.05025C13.2625 3.36301 14 5.14348 14 7C14 8.85652 13.2625 10.637 11.9497 11.9497C10.637 13.2625 8.85652 14 7 14C5.14348 14 3.36301 13.2625 2.05025 11.9497C0.737498 10.637 0 8.85652 0 7C0 5.14348 0.737498 3.36301 2.05025 2.05025C3.36301 0.737498 5.14348 0 7 0ZM8.05 4.29688C8.57031 4.29688 8.99219 3.9375 8.99219 3.40156C8.99219 2.86563 8.57031 2.50625 8.05 2.50625C7.52969 2.50625 7.10938 2.86563 7.10938 3.40156C7.10938 3.9375 7.53125 4.29844 8.05 4.29844M8.23281 9.925C8.23281 9.81875 8.27031 9.54063 8.24844 9.38125L7.42656 10.3281C7.25625 10.5063 7.04375 10.6312 6.94375 10.5984C6.89862 10.5816 6.86096 10.5492 6.83749 10.5071C6.81403 10.4651 6.80627 10.416 6.81563 10.3687L8.18437 6.04063C8.29688 5.49062 7.98906 4.99062 7.33594 4.92656C6.64844 4.92656 5.63281 5.625 5.01562 6.5125C5.01562 6.61875 4.99531 6.88125 5.01562 7.04062L5.8375 6.09375C6.00938 5.91563 6.20625 5.79062 6.30625 5.825C6.35491 5.84336 6.39467 5.87968 6.41734 5.92648C6.44002 5.97328 6.44387 6.027 6.42812 6.07656L5.06875 10.3844C4.9125 10.8875 5.20937 11.3812 5.92969 11.4937C6.99062 11.4937 7.61719 10.8125 8.23438 9.925H8.23281Z" fill="white"/>
                </svg>
              </button>
            ) : null}
          </div>
          {activeCard.helper ? <p className="family-history-page__helper">{activeCard.helper}</p> : null}

          <div className={`family-history-page__chips ${activeCard.multi ? 'family-history-page__chips--multi' : ''}`}>
            {activeCard.options.map((opt) => {
              const selected = activeSelections.includes(opt);
              return (
                <button key={opt} type="button" className={chipClass(opt)} onClick={() => handleChipClick(opt)}>
                  {activeCard.multi && selected ? (
                    <img src={tickIcon} alt="" aria-hidden="true" className="family-history-page__tick" />
                  ) : null}
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {stackCardCount >= 1 ? (
          <div className="family-history-page__stack-card family-history-page__stack-card--one" aria-hidden="true" />
        ) : null}
        {stackCardCount >= 2 ? (
          <div className="family-history-page__stack-card family-history-page__stack-card--two" aria-hidden="true" />
        ) : null}
      </div>

      <p className="family-history-page__swipe-hint">Swipe to go back and forth</p>

      {cardIndex === 3 ? (
        <button type="button" className="family-history-page__done" onClick={onDone}>Done</button>
      ) : null}

      {showInfoPopup && activeCard.infoLines?.length ? (
        <div className="family-history-page__info-popup" role="dialog" aria-label="Condition information">
          <div className="family-history-page__info-handle" aria-hidden="true" />
          <button
            type="button"
            className="family-history-page__info-close"
            onClick={() => setShowInfoPopup(false)}
            aria-label="Close information popup"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M12 4L4 12M4 4L12 12" stroke="#9A9A9A" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <ul className="family-history-page__info-list">
            {activeCard.infoLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default FamilyHistoryPage;
