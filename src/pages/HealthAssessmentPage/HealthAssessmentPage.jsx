import React, { useEffect, useMemo, useRef, useState } from 'react';
import ques1Icon from '../../images/ques-1.svg';
import ques2Icon from '../../images/ques-2.svg';
import ques3Icon from '../../images/ques-3.svg';
import ques4Icon from '../../images/ques-4.svg';
import ques5Icon from '../../images/ques-5.svg';
import quesArrow from '../../images/ques-arrow.svg';
import tickIcon from '../../images/ques-tick.svg';
import AnthInd from '../../images/Anth-Ind.svg';
import './HealthAssessmentPage.css';

const AnthropometryTriangleArrow = ({ direction = 'right' }) => {
  const rotation = direction === 'left' ? '180deg' : direction === 'up' ? '-90deg' : direction === 'down' ? '90deg' : '0deg';
  return (
    <svg style={{ transform: `rotate(${rotation})` }} xmlns="http://www.w3.org/2000/svg" width="13" height="15" viewBox="0 0 13 15" fill="none" aria-hidden="true">
      <path d="M12.2341 8.12403C12.8956 7.73815 12.8956 6.78235 12.2341 6.39647L1.50443 0.137513C0.837772 -0.251371 0.000557121 0.229501 0.000557112 1.00129L0.000556966 13.5192C0.000556957 14.291 0.837771 14.7719 1.50443 14.383L12.2341 8.12403Z" fill="#CC203B"/>
    </svg>
  );
};

const AnthropometryDialIndicator = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="25" viewBox="0 0 36 25" fill="none" aria-hidden="true">
    <path d="M19.7802 0L22.9881 23H36H0H16.1292L19.7802 0Z" fill="#CC203B"/>
    <circle cx="19.5" cy="19.5" r="5.5" fill="#CC203B"/>
  </svg>
);

