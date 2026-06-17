import React, { useEffect, useMemo, useRef, useState } from 'react';
import './PackageOnboardingMcqPage.css';
import tickIcon from '../../images/ques-tick.svg';
import {
  getConcernOptionsForGender,
  PERSONA_OPTIONS,
} from '../../utils/packageRecommendationEngine';

const CARD_KEYS = {
  persona: 'persona',
  primaryGoal: 'primaryGoal',
  otherGoals: 'otherGoals',
};

const HEALTH_GOAL_OPTIONS = [
  { label: 'Improving Metabolic Health', fullWidth: true },
  { label: 'Increasing Energy Levels', fullWidth: true },
  { label: 'Improving Physical Endurance', fullWidth: true },
  { label: 'Building Muscle Mass', fullWidth: true },
  { label: 'Weight Loss' },
  { label: 'Increasing Strength' },
];

const THIRD_QUESTION_EXCLUDED_OPTIONS = new Set([
  'Weight Loss',
  'Building Muscle Mass',
  'Increasing Energy Levels',
  'Improving Metabolic Health',
  'Improving Physical Endurance',
  'Increasing Strength',
]);

const MAX_MULTI_SELECT = 2;

const SCROLL_EDGE_TOLERANCE = 8;

/** After the last wheel tick, wait this long before allowing the next card swipe. */
const WHEEL_GESTURE_END_MS = 480;

const chipsListCanScroll = (element) => (
  Boolean(element) && element.scrollHeight > element.clientHeight + SCROLL_EDGE_TOLERANCE
);

const isChipsScrolledToTop = (element) => (
  !element || element.scrollTop <= SCROLL_EDGE_TOLERANCE
);

const isChipsScrolledToBottom = (element) => {
  if (!element) {
    return true;
  }
  if (!chipsListCanScroll(element)) {
    return true;
  }
  return element.scrollTop + element.clientHeight >= element.scrollHeight - SCROLL_EDGE_TOLERANCE;
};

const shouldUseFullWidthOption = (label) => {
  const text = String(label || '');
  return text.length > 18 || text.includes('/') || text.includes('&');
};

const buildMixedLayoutOptions = (labels = []) => {
  const options = labels.map((label) => ({
    label,
    fullWidth: shouldUseFullWidthOption(label),
  }));

  return options.sort((a, b) => {
    if (a.fullWidth === b.fullWidth) {
      return 0;
    }
    return a.fullWidth ? -1 : 1;
  });
};

const getChipsLayoutClass = (layout) => {
  switch (layout) {
    case 'mixed':
      return 'package-onboarding-mcq__chips--mixed';
    default:
      return 'package-onboarding-mcq__chips--grid';
  }
};

