import React, { useRef, useState } from 'react';
import tickIcon from '../../images/ques-tick.svg';
import './NutritionLogPage.css';

/* eslint-disable react-hooks/exhaustive-deps */

const cards = [
  {
    key: 'diet-type',
    title: 'What type of diet do you primarily consume?',
    helper: '',
    infoLines: [
      'Veg: Does not consume meat or fish',
      'Non-Veg: Consumes both meat and fish',
      'Eggetarian: Consumes eggs but not meat or fish',
      'Flexitarian: Primarily vegetarian but occasionally consumes meat or fish',
      'Pescatarian: Consumes fish but not meat',
    ],
    options: [
      { label: 'Veg' },
      { label: 'Jain' },
      { label: 'Non-Veg' },
      { label: 'Eggetarian' },
      { label: 'Flexitarian' },
      { label: 'Pescatarian' },
    ],
    defaultSelected: [],
    multi: false,
  },
  {
    key: 'daily-food-groups',
    title: 'Which of the following food groups do you consume every day?',
    helper: '(Select all that apply)',
    options: [
      { label: 'Pulses / Legumes' },
      { label: 'Fresh Fruits' },
      { label: 'Fresh Vegetables' },
      { label: 'Nuts / Seeds' },
      { label: 'Whole Grains' },
      { label: 'Eggs' },
      { label: 'Whole Milk / Curd' },
      { label: 'Chicken / Fish' },
      { label: 'Cruciferous (Cauliflower, Cabbage)', fullWidth: true },
      { label: 'None' },
    ],
    defaultSelected: [],
    multi: true,
  },
  {
    key: 'healthy-breakfast',
    title: 'How frequently do you have a healthy homemade breakfast in a week?',
    helper: '',
    options: [
      { label: 'More than 5 times' },
      { label: 'Less than 5 times' },
      { label: 'Do not have breakfast' },
    ],
    defaultSelected: [],
    multi: false,
  },
  {
    key: 'fresh-fruits',
    title: 'How frequently do you consume fresh fruits?',
    helper: '',
    options: [
      { label: 'Once a week or less' },
      { label: '2-3 times a week' },
      { label: '1-2 times per day' },
      { label: 'Rarely or never' },
      { label: '1-2 times per month' },
    ],
    defaultSelected: [],
    multi: false,
  },
  {
    key: 'cookies-bread-cakes',
    title: 'How frequently do you consume cookies, biscuits, bread, or cakes?',
    helper: '',
    options: [
      { label: 'Once a week or less' },
      { label: '2-3 times a week' },
      { label: 'Rarely or never' },
      { label: '1-2 times per month' },
      { label: '4 or more times a week' },
    ],
    defaultSelected: [],
    multi: false,
  },
  {
    key: 'fresh-vegetables',
    title: 'How frequently do you consume fresh vegetables ?',
    helper: '',
    options: [
      { label: 'Once a week or less' },
      { label: '2-3 times a week' },
      { label: '1-2 times per day' },
      { label: 'Rarely or never' },
      { label: '1-2 times per month' },
    ],
    defaultSelected: [],
    multi: false,
  },
  {
    key: 'sugary-drinks',
    title: 'How frequently do you consume sugary drinks and desserts?',
    helper: '(Soft Drinks, Ice Cream, Chocolate, Cakes, Pastries, Candies or Sweets)',
    options: [
      { label: 'Once a week or less' },
      { label: '2-3 times a week' },
      { label: '1-2 times per day' },
      { label: 'Rarely or never' },
      { label: '1-2 times per month' },
      { label: '4 or more times a week' },
    ],
    defaultSelected: [],
    multi: false,
  },
  {
    key: 'iodized-salt',
    title: 'Do you use iodized salt in your diet?',
    helper: '',
    options: [
      { label: 'Yes' },
      { label: 'No' },
    ],
    defaultSelected: [],
    multi: false,
  },
  {
    key: 'extra-salt',
    title: 'How often do you add extra salt to your food?',
    helper: '',
    options: [
      { label: 'Never' },
      { label: 'Rarely' },
      { label: 'Usually' },
    ],
    defaultSelected: [],
    multi: false,
  },
  {
    key: 'coffee-tea-intake',
    title: "What's your coffee or tea intake?",
    helper: '',
    options: [
      { label: 'I do not drink coffee or tea', fullWidth: true },
      { label: '2-3 time a week', fullWidth: true },
      { label: '0-1 cups per day' },
      { label: '1-2 cups per day' },
      { label: 'More than 2 cups per day', fullWidth: true },
    ],
    defaultSelected: [],
    multi: false,
  },
  {
    key: 'coffee-tea-type',
    title: 'What type of coffee or tea do you drink?',
    helper: '(Select all that apply)',
    options: [
      { label: 'Tea with sugar & milk' },
      { label: 'Green tea' },
      { label: 'Coffee with sugar & milk', fullWidth: true },
      { label: 'Milk tea without sugar', fullWidth: true },
      { label: 'Black Coffee' },
      { label: 'Black tea' },
      { label: 'Milk coffee without sugar', fullWidth: true },
    ],
    defaultSelected: [],
    multi: true,
  },
  {
    key: 'market-butter',
    title: 'How frequently do you indulge in dishes that are rich in market butter?',
    helper: '',
    options: [
      { label: 'Once a week or less' },
      { label: '2-3 times a week' },
      { label: '4 or more times a week' },
      { label: 'Rarely or never' },
      { label: '1-2 times per month' },
    ],
    defaultSelected: [],
    multi: false,
  },
  {
    key: 'red-meat',
    title: 'How frequently do you consume red meat (i.e., mutton, lamb, beef, pork)?',
    helper: '',
    options: [
      { label: 'Once a week or less' },
      { label: '2-3 times a week' },
      { label: '4 or more times a week' },
      { label: 'Rarely or never' },
      { label: '1-2 times per month' },
    ],
    defaultSelected: [],
    multi: false,
  },
  {
    key: 'water-glasses',
    title: 'How many glasses of water do you drink in a day?',
    helper: '(1 glass of water is ~250 ml)',
    options: [
      { label: 'Less than 2 glasses' },
      { label: '2 glasses' },
      { label: '4 glasses' },
      { label: '6 glasses' },
      { label: '8 glasses' },
      { label: 'More than 8 glasses' },
    ],
    defaultSelected: [],
    multi: false,
  },
  {
    key: 'fall-sick',
    title: 'How often do you fall sick in a year?',
    helper: '(Required at least a day of bed rest)',
    options: [
      { label: 'Rarely or Never' },
      { label: '1 to 2 times' },
      { label: '2 to 3 times' },
      { label: '4 to 5 times' },
      { label: 'More than 6 times' },
    ],
    defaultSelected: [],
    multi: false,
  },
];

