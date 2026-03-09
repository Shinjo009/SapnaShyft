import React, { useMemo, useRef, useState } from 'react';
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
    options: ['Type 2 Diabetes', 'Hypertension', 'Fatty Liver', 'Lipid Disorders', 'Heart Ailments', 'Thyroid Disorders', 'PCOS', 'Stroke', 'Mental Health', 'None', 'Other'],
    defaultSelected: [],
    multi: true,
  },
  {
    key: 'diagnosed',
    title: 'Are you diagnosed with the following diseases?',
    helper: '(Select multiple or None that apply)',
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

  const chipClass = useMemo(() => {
    return (opt) => {
      const selected = activeSelections.includes(opt);
      return `family-history-page__chip ${selected ? 'family-history-page__chip--selected' : ''}`;
    };
  }, [activeSelections]);

  const goPrev = () => setCardIndex((prev) => Math.max(0, prev - 1));
  const goNext = () => setCardIndex((prev) => Math.min(cards.length - 1, prev + 1));

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

          <p className="family-history-page__question">{activeCard.title}</p>
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
    </div>
  );
};

export default FamilyHistoryPage;