const useCenteredQuestionGap = (deps = []) => {
  const subtitleRef = useRef(null);
  const stackWrapRef = useRef(null);
  const [stackTopGap, setStackTopGap] = useState(141);
  const depsKey = useMemo(() => JSON.stringify(deps), [deps]);

  useEffect(() => {
    let frameId;

    const recalc = () => {
      if (!subtitleRef.current || !stackWrapRef.current) {
        return;
      }
      const subtitleBottom = subtitleRef.current.getBoundingClientRect().bottom;
      const stackHeight = stackWrapRef.current.offsetHeight;
      const gap = Math.max(16, Math.round((window.innerHeight - subtitleBottom - stackHeight) / 2) - 30);
      setStackTopGap(gap);
    };

    const scheduleRecalc = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(recalc);
    };

    scheduleRecalc();
    window.addEventListener('resize', scheduleRecalc);

    const observer = new ResizeObserver(scheduleRecalc);
    if (stackWrapRef.current) {
      observer.observe(stackWrapRef.current);
    }

    return () => {
      window.removeEventListener('resize', scheduleRecalc);
      observer.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, [depsKey]);

  return { subtitleRef, stackWrapRef, stackTopGap };
};

const getMinSelectionsForCard = (card) => {
  if (card.key === CARD_KEYS.persona) {
    return 1;
  }
  if (card.multi && card.maxSelect === MAX_MULTI_SELECT) {
    return MAX_MULTI_SELECT;
  }
  return 1;
};

const meetsCardSelectionRequirement = (card, selectedItems) => {
  if (card.optional) {
    return true;
  }
  const count = Array.isArray(selectedItems) ? selectedItems.length : 0;
  return count >= getMinSelectionsForCard(card);
};

const PackageOnboardingMcqPage = ({
  isOverlay = false,
  onBack,
  onSkip,
  onComplete,
  profileGender = null,
}) => {
  const concernOptions = useMemo(
    () => getConcernOptionsForGender(profileGender),
    [profileGender],
  );

  const cardsData = useMemo(() => ([
    {
      key: CARD_KEYS.persona,
      title: 'What best describes you?',
      multi: false,
      optional: false,
      options: PERSONA_OPTIONS.map((label) => ({ label })),
    },
    {
      key: CARD_KEYS.primaryGoal,
      title: 'What are your Health goals?',
      helper: '(Select your top two priorities)',
      multi: true,
      maxSelect: MAX_MULTI_SELECT,
      layout: 'mixed',
      optional: false,
      options: HEALTH_GOAL_OPTIONS,
    },
    {
      key: CARD_KEYS.otherGoals,
      title: 'What are your Health Concern?',
      helper: '(Select your top two priorities)',
      multi: true,
      maxSelect: MAX_MULTI_SELECT,
      layout: 'mixed',
      optional: false,
      options: buildMixedLayoutOptions(
        concernOptions.filter((label) => !THIRD_QUESTION_EXCLUDED_OPTIONS.has(label)),
      ),
    },
  ]), [concernOptions]);

  const [cardIndex, setCardIndex] = useState(0);
  const [selections, setSelections] = useState({
    [CARD_KEYS.persona]: [],
    [CARD_KEYS.primaryGoal]: [],
    [CARD_KEYS.otherGoals]: [],
  });

  const touchStartYRef = useRef(null);
  const touchStartXRef = useRef(null);
  const touchStartScrollTopRef = useRef(0);
  const wheelGestureConsumedRef = useRef(false);
  const wheelGestureEndTimerRef = useRef(null);
  const cardRef = useRef(null);
  const chipsScrollRef = useRef(null);

  useEffect(() => () => {
    if (wheelGestureEndTimerRef.current) {
      clearTimeout(wheelGestureEndTimerRef.current);
    }
  }, []);

  const totalCards = cardsData.length;
  const activeCard = cardsData[cardIndex] || cardsData[0];

  const activeCardVisibleOptions = useMemo(
    () => activeCard.options || [],
    [activeCard],
  );

  const activeSelections = useMemo(() => {
    const value = selections[activeCard.key];
    return Array.isArray(value) ? value : [];
  }, [selections, activeCard.key]);

  const progressNumerator = cardIndex + 1;
  const questionsLeft = totalCards - progressNumerator;
  const stackCardCount = questionsLeft >= 2 ? 2 : questionsLeft;
  const stackSpace = stackCardCount === 2 ? 36 : stackCardCount === 1 ? 18 : 0;

  const { subtitleRef, stackWrapRef, stackTopGap } = useCenteredQuestionGap([
    cardIndex,
    stackSpace,
    activeCard.title,
    activeCardVisibleOptions.length,
  ]);

  useEffect(() => {
    if (chipsScrollRef.current) {
      chipsScrollRef.current.scrollTop = 0;
    }
  }, [cardIndex, activeCard.key]);

  useEffect(() => {
    const stackEl = stackWrapRef.current;
    if (!stackEl) {
      return undefined;
    }

    const onTouchMove = (event) => {
      if (touchStartYRef.current == null || touchStartXRef.current == null) {
        return;
      }

      const chipsEl = chipsScrollRef.current;
      const currentY = event.touches[0]?.clientY;
      const currentX = event.touches[0]?.clientX;
      if (!Number.isFinite(currentY) || !Number.isFinite(currentX)) {
        return;
      }

      const deltaY = currentY - touchStartYRef.current;
      const deltaX = currentX - touchStartXRef.current;

      if (chipsEl && chipsListCanScroll(chipsEl)) {
        const scrollMoved = Math.abs(chipsEl.scrollTop - touchStartScrollTopRef.current) > 8;
        if (scrollMoved) {
          return;
        }

        if (deltaY < 0 && !isChipsScrolledToBottom(chipsEl)) {
          return;
        }

        if (deltaY > 0 && !isChipsScrolledToTop(chipsEl)) {
          return;
        }
      }

      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 4) {
        event.preventDefault();
      }
    };

    stackEl.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      stackEl.removeEventListener('touchmove', onTouchMove);
    };
  }, [cardIndex, activeCard.key, stackWrapRef]);

  const canNavigateToNextCard = () => isChipsScrolledToBottom(chipsScrollRef.current);
  const canNavigateToPrevCard = () => isChipsScrolledToTop(chipsScrollRef.current);

  const chipClass = (option) => {
    const selected = activeSelections.includes(option.label);
    const shouldFill = activeCard.layout === 'mixed' && Boolean(option.fullWidth);
    return [
      'package-onboarding-mcq__chip',
      selected ? 'package-onboarding-mcq__chip--selected' : '',
      shouldFill ? 'package-onboarding-mcq__chip--full' : '',
    ].filter(Boolean).join(' ');
  };

  const goPrev = () => {
    setCardIndex((prev) => Math.max(0, prev - 1));
  };

  const goNext = () => {
    setCardIndex((prev) => Math.min(totalCards - 1, prev + 1));
  };

  const triggerCardShake = () => {
    const cardElement = cardRef.current;
    if (!cardElement) {
      return;
    }

    cardElement.classList.remove('is-shaking');
    void cardElement.offsetWidth;
    cardElement.classList.add('is-shaking');
  };

  const attemptGoNext = () => {
    if (cardIndex >= totalCards - 1) {
      return;
    }
    if (!meetsCardSelectionRequirement(activeCard, activeSelections)) {
      triggerCardShake();
      return;
    }
    goNext();
  };

  const attemptGoPrev = () => {
    if (cardIndex <= 0) {
      return;
    }
    goPrev();
  };

  const handleTouchStart = (event) => {
    touchStartYRef.current = event.touches[0].clientY;
    touchStartXRef.current = event.touches[0].clientX;
    touchStartScrollTopRef.current = chipsScrollRef.current?.scrollTop ?? 0;
  };

  const handleTouchEnd = (event) => {
    if (touchStartYRef.current == null) {
      return;
    }

    const chipsEl = chipsScrollRef.current;
    const scrollMoved = chipsEl
      && Math.abs(chipsEl.scrollTop - touchStartScrollTopRef.current) > 8;

    if (scrollMoved) {
      touchStartYRef.current = null;
      touchStartXRef.current = null;
      return;
    }

    const deltaY = event.changedTouches[0].clientY - touchStartYRef.current;
    if (Math.abs(deltaY) > 40) {
      if (deltaY < 0) {
        if (canNavigateToNextCard()) {
          attemptGoNext();
        }
      } else {
        attemptGoPrev();
      }
    }
    touchStartYRef.current = null;
    touchStartXRef.current = null;
  };

  const scrollChipsByWheel = (event) => {
    const chipsEl = chipsScrollRef.current;
    if (!chipsEl || !chipsListCanScroll(chipsEl)) {
      return false;
    }

    const scrollingDown = event.deltaY > 0;
    const scrollingUp = event.deltaY < 0;

    if (scrollingDown && !isChipsScrolledToBottom(chipsEl)) {
      chipsEl.scrollTop += event.deltaY;
      event.preventDefault();
      return true;
    }

    if (scrollingUp && !isChipsScrolledToTop(chipsEl)) {
      chipsEl.scrollTop += event.deltaY;
      event.preventDefault();
      return true;
    }

    return false;
  };

  const handleChipsWheel = (event) => {
    if (scrollChipsByWheel(event)) {
      event.stopPropagation();
    }
  };

  const scheduleWheelGestureEnd = () => {
    if (wheelGestureEndTimerRef.current) {
      clearTimeout(wheelGestureEndTimerRef.current);
    }
    wheelGestureEndTimerRef.current = setTimeout(() => {
      wheelGestureConsumedRef.current = false;
      wheelGestureEndTimerRef.current = null;
    }, WHEEL_GESTURE_END_MS);
  };

  const handleWheel = (event) => {
    if (scrollChipsByWheel(event)) {
      return;
    }

    event.preventDefault();
    scheduleWheelGestureEnd();

    if (wheelGestureConsumedRef.current) {
      return;
    }

    if (event.deltaY > 0) {
      if (!canNavigateToNextCard()) {
        return;
      }
      wheelGestureConsumedRef.current = true;
      attemptGoNext();
      return;
    }

    if (event.deltaY < 0) {
      if (!canNavigateToPrevCard()) {
        return;
      }
      wheelGestureConsumedRef.current = true;
      attemptGoPrev();
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
      if (!exists && activeCard.maxSelect && current.length >= activeCard.maxSelect) {
        return prev;
      }

      const next = exists
        ? current.filter((item) => item !== optionLabel)
        : [...current, optionLabel];

      return {
        ...prev,
        [activeCard.key]: next,
      };
    });
  };

  const handleDone = () => {
    const personaSelections = selections[CARD_KEYS.persona] || [];
    const healthGoals = selections[CARD_KEYS.primaryGoal] || [];
    const healthConcerns = selections[CARD_KEYS.otherGoals] || [];

    if (
      personaSelections.length < 1
      || healthGoals.length < MAX_MULTI_SELECT
      || healthConcerns.length < MAX_MULTI_SELECT
    ) {
      triggerCardShake();
      return;
    }

    const persona = personaSelections[0] || '';

    const primaryConcern = healthGoals[0];
    const otherConcerns = [
      ...healthGoals.slice(1),
      ...healthConcerns.filter(
        (concern) => concern !== primaryConcern && !healthGoals.includes(concern),
      ),
    ];

    onComplete?.({
      persona,
      primaryConcern,
      otherConcerns,
    });
  };

  return (
    <div
      className={`package-onboarding-mcq${isOverlay ? ' package-onboarding-mcq--overlay' : ''}`}
      role={isOverlay ? 'dialog' : undefined}
      aria-modal={isOverlay ? 'true' : undefined}
      aria-label={isOverlay ? 'Package recommendation questions' : undefined}
    >
      <div className="package-onboarding-mcq__header">
        <div className="package-onboarding-mcq__header-main">
          <button className="package-onboarding-mcq__back" type="button" onClick={onBack} aria-label="Go back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="package-onboarding-mcq__title">Packages</h1>
        </div>
      </div>

      <p className="package-onboarding-mcq__subtitle" ref={subtitleRef}>
        Answer a few quick questions so we can recommend the right health packages for you.
      </p>

      <div
        className="package-onboarding-mcq__stack-wrap"
        ref={stackWrapRef}
        style={{ marginTop: `${stackTopGap}px` }}
      >
        {onSkip ? (
          <button
            type="button"
            className="package-onboarding-mcq__close"
            onClick={onSkip}
            aria-label="Skip questions"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="16" fill="#063533" />
              <path d="M23.1992 8.75C23.2127 8.75003 23.2258 8.75513 23.2354 8.76465C23.2449 8.77417 23.25 8.78732 23.25 8.80078C23.25 8.81422 23.2448 8.82738 23.2354 8.83691L16.6006 15.4697L16.0703 16L16.6006 16.5303L23.2354 23.1631C23.2448 23.1726 23.25 23.1858 23.25 23.1992C23.25 23.2127 23.2449 23.2258 23.2354 23.2354C23.2258 23.2449 23.2127 23.25 23.1992 23.25C23.1858 23.25 23.1726 23.2448 23.1631 23.2354L16.5303 16.6006L16 16.0703L15.4697 16.6006L8.83691 23.2354C8.82738 23.2448 8.81422 23.25 8.80078 23.25C8.78732 23.25 8.77417 23.2449 8.76465 23.2354C8.75513 23.2258 8.75003 23.2127 8.75 23.1992C8.75 23.1858 8.75518 23.1726 8.76465 23.1631L15.3994 16.5303L15.9297 16L15.3994 15.4697L8.76465 8.83691C8.75998 8.83221 8.75644 8.82643 8.75391 8.82031C8.75136 8.81415 8.75 8.80745 8.75 8.80078C8.75002 8.79414 8.75136 8.78739 8.75391 8.78125C8.75646 8.77514 8.75996 8.76933 8.76465 8.76465C8.76933 8.75996 8.77514 8.75646 8.78125 8.75391C8.78739 8.75136 8.79414 8.75002 8.80078 8.75C8.80745 8.75 8.81415 8.75136 8.82031 8.75391C8.82643 8.75644 8.83221 8.75998 8.83691 8.76465L15.4697 15.3994L16 15.9297L16.5303 15.3994L23.1631 8.76465C23.1726 8.75518 23.1858 8.75 23.1992 8.75Z" fill="white" stroke="white" strokeWidth="1.5" />
            </svg>
          </button>
        ) : null}

        <div
          key={activeCard.key}
          ref={cardRef}
          className="package-onboarding-mcq__card"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          <div className="package-onboarding-mcq__card-inner">
            <div className="package-onboarding-mcq__progress">
              <span className="package-onboarding-mcq__progress-main">{progressNumerator}</span>
              <span className="package-onboarding-mcq__progress-sub">/{totalCards}</span>
            </div>

            <div className="package-onboarding-mcq__question-block">
              <div className="package-onboarding-mcq__question-row">
                <p className="package-onboarding-mcq__question">{activeCard.title}</p>
                {activeCard.helper ? (
                  <p className="package-onboarding-mcq__helper">{activeCard.helper}</p>
                ) : null}
              </div>

              <div
                ref={chipsScrollRef}
                className="package-onboarding-mcq__chips-scroll"
                onWheel={handleChipsWheel}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div className={`package-onboarding-mcq__chips ${getChipsLayoutClass(activeCard.layout)}`}>
                  {activeCardVisibleOptions.map((option) => {
                    const selected = activeSelections.includes(option.label);
                    const showTick = selected && activeCard.multi;
                    return (
                      <button
                        key={option.label}
                        type="button"
                        className={chipClass(option)}
                        onClick={() => handleChipClick(option.label)}
                        aria-pressed={selected}
                      >
                        {showTick ? (
                          <img src={tickIcon} alt="" aria-hidden="true" className="package-onboarding-mcq__tick" />
                        ) : null}
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {stackCardCount > 0 ? (
          <div
            className={`package-onboarding-mcq__stack-deck${stackCardCount === 1 ? ' package-onboarding-mcq__stack-deck--one' : ''}`}
            style={{ '--stack-peek': `${stackSpace}px` }}
            aria-hidden="true"
          >
            {stackCardCount >= 2 ? (
              <div className="package-onboarding-mcq__stack-card package-onboarding-mcq__stack-card--two" />
            ) : null}
            <div className="package-onboarding-mcq__stack-card package-onboarding-mcq__stack-card--one" />
          </div>
        ) : null}
      </div>

      <p className="package-onboarding-mcq__swipe-hint">Swipe to go back and forth</p>

      {cardIndex === totalCards - 1 ? (
        <button type="button" className="package-onboarding-mcq__done" onClick={handleDone}>
          See my packages
        </button>
      ) : null}
    </div>
  );
};

export default PackageOnboardingMcqPage;