const NutritionLogPage = ({ onBack, onDone }) => {
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
    return `nutrition-log-page__chip ${selected ? 'nutrition-log-page__chip--selected' : ''} ${option.fullWidth ? 'nutrition-log-page__chip--full' : ''}`;
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

      if (optionLabel === 'None') {
        return {
          ...prev,
          [activeCard.key]: ['None'],
        };
      }

      const withoutNone = current.filter((item) => item !== 'None');
      const exists = withoutNone.includes(optionLabel);
      const next = exists ? withoutNone.filter((item) => item !== optionLabel) : [...withoutNone, optionLabel];

      return {
        ...prev,
        [activeCard.key]: next,
      };
    });
  };

  return (
    <div className="nutrition-log-page">
      <div className="nutrition-log-page__header">
        <button className="nutrition-log-page__back" type="button" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="nutrition-log-page__title">Nutrition Log</h1>
        <svg className="nutrition-log-page__header-icon" xmlns="http://www.w3.org/2000/svg" width="17" height="22" viewBox="0 0 17 22" fill="none" aria-hidden="true">
          <path d="M4.37492 7.91287C3.35892 8.04026 2.55103 8.16622 1.95263 8.29074C2.40631 14.7814 4.98737 19.3454 8.02652 19.3454C11.0711 19.3454 13.6559 14.7644 14.1022 8.25336C13.4738 8.13656 12.6589 8.0235 11.6818 7.91857M8.15606 0.625C8.15606 0.625 8.46882 4.68742 4.37492 7.91287M8.15606 0.625C8.15606 0.625 7.849 4.68742 11.6818 7.91857M8.15606 0.625V7.91287M8.15606 7.91287H4.37492M8.15606 7.91287H11.6818M0.507812 8.625C0.507812 8.625 0.731064 21.375 8.02652 21.375C15.322 21.375 15.5452 8.625 15.5452 8.625" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16.4998 5.52024H16.5006L16.5006 5.54024C16.5006 5.62017 16.4852 5.69917 16.4554 5.77334C16.4256 5.8475 16.382 5.91535 16.3272 5.97298C16.2724 6.03061 16.2074 6.0769 16.1355 6.10918C16.0636 6.14147 15.9864 6.15912 15.9082 6.16109L15.9001 6.16119V6.17882C15.9001 8.01273 15.2145 9.77371 13.9941 11.0703C12.7736 12.367 11.1185 13.0954 9.39278 13.0954C7.66703 13.0954 6.01194 12.367 4.79146 11.0703C3.57099 9.77371 2.88543 8.01273 2.88543 6.17882V6.16119L2.87735 6.16109C2.79914 6.15912 2.72191 6.14147 2.65001 6.10918C2.57811 6.0769 2.51308 6.03061 2.45827 5.97298C2.40346 5.91535 2.35997 5.8475 2.33016 5.77334C2.30034 5.69917 2.28477 5.62017 2.28437 5.54024L2.28437 5.52024H2.28518C2.2903 4.93273 2.51574 4.37043 2.91298 3.95796C3.31024 3.54549 3.84728 3.31548 4.40706 3.31839H14.3787C14.9385 3.31548 15.4756 3.54549 15.8728 3.95796C16.27 4.37043 16.4955 4.93273 16.5006 5.52024H16.4998Z" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5.53711 0.625H13.2426" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <p className="nutrition-log-page__subtitle">
        Your dietary data helps our system decode patterns that impact your metabolic health.
      </p>

      <div
        className="nutrition-log-page__stack-wrap"
        style={{ '--stack-space': `${stackSpace}px` }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="nutrition-log-page__card">
          <div className="nutrition-log-page__progress">
            <span className="nutrition-log-page__progress-main">{progressNumerator}</span>
            <span className="nutrition-log-page__progress-sub">/15</span>
          </div>

          <div className="nutrition-log-page__question-row">
            <p className="nutrition-log-page__question">{activeCard.title}</p>
            {activeCard.infoLines?.length ? (
              <button
                type="button"
                className="nutrition-log-page__info-btn"
                onClick={() => setShowInfoPopup(true)}
                aria-label="Open nutrition info"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 0C8.85652 0 10.637 0.737498 11.9497 2.05025C13.2625 3.36301 14 5.14348 14 7C14 8.85652 13.2625 10.637 11.9497 11.9497C10.637 13.2625 8.85652 14 7 14C5.14348 14 3.36301 13.2625 2.05025 11.9497C0.737498 10.637 0 8.85652 0 7C0 5.14348 0.737498 3.36301 2.05025 2.05025C3.36301 0.737498 5.14348 0 7 0ZM8.05 4.29688C8.57031 4.29688 8.99219 3.9375 8.99219 3.40156C8.99219 2.86563 8.57031 2.50625 8.05 2.50625C7.52969 2.50625 7.10938 2.86563 7.10938 3.40156C7.10938 3.9375 7.53125 4.29844 8.05 4.29844M8.23281 9.925C8.23281 9.81875 8.27031 9.54063 8.24844 9.38125L7.42656 10.3281C7.25625 10.5063 7.04375 10.6312 6.94375 10.5984C6.89862 10.5816 6.86096 10.5492 6.83749 10.5071C6.81403 10.4651 6.80627 10.416 6.81563 10.3687L8.18437 6.04063C8.29688 5.49062 7.98906 4.99062 7.33594 4.92656C6.64844 4.92656 5.63281 5.625 5.01562 6.5125C5.01562 6.61875 4.99531 6.88125 5.01562 7.04062L5.8375 6.09375C6.00938 5.91563 6.20625 5.79062 6.30625 5.825C6.35491 5.84336 6.39467 5.87968 6.41734 5.92648C6.44002 5.97328 6.44387 6.027 6.42812 6.07656L5.06875 10.3844C4.9125 10.8875 5.20937 11.3812 5.92969 11.4937C6.99062 11.4937 7.61719 10.8125 8.23438 9.925H8.23281Z" fill="white"/>
                </svg>
              </button>
            ) : null}
          </div>

          {activeCard.helper ? <p className="nutrition-log-page__helper">{activeCard.helper}</p> : null}

          <div className={`nutrition-log-page__chips ${activeCard.multi ? 'nutrition-log-page__chips--multi' : ''}`}>
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
                    <img src={tickIcon} alt="" aria-hidden="true" className="nutrition-log-page__tick" />
                  ) : null}
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {stackCardCount >= 1 ? <div className="nutrition-log-page__stack-card nutrition-log-page__stack-card--one" aria-hidden="true" /> : null}
        {stackCardCount >= 2 ? <div className="nutrition-log-page__stack-card nutrition-log-page__stack-card--two" aria-hidden="true" /> : null}
      </div>

      <p className="nutrition-log-page__swipe-hint">Swipe to go back and forth</p>

      {cardIndex === cards.length - 1 ? (
        <button type="button" className="nutrition-log-page__done" onClick={onDone}>Done</button>
      ) : null}

      {showInfoPopup && activeCard.infoLines?.length ? (
        <div className="nutrition-log-page__info-popup" role="dialog" aria-label="Diet information">
          <div className="nutrition-log-page__info-handle" aria-hidden="true" />
          <button
            type="button"
            className="nutrition-log-page__info-close"
            onClick={() => setShowInfoPopup(false)}
            aria-label="Close diet information"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M12 4L4 12M4 4L12 12" stroke="#9A9A9A" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <ul className="nutrition-log-page__info-list">
            {activeCard.infoLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default NutritionLogPage;