const AnthropometryUnitDropdown = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="anthropometry-page__unit-wrap">
      <button
        type="button"
        className="anthropometry-page__unit"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {value} <span>▼</span>
      </button>
      {open && (
        <ul className="anthropometry-page__unit-menu" role="listbox">
          {options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                className={`anthropometry-page__unit-option${opt === value ? ' is-active' : ''}`}
                role="option"
                aria-selected={opt === value}
                onClick={() => { onChange(opt); setOpen(false); }}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const EmbeddedAnthropometryPage = ({ onBack, onContinue, questions = [] }) => {
  const [height, setHeight] = useState(172);
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState(33);
  const [heightUnit, setHeightUnit] = useState('cm');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [waistUnit, setWaistUnit] = useState('in');

  const heightTouchLastY = useRef(null);
  const waistTouchLastX = useRef(null);

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const handleHeightWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;
    setHeight((prev) => clamp(prev + delta, 120, 230));
  };

  const handleHeightTouchStart = (e) => {
    heightTouchLastY.current = e.touches[0].clientY;
  };

  const handleHeightTouchMove = (e) => {
    const y = e.touches[0].clientY;
    const delta = heightTouchLastY.current - y;
    if (Math.abs(delta) >= 8) {
      setHeight((prev) => clamp(prev + Math.sign(delta), 120, 230));
      heightTouchLastY.current = y;
    }
  };

  const handleHeightTouchEnd = () => { heightTouchLastY.current = null; };

  const handleWaistWheel = (e) => {
    e.preventDefault();
    const raw = e.deltaX !== 0 ? e.deltaX : e.deltaY;
    const delta = raw > 0 ? 1 : -1;
    setWaist((prev) => clamp(prev + delta, 20, 60));
  };

  const handleWaistTouchStart = (e) => {
    waistTouchLastX.current = e.touches[0].clientX;
  };

  const handleWaistTouchMove = (e) => {
    const x = e.touches[0].clientX;
    const delta = waistTouchLastX.current - x;
    if (Math.abs(delta) >= 8) {
      setWaist((prev) => clamp(prev + Math.sign(delta), 20, 60));
      waistTouchLastX.current = x;
    }
  };

  const handleWaistTouchEnd = () => { waistTouchLastX.current = null; };

  const handleWeightChange = (e) => {
    // Only allow digits while typing — no clamping mid-input.
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
    setWeight(val);
  };

  const handleWeightBlur = () => {
    if (weight === '') return;
    const num = parseInt(weight, 10);
    if (isNaN(num)) { setWeight(''); return; }
    setWeight(String(clamp(num, 20, 250)));
  };

  const getQuestionText = (keys, fallback) => {
    const match = questions.find((question) => keys.includes(String(question?.question_key || '').toLowerCase()));
    return match?.question_text || fallback;
  };

  const heightQuestion = getQuestionText(['height'], 'What is your height?');
  const weightQuestion = getQuestionText(['weight'], 'What is your body weight?');
  const waistQuestion = getQuestionText(['waist_circumference', 'waist'], 'What is your waist size?');

  return (
    <div className="anthropometry-page">
      <div className="anthropometry-page__header">
        <button className="anthropometry-page__back" type="button" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="anthropometry-page__title">Anthropometry</h1>
        <img src={ques1Icon} alt="" aria-hidden="true" className="anthropometry-page__header-icon" />
      </div>

      <p className="anthropometry-page__subtitle">
        Your measurements power our AI to generate accurate metabolic and wellness scores.
      </p>

      <div className="anthropometry-page__content">
      <p className="anthropometry-page__question">{heightQuestion}</p>
      <div
        className="anthropometry-page__box anthropometry-page__height-box"
        onWheel={handleHeightWheel}
        onTouchStart={handleHeightTouchStart}
        onTouchMove={handleHeightTouchMove}
        onTouchEnd={handleHeightTouchEnd}
      >
        <AnthropometryUnitDropdown value={heightUnit} options={['cm', 'in']} onChange={setHeightUnit} />
        <div className="anthropometry-page__faded">{height - 1}</div>
        <div className="anthropometry-page__row-centered">
          <div className="anthropometry-page__arrow-wrap"><AnthropometryTriangleArrow direction="right" /></div>
          <div className="anthropometry-page__selected-box">
            <span className="anthropometry-page__selected-value">{height}</span>
          </div>
          <div className="anthropometry-page__arrow-wrap"><AnthropometryTriangleArrow direction="left" /></div>
        </div>
        <div className="anthropometry-page__faded">{height + 1}</div>
      </div>

      <p className="anthropometry-page__question anthropometry-page__question--mid">{weightQuestion}</p>
      <div className="anthropometry-page__box anthropometry-page__weight-box">
        <AnthropometryUnitDropdown value={weightUnit} options={['kg', 'lb']} onChange={setWeightUnit} />
        <img src={AnthInd} alt="" aria-hidden="true" className="anthropometry-page__dial" />
        <div className="anthropometry-page__selected-box anthropometry-page__selected-box--weight">
          <input
            type="text"
            inputMode="numeric"
            className="anthropometry-page__weight-dial-input"
            value={weight}
            onChange={handleWeightChange}
            onBlur={handleWeightBlur}
            maxLength={3}
            placeholder="00"
            aria-label="Body weight"
          />
        </div>
        <div className="anthropometry-page__indicator">
          <AnthropometryDialIndicator />
        </div>
      </div>

      <p className="anthropometry-page__question anthropometry-page__question--low">{waistQuestion}</p>
      <div
        className="anthropometry-page__box anthropometry-page__waist-box"
        onWheel={handleWaistWheel}
        onTouchStart={handleWaistTouchStart}
        onTouchMove={handleWaistTouchMove}
        onTouchEnd={handleWaistTouchEnd}
      >
        <AnthropometryUnitDropdown value={waistUnit} options={['in', 'cm']} onChange={setWaistUnit} />
        <div className="anthropometry-page__arrow-wrap"><AnthropometryTriangleArrow direction="down" /></div>
        <div className="anthropometry-page__waist-h-row">
          <span className="anthropometry-page__faded anthropometry-page__faded--inline">{waist - 2}</span>
          <span className="anthropometry-page__faded anthropometry-page__faded--inline">{waist - 1}</span>
          <div className="anthropometry-page__selected-box">
            <span className="anthropometry-page__selected-value">{waist}</span>
          </div>
          <span className="anthropometry-page__faded anthropometry-page__faded--inline">{waist + 1}</span>
          <span className="anthropometry-page__faded anthropometry-page__faded--inline">{waist + 2}</span>
        </div>
        <div className="anthropometry-page__arrow-wrap"><AnthropometryTriangleArrow direction="up" /></div>
      </div>
      </div>

      <button type="button" className="anthropometry-page__continue" onClick={onContinue}>Continue</button>
    </div>
  );
};

const FollowupUnitDropdown = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="anthropometry-followup-page__unit-wrap">
      <button
        type="button"
        className="anthropometry-followup-page__unit"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {value} <span>▼</span>
      </button>
      {open && (
        <ul className="anthropometry-followup-page__unit-menu" role="listbox">
          {options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                className={`anthropometry-followup-page__unit-option${opt === value ? ' is-active' : ''}`}
                role="option"
                aria-selected={opt === value}
                onClick={() => { onChange(opt); setOpen(false); }}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const EmbeddedAnthropometryFollowupPage = ({ onBack, onDone }) => {
  const [hipSize, setHipSize] = useState(33);
  const [bodyFat, setBodyFat] = useState(45);
  const [hipUnit, setHipUnit] = useState('in');
  const hipTouchLastX = useRef(null);

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const handleHipWheel = (e) => {
    e.preventDefault();
    const raw = e.deltaX !== 0 ? e.deltaX : e.deltaY;
    const delta = raw > 0 ? 1 : -1;
    setHipSize((prev) => clamp(prev + delta, 20, 60));
  };

  const handleHipTouchStart = (e) => {
    hipTouchLastX.current = e.touches[0].clientX;
  };

  const handleHipTouchMove = (e) => {
    const x = e.touches[0].clientX;
    const delta = hipTouchLastX.current - x;
    if (Math.abs(delta) >= 8) {
      setHipSize((prev) => clamp(prev + Math.sign(delta), 20, 60));
      hipTouchLastX.current = x;
    }
  };

  const handleHipTouchEnd = () => { hipTouchLastX.current = null; };

  return (
    <div className="anthropometry-followup-page">
      <div className="anthropometry-followup-page__header">
        <button className="anthropometry-followup-page__back" type="button" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="anthropometry-followup-page__title">Anthropometry</h1>
        <img src={ques1Icon} alt="" aria-hidden="true" className="anthropometry-followup-page__header-icon" />
      </div>

      <p className="anthropometry-followup-page__subtitle">
        Your measurements power our AI to generate accurate metabolic and wellness scores.
      </p>

      <div className="anthropometry-followup-page__content">
      <p className="anthropometry-followup-page__question anthropometry-followup-page__question--hip">What is your hip size?</p>
      <div
        className="anthropometry-followup-page__box anthropometry-followup-page__hip-box"
        onWheel={handleHipWheel}
        onTouchStart={handleHipTouchStart}
        onTouchMove={handleHipTouchMove}
        onTouchEnd={handleHipTouchEnd}
      >
        <FollowupUnitDropdown value={hipUnit} options={['in', 'cm']} onChange={setHipUnit} />
        <div className="anthropometry-followup-page__arrow-wrap"><AnthropometryTriangleArrow direction="down" /></div>
        <div className="anthropometry-followup-page__hip-h-row">
          <span className="anthropometry-followup-page__faded">{hipSize - 2}</span>
          <span className="anthropometry-followup-page__faded">{hipSize - 1}</span>
          <div className="anthropometry-followup-page__selected-box">
            <span className="anthropometry-followup-page__selected-value">{hipSize}</span>
          </div>
          <span className="anthropometry-followup-page__faded">{hipSize + 1}</span>
          <span className="anthropometry-followup-page__faded">{hipSize + 2}</span>
        </div>
        <div className="anthropometry-followup-page__arrow-wrap"><AnthropometryTriangleArrow direction="up" /></div>
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
      </div>

      <button type="button" className="anthropometry-followup-page__done" onClick={onDone}>Done</button>
    </div>
  );
};

const familyCards = [
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

const familyHelperByQuestionKey = {
  family_health_conditions: '(Select multiple or None that apply)',
  diagnosed_diseases: '(Select multiple or None that apply)',
};

const toFamilyApiCards = (questions = []) => {
  return questions.map((question) => {
    const key = question?.question_key || `question-${question?.question_id}`;
    const isMulti = ['multi_choice', 'multiple_choice'].includes(String(question?.question_type || '').toLowerCase());
    const options = Array.isArray(question?.options)
      ? [...new Set(
          question.options
            .map((option) => option?.display_name || option?.option_value || '')
            .filter(Boolean)
        )]
      : [];

    const normalizedTitle = String(question?.question_text || '').toLowerCase();
    const helper = familyHelperByQuestionKey[key]
      || (normalizedTitle.includes('close blood relatives') ? '(Select multiple or None that apply)' : '')
      || (normalizedTitle.includes('diagnosed with the following') ? '(Select multiple or None that apply)' : '');

    return {
      key,
      title: question?.question_text || '',
      helper,
      infoLines: question?.help_text ? [question.help_text] : undefined,
      options,
      defaultSelected: [],
      multi: isMulti,
    };
  });
};

const shouldUseFullWidthOption = (label) => String(label || '').length > 25;

const EmbeddedFamilyHistoryPage = ({ onBack, onDone, questions = [] }) => {
  const [cardIndex, setCardIndex] = useState(0);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const cardsData = useMemo(() => {
    return Array.isArray(questions) ? toFamilyApiCards(questions) : familyCards;
  }, [questions]);

  const [selections, setSelections] = useState(() => cardsData.reduce((acc, card) => {
    acc[card.key] = [...card.defaultSelected];
    return acc;
  }, {}));
  const touchStartYRef = useRef(null);
  const lastWheelAtRef = useRef(0);

  useEffect(() => {
    setCardIndex(0);
    setShowInfoPopup(false);
    setSelections(cardsData.reduce((acc, card) => {
      acc[card.key] = [...card.defaultSelected];
      return acc;
    }, {}));
  }, [cardsData]);

  const totalCards = Math.max(cardsData.length, 1);
  const activeCard = cardsData[cardIndex] || {
    key: 'empty',
    title: 'No questions available for this category yet.',
    helper: '',
    options: [],
    defaultSelected: [],
    multi: false,
  };
  const activeSelections = selections[activeCard.key] || [];
  const progressNumerator = cardIndex + 1;
  const questionsLeft = totalCards - progressNumerator;
  const stackCardCount = questionsLeft >= 2 ? 2 : questionsLeft;
  const stackSpace = stackCardCount === 2 ? 36 : stackCardCount === 1 ? 18 : 0;

  const chipClass = (opt) => {
    const selected = activeSelections.includes(opt);
    return `family-history-page__chip ${selected ? 'family-history-page__chip--selected' : ''} ${shouldUseFullWidthOption(opt) ? 'family-history-page__chip--full' : ''}`;
  };

  const goPrev = () => {
    setShowInfoPopup(false);
    setCardIndex((prev) => Math.max(0, prev - 1));
  };

  const goNext = () => {
    setShowInfoPopup(false);
    setCardIndex((prev) => Math.min(totalCards - 1, prev + 1));
  };

  const handleTouchStart = (e) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartYRef.current == null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    if (Math.abs(deltaY) > 40) {
      if (deltaY < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
    touchStartYRef.current = null;
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
            <span className="family-history-page__progress-sub">/{totalCards}</span>
          </div>

          <div className="family-history-page__question-row">
            <p className="family-history-page__question">{activeCard.title}</p>
            {activeCard.infoLines?.length ? (
              <button
                type="button"
                className="family-history-page__info-btn"
                onClick={() => setShowInfoPopup((prev) => !prev)}
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

      <p className="family-history-page__swipe-hint">Scroll up / down to navigate</p>

      {cardIndex === totalCards - 1 ? (
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

const lifestyleCards = [
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

const lifestyleHelperByQuestionKey = {
  physical_activity_duration: '(Brisk Walking or Bicycling or Heavy Lifting or Games or Yoga Or Meditation or Cleaning)',
  alcohol_consumption: '(1 serving = 125 ml wine or 330 ml of beer or 40 ml of hard liquor)',
};

const lifestyleFullWidthByQuestionKey = {
  alcohol_consumption: new Set(['3 servings per week or less', 'More than 3 servings per week']),
  lifestyle_priority: new Set([
    'Reducing daily diet intake',
    'Forming healthy habits',
    'Increasing physical activity',
  ]),
};

const toLifestyleApiCards = (questions = []) => {
  return questions.map((question) => {
    const key = question?.question_key || `question-${question?.question_id}`;
    const isMulti = ['multi_choice', 'multiple_choice'].includes(String(question?.question_type || '').toLowerCase());
    const options = Array.isArray(question?.options)
      ? [...new Map(question.options.map((option) => {
          const label = option?.display_name || option?.option_value || '';
          return [label, {
            label,
            fullWidth: lifestyleFullWidthByQuestionKey[key]?.has(label) || shouldUseFullWidthOption(label),
          }];
        })).values()].filter((option) => option.label)
      : [];

    const normalizedTitle = String(question?.question_text || '').toLowerCase();
    const helper = lifestyleHelperByQuestionKey[key]
      || (normalizedTitle.includes('physical activity') ? '(Brisk Walking or Bicycling or Heavy Lifting or Games or Yoga Or Meditation or Cleaning)' : '')
      || (normalizedTitle.includes('alcohol consumption') ? '(1 serving = 125 ml wine or 330 ml of beer or 40 ml of hard liquor)' : '');

    return {
      key,
      title: question?.question_text || '',
      helper,
      infoLines: question?.help_text ? [question.help_text] : undefined,
      options,
      defaultSelected: [],
      multi: isMulti,
      maxSelections: key === 'wellness-priorities' || key === 'wellness_priorities' ? 2 : undefined,
    };
  });
};

const EmbeddedLifestyleHabitsPage = ({ onBack, onDone, questions = [] }) => {
  const [cardIndex, setCardIndex] = useState(0);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const cardsData = useMemo(() => {
    return Array.isArray(questions) ? toLifestyleApiCards(questions) : lifestyleCards;
  }, [questions]);

  const [selections, setSelections] = useState(() => cardsData.reduce((acc, card) => {
    acc[card.key] = [...card.defaultSelected];
    return acc;
  }, {}));
  const touchStartYRef = useRef(null);
  const lastWheelAtRef = useRef(0);

  useEffect(() => {
    setCardIndex(0);
    setShowInfoPopup(false);
    setSelections(cardsData.reduce((acc, card) => {
      acc[card.key] = [...card.defaultSelected];
      return acc;
    }, {}));
  }, [cardsData]);

  const totalCards = Math.max(cardsData.length, 1);
  const activeCard = cardsData[cardIndex] || {
    key: 'empty',
    title: 'No questions available for this category yet.',
    helper: '',
    options: [],
    defaultSelected: [],
    multi: false,
  };
  const activeSelections = selections[activeCard.key] || [];
  const progressNumerator = cardIndex + 1;
  const questionsLeft = totalCards - progressNumerator;
  const stackCardCount = questionsLeft >= 2 ? 2 : questionsLeft;
  const stackSpace = stackCardCount === 2 ? 36 : stackCardCount === 1 ? 18 : 0;

  const chipClass = (option) => {
    const selected = activeSelections.includes(option.label);
    const shouldFill = option.fullWidth || shouldUseFullWidthOption(option.label);
    return `lifestyle-habits-page__chip ${selected ? 'lifestyle-habits-page__chip--selected' : ''} ${shouldFill ? 'lifestyle-habits-page__chip--full' : ''}`;
  };

  const goPrev = () => {
    setShowInfoPopup(false);
    setCardIndex((prev) => Math.max(0, prev - 1));
  };

  const goNext = () => {
    setShowInfoPopup(false);
    setCardIndex((prev) => Math.min(totalCards - 1, prev + 1));
  };

  const handleTouchStart = (e) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartYRef.current == null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    if (Math.abs(deltaY) > 40) {
      if (deltaY < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
    touchStartYRef.current = null;
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
            <span className="lifestyle-habits-page__progress-sub">/{totalCards}</span>
          </div>

          <div className="lifestyle-habits-page__question-row">
            <p className="lifestyle-habits-page__question">{activeCard.title}</p>
            {activeCard.infoLines?.length ? (
              <button
                type="button"
                className="lifestyle-habits-page__info-btn"
                onClick={() => setShowInfoPopup((prev) => !prev)}
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

      <p className="lifestyle-habits-page__swipe-hint">Scroll up / down to navigate</p>

      {cardIndex === totalCards - 1 ? (
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

const nutritionCards = [
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

const nutritionHelperByQuestionKey = {
  daily_food_groups: '(Select all that apply)',
  sugary_drinks_frequency: '(Soft Drinks, Ice Cream, Chocolate, Cakes, Pastries, Candies or Sweets)',
  water_intake_glasses: '(1 glass of water is ~250 ml)',
};

const nutritionFullWidthByQuestionKey = {
  coffee_tea_intake: new Set([
    'I do not drink coffee or tea',
    '2-3 time a week',
    'More than 2 cups per day',
  ]),
};

const toNutritionApiCards = (questions = []) => {
  return questions.map((question) => {
    const key = question?.question_key || `question-${question?.question_id}`;
    const isMulti = ['multi_choice', 'multiple_choice'].includes(String(question?.question_type || '').toLowerCase());
    const options = Array.isArray(question?.options)
      ? [...new Map(question.options.map((option) => {
          const label = option?.display_name || option?.option_value || '';
          return [label, {
            label,
            fullWidth: nutritionFullWidthByQuestionKey[key]?.has(label) || shouldUseFullWidthOption(label),
          }];
        })).values()].filter((option) => option.label)
      : [];

    let helper = nutritionHelperByQuestionKey[key] || '';
    const normalizedTitle = String(question?.question_text || '').toLowerCase();
    if (!helper && normalizedTitle.includes('select all that apply')) {
      helper = '(Select all that apply)';
    }
    if (!helper && normalizedTitle.includes('sugary drinks')) {
      helper = '(Soft Drinks, Ice Cream, Chocolate, Cakes, Pastries, Candies or Sweets)';
    }
    if (!helper && normalizedTitle.includes('glasses of water')) {
      helper = '(1 glass of water is ~250 ml)';
    }

    return {
      key,
      title: question?.question_text || '',
      helper,
      infoLines: question?.help_text ? [question.help_text] : undefined,
      options,
      defaultSelected: [],
      multi: isMulti,
    };
  });
};

const EmbeddedNutritionLogPage = ({ onBack, onDone, questions = [] }) => {
  const [cardIndex, setCardIndex] = useState(0);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const cardsData = useMemo(() => {
    return Array.isArray(questions) ? toNutritionApiCards(questions) : nutritionCards;
  }, [questions]);

  const [selections, setSelections] = useState(() => cardsData.reduce((acc, card) => {
    acc[card.key] = [...card.defaultSelected];
    return acc;
  }, {}));
  const touchStartYRef = useRef(null);
  const lastWheelAtRef = useRef(0);

  useEffect(() => {
    setCardIndex(0);
    setShowInfoPopup(false);
    setSelections(cardsData.reduce((acc, card) => {
      acc[card.key] = [...card.defaultSelected];
      return acc;
    }, {}));
  }, [cardsData]);

  const totalCards = Math.max(cardsData.length, 1);
  const activeCard = cardsData[cardIndex] || {
    key: 'empty',
    title: 'No questions available for this category yet.',
    helper: '',
    options: [],
    defaultSelected: [],
    multi: false,
  };
  const activeSelections = selections[activeCard.key] || [];
  const progressNumerator = cardIndex + 1;
  const questionsLeft = totalCards - progressNumerator;
  const stackCardCount = questionsLeft >= 2 ? 2 : questionsLeft;
  const stackSpace = stackCardCount === 2 ? 36 : stackCardCount === 1 ? 18 : 0;

  const chipClass = (option) => {
    const selected = activeSelections.includes(option.label);
    const shouldFill = option.fullWidth || shouldUseFullWidthOption(option.label);
    return `nutrition-log-page__chip ${selected ? 'nutrition-log-page__chip--selected' : ''} ${shouldFill ? 'nutrition-log-page__chip--full' : ''}`;
  };

  const goPrev = () => {
    setShowInfoPopup(false);
    setCardIndex((prev) => Math.max(0, prev - 1));
  };

  const goNext = () => {
    setShowInfoPopup(false);
    setCardIndex((prev) => Math.min(totalCards - 1, prev + 1));
  };

  const handleTouchStart = (e) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartYRef.current == null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    if (Math.abs(deltaY) > 40) {
      if (deltaY < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
    touchStartYRef.current = null;
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
        <img src={ques4Icon} alt="" aria-hidden="true" className="nutrition-log-page__header-icon" />
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
            <span className="nutrition-log-page__progress-sub">/{totalCards}</span>
          </div>

          <div className="nutrition-log-page__question-row">
            <p className="nutrition-log-page__question">{activeCard.title}</p>
            {activeCard.infoLines?.length ? (
              <button
                type="button"
                className="nutrition-log-page__info-btn"
                onClick={() => setShowInfoPopup((prev) => !prev)}
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

      <p className="nutrition-log-page__swipe-hint">Scroll up / down to navigate</p>

      {cardIndex === totalCards - 1 ? (
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

const formatVitalsTwoDigits = (value) => String(value).padStart(2, '0');

const EmbeddedVitalsPage = ({ onBack, onDone, onSkip, questions = [] }) => {
  const [systolic, setSystolic] = useState(0);
  const [diastolic, setDiastolic] = useState(80);

  const handleNumberInput = (setter) => (e) => {
    const next = Number(e.target.value || 0);
    const clamped = Math.max(0, Math.min(299, next));
    setter(clamped);
  };

  const getQuestionText = (keys, fallback) => {
    const match = questions.find((question) => keys.includes(String(question?.question_key || '').toLowerCase()));
    return match?.question_text || fallback;
  };

  const systolicLabel = getQuestionText(['systolic_blood_pressure', 'systolic'], 'Systolic Blood Pressure');
  const diastolicLabel = getQuestionText(['diastolic_blood_pressure', 'diastolic'], 'Diastolic Blood Pressure');

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

      <p className="vitals-page__label vitals-page__label--first">{systolicLabel}</p>
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
            {formatVitalsTwoDigits(systolic)}
          </span>
        </div>
        <span className="vitals-page__unit">mmHg</span>
      </div>

      <p className="vitals-page__label vitals-page__label--second">{diastolicLabel}</p>
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
            {formatVitalsTwoDigits(diastolic)}
          </span>
        </div>
        <span className="vitals-page__unit">mmHg</span>
      </div>

      <button type="button" className="vitals-page__skip" onClick={onSkip}>Skip</button>
      <button type="button" className="vitals-page__done" onClick={onDone}>Done</button>
    </div>
  );
};

const defaultSteps = [
  { id: 'anthropometry', label: 'Anthropometry', detail: 'Track your height, weight & BMI', icon: ques1Icon, side: 'center' },
  { id: 'family-history', label: 'Family\nHistory', detail: 'Record hereditary health conditions', icon: ques2Icon, side: 'left' },
  { id: 'lifestyle-habits', label: 'Lifestyle &\nHabits', detail: 'Your daily routine & activities', icon: ques3Icon, side: 'right' },
  { id: 'nutrition-log', label: 'Nutrition\nLog', detail: 'Monitor your dietary intake', icon: ques4Icon, side: 'left' },
  { id: 'vitals', label: 'Vitals', detail: 'Blood pressure & more', icon: ques5Icon, side: 'center' },
];

const DOT_LEVELS = [1, 2, 3];
const SEGMENT_GLOW_DOT_LEVELS = [0, 1, 2, 3];

const stepMetaByRoute = {
  anthropometry: { icon: ques1Icon, side: 'center', detail: 'Track your height, weight & BMI' },
  'family-history': { icon: ques2Icon, side: 'left', detail: 'Record hereditary health conditions' },
  'lifestyle-habits': { icon: ques3Icon, side: 'right', detail: 'Your daily routine & activities' },
  'nutrition-log': { icon: ques4Icon, side: 'left', detail: 'Monitor your dietary intake' },
  vitals: { icon: ques5Icon, side: 'center', detail: 'Blood pressure & more' },
};

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

const HealthAssessmentPage = ({
  progress = 0,
  expandedStep = null,
  onExpandStep,
  steps = [],
  questionsByRouteId = {},
  onStepComplete,
  onNavigateHome,
}) => {
  const [activeSubPage, setActiveSubPage] = useState(null);
  const [showFollowup, setShowFollowup] = useState(false);
  const resolvedSteps = defaultSteps.map((defaultStep) => {
    const matchedStep = Array.isArray(steps)
      ? steps.find((step) => step?.routeId === defaultStep.id || step?.id === defaultStep.id)
      : null;
    const meta = stepMetaByRoute[defaultStep.id] || stepMetaByRoute.vitals;

    return {
      id: defaultStep.id,
      label: String(matchedStep?.display_name || defaultStep.label),
      detail: String(meta.detail),
      icon: meta.icon,
      side: meta.side,
    };
  });

  const activeIndex = progress < resolvedSteps.length ? progress : -1;
  const showPill = activeIndex !== -1 && expandedStep === activeIndex;
  const activeY = activeIndex !== -1 ? `var(--y${activeIndex})` : null;
  const lineEndY = progress >= 4 ? 'var(--line-bottom)' : `var(--y${Math.min(progress, 4)})`;
  const hideMiddleDotAtActivePill = showPill && activeIndex >= 1 && activeIndex <= 3;

  const isCompleted = (index) => index < progress;
  const isActive = (index) => index === activeIndex;

  useEffect(() => {
    if (activeIndex === -1 || activeSubPage) {
      return;
    }

    if (expandedStep === activeIndex) {
      return;
    }

    const timer = setTimeout(() => {
      onExpandStep?.(activeIndex);
    }, 1);

    return () => clearTimeout(timer);
  }, [activeIndex, activeSubPage, expandedStep, onExpandStep]);

  if (activeSubPage === 'anthropometry' && !showFollowup) {
    return (
      <EmbeddedAnthropometryPage
        questions={questionsByRouteId['anthropometry'] || []}
        onBack={() => setActiveSubPage(null)}
        onContinue={() => setShowFollowup(true)}
      />
    );
  }

  if (activeSubPage === 'anthropometry' && showFollowup) {
    return (
      <EmbeddedAnthropometryFollowupPage
        onBack={() => setShowFollowup(false)}
        onDone={() => {
          setShowFollowup(false);
          setActiveSubPage(null);
          onStepComplete?.('anthropometry');
        }}
      />
    );
  }

  if (activeSubPage === 'family-history') {
    return (
      <EmbeddedFamilyHistoryPage
        questions={questionsByRouteId['family-history'] || []}
        onBack={() => setActiveSubPage(null)}
        onDone={() => {
          setActiveSubPage(null);
          onStepComplete?.('family-history');
        }}
      />
    );
  }

  if (activeSubPage === 'lifestyle-habits') {
    return (
      <EmbeddedLifestyleHabitsPage
        questions={questionsByRouteId['lifestyle-habits'] || []}
        onBack={() => setActiveSubPage(null)}
        onDone={() => {
          setActiveSubPage(null);
          onStepComplete?.('lifestyle-habits');
        }}
      />
    );
  }

  if (activeSubPage === 'nutrition-log') {
    return (
      <EmbeddedNutritionLogPage
        questions={questionsByRouteId['nutrition-log'] || []}
        onBack={() => setActiveSubPage(null)}
        onDone={() => {
          setActiveSubPage(null);
          onStepComplete?.('nutrition-log');
        }}
      />
    );
  }

  if (activeSubPage === 'vitals') {
    return (
      <EmbeddedVitalsPage
        questions={questionsByRouteId['vitals'] || []}
        onBack={() => setActiveSubPage(null)}
        onDone={() => {
          setActiveSubPage(null);
          onStepComplete?.('vitals');
          onNavigateHome?.();
        }}
        onSkip={() => {
          setActiveSubPage(null);
          onStepComplete?.('vitals');
          onNavigateHome?.();
        }}
      />
    );
  }

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

        {resolvedSteps.map((step, index) => {
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
                  onClick={() => setActiveSubPage(step.id)}
                  style={getPillPositionStyle()}
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
