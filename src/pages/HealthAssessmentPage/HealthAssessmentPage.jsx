import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getMyProfileCached } from '../../services/profileService';
import {
  computeQuestionsWithVisibility,
  getQuestionnairePreferencesFromProfile,
  hasNutritionLogQuestionnaireDraft,
  hasSubmittedHealthQuestionnaire,
  pruneSelectionsForVisibleCards,
} from '../../services/questionnaireService';
import ques1Icon from '../../images/ques-1.svg';
import ques2Icon from '../../images/ques-2.svg';
import ques3Icon from '../../images/ques-3.svg';
import ques4Icon from '../../images/ques-4.svg';
import ques5Icon from '../../images/ques-5.svg';
import tickIcon from '../../images/ques-tick.svg';
import AnthInd from '../../images/Anth-Ind.svg';
import waistGif from '../../images/waist-gif.gif';
import hipGif from '../../images/hip-gif.gif';
import './HealthAssessmentPage.css';
import HealthAssessmentScenario2Category from './HealthAssessmentScenario2Category';
import { PageBackdrop } from '../../newDesQues/components/PageBackdrop';
import { HealthAssessmentStep } from '../../newDesQues/components/HealthAssessmentStep';
import { SectionCompleteHub } from '../../newDesQues/components/SectionCompleteHub';
import backgroundAssessmentSvg from '../../newDesQues/assets/Background.svg';
import familyHistoryBackgroundSvg from '../../newDesQues/assets/family history.svg';
import lifestyleHabitsBackgroundSvg from '../../newDesQues/assets/lifestyle-habits/background.svg';
import nutritionLogBackgroundSvg from '../../newDesQues/assets/nutritionlogstart.svg';
import nutritionEndBackgroundSvg from '../../newDesQues/assets/nutritionend.svg';

const HA_ROUTE_CATEGORY_KEY = {
  anthropometry: 'anthropometry',
  'family-history': 'family_history',
  'lifestyle-habits': 'lifestyle_habits',
  'nutrition-log': 'nutrition_log',
  vitals: 'vitals',
};

const HA_ROUTE_HUB_VARIANT = {
  anthropometry: 'anthropometry',
  'family-history': 'family',
  'lifestyle-habits': 'lifestyle',
  'nutrition-log': 'nutrition',
  vitals: 'vitals',
};

const haHubBackdropForVariant = (variant) => {
  if (variant === 'lifestyle') return lifestyleHabitsBackgroundSvg;
  if (variant === 'nutrition') return nutritionLogBackgroundSvg;
  if (variant === 'family') return familyHistoryBackgroundSvg;
  if (variant === 'vitals') return nutritionEndBackgroundSvg;
  return backgroundAssessmentSvg;
};

const AnthropometryTriangleArrow = ({ direction = 'right' }) => {
  const rotation = direction === 'left' ? '180deg' : direction === 'up' ? '-90deg' : direction === 'down' ? '90deg' : '0deg';
  return (
    <svg style={{ transform: `rotate(${rotation})` }} xmlns="http://www.w3.org/2000/svg" width="13" height="15" viewBox="0 0 13 15" fill="none" aria-hidden="true">
      <path d="M12.2341 8.12403C12.8956 7.73815 12.8956 6.78235 12.2341 6.39647L1.50443 0.137513C0.837772 -0.251371 0.000557121 0.229501 0.000557112 1.00129L0.000556966 13.5192C0.000556957 14.291 0.837771 14.7719 1.50443 14.383L12.2341 8.12403Z" fill="#CC203B"/>
    </svg>
  );
};

const AnthropometryDialIndicator = ({ angle = 0 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="25" viewBox="0 0 36 25" fill="none" aria-hidden="true">
    <path
      className="anthropometry-page__indicator-needle"
      d="M19.7802 0L22.9881 23H36H0H16.1292L19.7802 0Z"
      fill="#CC203B"
      style={{ transform: `rotate(${angle}deg)`, transformOrigin: '19.5px 19.5px' }}
    />
    <circle cx="19.5" cy="19.5" r="5.5" fill="#CC203B"/>
  </svg>
);

const UnitDropdownArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 10 7" fill="none" aria-hidden="true">
    <path d="M3.74486 6.56097C4.14368 7.11932 4.97351 7.11932 5.37233 6.56097L8.92914 1.58143C9.4019 0.919565 8.92878 0.000194936 8.1154 0.000194864L1.00178 0.000194243C0.18841 0.000194171 -0.284713 0.919564 0.18805 1.58143L3.74486 6.56097Z" fill="white"/>
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
        {value} <span className="anthropometry-page__unit-arrow"><UnitDropdownArrow /></span>
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

const normalizeUnitToken = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const roundToWholeNumber = (value, fallback = 0) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return Math.round(numericValue);
};

const MIN_HEIGHT_CM = 50;
const MAX_HEIGHT_CM = 250;
const MIN_HEIGHT_INCHES = 17;
const MAX_HEIGHT_INCHES = 101;
const DEFAULT_HEIGHT_CM = 165;
const DEFAULT_HEIGHT_FEET = 5;
const DEFAULT_HEIGHT_INCHES = 5;

const MIN_WAIST_CM = 60;
const MAX_WAIST_CM = 150;
const MIN_WAIST_IN = 24;
const MAX_WAIST_IN = 59;
const DEFAULT_WAIST_CM = 90;
const DEFAULT_WAIST_IN = 35;

const MIN_HIP_CM = 70;
const MAX_HIP_CM = 160;
const MIN_HIP_IN = 28;
const MAX_HIP_IN = 62;
const DEFAULT_HIP_CM = 95;
const DEFAULT_HIP_IN = 37;

const MIN_WEIGHT_KG = 20;
const MAX_WEIGHT_KG = 130;
const MIN_WEIGHT_LB = 44;
const MAX_WEIGHT_LB = 660;

const resolvePreferredUnitOption = (options = [], preferredUnit = '', fallback = '-') => {
  if (!Array.isArray(options) || options.length === 0) {
    return fallback;
  }

  const normalizedPreferred = normalizeUnitToken(preferredUnit);
  if (!normalizedPreferred) {
    return options[0];
  }

  const byExact = options.find((option) => normalizeUnitToken(option) === normalizedPreferred);
  if (byExact) {
    return byExact;
  }

  const byPartial = options.find((option) => {
    const normalizedOption = normalizeUnitToken(option);
    return normalizedOption.includes(normalizedPreferred) || normalizedPreferred.includes(normalizedOption);
  });
  if (byPartial) {
    return byPartial;
  }

  const unitMatchers = [
    {
      match: (token) => isFeetInchesUnit(token),
      optionMatch: (optionToken) => isFeetInchesUnit(optionToken),
    },
    {
      match: (token) => isCentimeterUnit(token),
      optionMatch: (optionToken) => isCentimeterUnit(optionToken),
    },
    {
      match: (token) => token === 'kg' || token.includes('kilogram'),
      optionMatch: (optionToken) => optionToken === 'kg' || optionToken.includes('kilogram'),
    },
    {
      match: (token) => token === 'lb' || token === 'lbs' || token.includes('pound'),
      optionMatch: (optionToken) => optionToken === 'lb' || optionToken === 'lbs' || optionToken.includes('pound'),
    },
    {
      match: (token) => token === 'in' || token.includes('inch'),
      optionMatch: (optionToken) => optionToken === 'in' || optionToken.includes('inch'),
    },
  ];

  const matchedGroup = unitMatchers.find((matcher) => matcher.match(normalizedPreferred));
  if (matchedGroup) {
    const byGroup = options.find((option) => matchedGroup.optionMatch(normalizeUnitToken(option)));
    if (byGroup) {
      return byGroup;
    }
  }

  return options[0];
};

const resolveUnitLabelFromQuestion = (question, unitValue = '') => {
  const normalizedUnit = String(unitValue || '').trim();
  if (!normalizedUnit || !Array.isArray(question?.options)) {
    return normalizedUnit;
  }

  const byExactOptionValue = question.options.find((option) => {
    return String(option?.option_value || '').trim() === normalizedUnit;
  });
  if (byExactOptionValue) {
    return String(byExactOptionValue.display_name || byExactOptionValue.option_value || normalizedUnit).trim();
  }

  const normalizedTarget = normalizeUnitToken(normalizedUnit);
  const byDisplayMatch = question.options.find((option) => {
    const displayToken = normalizeUnitToken(option?.display_name || '');
    const valueToken = normalizeUnitToken(option?.option_value || '');
    return displayToken === normalizedTarget || valueToken === normalizedTarget;
  });

  if (byDisplayMatch) {
    return String(byDisplayMatch.display_name || byDisplayMatch.option_value || normalizedUnit).trim();
  }

  return normalizedUnit;
};

const isFeetInchesUnit = (value) => {
  const token = normalizeUnitToken(value);
  return token.includes('ftin')
    || token.includes('feetinch')
    || token.includes('footinch')
    || token === 'ft'
    || token === 'feet'
    || token === 'foot'
    || token.includes('feet')
    || token.includes('foot');
};

const isCentimeterUnit = (value) => {
  const token = normalizeUnitToken(value);
  return token === 'cm' || token.includes('centimeter') || token.includes('centimetre');
};

const isInchUnit = (value) => {
  const token = normalizeUnitToken(value);
  return token === 'in' || token === 'inch' || token.includes('inches');
};

const isPoundUnit = (value) => {
  const token = normalizeUnitToken(value);
  return token === 'lb' || token === 'lbs' || token.includes('pound');
};

const getWeightRangeForUnit = (unit) => {
  if (isPoundUnit(unit)) {
    return { min: MIN_WEIGHT_LB, max: MAX_WEIGHT_LB };
  }
  return { min: MIN_WEIGHT_KG, max: MAX_WEIGHT_KG };
};

const getCircumferenceRangeForUnit = (unit, kind = 'waist') => {
  if (isCentimeterUnit(unit)) {
    if (kind === 'hip') {
      return {
        min: MIN_HIP_CM,
        max: MAX_HIP_CM,
        defaultValue: DEFAULT_HIP_CM,
      };
    }
    return {
      min: MIN_WAIST_CM,
      max: MAX_WAIST_CM,
      defaultValue: DEFAULT_WAIST_CM,
    };
  }

  if (kind === 'hip') {
    return {
      min: MIN_HIP_IN,
      max: MAX_HIP_IN,
      defaultValue: DEFAULT_HIP_IN,
    };
  }

  return {
    min: MIN_WAIST_IN,
    max: MAX_WAIST_IN,
    defaultValue: DEFAULT_WAIST_IN,
  };
};

const isMeterUnit = (value) => {
  const token = normalizeUnitToken(value);
  return token === 'm' || token === 'meter' || token === 'metre' || token.includes('meters') || token.includes('metres');
};

const convertHeightToCm = (value, unit) => {
  if (!Number.isFinite(value)) {
    return null;
  }

  if (isFeetInchesUnit(unit)) {
    return value * 30.48;
  }

  if (isInchUnit(unit)) {
    return value * 2.54;
  }

  if (isMeterUnit(unit)) {
    return value * 100;
  }

  return value;
};

const getQuestionOptionLabel = (option) => String(option?.display_name || option?.option_value || '').trim();

const findQuestionByAliasesAndHints = (questions = [], aliases = [], hints = []) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    return null;
  }

  const normalizedAliases = aliases.map((alias) => normalizeUnitToken(alias)).filter(Boolean);
  const normalizedHints = hints.map((hint) => normalizeUnitToken(hint)).filter(Boolean);

  const byExactKey = questions.find((question) => {
    const key = normalizeUnitToken(question?.question_key);
    return key && normalizedAliases.includes(key);
  });
  if (byExactKey) return byExactKey;

  const byPartialKey = questions.find((question) => {
    const key = normalizeUnitToken(question?.question_key);
    return key && normalizedAliases.some((alias) => key.includes(alias) || alias.includes(key));
  });
  if (byPartialKey) return byPartialKey;

  return questions.find((question) => {
    const questionText = normalizeUnitToken(question?.question_text);
    return questionText && normalizedHints.some((hint) => questionText.includes(hint));
  }) || null;
};

const extractUnitOptionsFromQuestion = (question) => {
  const apiOptions = Array.isArray(question?.options)
    ? question.options.map(getQuestionOptionLabel).filter(Boolean)
    : [];

  const uniqueApiOptions = [...new Set(apiOptions)];
  return uniqueApiOptions.length > 0 ? uniqueApiOptions : ['-'];
};

const prioritizeHeightUnitOptions = (options = []) => {
  const normalizedOptions = Array.isArray(options) ? options.filter(Boolean) : [];
  if (normalizedOptions.length === 0) {
    return ['ft/in', 'cm'];
  }

  const feetOption = normalizedOptions.find((option) => isFeetInchesUnit(option));
  const cmOption = normalizedOptions.find((option) => isCentimeterUnit(option));
  const prioritized = [];

  if (feetOption) {
    prioritized.push(feetOption);
  } else {
    prioritized.push('ft/in');
  }

  if (cmOption) {
    prioritized.push(cmOption);
  } else {
    prioritized.push('cm');
  }

  for (const option of normalizedOptions) {
    if (!prioritized.some((existing) => normalizeUnitToken(existing) === normalizeUnitToken(option))) {
      prioritized.push(option);
    }
  }

  return prioritized;
};

const prioritizeCircumferenceUnitOptions = (options = []) => {
  const normalizedOptions = Array.isArray(options) ? options.filter(Boolean) : [];
  if (normalizedOptions.length === 0) {
    return ['In', 'cm'];
  }

  const inchOption = normalizedOptions.find((option) => isInchUnit(option));
  const cmOption = normalizedOptions.find((option) => isCentimeterUnit(option));
  const prioritized = [];

  if (inchOption) {
    prioritized.push(inchOption);
  } else {
    prioritized.push('In');
  }

  if (cmOption) {
    prioritized.push(cmOption);
  } else {
    prioritized.push('cm');
  }

  for (const option of normalizedOptions) {
    if (!prioritized.some((existing) => normalizeUnitToken(existing) === normalizeUnitToken(option))) {
      prioritized.push(option);
    }
  }

  return prioritized;
};

const parseInitialAnthropometryWeight = (raw) => {
  if (raw == null || raw === '') {
    return null;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

const isProvidedAnthropometryNumber = (raw) => {
  if (raw == null || raw === '') {
    return false;
  }
  const n = Number(raw);
  return Number.isFinite(n) && n > 0;
};

const AnthropometryQuestionLabel = ({ className = '', children, showRequired, id }) => (
  <p className={className} id={id}>
    {children}
    {showRequired ? (
      <>
        <span className="question-required-mark" aria-hidden="true">*</span>
        <span className="anthropometry-page__required-hint">required</span>
      </>
    ) : null}
  </p>
);

const EmbeddedAnthropometryPage = ({ onBack, onContinue, questions = [], initialValues = {}, categoryHeading = 'Anthropometry' }) => {
  const [height, setHeight] = useState(roundToWholeNumber(initialValues?.height, DEFAULT_HEIGHT_CM));
  const [weight, setWeight] = useState(() => parseInitialAnthropometryWeight(initialValues?.weight));
  const [waist, setWaist] = useState(roundToWholeNumber(initialValues?.waist, DEFAULT_WAIST_IN));
  const [heightUnit, setHeightUnit] = useState(initialValues?.heightUnit || '-');
  const [weightUnit, setWeightUnit] = useState(initialValues?.weightUnit || '-');
  const [waistUnit, setWaistUnit] = useState(initialValues?.waistUnit || 'in');
  const [heightFeet, setHeightFeet] = useState(initialValues?.heightFeet ?? DEFAULT_HEIGHT_FEET);
  const [heightInches, setHeightInches] = useState(initialValues?.heightInches ?? DEFAULT_HEIGHT_INCHES);
  const [showWaistInfoPopup, setShowWaistInfoPopup] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const heightQuestionConfig = useMemo(
    () => findQuestionByAliasesAndHints(questions, ['height'], ['height']),
    [questions]
  );
  const weightQuestionConfig = useMemo(
    () => findQuestionByAliasesAndHints(questions, ['weight'], ['weight', 'body weight']),
    [questions]
  );
  const waistQuestionConfig = useMemo(
    () => findQuestionByAliasesAndHints(questions, ['waist_circumference', 'waist'], ['waist']),
    [questions]
  );

  const heightUnitOptions = useMemo(
    () => prioritizeHeightUnitOptions(extractUnitOptionsFromQuestion(heightQuestionConfig)),
    [heightQuestionConfig]
  );
  const weightUnitOptions = useMemo(
    () => extractUnitOptionsFromQuestion(weightQuestionConfig),
    [weightQuestionConfig]
  );
  const waistUnitOptions = useMemo(
    () => prioritizeCircumferenceUnitOptions(extractUnitOptionsFromQuestion(waistQuestionConfig)),
    [waistQuestionConfig]
  );

  const usesFeetInchesHeightUnit = isFeetInchesUnit(heightUnit);

  const heightTouchLastY = useRef(null);
  const heightFeetTouchLastY = useRef(null);
  const heightInchesTouchLastY = useRef(null);
  const waistTouchLastX = useRef(null);

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  useEffect(() => {
    setHeight(roundToWholeNumber(initialValues?.height, DEFAULT_HEIGHT_CM));
    setWeight(parseInitialAnthropometryWeight(initialValues?.weight));
    setWaist(roundToWholeNumber(initialValues?.waist, DEFAULT_WAIST_IN));
    setHeightUnit(
      resolvePreferredUnitOption(
        heightUnitOptions,
        resolveUnitLabelFromQuestion(heightQuestionConfig, initialValues?.heightUnit || ''),
        '-'
      )
    );
    setWeightUnit(
      resolvePreferredUnitOption(
        weightUnitOptions,
        resolveUnitLabelFromQuestion(weightQuestionConfig, initialValues?.weightUnit || ''),
        '-'
      )
    );
    setWaistUnit(
      resolvePreferredUnitOption(
        waistUnitOptions,
        resolveUnitLabelFromQuestion(waistQuestionConfig, initialValues?.waistUnit || 'in'),
        'in'
      )
    );
    setHeightFeet(initialValues?.heightFeet ?? DEFAULT_HEIGHT_FEET);
    setHeightInches(initialValues?.heightInches ?? DEFAULT_HEIGHT_INCHES);
  }, [
    initialValues,
    heightUnitOptions,
    weightUnitOptions,
    waistUnitOptions,
    heightQuestionConfig,
    weightQuestionConfig,
    waistQuestionConfig,
  ]);

  useEffect(() => {
    if (!heightUnitOptions.includes(heightUnit)) {
      setHeightUnit(heightUnitOptions[0]);
    }
  }, [heightUnit, heightUnitOptions]);

  useEffect(() => {
    if (!weightUnitOptions.includes(weightUnit)) {
      setWeightUnit(weightUnitOptions[0]);
    }
  }, [weightUnit, weightUnitOptions]);

  useEffect(() => {
    if (!waistUnitOptions.includes(waistUnit)) {
      setWaistUnit(waistUnitOptions[0]);
    }
  }, [waistUnit, waistUnitOptions]);

  useEffect(() => {
    const { min, max, defaultValue } = getCircumferenceRangeForUnit(waistUnit);
    setWaist((prev) => {
      const safePrev = Number.isFinite(prev) ? prev : defaultValue;
      return clamp(safePrev, min, max);
    });
  }, [waistUnit]);

  const handleHeightWheel = (e) => {
    if (usesFeetInchesHeightUnit) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;
    setHeight((prev) => clamp(prev + delta, MIN_HEIGHT_CM, MAX_HEIGHT_CM));
  };

  const handleHeightTouchStart = (e) => {
    heightTouchLastY.current = e.touches[0].clientY;
  };

  const handleHeightTouchMove = (e) => {
    if (usesFeetInchesHeightUnit) return;
    const y = e.touches[0].clientY;
    const delta = heightTouchLastY.current - y;
    if (Math.abs(delta) >= 8) {
      setHeight((prev) => clamp(prev + Math.sign(delta), MIN_HEIGHT_CM, MAX_HEIGHT_CM));
      heightTouchLastY.current = y;
    }
  };

  const handleHeightTouchEnd = () => { heightTouchLastY.current = null; };

  const handleWaistWheel = (e) => {
    e.preventDefault();
    const raw = e.deltaX !== 0 ? e.deltaX : e.deltaY;
    const delta = raw > 0 ? 1 : -1;
    const { min, max } = getCircumferenceRangeForUnit(waistUnit);
    setWaist((prev) => clamp(prev + delta, min, max));
  };

  const handleWaistTouchStart = (e) => {
    waistTouchLastX.current = e.touches[0].clientX;
  };

  const handleWaistTouchMove = (e) => {
    const x = e.touches[0].clientX;
    const delta = waistTouchLastX.current - x;
    if (Math.abs(delta) >= 8) {
      const { min, max } = getCircumferenceRangeForUnit(waistUnit);
      setWaist((prev) => clamp(prev + Math.sign(delta), min, max));
      waistTouchLastX.current = x;
    }
  };

  const handleWaistTouchEnd = () => { waistTouchLastX.current = null; };

  const weightRange = getWeightRangeForUnit(weightUnit);
  const minHeightFeet = Math.floor(MIN_HEIGHT_INCHES / 12);
  const maxHeightFeet = Math.floor(MAX_HEIGHT_INCHES / 12);

  const handleWeightInput = (e) => {
    const raw = String(e.target.value || '').trim();
    if (raw === '') {
      setWeight(null);
      setSubmitAttempted(false);
      return;
    }
    const digits = raw.replace(/[^0-9]/g, '').slice(0, 3);
    if (digits === '') {
      setWeight(null);
      return;
    }
    const next = Number.parseInt(digits, 10);
    if (Number.isNaN(next)) {
      setWeight(null);
      return;
    }
    const nextWeight = clamp(next, weightRange.min, weightRange.max);
    setWeight(nextWeight);
    if (isProvidedAnthropometryNumber(nextWeight)) {
      setSubmitAttempted(false);
    }
  };

  const handleWeightBlur = () => {
    if (weight == null) {
      return;
    }
    setWeight((prev) => (prev == null ? null : clamp(prev, weightRange.min, weightRange.max)));
  };

  useEffect(() => {
    const range = getWeightRangeForUnit(weightUnit);
    setWeight((prev) => {
      if (prev == null) {
        return prev;
      }
      return clamp(prev, range.min, range.max);
    });
  }, [weightUnit]);

  useEffect(() => {
    if (!usesFeetInchesHeightUnit) return;
    const totalInches = clamp(Math.round(height / 2.54), MIN_HEIGHT_INCHES, MAX_HEIGHT_INCHES);
    const nextFeet = Math.floor(totalInches / 12);
    const nextInches = totalInches % 12;
    setHeightFeet(nextFeet);
    setHeightInches(nextInches);
  }, [height, usesFeetInchesHeightUnit]);

  const handleHeightUnitChange = (nextUnit) => {
    const nextUsesFeetInches = isFeetInchesUnit(nextUnit);
    const currentUsesFeetInches = isFeetInchesUnit(heightUnit);
    const nextUsesCentimeter = isCentimeterUnit(nextUnit);

    if (nextUsesFeetInches) {
      const totalInches = clamp(Math.round(height / 2.54), MIN_HEIGHT_INCHES, MAX_HEIGHT_INCHES);
      setHeightFeet(Math.floor(totalInches / 12));
      setHeightInches(totalInches % 12);
    }
    if (currentUsesFeetInches && nextUsesCentimeter) {
      const totalInches = clamp(heightFeet * 12 + heightInches, MIN_HEIGHT_INCHES, MAX_HEIGHT_INCHES);
      setHeight(Math.round(totalInches * 2.54));
    }
    setHeightUnit(nextUnit);
  };

  const handleFeetChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 1);
    const nextFeet = raw === '' ? 0 : clamp(Number(raw), minHeightFeet, maxHeightFeet);
    setHeightFeet(nextFeet);
    const totalInches = clamp(nextFeet * 12 + heightInches, MIN_HEIGHT_INCHES, MAX_HEIGHT_INCHES);
    setHeight(Math.round(totalInches * 2.54));
  };

  const handleFeetStep = (delta) => {
    setHeightFeet((prev) => {
      const nextFeet = clamp(prev + delta, minHeightFeet, maxHeightFeet);
      const totalInches = clamp(nextFeet * 12 + heightInches, MIN_HEIGHT_INCHES, MAX_HEIGHT_INCHES);
      setHeight(Math.round(totalInches * 2.54));
      return nextFeet;
    });
  };

  const handleFeetWheel = (e) => {
    if (!usesFeetInchesHeightUnit) return;
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? 1 : -1;
    handleFeetStep(delta);
  };

  const handleFeetTouchStart = (e) => {
    if (!usesFeetInchesHeightUnit) return;
    heightFeetTouchLastY.current = e.touches[0].clientY;
  };

  const handleFeetTouchMove = (e) => {
    if (!usesFeetInchesHeightUnit || heightFeetTouchLastY.current === null) return;
    const y = e.touches[0].clientY;
    const delta = heightFeetTouchLastY.current - y;
    if (Math.abs(delta) >= 8) {
      e.preventDefault();
      e.stopPropagation();
      handleFeetStep(Math.sign(delta));
      heightFeetTouchLastY.current = y;
    }
  };

  const handleFeetTouchEnd = () => {
    heightFeetTouchLastY.current = null;
  };

  const handleInchesChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
    const nextInches = raw === '' ? 0 : clamp(Number(raw), 0, 11);
    setHeightInches(nextInches);
    const totalInches = clamp(heightFeet * 12 + nextInches, MIN_HEIGHT_INCHES, MAX_HEIGHT_INCHES);
    setHeight(Math.round(totalInches * 2.54));
  };

  const handleInchesStep = (delta) => {
    setHeightInches((prev) => {
      const nextInches = clamp(prev + delta, 0, 11);
      const totalInches = clamp(heightFeet * 12 + nextInches, MIN_HEIGHT_INCHES, MAX_HEIGHT_INCHES);
      setHeight(Math.round(totalInches * 2.54));
      return nextInches;
    });
  };

  const handleInchesWheel = (e) => {
    if (!usesFeetInchesHeightUnit) return;
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? 1 : -1;
    handleInchesStep(delta);
  };

  const handleInchesTouchStart = (e) => {
    if (!usesFeetInchesHeightUnit) return;
    heightInchesTouchLastY.current = e.touches[0].clientY;
  };

  const handleInchesTouchMove = (e) => {
    if (!usesFeetInchesHeightUnit || heightInchesTouchLastY.current === null) return;
    const y = e.touches[0].clientY;
    const delta = heightInchesTouchLastY.current - y;
    if (Math.abs(delta) >= 8) {
      e.preventDefault();
      e.stopPropagation();
      handleInchesStep(Math.sign(delta));
      heightInchesTouchLastY.current = y;
    }
  };

  const handleInchesTouchEnd = () => {
    heightInchesTouchLastY.current = null;
  };

  const weightForIndicator = weight == null ? weightRange.min : clamp(weight, weightRange.min, weightRange.max);
  const indicatorProgress = (weightForIndicator - weightRange.min) / (weightRange.max - weightRange.min);
  const indicatorAngle = -90 + (indicatorProgress * 180);

  const getQuestionText = (keys, hints, fallback) => {
    const match = findQuestionByAliasesAndHints(questions, keys, hints);
    return match?.question_text || fallback;
  };

  const heightQuestion = getQuestionText(['height'], ['height'], 'What is your height?');
  const weightQuestion = getQuestionText(['weight'], ['weight', 'body weight'], 'What is your body weight?');
  const waistQuestion = getQuestionText(['waist_circumference', 'waist'], ['waist'], 'What is your waist size?');

  const isWeightValid = isProvidedAnthropometryNumber(weight);
  const showWeightRequired = submitAttempted && !isWeightValid;

  const handleContinueClick = () => {
    if (!isWeightValid) {
      setSubmitAttempted(true);
      return;
    }

    onContinue?.({
      height,
      weight,
      waist: roundToWholeNumber(waist, DEFAULT_WAIST_IN),
      heightUnit,
      weightUnit,
      waistUnit,
      heightFeet,
      heightInches,
    });
  };

  return (
    <div className="anthropometry-page">
      <div className="anthropometry-page__header">
        <button className="anthropometry-page__back" type="button" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="anthropometry-page__title">{categoryHeading}</h1>
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
        <AnthropometryUnitDropdown value={heightUnit} options={heightUnitOptions} onChange={handleHeightUnitChange} />
        {usesFeetInchesHeightUnit ? (
          <div className="anthropometry-page__height-dual-faded-row" aria-hidden="true">
            <span className="anthropometry-page__faded anthropometry-page__height-dual-faded-cell">{Math.max(0, heightFeet - 1)}</span>
            <span className="anthropometry-page__faded anthropometry-page__height-dual-faded-cell">{heightInches === 0 ? 11 : heightInches - 1}</span>
          </div>
        ) : (
          <div className="anthropometry-page__faded">{height - 1}</div>
        )}
        <div className="anthropometry-page__row-centered">
          <div className="anthropometry-page__arrow-wrap"><AnthropometryTriangleArrow direction="right" /></div>
          {usesFeetInchesHeightUnit ? (
            <div className="anthropometry-page__height-dual-boxes">
              <div
                className="anthropometry-page__selected-box anthropometry-page__selected-box--height-dual anthropometry-page__height-dual-scroll"
                onWheel={handleFeetWheel}
                onTouchStart={handleFeetTouchStart}
                onTouchMove={handleFeetTouchMove}
                onTouchEnd={handleFeetTouchEnd}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  className="anthropometry-page__height-dual-input"
                  value={heightFeet}
                  onChange={handleFeetChange}
                  maxLength={1}
                  aria-label="Height in feet"
                />
                <span className="anthropometry-page__height-dual-mark">'</span>
              </div>
              <div
                className="anthropometry-page__selected-box anthropometry-page__selected-box--height-dual anthropometry-page__height-dual-scroll"
                onWheel={handleInchesWheel}
                onTouchStart={handleInchesTouchStart}
                onTouchMove={handleInchesTouchMove}
                onTouchEnd={handleInchesTouchEnd}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  className="anthropometry-page__height-dual-input"
                  value={heightInches}
                  onChange={handleInchesChange}
                  maxLength={2}
                  aria-label="Height in inches"
                />
                <span className="anthropometry-page__height-dual-mark anthropometry-page__height-dual-mark--double">''</span>
              </div>
            </div>
          ) : (
            <div className="anthropometry-page__selected-box anthropometry-page__selected-box--height">
              <span className="anthropometry-page__selected-value">{height}</span>
            </div>
          )}
          <div className="anthropometry-page__arrow-wrap"><AnthropometryTriangleArrow direction="left" /></div>
        </div>
        {usesFeetInchesHeightUnit ? (
          <div className="anthropometry-page__height-dual-faded-row" aria-hidden="true">
            <span className="anthropometry-page__faded anthropometry-page__height-dual-faded-cell">{Math.min(6, heightFeet + 1)}</span>
            <span className="anthropometry-page__faded anthropometry-page__height-dual-faded-cell">{heightInches === 11 ? 0 : heightInches + 1}</span>
          </div>
        ) : (
          <div className="anthropometry-page__faded">{height + 1}</div>
        )}
      </div>

      <AnthropometryQuestionLabel
        className={`anthropometry-page__question anthropometry-page__question--mid${showWeightRequired ? ' anthropometry-page__question--invalid' : ''}`}
        showRequired={showWeightRequired}
        id="anthropometry-weight-question"
      >
        {weightQuestion}
      </AnthropometryQuestionLabel>
      <div className={`anthropometry-page__box anthropometry-page__weight-box${showWeightRequired ? ' anthropometry-page__box--invalid' : ''}`}>
        <AnthropometryUnitDropdown value={weightUnit} options={weightUnitOptions} onChange={setWeightUnit} />
        <img src={AnthInd} alt="" aria-hidden="true" className="anthropometry-page__dial" />
        <div className="anthropometry-page__selected-box anthropometry-page__selected-box--weight">
          <div className="anthropometry-page__weight-dial-stack">
            <span
              className={`anthropometry-page__weight-dial-display${weight == null ? ' anthropometry-page__weight-dial-display--empty' : ''}`}
              aria-hidden="true"
            >
              {weight == null ? '00' : String(weight)}
            </span>
            <input
              type="text"
              inputMode="numeric"
              className="anthropometry-page__weight-dial-input"
              value={weight ?? ''}
              onChange={handleWeightInput}
              onBlur={handleWeightBlur}
              maxLength={3}
              aria-label="Body weight"
              aria-invalid={showWeightRequired}
              aria-describedby={showWeightRequired ? 'anthropometry-weight-question' : undefined}
              required
            />
          </div>
        </div>
        <div className="anthropometry-page__indicator">
          <AnthropometryDialIndicator angle={indicatorAngle} />
        </div>
      </div>

      <div className="anthropometry-page__question-row anthropometry-page__question-row--low">
        <p className="anthropometry-page__question anthropometry-page__question--inline">{waistQuestion}</p>
        <button
          type="button"
          className="anthropometry-page__info-btn"
          aria-label="Open waist size information"
          onClick={() => setShowWaistInfoPopup((prev) => !prev)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 0C8.85652 0 10.637 0.737498 11.9497 2.05025C13.2625 3.36301 14 5.14348 14 7C14 8.85652 13.2625 10.637 11.9497 11.9497C10.637 13.2625 8.85652 14 7 14C5.14348 14 3.36301 13.2625 2.05025 11.9497C0.737498 10.637 0 8.85652 0 7C0 5.14348 0.737498 3.36301 2.05025 2.05025C3.36301 0.737498 5.14348 0 7 0ZM8.05 4.29688C8.57031 4.29688 8.99219 3.9375 8.99219 3.40156C8.99219 2.86563 8.57031 2.50625 8.05 2.50625C7.52969 2.50625 7.10938 2.86563 7.10938 3.40156C7.10938 3.9375 7.53125 4.29844 8.05 4.29844M8.23281 9.925C8.23281 9.81875 8.27031 9.54063 8.24844 9.38125L7.42656 10.3281C7.25625 10.5063 7.04375 10.6312 6.94375 10.5984C6.89862 10.5816 6.86096 10.5492 6.83749 10.5071C6.81403 10.4651 6.80627 10.416 6.81563 10.3687L8.18437 6.04063C8.29688 5.49062 7.98906 4.99062 7.33594 4.92656C6.64844 4.92656 5.63281 5.625 5.01562 6.5125C5.01562 6.61875 4.99531 6.88125 5.01562 7.04062L5.8375 6.09375C6.00938 5.91563 6.20625 5.79062 6.30625 5.825C6.35491 5.84336 6.39467 5.87968 6.41734 5.92648C6.44002 5.97328 6.44387 6.027 6.42812 6.07656L5.06875 10.3844C4.9125 10.8875 5.20937 11.3812 5.92969 11.4937C6.99062 11.4937 7.61719 10.8125 8.23438 9.925H8.23281Z" fill="white"/>
          </svg>
        </button>
      </div>
      <div
        className="anthropometry-page__box anthropometry-page__waist-box"
        onWheel={handleWaistWheel}
        onTouchStart={handleWaistTouchStart}
        onTouchMove={handleWaistTouchMove}
        onTouchEnd={handleWaistTouchEnd}
      >
        <AnthropometryUnitDropdown value={waistUnit} options={waistUnitOptions} onChange={setWaistUnit} />
        <div className="anthropometry-page__arrow-wrap"><AnthropometryTriangleArrow direction="down" /></div>
        <div className="anthropometry-page__waist-h-row">
          <span className="anthropometry-page__faded anthropometry-page__faded--inline anthropometry-page__faded--far">{waist - 2}</span>
          <span className="anthropometry-page__faded anthropometry-page__faded--inline anthropometry-page__faded--near">{waist - 1}</span>
          <div className="anthropometry-page__selected-box">
            <span className="anthropometry-page__selected-value">{waist}</span>
          </div>
          <span className="anthropometry-page__faded anthropometry-page__faded--inline anthropometry-page__faded--near">{waist + 1}</span>
          <span className="anthropometry-page__faded anthropometry-page__faded--inline anthropometry-page__faded--far">{waist + 2}</span>
        </div>
        <div className="anthropometry-page__arrow-wrap"><AnthropometryTriangleArrow direction="up" /></div>
      </div>

      </div>

      <button
        type="button"
        className="anthropometry-page__continue"
        onClick={handleContinueClick}
      >
        Continue
      </button>

      {showWaistInfoPopup ? (
        <div
          className="anthropometry-page__waist-info-overlay"
          onClick={() => setShowWaistInfoPopup(false)}
          aria-hidden="true"
        >
          <div
            className="family-history-page__info-popup anthropometry-page__waist-info-popup"
            role="dialog"
            aria-label="Waist size information"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="family-history-page__info-handle" aria-hidden="true" />
            <button
              type="button"
              className="family-history-page__info-close"
              onClick={() => setShowWaistInfoPopup(false)}
              aria-label="Close waist size information"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M12 4L4 12M4 4L12 12" stroke="#9A9A9A" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div
              className="anthropometry-page__waist-info-gif"
              style={{ backgroundImage: `url(${waistGif})` }}
              aria-label="Waist size guide"
            />
          </div>
        </div>
      ) : null}
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
        {value} <span className="anthropometry-followup-page__unit-arrow"><UnitDropdownArrow /></span>
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

const EmbeddedAnthropometryFollowupPage = ({ onBack, onDone, questions = [], initialValues = {}, categoryHeading = 'Anthropometry' }) => {
  const [hipSize, setHipSize] = useState(roundToWholeNumber(initialValues?.hipSize, DEFAULT_HIP_IN));
  const [hipUnit, setHipUnit] = useState(initialValues?.hipUnit || 'in');
  const [showHipInfoPopup, setShowHipInfoPopup] = useState(false);
  const hipTouchLastX = useRef(null);

  const hipQuestionConfig = useMemo(
    () => findQuestionByAliasesAndHints(questions, ['hip_circumference', 'hip_size', 'hip'], ['hip']),
    [questions]
  );
  const hipUnitOptions = useMemo(
    () => prioritizeCircumferenceUnitOptions(extractUnitOptionsFromQuestion(hipQuestionConfig)),
    [hipQuestionConfig]
  );

  useEffect(() => {
    setHipSize(roundToWholeNumber(initialValues?.hipSize, DEFAULT_HIP_IN));
    setHipUnit(
      resolvePreferredUnitOption(
        hipUnitOptions,
        resolveUnitLabelFromQuestion(hipQuestionConfig, initialValues?.hipUnit || 'in'),
        'in'
      )
    );
  }, [initialValues, hipUnitOptions, hipQuestionConfig]);

  useEffect(() => {
    if (!hipUnitOptions.includes(hipUnit)) {
      setHipUnit(hipUnitOptions[0]);
    }
  }, [hipUnit, hipUnitOptions]);

  useEffect(() => {
    const { min, max, defaultValue } = getCircumferenceRangeForUnit(hipUnit, 'hip');
    setHipSize((prev) => {
      const safePrev = Number.isFinite(prev) ? prev : defaultValue;
      return clamp(safePrev, min, max);
    });
  }, [hipUnit]);

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const handleHipWheel = (e) => {
    e.preventDefault();
    const raw = e.deltaX !== 0 ? e.deltaX : e.deltaY;
    const delta = raw > 0 ? 1 : -1;
    const { min, max } = getCircumferenceRangeForUnit(hipUnit, 'hip');
    setHipSize((prev) => clamp(prev + delta, min, max));
  };

  const handleHipTouchStart = (e) => {
    hipTouchLastX.current = e.touches[0].clientX;
  };

  const handleHipTouchMove = (e) => {
    const x = e.touches[0].clientX;
    const delta = hipTouchLastX.current - x;
    if (Math.abs(delta) >= 8) {
      const { min, max } = getCircumferenceRangeForUnit(hipUnit, 'hip');
      setHipSize((prev) => clamp(prev + Math.sign(delta), min, max));
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
        <h1 className="anthropometry-followup-page__title">{categoryHeading}</h1>
        <img src={ques1Icon} alt="" aria-hidden="true" className="anthropometry-followup-page__header-icon" />
      </div>

      <p className="anthropometry-followup-page__subtitle">
        Your measurements power our AI to generate accurate metabolic and wellness scores.
      </p>

      <div className="anthropometry-followup-page__content">
      <div className="anthropometry-followup-page__question-row anthropometry-followup-page__question-row--hip">
        <p className="anthropometry-followup-page__question anthropometry-followup-page__question--inline">What is your hip size?</p>
        <button
          type="button"
          className="anthropometry-followup-page__info-btn"
          aria-label="Open hip size information"
          onClick={() => setShowHipInfoPopup((prev) => !prev)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 0C8.85652 0 10.637 0.737498 11.9497 2.05025C13.2625 3.36301 14 5.14348 14 7C14 8.85652 13.2625 10.637 11.9497 11.9497C10.637 13.2625 8.85652 14 7 14C5.14348 14 3.36301 13.2625 2.05025 11.9497C0.737498 10.637 0 8.85652 0 7C0 5.14348 0.737498 3.36301 2.05025 2.05025C3.36301 0.737498 5.14348 0 7 0ZM8.05 4.29688C8.57031 4.29688 8.99219 3.9375 8.99219 3.40156C8.99219 2.86563 8.57031 2.50625 8.05 2.50625C7.52969 2.50625 7.10938 2.86563 7.10938 3.40156C7.10938 3.9375 7.53125 4.29844 8.05 4.29844M8.23281 9.925C8.23281 9.81875 8.27031 9.54063 8.24844 9.38125L7.42656 10.3281C7.25625 10.5063 7.04375 10.6312 6.94375 10.5984C6.89862 10.5816 6.86096 10.5492 6.83749 10.5071C6.81403 10.4651 6.80627 10.416 6.81563 10.3687L8.18437 6.04063C8.29688 5.49062 7.98906 4.99062 7.33594 4.92656C6.64844 4.92656 5.63281 5.625 5.01562 6.5125C5.01562 6.61875 4.99531 6.88125 5.01562 7.04062L5.8375 6.09375C6.00938 5.91563 6.20625 5.79062 6.30625 5.825C6.35491 5.84336 6.39467 5.87968 6.41734 5.92648C6.44002 5.97328 6.44387 6.027 6.42812 6.07656L5.06875 10.3844C4.9125 10.8875 5.20937 11.3812 5.92969 11.4937C6.99062 11.4937 7.61719 10.8125 8.23438 9.925H8.23281Z" fill="white"/>
          </svg>
        </button>
      </div>
      <div
        className="anthropometry-followup-page__box anthropometry-followup-page__hip-box"
        onWheel={handleHipWheel}
        onTouchStart={handleHipTouchStart}
        onTouchMove={handleHipTouchMove}
        onTouchEnd={handleHipTouchEnd}
      >
        <FollowupUnitDropdown value={hipUnit} options={hipUnitOptions} onChange={setHipUnit} />
        <div className="anthropometry-followup-page__arrow-wrap"><AnthropometryTriangleArrow direction="down" /></div>
        <div className="anthropometry-followup-page__hip-h-row">
          <span className="anthropometry-followup-page__faded anthropometry-followup-page__faded--far">{hipSize - 2}</span>
          <span className="anthropometry-followup-page__faded anthropometry-followup-page__faded--near">{hipSize - 1}</span>
          <div className="anthropometry-followup-page__selected-box">
            <span className="anthropometry-followup-page__selected-value">{hipSize}</span>
          </div>
          <span className="anthropometry-followup-page__faded anthropometry-followup-page__faded--near">{hipSize + 1}</span>
          <span className="anthropometry-followup-page__faded anthropometry-followup-page__faded--far">{hipSize + 2}</span>
        </div>
        <div className="anthropometry-followup-page__arrow-wrap"><AnthropometryTriangleArrow direction="up" /></div>
      </div>

      <button type="button" className="anthropometry-followup-page__skip" onClick={() => onDone?.({})}>Skip</button>
      </div>

      <button
        type="button"
        className="anthropometry-followup-page__done"
        onClick={() => {
          onDone?.({
            hipSize: roundToWholeNumber(hipSize, DEFAULT_HIP_IN),
            hipUnit,
          });
        }}
      >
        Done
      </button>

      {showHipInfoPopup ? (
        <div className="family-history-page__info-popup anthropometry-followup-page__hip-info-popup" role="dialog" aria-label="Hip size information">
          <div className="family-history-page__info-handle" aria-hidden="true" />
          <button
            type="button"
            className="family-history-page__info-close"
            onClick={() => setShowHipInfoPopup(false)}
            aria-label="Close hip size information"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M12 4L4 12M4 4L12 12" stroke="#9A9A9A" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div
            className="anthropometry-followup-page__hip-info-gif"
            style={{ backgroundImage: `url(${hipGif})` }}
            aria-label="Hip size guide"
          />
        </div>
      ) : null}
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
    helper: '(Select all that apply)',
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
    helper: '(Select all that apply)',
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

/** Instruction line below the question (matches product copy); title match is normalized. */
const getHardcodedQuestionnaireSubline = (title) => {
  const t = String(title || '').trim().toLowerCase();
  if (!t) {
    return '';
  }
  if (t.includes('close blood relatives') && t.includes('health conditions')) {
    return '(Select all that apply)';
  }
  if (t.includes('taking medications') && t.includes('following diseases')) {
    return '(Select all that apply)';
  }
  if (t.includes('diagnosed with the following diseases')) {
    return '(Select all that apply)';
  }
  if (t.includes('which of the following food groups') && t.includes('consume')) {
    return '(Select all that apply)';
  }
  if (t.includes('sugary drinks') && t.includes('desserts')) {
    return '(Soft Drinks, Ice Cream, Chocolate, Cakes, Pastries, Candies or Sweets)';
  }
  if (t.includes('what type of coffee or tea')) {
    return '(Select all that apply)';
  }
  if (t.includes('glasses of water') && t.includes('day')) {
    return '(1 glass of water is ~250 ml)';
  }
  if (t.includes('fall sick') && t.includes('year')) {
    return '(Required at least a day of bed rest)';
  }
  if (t.includes('physical activity') && t.includes('exercise') && t.includes('daily')) {
    return '(Brisk Walking or Bicycling or Heavy Lifting or Games or Yoga or Meditation or Cleaning)';
  }
  if (t.includes('actively walking') && (t.includes('each day') || t.includes('every day'))) {
    return '(Includes commuting to work, breaks at work and household chores)';
  }
  if (t.includes('alcohol consumption')) {
    return '(1 serving = 125 ml wine or 330 ml of beer or 40 ml of hard liquor)';
  }
  if (t.includes('what sports') && t.includes('play')) {
    return '(Select all that apply)';
   }
  return '';
};

const familyHelperByQuestionKey = {
  family_health_conditions: '(Select all that apply)',
  diagnosed_diseases: '(Select all that apply)',
};

const toFamilyApiCards = (questions = []) => {
  return questions
    .filter((question) => question?.is_visible !== false)
    .filter((question) => !isLikelyOtherTextQuestion(question))
    .map((question) => {
    const key = question?.question_key || `question-${question?.question_id}`;
    const isMulti = ['multi_choice', 'multiple_choice'].includes(String(question?.question_type || '').toLowerCase());
    const isTextInput = isTextQuestionWithoutOptions(question);
    const options = Array.isArray(question?.options)
      ? [...new Set(
          question.options
            .map((option) => option?.display_name || option?.option_value || '')
            .filter(Boolean)
        )]
      : [];

    const normalizedTitle = String(question?.question_text || '').toLowerCase();
    const helper = familyHelperByQuestionKey[key]
      || (normalizedTitle.includes('close blood relatives') ? '(Select all that apply)' : '')
      || (normalizedTitle.includes('diagnosed with the following') ? '(Select all that apply)' : '');

    return {
      key,
      title: question?.question_text || '',
      helper,
      infoLines: question?.help_text ? [question.help_text] : undefined,
      options: moveOtherLabelToEnd(options),
      defaultSelected: [],
      multi: isMulti,
      isTextInput,
      otherTextQuestionKey: findMappedOtherTextQuestion(questions, question)?.question_key || '',
    };
    });
};

const shouldUseFullWidthOption = (label) => {
  const normalizedLabel = String(label || '').trim();
  return normalizedLabel.length > 20 || isOtherOptionLabel(normalizedLabel);
};
const OTHER_TEXT_SELECTION_KEY_SUFFIX = '__other_text';
const OTHER_HINT_REGEX = /(other|specify|please\s*specify)/i;

const isOtherOptionLabel = (label) => {
  return normalizeLookupText(label) === 'other';
};

const getOptionLabel = (option) => {
  if (typeof option === 'string') {
    return option;
  }

  return option?.label || option?.display_name || option?.option_value || option?.value || '';
};

const getOtherTextSelectionKey = (questionKey) => `${questionKey}${OTHER_TEXT_SELECTION_KEY_SUFFIX}`;

const moveOtherOptionToEnd = (options = []) => {
  const normalizedOptions = Array.isArray(options) ? options : [];
  const regularOptions = normalizedOptions
    .filter((option) => !isOtherOptionLabel(option?.label))
    .sort((a, b) => {
      const aIsLong = Boolean(a?.fullWidth) || shouldUseFullWidthOption(a?.label);
      const bIsLong = Boolean(b?.fullWidth) || shouldUseFullWidthOption(b?.label);
      if (aIsLong === bIsLong) return 0;
      return aIsLong ? -1 : 1;
    });
  const otherOptions = normalizedOptions
    .filter((option) => isOtherOptionLabel(option?.label))
    .map((option) => ({ ...option, fullWidth: true }));
  return [...regularOptions, ...otherOptions];
};

const moveOtherLabelToEnd = (options = []) => {
  const normalizedOptions = (Array.isArray(options) ? options : [])
    .map((option) => String(option || '').trim())
    .filter(Boolean);
  const regularOptions = normalizedOptions
    .filter((option) => !isOtherOptionLabel(option))
    .sort((a, b) => {
      const aIsLong = shouldUseFullWidthOption(a);
      const bIsLong = shouldUseFullWidthOption(b);
      if (aIsLong === bIsLong) return 0;
      return aIsLong ? -1 : 1;
    });
  const otherOptions = normalizedOptions.filter((option) => isOtherOptionLabel(option));
  return [...regularOptions, ...otherOptions];
};

const isLikelyOtherTextQuestion = (question) => {
  const key = String(question?.question_key || '').trim();
  const title = String(question?.question_text || '').trim();
  const help = String(question?.help_text || '').trim();
  const questionType = normalizeQuestionType(question?.question_type);
  const hasOptions = Array.isArray(question?.options)
    && question.options.some((option) => Boolean(option?.display_name || option?.option_value));

  if (hasOptions) {
    return false;
  }

  if (!['text', 'short_text', 'long_text', 'textarea'].includes(questionType)) {
    return false;
  }

  return OTHER_HINT_REGEX.test(key) || OTHER_HINT_REGEX.test(title) || OTHER_HINT_REGEX.test(help);
};

const findMappedOtherTextQuestion = (questions = [], sourceQuestion = null) => {
  if (!Array.isArray(questions) || !sourceQuestion) {
    return null;
  }

  const sourceId = Number(sourceQuestion?.question_id || sourceQuestion?.id || 0);
  const sourceKey = normalizeLookupText(sourceQuestion?.question_key);
  const sourceTitle = normalizeLookupText(sourceQuestion?.question_text);
  const mappedOtherQuestionIdFromQuestion = Number(
    sourceQuestion?.other_question_id
    || sourceQuestion?.other_text_question_id
    || sourceQuestion?.otherTextQuestionId
    || 0
  );

  const otherOption = Array.isArray(sourceQuestion?.options)
    ? sourceQuestion.options.find((option) => {
        const label = option?.display_name || option?.option_value || option?.label || option?.value || '';
        return isOtherOptionLabel(label);
      })
    : null;

  const mappedOtherQuestionIdFromOption = Number(
    otherOption?.other_question_id
    || otherOption?.other_text_question_id
    || otherOption?.otherTextQuestionId
    || otherOption?.mapped_question_id
    || otherOption?.mappedQuestionId
    || otherOption?.linked_question_id
    || otherOption?.linkedQuestionId
    || otherOption?.text_question_id
    || otherOption?.textQuestionId
    || 0
  );

  const mappedOtherQuestionId = mappedOtherQuestionIdFromQuestion > 0
    ? mappedOtherQuestionIdFromQuestion
    : mappedOtherQuestionIdFromOption;

  if (mappedOtherQuestionId > 0) {
    const explicitMatch = questions.find((question) => {
      const id = Number(question?.question_id || question?.id || 0);
      return id === mappedOtherQuestionId;
    });

    if (explicitMatch) {
      return explicitMatch;
    }
  }

  const otherTextCandidates = questions.filter((question) => {
    const id = Number(question?.question_id || question?.id || 0);
    return id !== sourceId && isLikelyOtherTextQuestion(question);
  });

  const byKey = otherTextCandidates.find((question) => {
    const key = normalizeLookupText(question?.question_key);
    return sourceKey && key && (key.includes(sourceKey) || sourceKey.includes(key));
  });
  if (byKey) {
    return byKey;
  }

  const byText = otherTextCandidates.find((question) => {
    const text = normalizeLookupText(question?.question_text);
    return sourceTitle && text && (text.includes(sourceTitle) || sourceTitle.includes(text));
  });
  if (byText) {
    return byText;
  }

  return otherTextCandidates[0] || null;
};

const normalizeInfoLines = (infoLines = []) => {
  return infoLines.flatMap((line) => {
    const text = String(line || '').trim();
    if (!text) return [];
    if (!text.includes('.')) return [text];
    return text
      .split('.')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => `${part}.`);
  });
};

const useCenteredQuestionGap = (deps = []) => {
  const subtitleRef = useRef(null);
  const stackWrapRef = useRef(null);
  const [stackTopGap, setStackTopGap] = useState(141);
  const depsKey = useMemo(() => JSON.stringify(deps), [deps]);

  useEffect(() => {
    let frameId;

    const recalc = () => {
      if (!subtitleRef.current || !stackWrapRef.current) return;
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

const normalizeQuestionType = (questionType) => String(questionType || '').trim().toLowerCase();

const isEmptyAnswer = (answer) => {
  if (answer == null) return true;
  if (Array.isArray(answer)) return answer.length === 0;
  if (typeof answer === 'string') return answer.trim() === '';
  return false;
};

const getOptionDisplayText = (option) => {
  if (typeof option === 'string' || typeof option === 'number') {
    return String(option).trim();
  }
  return String(option?.display_name ?? option?.label ?? '').trim();
};

const getOptionStoredValue = (option) => {
  if (typeof option === 'string' || typeof option === 'number') {
    return String(option).trim();
  }
  const fromOptionValue = option?.option_value;
  if (fromOptionValue != null && String(fromOptionValue).trim() !== '') {
    return String(fromOptionValue).trim();
  }
  const fromValue = option?.value;
  if (fromValue != null && String(fromValue).trim() !== '') {
    return String(fromValue).trim();
  }
  return '';
};

/** Last-resort Metsights lifestyle label → option_value when API options are missing on the client. */
const METSIGHTS_LIFESTYLE_LABEL_TO_KEY = {
  sitting_hours: {
    lessthan1hour: '0',
    '14hours': '1',
    morethan4hours: '2',
  },
  physical_activity_frequency: {
    rarelyornever: '5',
    lessthan30minutesaday: '1',
    '3060minutesaday': '2',
    morethan60minutesaday: '3',
  },
  exercise_frequency_week: {
    rarelyornever: '0',
    lessthan1hour: '1',
    '1to3hours': '2',
    '13hours': '2',
    '4to8hours': '3',
    '48hours': '3',
    morethan8hours: '4',
  },
  exercise_level: {
    lowintensity: '0',
    moderateintensity: '1',
    highintensity: '2',
  },
  sleeping_hours: {
    lessthan5hours: '0',
    between5to7hours: '1',
    between57hours: '1',
    between7to9hours: '2',
    between79hours: '2',
    morethan9hours: '3',
  },
  alcohol_frequency: {
    idonotdrinkalcohol: '0',
    iquitalcohol: '1',
    '3servingsperweekorless': '2',
    morethan3servingsperweek: '3',
    '12timesin3months': '4',
    '12timesin6months': '5',
  },
  tobacco_frequency: {
    idonotsmoke: '0',
    iquitsmoking: '1',
    '1to3timesaweek': '2',
    '13timesaweek': '2',
    '5to7timesaweek': '3',
    '57timesaweek': '3',
    morethan7timesaweek: '4',
    '45timesamonth': '5',
    '12timesamonth': '6',
  },
};

const METSIGHTS_LIFESTYLE_LABEL_TO_KEY_BY_ID = {
  13: METSIGHTS_LIFESTYLE_LABEL_TO_KEY.sitting_hours,
  14: METSIGHTS_LIFESTYLE_LABEL_TO_KEY.physical_activity_frequency,
  15: METSIGHTS_LIFESTYLE_LABEL_TO_KEY.exercise_frequency_week,
  16: METSIGHTS_LIFESTYLE_LABEL_TO_KEY.exercise_level,
  18: METSIGHTS_LIFESTYLE_LABEL_TO_KEY.sleeping_hours,
  19: METSIGHTS_LIFESTYLE_LABEL_TO_KEY.alcohol_frequency,
  20: METSIGHTS_LIFESTYLE_LABEL_TO_KEY.tobacco_frequency,
};

const looseOptionLookupKey = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const mapOptionLabelToValue = (question, label) => {
  const normalizedLabel = String(label || '').trim();
  if (!normalizedLabel) return '';

  const opts = Array.isArray(question?.options) ? question.options : [];
  const normalizedLookup = normalizedLabel.toLowerCase();
  const looseLabel = looseOptionLookupKey(normalizedLabel);

  if (opts.length > 0) {
    const matchedOption = opts.find((option) => {
      const displayName = getOptionDisplayText(option);
      const optionValue = getOptionStoredValue(option);
      return displayName === normalizedLabel
        || optionValue === normalizedLabel
        || displayName.toLowerCase() === normalizedLookup
        || optionValue.toLowerCase() === normalizedLookup
        || (looseLabel && looseOptionLookupKey(displayName) === looseLabel)
        || (looseLabel && looseOptionLookupKey(optionValue) === looseLabel);
    });

    if (matchedOption) {
      const stored = getOptionStoredValue(matchedOption);
      if (stored) {
        return stored;
      }
    }
  }

  const questionKey = String(question?.question_key || '').trim().toLowerCase();
  const questionId = Number(question?.question_id || question?.id || 0);
  const fallbackMap = METSIGHTS_LIFESTYLE_LABEL_TO_KEY[questionKey]
    || METSIGHTS_LIFESTYLE_LABEL_TO_KEY_BY_ID[questionId];
  if (fallbackMap && looseLabel && fallbackMap[looseLabel]) {
    return fallbackMap[looseLabel];
  }

  if (opts.length > 0) {
    const matchedOption = opts.find((option) => {
      const displayName = getOptionDisplayText(option);
      return displayName === normalizedLabel
        || displayName.toLowerCase() === normalizedLookup
        || (looseLabel && looseOptionLookupKey(displayName) === looseLabel);
    });
    if (matchedOption) {
      return getOptionDisplayText(matchedOption) || normalizedLabel;
    }
  }

  return normalizedLabel;
};

/** Force every choice answer onto questionnaire option_value keys before PUT. */
const coerceResponsesToOptionKeys = (questions = [], responses = []) => {
  const byId = new Map();
  (Array.isArray(questions) ? questions : []).forEach((question) => {
    const id = Number(question?.question_id || question?.id || 0);
    if (id > 0 && !byId.has(id)) {
      byId.set(id, question);
    }
  });

  return (Array.isArray(responses) ? responses : [])
    .map((row) => {
      const questionId = Number(row?.question_id || row?.questionId || 0);
      if (questionId <= 0) {
        return null;
      }
      const question = byId.get(questionId);
      if (!question) {
        const answer = row?.answer;
        if (isEmptyAnswer(answer)) {
          return null;
        }
        return { question_id: questionId, answer };
      }
      return buildResponseItem(question, row?.answer);
    })
    .filter(Boolean);
};

const mapOptionValueToLabel = (question, value) => {
  const normalizedValue = String(value || '').trim();
  if (!normalizedValue) return '';

  const matchedOption = Array.isArray(question?.options)
    ? question.options.find((option) => {
        const displayName = getOptionDisplayText(option);
        const optionValue = getOptionStoredValue(option);
        return displayName === normalizedValue || optionValue === normalizedValue;
      })
    : null;

  if (!matchedOption) {
    return normalizedValue;
  }

  return getOptionDisplayText(matchedOption) || getOptionStoredValue(matchedOption) || normalizedValue;
};

const normalizeResponseItems = (responses = []) => {
  if (!Array.isArray(responses)) {
    return [];
  }

  return responses
    .map((item) => {
      const questionId = Number(item?.question_id || item?.questionId || item?.id || 0);
      if (questionId <= 0) {
        return null;
      }

      const answer = item?.answer
        ?? item?.response
        ?? item?.value
        ?? item?.selected_option
        ?? item?.selected_options
        ?? item?.answers;

      if (isEmptyAnswer(answer)) {
        return null;
      }

      return {
        question_id: questionId,
        answer,
      };
    })
    .filter(Boolean);
};

const getResponseAnswerForQuestion = (question, responses = []) => {
  const questionId = Number(question?.question_id || question?.id || 0);
  if (questionId <= 0) {
    return null;
  }

  const matchedResponse = responses.find((response) => response.question_id === questionId);
  return matchedResponse ? matchedResponse.answer : null;
};

const toSelectionArray = (question, rawAnswer) => {
  if (isEmptyAnswer(rawAnswer)) {
    return [];
  }

  const questionType = normalizeQuestionType(question?.question_type);
  const values = (questionType === 'multiple_choice' || questionType === 'multi_choice')
    ? (Array.isArray(rawAnswer) ? rawAnswer : [rawAnswer])
    : [Array.isArray(rawAnswer) ? rawAnswer[0] : rawAnswer];

  // Keep option keys (option_value) in selection state — never display labels.
  return [...new Set(
    values
      .map((value) => mapOptionLabelToValue(question, value))
      .filter((value) => !isEmptyAnswer(value))
  )];
};

const toNumericAnswer = (rawAnswer) => {
  if (isEmptyAnswer(rawAnswer)) {
    return null;
  }

  const selected = Array.isArray(rawAnswer) ? rawAnswer[0] : rawAnswer;

  if (typeof selected === 'number') {
    return Number.isFinite(selected) ? selected : null;
  }

  if (typeof selected === 'string') {
    const trimmed = selected.trim();
    if (!trimmed) {
      return null;
    }

    const directNumber = Number(trimmed);
    if (Number.isFinite(directNumber)) {
      return directNumber;
    }

    const extracted = trimmed.match(/-?\d+(?:\.\d+)?/);
    if (!extracted) {
      return null;
    }

    const parsed = Number(extracted[0]);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (selected && typeof selected === 'object') {
    const nestedValue = selected.value
      ?? selected.answer
      ?? selected.response
      ?? selected.numeric_value
      ?? selected.measurement
      ?? selected.quantity
      ?? selected.amount;

    return toNumericAnswer(nestedValue);
  }

  const numberValue = Number(selected);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const toUnitAnswer = (rawAnswer) => {
  if (isEmptyAnswer(rawAnswer)) {
    return '';
  }

  const selected = Array.isArray(rawAnswer) ? rawAnswer[0] : rawAnswer;

  if (typeof selected === 'string') {
    return selected.trim();
  }

  if (selected && typeof selected === 'object') {
    const unitValue = selected.unit
      ?? selected.units
      ?? selected.measurement_unit
      ?? selected.unit_name
      ?? selected.selected_unit
      ?? selected.label
      ?? selected.value;

    return String(unitValue || '').trim();
  }

  return String(selected || '').trim();
};

const buildSelectionStateFromResponses = (questions = [], responses = []) => {
  const normalizedResponses = normalizeResponseItems(responses);
  if (!Array.isArray(questions) || questions.length === 0 || normalizedResponses.length === 0) {
    return {};
  }

  const baseSelections = questions.reduce((acc, question) => {
    const questionId = question?.question_id || question?.id;
    const key = question?.question_key || `question-${questionId}`;
    if (!key) {
      return acc;
    }

    const answer = getResponseAnswerForQuestion(question, normalizedResponses);
    const selectedOptions = toSelectionArray(question, answer);

    if (selectedOptions.length > 0) {
      acc[key] = selectedOptions;
    }

    return acc;
  }, {});

  const questionsByKey = new Map(
    questions.map((question) => [
      question?.question_key || `question-${question?.question_id || question?.id || ''}`,
      question,
    ])
  );

  questions.forEach((question) => {
    const questionId = question?.question_id || question?.id;
    const key = question?.question_key || `question-${questionId}`;
    if (!key) {
      return;
    }

    const selectedValues = Array.isArray(baseSelections[key]) ? baseSelections[key] : [];
    const hasOtherSelected = selectedValues.some((value) => isOtherOptionLabel(value));
    if (!hasOtherSelected) {
      return;
    }

    const mappedOtherQuestion = findMappedOtherTextQuestion(questions, question);
    if (!mappedOtherQuestion) {
      return;
    }

    const mappedOtherKey = mappedOtherQuestion?.question_key
      || `question-${mappedOtherQuestion?.question_id || mappedOtherQuestion?.id || ''}`;
    const otherAnswer = getResponseAnswerForQuestion(mappedOtherQuestion, normalizedResponses);
    if (isEmptyAnswer(otherAnswer)) {
      return;
    }

    const otherSelectionKey = getOtherTextSelectionKey(key);
    baseSelections[otherSelectionKey] = [String(Array.isArray(otherAnswer) ? otherAnswer[0] : otherAnswer || '').trim()].filter(Boolean);

    if (!questionsByKey.has(mappedOtherKey)) {
      questionsByKey.set(mappedOtherKey, mappedOtherQuestion);
    }
  });

  questions.forEach((question) => {
    const questionId = question?.question_id || question?.id;
    const key = question?.question_key || `question-${questionId}`;
    if (!key || !isWalkingDurationLifestyleQuestion(question)) {
      return;
    }
    const answer = getResponseAnswerForQuestion(question, normalizedResponses);
    const wheel = hydrateWalkingWheelFromAnswer(question, answer);
    if (wheel) {
      baseSelections[lifestyleWalkingWheelStorageKey(key)] = wheel;
    }
  });

  return baseSelections;
};

const buildAnthropometryInitialValuesFromResponses = (questions = [], responses = []) => {
  const normalizedResponses = normalizeResponseItems(responses);
  if (!Array.isArray(questions) || questions.length === 0 || normalizedResponses.length === 0) {
    return {
      primary: {},
      followup: {},
    };
  }

  const getAnswer = (aliases, textHints = []) => {
    const question = findQuestionByKeys(questions, aliases, textHints);
    if (!question) {
      return {
        question: null,
        rawAnswer: null,
        numericValue: null,
        unitValue: '',
      };
    }

    const rawAnswer = getResponseAnswerForQuestion(question, normalizedResponses);
    return {
      question,
      rawAnswer,
      numericValue: toNumericAnswer(rawAnswer),
      unitValue: toUnitAnswer(rawAnswer),
    };
  };

  const heightAnswer = getAnswer(['height'], ['height']);
  const weightAnswer = getAnswer(['weight'], ['weight', 'body weight']);
  const waistAnswer = getAnswer(['waist_circumference', 'waist'], ['waist']);
  const hipAnswer = getAnswer(['hip_circumference', 'hip_size', 'hip'], ['hip']);
  const heightUnitAnswer = getAnswer(['height_unit', 'heightunit'], ['height unit']);
  const weightUnitAnswer = getAnswer(['weight_unit', 'weightunit'], ['weight unit']);
  const waistUnitAnswer = getAnswer(['waist_unit', 'waistunit', 'waist_circumference_unit'], ['waist unit']);
  const hipUnitAnswer = getAnswer(['hip_unit', 'hipunit', 'hip_circumference_unit'], ['hip unit']);

  const primary = {};
  const followup = {};

  const rawHeightUnit = heightUnitAnswer.unitValue || heightAnswer.unitValue;
  const rawWeightUnit = weightUnitAnswer.unitValue || weightAnswer.unitValue;
  const rawWaistUnit = waistUnitAnswer.unitValue || waistAnswer.unitValue;
  const rawHipUnit = hipUnitAnswer.unitValue || hipAnswer.unitValue;

  let heightUnit = resolveUnitLabelFromQuestion(heightAnswer.question || heightUnitAnswer.question, rawHeightUnit);
  const weightUnit = resolveUnitLabelFromQuestion(weightAnswer.question || weightUnitAnswer.question, rawWeightUnit);
  const waistUnit = resolveUnitLabelFromQuestion(waistAnswer.question || waistUnitAnswer.question, rawWaistUnit);
  const hipUnit = resolveUnitLabelFromQuestion(hipAnswer.question || hipUnitAnswer.question, rawHipUnit);

  if (!heightUnit && Number.isFinite(heightAnswer.numericValue) && heightAnswer.numericValue > 0 && heightAnswer.numericValue <= 9.5) {
    // Height values like 5.58 without explicit unit are most likely feet.
    heightUnit = 'ft/in';
  }

  const normalizedHeightInCm = Number.isFinite(heightAnswer.numericValue)
    ? convertHeightToCm(heightAnswer.numericValue, heightUnit)
    : null;

  if (normalizedHeightInCm != null) primary.height = roundToWholeNumber(normalizedHeightInCm, DEFAULT_HEIGHT_CM);
  if (weightAnswer.numericValue != null) primary.weight = weightAnswer.numericValue;
  if (waistAnswer.numericValue != null) primary.waist = roundToWholeNumber(waistAnswer.numericValue, DEFAULT_WAIST_IN);
  if (hipAnswer.numericValue != null) followup.hipSize = roundToWholeNumber(hipAnswer.numericValue, DEFAULT_HIP_IN);

  if (heightUnit) primary.heightUnit = heightUnit;
  if (weightUnit) primary.weightUnit = weightUnit;
  if (waistUnit) primary.waistUnit = waistUnit;
  if (hipUnit) followup.hipUnit = hipUnit;

  return {
    primary,
    followup,
  };
};

/** BP readings ≤ 0 are treated as unset (placeholder / legacy bad saves) so inputs stay empty and “00” is visual only. */
const normalizeStoredVitalReading = (raw) => {
  if (raw == null || raw === '') {
    return null;
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) {
    return null;
  }
  return n;
};

const buildVitalsInitialValuesFromResponses = (questions = [], responses = []) => {
  const normalizedResponses = normalizeResponseItems(responses);
  if (!Array.isArray(questions) || questions.length === 0 || normalizedResponses.length === 0) {
    return {
      systolic: null,
      diastolic: null,
    };
  }

  const getValue = (aliases) => {
    const question = findQuestionByKeys(questions, aliases);
    if (!question) {
      return null;
    }

    const parsed = toNumericAnswer(getResponseAnswerForQuestion(question, normalizedResponses));
    return normalizeStoredVitalReading(parsed);
  };

  return {
    systolic: getValue(['systolic_blood_pressure', 'systolic']),
    diastolic: getValue(['diastolic_blood_pressure', 'diastolic']),
  };
};

const normalizeAnswerForQuestion = (question, rawAnswer) => {
  const questionType = normalizeQuestionType(question?.question_type);

  if (
    questionType === 'multiple_choice'
    || questionType === 'multi_choice'
    || questionType === 'checkbox'
    || questionType === 'multi_select'
  ) {
    const values = (Array.isArray(rawAnswer) ? rawAnswer : [rawAnswer])
      .map((value) => mapOptionLabelToValue(question, value))
      .filter((value) => !isEmptyAnswer(value));
    return values;
  }

  if (
    questionType === 'single_choice'
    || questionType === 'choice'
    || questionType === 'radio'
    || questionType === 'single_select'
    || questionType === 'select_one'
    || questionType === 'dropdown'
  ) {
    const selected = Array.isArray(rawAnswer) ? rawAnswer[0] : rawAnswer;
    return mapOptionLabelToValue(question, selected);
  }

  if (questionType === 'scale') {
    if (rawAnswer != null && typeof rawAnswer === 'object' && !Array.isArray(rawAnswer)) {
      const valRaw = rawAnswer.value ?? rawAnswer.answer ?? rawAnswer.response;
      const unitRaw = rawAnswer.unit ?? rawAnswer.units;
      const num = Number(valRaw);
      if (!Number.isFinite(num)) {
        return null;
      }
      const unitStr = String(unitRaw ?? '').trim();
      const unitCode = mapOptionLabelToValue(question, unitStr) || unitStr;
      if (!unitCode) {
        return null;
      }
      return { value: num, unit: unitCode };
    }
    const primitive = Array.isArray(rawAnswer) ? rawAnswer[0] : rawAnswer;
    const coerced = Number(primitive);
    if (!Number.isFinite(coerced)) {
      return null;
    }
    const firstOpt = Array.isArray(question?.options) ? question.options[0] : null;
    const unitCode = String(firstOpt?.option_value ?? '').trim();
    if (!unitCode) {
      return null;
    }
    return { value: coerced, unit: unitCode };
  }

  if (questionType === 'number' || questionType === 'numeric' || questionType === 'integer') {
    const selected = Array.isArray(rawAnswer) ? rawAnswer[0] : rawAnswer;
    const numberValue = Number(selected);
    return Number.isFinite(numberValue) ? numberValue : null;
  }

  if (Array.isArray(question?.options) && question.options.length > 0) {
    if (!Array.isArray(rawAnswer) || rawAnswer.length <= 1) {
      const picked = Array.isArray(rawAnswer) ? rawAnswer[0] : rawAnswer;
      const mapped = mapOptionLabelToValue(question, picked);
      if (!isEmptyAnswer(mapped) && String(mapped).trim() !== '') {
        return mapped;
      }
    }
  }

  if (Array.isArray(rawAnswer)) {
    return rawAnswer[0] ?? null;
  }

  return rawAnswer;
};

const buildResponseItem = (question, rawAnswer) => {
  const questionId = Number(question?.question_id || question?.id || 0);
  if (questionId <= 0) return null;

  const answer = normalizeAnswerForQuestion(question, rawAnswer);
  if (isEmptyAnswer(answer)) return null;

  return {
    question_id: questionId,
    answer,
  };
};

/** Resolves UI selection keys when API `question_key` uses underscores and static cards use hyphens (e.g. fall-sick vs fall_sick). */
const getSelectionsValueForKey = (selections, key) => {
  if (!selections || typeof selections !== 'object' || !key) {
    return undefined;
  }
  if (Object.prototype.hasOwnProperty.call(selections, key)) {
    return selections[key];
  }
  const underscored = String(key).replace(/-/g, '_');
  if (underscored !== key && Object.prototype.hasOwnProperty.call(selections, underscored)) {
    return selections[underscored];
  }
  const hyphened = String(key).replace(/_/g, '-');
  if (hyphened !== key && Object.prototype.hasOwnProperty.call(selections, hyphened)) {
    return selections[hyphened];
  }
  return undefined;
};

/** API ``scale`` questions require ``{ value, unit }`` with ``unit`` as questionnaire option_value (e.g. Metsights codes). */
const buildScaleResponseItem = (question, numericValue, unitLabel, opts = {}) => {
  const forceValueCmUnitZero = Boolean(opts?.forceValueCmUnitZero);
  const questionId = Number(question?.question_id || question?.id || 0);
  if (questionId <= 0) {
    return null;
  }
  if (numericValue == null || numericValue === '') {
    return null;
  }
  const n = Number(numericValue);
  if (!Number.isFinite(n)) {
    return null;
  }

  const qType = normalizeQuestionType(question?.question_type);
  if (qType !== 'scale') {
    return buildResponseItem(question, n);
  }

  let unitCode;
  if (forceValueCmUnitZero) {
    unitCode = '0';
  } else {
    unitCode = mapOptionLabelToValue(question, String(unitLabel || '').trim());
    if (!unitCode && Array.isArray(question?.options) && question.options.length > 0) {
      unitCode = String(question.options[0].option_value ?? '').trim();
    }
  }
  if (!unitCode) {
    return null;
  }

  return buildResponseItem(question, { value: n, unit: unitCode });
};

const buildResponsesFromSelections = (questions = [], selections = {}, preferences = {}) => {
  if (!Array.isArray(questions) || !selections || typeof selections !== 'object') {
    return [];
  }

  const visibleQuestions = computeQuestionsWithVisibility(questions, { selections, preferences })
    .filter((question) => question.is_visible !== false);

  const primaryResponses = visibleQuestions
    .map((question) => {
      const questionId = question?.question_id || question?.id;
      const key = question?.question_key || `question-${questionId}`;
      if (isWalkingDurationLifestyleQuestion(question)) {
        const wheel = readWalkingWheelFromSelections(selections, key);
        if (wheel && Number.isFinite(Number(wheel.value)) && String(wheel.unitLabel || '').trim()) {
          return buildScaleResponseItem(question, Number(wheel.value), String(wheel.unitLabel || '').trim());
        }
        return null;
      }
      return buildResponseItem(question, getSelectionsValueForKey(selections, key));
    })
    .filter(Boolean);

  const extraResponses = [];

  visibleQuestions.forEach((question) => {
    const questionId = question?.question_id || question?.id;
    const key = question?.question_key || `question-${questionId}`;
    if (!key) {
      return;
    }

    const selectedValues = getSelectionsValueForKey(selections, key);
    const normalizedSelection = Array.isArray(selectedValues) ? selectedValues : [selectedValues];
    const hasOtherSelected = normalizedSelection.some((value) => isOtherOptionLabel(value));
    if (!hasOtherSelected) {
      return;
    }

    const otherTextKey = getOtherTextSelectionKey(key);
    const otherTextRaw = getSelectionsValueForKey(selections, otherTextKey);
    const otherTextAnswer = Array.isArray(otherTextRaw)
      ? otherTextRaw[0]
      : otherTextRaw;
    if (isEmptyAnswer(otherTextAnswer)) {
      return;
    }

    const mappedOtherQuestion = findMappedOtherTextQuestion(questions, question);
    if (!mappedOtherQuestion) {
      return;
    }

    const responseItem = buildResponseItem(mappedOtherQuestion, String(otherTextAnswer || '').trim());
    if (responseItem) {
      extraResponses.push(responseItem);
    }
  });

  return [...primaryResponses, ...extraResponses];
};

const findQuestionForNutritionCardSelection = (questions, selectionKey, cardsData) => {
  if (!Array.isArray(questions) || questions.length === 0 || !selectionKey) {
    return null;
  }
  const sel = String(selectionKey).trim();

  const direct = questions.find((q) => {
    const qk = String(q?.question_key || '').trim();
    if (!qk) {
      return false;
    }
    return qk === sel
      || qk.replace(/_/g, '-') === sel.replace(/_/g, '-')
      || qk.replace(/-/g, '_') === sel.replace(/-/g, '_');
  });
  if (direct) {
    return direct;
  }

  const card =
    (Array.isArray(cardsData) ? cardsData.find((c) => c.key === sel) : null)
    || nutritionCards.find((c) => c.key === sel);
  const titleFromCard = String(card?.title || '').trim();
  if (titleFromCard) {
    const looseTitle = normalizeLookupText(titleFromCard);
    const byTitle = questions.find((q) => {
      const qt = normalizeLookupText(q?.question_text || '');
      return qt && (qt === looseTitle || qt.includes(looseTitle) || looseTitle.includes(qt));
    });
    if (byTitle) {
      return byTitle;
    }
  }

  const looseSel = normalizeLookupText(sel);
  return questions.find((q) => {
    const qk = normalizeLookupText(q?.question_key || '');
    return qk && (qk === looseSel || qk.includes(looseSel) || looseSel.includes(qk));
  }) || null;
};

/**
 * Nutrition questionnaire API expects `{ question_id, answer }` where `answer` is a string
 * or string[] (e.g. option_value / value, or option index as string when those are blank).
 */
const isNutritionMultiSelectQuestionType = (question) => {
  const questionType = normalizeQuestionType(question?.question_type);
  return (
    questionType === 'multiple_choice'
    || questionType === 'multi_choice'
    || questionType === 'checkbox'
    || questionType === 'multi_select'
  );
};

const coerceNutritionLogAnswerForApi = (question, answer) => {
  const opts = Array.isArray(question?.options) ? question.options : [];
  const isMulti = isNutritionMultiSelectQuestionType(question)
    || (Array.isArray(answer) && answer.length > 1);

  const toApiString = (piece) => {
    if (piece == null) {
      return null;
    }
    if (typeof piece === 'boolean') {
      return piece ? 'true' : 'false';
    }
    if (typeof piece === 'number' && Number.isFinite(piece)) {
      return String(piece);
    }
    if (typeof piece === 'object' && !Array.isArray(piece)) {
      return null;
    }
    const s = String(piece).trim();
    if (s === '') {
      return null;
    }
    if (opts.length > 0) {
      const idx = opts.findIndex((opt) => {
        const stored = getOptionStoredValue(opt);
        const display = getOptionDisplayText(opt);
        return (stored !== '' && stored === s) || display === s;
      });
      if (idx >= 0) {
        const stored = getOptionStoredValue(opts[idx]);
        return stored !== '' ? stored : String(idx);
      }
    }
    return s;
  };

  if (answer == null || (typeof answer === 'string' && answer.trim() === '')) {
    return null;
  }

  if (isMulti) {
    const arr = (Array.isArray(answer) ? answer : [answer])
      .map(toApiString)
      .filter((x) => x != null && x !== '');
    return arr.length ? arr : null;
  }

  if (Array.isArray(answer)) {
    return toApiString(answer[0]);
  }

  return toApiString(answer);
};

/** Merges `buildResponsesFromSelections` with answers keyed by static card keys that do not match API `question_key`. */
const buildNutritionLogResponsesForSave = (questions = [], selections = {}, cardsData = [], preferences = {}) => {
  const base = buildResponsesFromSelections(questions, selections, preferences);
  const byQuestionId = new Map(base.map((r) => [Number(r.question_id), r]));

  if (selections && typeof selections === 'object' && Array.isArray(cardsData)) {
    Object.keys(selections).forEach((key) => {
      if (!key || key.endsWith(OTHER_TEXT_SELECTION_KEY_SUFFIX)) {
        return;
      }
      const raw = getSelectionsValueForKey(selections, key);
      const hasValue = Array.isArray(raw) ? raw.length > 0 : !isEmptyAnswer(raw);
      if (!hasValue) {
        return;
      }

      const question = findQuestionForNutritionCardSelection(questions, key, cardsData);
      if (!question) {
        return;
      }
      const qid = Number(question.question_id || question.id || 0);
      if (qid <= 0 || byQuestionId.has(qid)) {
        return;
      }

      const item = buildResponseItem(question, raw);
      if (item) {
        byQuestionId.set(qid, item);
      }
    });
  }

  const questionById = new Map(
    (Array.isArray(questions) ? questions : []).map((q) => [Number(q?.question_id || q?.id || 0), q]),
  );

  return Array.from(byQuestionId.values())
    .map((item) => {
      const q = questionById.get(Number(item.question_id));
      const answer = coerceNutritionLogAnswerForApi(q, item.answer);
      if (answer == null || (Array.isArray(answer) && answer.length === 0)) {
        return null;
      }
      return {
        question_id: Number(item.question_id),
        answer,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.question_id - b.question_id);
};

const buildSelectionStateFromCards = (cardsData = [], initialSelections = {}) => {
  return cardsData.reduce((acc, card) => {
    const key = card?.key;
    if (!key) {
      return acc;
    }

    const nextValue = initialSelections && Object.prototype.hasOwnProperty.call(initialSelections, key)
      ? initialSelections[key]
      : card.defaultSelected;

    acc[key] = Array.isArray(nextValue) ? [...nextValue] : [];
    const wheelKey = lifestyleWalkingWheelStorageKey(key);
    if (initialSelections && Object.prototype.hasOwnProperty.call(initialSelections, wheelKey)) {
      acc[wheelKey] = initialSelections[wheelKey];
    }
    return acc;
  }, {});
};

const isNoneOptionLabel = (label) => normalizeLookupText(label) === 'none';

const areStringArraysEqual = (left = [], right = []) => {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((item, index) => item === right[index]);
};

const findFamilyHistoryCardKeys = (cardsData = []) => {
  const getCardKey = (matcher) => {
    const matched = cardsData.find((card) => matcher(card));
    return matched?.key || '';
  };

  const familyBloodKey = getCardKey((card) => {
    const key = normalizeLookupText(card?.key);
    const title = normalizeLookupText(card?.title);
    return key.includes('familyhealthconditions')
      || key.includes('familyblood')
      || title.includes('closebloodrelatives');
  });

  const diagnosedKey = getCardKey((card) => {
    const key = normalizeLookupText(card?.key);
    const title = normalizeLookupText(card?.title);
    return key.includes('diagnoseddiseases')
      || key.includes('diagnosed')
      || title.includes('areyoudiagnosedwiththefollowingdiseases');
  });

  const medicationKey = getCardKey((card) => {
    const key = normalizeLookupText(card?.key);
    const title = normalizeLookupText(card?.title);
    return key.includes('medication')
      || title.includes('takingmedicationsforthefollowingdiseases');
  });

  return { familyBloodKey, diagnosedKey, medicationKey };
};

const hasCardAnswer = (card = {}, selectionValue = [], walkingContext) => {
  if (!card || card.key === 'empty') {
    return true;
  }

  if (
    walkingContext
    && walkingContext.selections
    && Array.isArray(walkingContext.questions)
  ) {
    const sourceQuestion = findLifestyleSourceQuestion(walkingContext.questions, card.key);
    if (isWalkingDurationLifestyleCard(card, sourceQuestion)) {
      const w = readWalkingWheelFromSelections(walkingContext.selections, card.key);
      if (!w || !String(w.unitLabel || '').trim()) {
        return false;
      }
      return Number.isFinite(Number(w.value));
    }
  }

  if (card.isTextInput) {
    const textValue = Array.isArray(selectionValue) ? selectionValue[0] : '';
    return String(textValue || '').trim().length > 0;
  }

  return Array.isArray(selectionValue) && selectionValue.length > 0;
};

const isTextQuestionWithoutOptions = (question) => {
  const questionType = normalizeQuestionType(question?.question_type);
  const hasOptions = Array.isArray(question?.options)
    && question.options.some((option) => Boolean(option?.display_name || option?.option_value));

  return !hasOptions && ['text', 'short_text', 'long_text', 'textarea'].includes(questionType);
};

const normalizeLookupText = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const findQuestionByKeys = (questions = [], keys = [], textHints = []) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    return null;
  }

  const normalizedKeys = keys
    .map((key) => normalizeLookupText(key))
    .filter(Boolean);
  const normalizedHints = textHints
    .map((hint) => normalizeLookupText(hint))
    .filter(Boolean);

  const byExactKey = questions.find((question) => {
    const key = normalizeLookupText(question?.question_key);
    return key && normalizedKeys.some((candidate) => candidate === key);
  });
  if (byExactKey) {
    return byExactKey;
  }

  const byPartialKey = questions.find((question) => {
    const key = normalizeLookupText(question?.question_key);
    if (!key) return false;
    return normalizedKeys.some((candidate) => key.includes(candidate) || candidate.includes(key));
  });
  if (byPartialKey) {
    return byPartialKey;
  }

  const byTextHint = questions.find((question) => {
    const text = normalizeLookupText(question?.question_text);
    if (!text) return false;
    return normalizedHints.some((hint) => text.includes(hint));
  });

  return byTextHint || null;
};

const LIFESTYLE_WALKING_WHEEL_KEY_SUFFIX = '__walkingWheel';

const lifestyleWalkingWheelStorageKey = (cardKey) => `${String(cardKey || '')}${LIFESTYLE_WALKING_WHEEL_KEY_SUFFIX}`;

const findLifestyleSourceQuestion = (questions, cardKey) => {
  if (!Array.isArray(questions) || !cardKey) {
    return null;
  }
  const want = normalizeLookupText(String(cardKey));
  return questions.find((q) => {
    const k = String(q?.question_key || `question-${q?.question_id || q?.id || ''}`);
    if (k === cardKey) {
      return true;
    }
    if (normalizeLookupText(k) === want) {
      return true;
    }
    if (k.replace(/_/g, '-') === cardKey || k.replace(/-/g, '_') === cardKey) {
      return true;
    }
    return false;
  }) || null;
};

const isWalkingDurationLifestyleQuestion = (question) => {
  if (!question || typeof question !== 'object') {
    return false;
  }
  const title = normalizeLookupText(question?.question_text || '');
  const walkingTitle = title.includes('activelywalking') && title.includes('eachday');
  const opts = Array.isArray(question.options) ? question.options : [];
  if (opts.length !== 2) {
    return walkingTitle && normalizeQuestionType(question.question_type) === 'scale';
  }
  const labs = opts.map((o) => normalizeLookupText(getOptionDisplayText(o)));
  const hasMinute = labs.some((l) => l.includes('minute'));
  const hasHour = labs.some((l) => l.includes('hour'));
  return (hasMinute && hasHour && opts.length === 2) || walkingTitle;
};

const isWalkingDurationLifestyleCard = (card, sourceQuestion) => {
  if (!card || typeof card !== 'object') {
    return false;
  }
  if (sourceQuestion && isWalkingDurationLifestyleQuestion(sourceQuestion)) {
    return true;
  }
  const title = normalizeLookupText(card.title || '');
  const keyNorm = normalizeLookupText(String(card.key || ''));
  if (keyNorm === 'activewalking') {
    return true;
  }
  if (title.includes('activelywalking') && title.includes('eachday')) {
    const opts = card.options || [];
    if (opts.length === 2) {
      const labs = opts.map((o) => normalizeLookupText(getOptionLabel(o)));
      return labs.some((l) => l.includes('minute')) && labs.some((l) => l.includes('hour'));
    }
  }
  return false;
};

const getWalkingDurationUnitLabelsOrdered = (sourceQuestion, card) => {
  const opts = Array.isArray(sourceQuestion?.options) && sourceQuestion.options.length >= 2
    ? sourceQuestion.options
    : (Array.isArray(card?.options) ? card.options : []);
  if (!Array.isArray(opts) || opts.length < 2) {
    return ['minutes daily', 'hours daily'];
  }
  const labels = opts.slice(0, 2).map((o) => getOptionDisplayText(o)).filter(Boolean);
  if (labels.length < 2) {
    return ['minutes daily', 'hours daily'];
  }
  return [...labels].sort((a, b) => {
    const ma = /minute/i.test(a);
    const mb = /minute/i.test(b);
    if (ma && !mb) return -1;
    if (!ma && mb) return 1;
    return 0;
  });
};

const hydrateWalkingWheelFromAnswer = (question, answer) => {
  if (!isWalkingDurationLifestyleQuestion(question) || isEmptyAnswer(answer)) {
    return null;
  }
  const qType = normalizeQuestionType(question.question_type);
  if (qType === 'scale' && answer && typeof answer === 'object' && !Array.isArray(answer)) {
    const valRaw = answer.value ?? answer.answer ?? answer.response;
    const n = Number(valRaw);
    if (!Number.isFinite(n)) {
      return null;
    }
    const unitRaw = String(answer.unit ?? answer.units ?? '').trim();
    const unitLabel = mapOptionValueToLabel(question, unitRaw) || unitRaw;
    const max = /hour/i.test(unitLabel) ? 10 : 60;
    const value = Math.round(Math.min(max, Math.max(0, n)));
    return { value, unitLabel };
  }
  return null;
};

const readWalkingWheelFromSelections = (selections, questionKey) => {
  if (!selections || typeof selections !== 'object' || !questionKey) {
    return null;
  }
  const keys = [
    lifestyleWalkingWheelStorageKey(questionKey),
    lifestyleWalkingWheelStorageKey(String(questionKey).replace(/_/g, '-')),
    lifestyleWalkingWheelStorageKey(String(questionKey).replace(/-/g, '_')),
  ];
  for (const k of keys) {
    const w = selections[k];
    if (w && typeof w === 'object' && Number.isFinite(Number(w.value)) && String(w.unitLabel || '').trim()) {
      return w;
    }
  }
  return null;
};

const buildAnthropometryResponses = (questions = [], primaryValues = {}, followupValues = {}) => {
  const mergedValues = {
    ...primaryValues,
    ...followupValues,
  };

  const fieldMap = [
    {
      aliases: ['height'],
      textHints: ['height'],
      value: mergedValues.height,
      unitLabel: mergedValues.heightUnit,
      forceValueCmUnitZero: true,
    },
    {
      aliases: ['weight'],
      textHints: ['weight', 'body weight'],
      value: mergedValues.weight,
      unitLabel: mergedValues.weightUnit,
    },
    {
      aliases: ['waist_circumference', 'waist'],
      textHints: ['waist'],
      value: mergedValues.waist,
      unitLabel: mergedValues.waistUnit,
    },
    {
      aliases: ['hip_circumference', 'hip_size', 'hip'],
      textHints: ['hip'],
      value: mergedValues.hipSize,
      unitLabel: mergedValues.hipUnit,
    },
  ];

  return fieldMap
    .map(({ aliases, textHints, value, unitLabel, forceValueCmUnitZero }) => {
      if (value == null || value === '') {
        return null;
      }

      const question = findQuestionByKeys(questions, aliases, textHints);
      if (!question) {
        return null;
      }

      const shouldUseWholeNumber = aliases.some((alias) => (
        alias === 'height'
        || alias === 'waist_circumference'
        || alias === 'waist'
        || alias === 'hip_circumference'
        || alias === 'hip_size'
        || alias === 'hip'
      ));
      const normalizedValue = shouldUseWholeNumber ? roundToWholeNumber(value, 0) : value;

      return buildScaleResponseItem(question, normalizedValue, unitLabel, { forceValueCmUnitZero });
    })
    .filter(Boolean);
};

const DEFAULT_SYSTOLIC_BP = 120;
const DEFAULT_DIASTOLIC_BP = 80;

const buildVitalsResponses = (questions = [], values = {}) => {
  const fieldMap = [
    {
      aliases: ['systolic_blood_pressure', 'systolic'],
      value: normalizeStoredVitalReading(values.systolic) ?? DEFAULT_SYSTOLIC_BP,
    },
    {
      aliases: ['diastolic_blood_pressure', 'diastolic'],
      value: normalizeStoredVitalReading(values.diastolic) ?? DEFAULT_DIASTOLIC_BP,
    },
  ];

  return fieldMap
    .map(({ aliases, value }) => {
      const question = findQuestionByKeys(questions, aliases);
      if (!question) {
        return null;
      }

      const defaultUnitLabel = extractUnitOptionsFromQuestion(question)[0] || 'mmHG';
      return buildScaleResponseItem(question, value, defaultUnitLabel);
    })
    .filter(Boolean);
};

const isMetsightsScaleAnswerComplete = (answer) => {
  if (answer == null || typeof answer !== 'object' || Array.isArray(answer)) {
    return false;
  }
  const rawValue = answer.value ?? answer.numeric ?? answer.amount;
  if (rawValue == null || rawValue === '') {
    return false;
  }
  const unit = answer.unit ?? answer.unit_code ?? answer.unitCode;
  return unit != null && String(unit).trim() !== '';
};

const getAnswerForRouteCompletion = (question, rawResponses = []) => {
  const inline = question?.answer
    ?? question?.response
    ?? question?.value
    ?? question?.selected_option
    ?? question?.selected_options
    ?? question?.user_answer
    ?? question?.user_response
    ?? question?.answers;
  if (!isEmptyAnswer(inline)) {
    return inline;
  }
  return getResponseAnswerForQuestion(question, rawResponses);
};

const questionBlocksHealthAssessmentRoute = (question, rawResponses = []) => {
  if (!question || typeof question !== 'object') {
    return false;
  }
  if (question.is_read_only || question.is_visible === false) {
    return false;
  }

  const answer = getAnswerForRouteCompletion(question, rawResponses);
  if (isEmptyAnswer(answer)) {
    return true;
  }

  const qtype = String(question?.question_type || question?.type || '').trim().toLowerCase();
  if (qtype === 'scale' || (typeof answer === 'object' && answer !== null && !Array.isArray(answer))) {
    return !isMetsightsScaleAnswerComplete(answer);
  }

  return false;
};

const isAnthropometryPrimaryQuestionForRoute = (question) => {
  const k = String(question?.question_key || '').toLowerCase();
  const t = String(question?.question_text || '').toLowerCase();
  if (k.includes('hip') || t.includes('hip size')) {
    return false;
  }
  if (t.includes('body fat') || t.includes('body-fat') || k.includes('body_fat') || k.includes('fat_percent')) {
    return false;
  }
  return k.includes('height') || k.includes('weight') || k.includes('waist') || t.includes('waist');
};

const isAnthropometryFollowupQuestionForRoute = (question) => {
  const k = String(question?.question_key || '').toLowerCase();
  const t = String(question?.question_text || '').toLowerCase();
  return k.includes('hip') || t.includes('hip size');
};

const cardKeyForHealthAssessmentQuestion = (question) => (
  String(question?.question_key || `question-${question?.question_id || question?.id || ''}`)
);

const isFamilyMedicationSkippedForRoute = (allQuestions, rawResponses, question) => {
  const cards = toFamilyApiCards(allQuestions);
  const { diagnosedKey, medicationKey } = findFamilyHistoryCardKeys(cards);
  if (!medicationKey || !diagnosedKey) {
    return false;
  }
  if (String(medicationKey) !== cardKeyForHealthAssessmentQuestion(question)) {
    return false;
  }
  const selections = buildSelectionStateFromResponses(allQuestions, rawResponses);
  const diagnosedSel = Array.isArray(selections[diagnosedKey]) ? selections[diagnosedKey] : [];
  return diagnosedSel.length > 0 && diagnosedSel.every((item) => isNoneOptionLabel(item));
};

const isLifestyleWellnessPrioritiesQuestionForRoute = (question) => {
  const text = String(question?.question_text || '').toLowerCase();
  const key = String(question?.question_key || '').toLowerCase();
  return (
    key.includes('wellness_priorities')
    || key.includes('wellness-priorities')
    || key.includes('health_wellness')
    || (text.includes('wellness') && text.includes('priorit'))
    || (text.includes('health') && text.includes('priorit'))
  );
};

const isQuestionFilledForHealthAssessmentRoute = (
  routeId,
  question,
  allQuestions,
  rawResponses,
  selections,
) => {
  if (isWalkingDurationLifestyleQuestion(question)) {
    const key = question?.question_key || `question-${question?.question_id || question?.id || ''}`;
    const wheel = readWalkingWheelFromSelections(selections, key);
    if (wheel && Number.isFinite(Number(wheel.value)) && String(wheel.unitLabel || '').trim()) {
      return true;
    }
  }

  if (isLifestyleWellnessPrioritiesQuestionForRoute(question)) {
    const answer = getAnswerForRouteCompletion(question, rawResponses);
    const count = Array.isArray(answer)
      ? answer.length
      : (typeof answer === 'string' || typeof answer === 'number') && String(answer).trim()
        ? 1
        : 0;
    return count >= 1;
  }

  const mappedOther = findMappedOtherTextQuestion(allQuestions, question);
  if (mappedOther) {
    const parentAnswer = getAnswerForRouteCompletion(question, rawResponses);
    const selected = Array.isArray(parentAnswer) ? parentAnswer : [parentAnswer];
    const hasOther = selected.some((value) => isOtherOptionLabel(value));
    if (hasOther) {
      const otherAnswer = getAnswerForRouteCompletion(mappedOther, rawResponses);
      if (isEmptyAnswer(otherAnswer)) {
        return false;
      }
    }
  }

  if (routeId === 'family-history') {
    if (!questionBlocksHealthAssessmentRoute(question, rawResponses)) {
      return true;
    }
    return isFamilyMedicationSkippedForRoute(allQuestions, rawResponses, question);
  }

  return !questionBlocksHealthAssessmentRoute(question, rawResponses);
};

const isHealthAssessmentRouteFilled = (
  routeId,
  {
    questions = [],
    responses = [],
    preferences = {},
    anthropometryPrimary = {},
    anthropometryFollowup = {},
    vitalsValues = {},
  } = {},
) => {
  if (routeId === 'vitals') {
    const systolic = normalizeStoredVitalReading(vitalsValues?.systolic);
    const diastolic = normalizeStoredVitalReading(vitalsValues?.diastolic);
    if (systolic != null && diastolic != null) {
      return true;
    }

    const visibleVitals = (Array.isArray(questions) ? questions : [])
      .filter((question) => question?.is_visible !== false && !question?.is_read_only);
    if (visibleVitals.length === 0) {
      return false;
    }
    return visibleVitals.every((question) => !questionBlocksHealthAssessmentRoute(question, responses));
  }

  if (routeId === 'anthropometry') {
    const built = buildAnthropometryResponses(questions, anthropometryPrimary, anthropometryFollowup);
    const rawResponses = built.length > 0 ? built : responses;
    const primaryQuestions = (Array.isArray(questions) ? questions : [])
      .filter(isAnthropometryPrimaryQuestionForRoute);
    const followupQuestions = (Array.isArray(questions) ? questions : [])
      .filter(isAnthropometryFollowupQuestionForRoute);
    const primaryComplete = primaryQuestions.length > 0
      && primaryQuestions.every((question) => !questionBlocksHealthAssessmentRoute(question, rawResponses));
    const followupComplete = followupQuestions.length === 0
      || followupQuestions.every((question) => !questionBlocksHealthAssessmentRoute(question, rawResponses));
    return primaryComplete && followupComplete;
  }

  const list = Array.isArray(questions) ? questions : [];
  if (list.length === 0) {
    return false;
  }

  const rawResponses = Array.isArray(responses) ? responses : [];
  const selections = buildSelectionStateFromResponses(list, rawResponses);
  const visibleQuestions = computeQuestionsWithVisibility(list, { selections, preferences })
    .filter((question) => question.is_visible !== false && !question.is_read_only);

  if (visibleQuestions.length === 0) {
    return false;
  }

  return visibleQuestions.every((question) => (
    isQuestionFilledForHealthAssessmentRoute(routeId, question, list, rawResponses, selections)
  ));
};

/** Keeps card index on the same question when visibility removes cards; prunes hidden answers. */
const useLiveQuestionnaireCardNavigation = (cardsData, cardIndex, setCardIndex, setSelections) => {
  const activeCardKeyRef = useRef('');

  useEffect(() => {
    const key = cardsData[cardIndex]?.key;
    if (key) {
      activeCardKeyRef.current = key;
    }
  }, [cardsData, cardIndex]);

  useEffect(() => {
    if (!cardsData.length) {
      return;
    }
    setCardIndex((prev) => {
      const trackedKey = activeCardKeyRef.current;
      if (trackedKey) {
        const nextIdx = cardsData.findIndex((card) => card.key === trackedKey);
        if (nextIdx >= 0) {
          return nextIdx;
        }
      }
      return Math.min(prev, cardsData.length - 1);
    });
  }, [cardsData, setCardIndex]);

  useEffect(() => {
    setSelections((prev) => pruneSelectionsForVisibleCards(prev, cardsData));
  }, [cardsData, setSelections]);
};

const EmbeddedFamilyHistoryPage = ({
  onBack,
  onDone,
  onDraftSave,
  questions = [],
  initialSelections = {},
  categoryHeading = 'Family History',
  questionnairePreferences = {},
}) => {
  const [cardIndex, setCardIndex] = useState(0);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [selections, setSelections] = useState(() => {
    const initialVisible = computeQuestionsWithVisibility(questions, { preferences: questionnairePreferences });
    const cards = Array.isArray(questions) && questions.length > 0
      ? toFamilyApiCards(initialVisible)
      : familyCards;
    return buildSelectionStateFromCards(cards, initialSelections);
  });
  const visibleQuestions = useMemo(
    () => computeQuestionsWithVisibility(questions, { selections, preferences: questionnairePreferences }),
    [questions, selections, questionnairePreferences],
  );
  const cardsData = useMemo(() => {
    return Array.isArray(visibleQuestions) ? toFamilyApiCards(visibleQuestions) : familyCards;
  }, [visibleQuestions]);
  const selectionsRef = useRef(selections);
  selectionsRef.current = selections;
  const touchStartYRef = useRef(null);
  const lastWheelAtRef = useRef(0);
  const cardRef = useRef(null);

  useEffect(() => {
    setCardIndex(0);
    setShowInfoPopup(false);
    const initialVisible = computeQuestionsWithVisibility(questions, { preferences: questionnairePreferences });
    const cards = Array.isArray(questions) && questions.length > 0
      ? toFamilyApiCards(initialVisible)
      : familyCards;
    setSelections(buildSelectionStateFromCards(cards, initialSelections));
  }, [questions, initialSelections, questionnairePreferences]);

  useLiveQuestionnaireCardNavigation(cardsData, cardIndex, setCardIndex, setSelections);

  const familyHistoryKeys = useMemo(() => findFamilyHistoryCardKeys(cardsData), [cardsData]);

  const medicationOptions = useMemo(() => {
    const diseaseSelections = [];
    // Medication choices follow only self-reported diagnoses, not family-history conditions.
    const sourceKeys = [familyHistoryKeys.diagnosedKey].filter(Boolean);

    sourceKeys.forEach((key) => {
      const selected = Array.isArray(selections[key]) ? selections[key] : [];
      selected.forEach((value) => {
        const label = String(value || '').trim();
        if (!label) {
          return;
        }
        if (isNoneOptionLabel(label)) {
          return;
        }
        diseaseSelections.push(label);
      });
    });

    const uniqueSelections = [...new Set(diseaseSelections)];
    if (uniqueSelections.length === 0) {
      return ['None'];
    }
    return moveOtherLabelToEnd([...uniqueSelections, 'None']);
  }, [familyHistoryKeys, selections]);

  useEffect(() => {
    const medicationKey = familyHistoryKeys.medicationKey;
    if (!medicationKey) {
      return;
    }

    setSelections((prev) => {
      const currentSelections = Array.isArray(prev[medicationKey]) ? prev[medicationKey] : [];
      const allowedOptions = new Set(medicationOptions);
      let nextSelections = currentSelections.filter((item) => allowedOptions.has(item));

      const medicationHasOnlyNone = medicationOptions.length === 1 && isNoneOptionLabel(medicationOptions[0]);
      if (medicationHasOnlyNone) {
        nextSelections = ['None'];
      } else if (nextSelections.length > 1 && nextSelections.some((item) => isNoneOptionLabel(item))) {
        nextSelections = nextSelections.filter((item) => !isNoneOptionLabel(item));
      }

      if (areStringArraysEqual(currentSelections, nextSelections)) {
        return prev;
      }

      return {
        ...prev,
        [medicationKey]: nextSelections,
      };
    });
  }, [familyHistoryKeys, medicationOptions]);

  const resolvedCardsData = useMemo(() => {
    const medicationKey = familyHistoryKeys.medicationKey;
    if (!medicationKey) {
      return cardsData;
    }

    return cardsData.map((card) => {
      if (card.key !== medicationKey) {
        return card;
      }
      return {
        ...card,
        options: medicationOptions,
        multi: true,
      };
    });
  }, [cardsData, familyHistoryKeys, medicationOptions]);

  const isDiagnosedNoneOnly = useMemo(() => {
    const diagnosedKey = familyHistoryKeys.diagnosedKey;
    const medicationKey = familyHistoryKeys.medicationKey;
    if (!diagnosedKey || !medicationKey) {
      return false;
    }
    const diagnosedSel = Array.isArray(selections[diagnosedKey]) ? selections[diagnosedKey] : [];
    if (diagnosedSel.length === 0) {
      return false;
    }
    return diagnosedSel.every((item) => isNoneOptionLabel(item));
  }, [familyHistoryKeys.diagnosedKey, familyHistoryKeys.medicationKey, selections]);

  const visibleCardsData = useMemo(() => {
    const medicationKey = familyHistoryKeys.medicationKey;
    if (!medicationKey || !isDiagnosedNoneOnly) {
      return resolvedCardsData;
    }
    return resolvedCardsData.filter((card) => card.key !== medicationKey);
  }, [resolvedCardsData, familyHistoryKeys.medicationKey, isDiagnosedNoneOnly]);

  useEffect(() => {
    const maxIdx = Math.max(0, visibleCardsData.length - 1);
    setCardIndex((prev) => (prev > maxIdx ? maxIdx : prev));
  }, [visibleCardsData]);

  const hasVisibleCards = visibleCardsData.length > 0;
  const totalCards = Math.max(visibleCardsData.length, 1);
  const activeCard = visibleCardsData[cardIndex] || {
    key: 'empty',
    title: 'No questions available for this category yet.',
    helper: '',
    options: [],
    defaultSelected: [],
    multi: false,
  };
  const activeSelections = selections[activeCard.key] || [];
  const hasOtherOption = !activeCard.isTextInput
    && Array.isArray(activeCard.options)
    && activeCard.options.some((option) => isOtherOptionLabel(getOptionLabel(option)));
  const hasOtherSelected = hasOtherOption && activeSelections.some((option) => isOtherOptionLabel(option));
  const otherTextSelectionKey = getOtherTextSelectionKey(activeCard.key);
  const otherTextInputValue = (Array.isArray(selections[otherTextSelectionKey]) ? selections[otherTextSelectionKey][0] : '') || '';
  const progressNumerator = cardIndex + 1;
  const questionsLeft = totalCards - progressNumerator;
  const stackCardCount = questionsLeft >= 2 ? 2 : questionsLeft;
  const stackSpace = stackCardCount === 2 ? 36 : stackCardCount === 1 ? 18 : 0;
  const infoLines = normalizeInfoLines(activeCard.infoLines || []);
  const { subtitleRef, stackWrapRef, stackTopGap } = useCenteredQuestionGap([
    cardIndex,
    stackSpace,
    activeCard.title,
    activeCard.helper,
    activeCard.options?.length || 0,
  ]);

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
    if (!hasVisibleCards || activeCard.key === 'empty') {
      return;
    }
    if (!hasCardAnswer(activeCard, activeSelections)) {
      triggerCardShake();
      return;
    }

    onDraftSave?.(selectionsRef.current);

    goNext();
  };

  const handleTouchStart = (e) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartYRef.current == null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    if (Math.abs(deltaY) > 40) {
      if (deltaY < 0) {
        attemptGoNext();
      } else {
        goPrev();
      }
    }
    touchStartYRef.current = null;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastWheelAtRef.current < 340) return;
    lastWheelAtRef.current = now;

    if (e.deltaY > 0) {
      attemptGoNext();
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

      const nextState = {
        ...prev,
        [activeCard.key]: next,
      };

      const hasOtherInNext = next.some((item) => isOtherOptionLabel(item));
      if (!hasOtherInNext && Object.prototype.hasOwnProperty.call(nextState, otherTextSelectionKey)) {
        delete nextState[otherTextSelectionKey];
      }

      return nextState;
    });
  };

  const handleOtherInputChange = (event) => {
    const nextValue = String(event?.target?.value || '');
    setSelections((prev) => ({
      ...prev,
      [otherTextSelectionKey]: nextValue ? [nextValue] : [],
    }));
  };

  const handleTextInputChange = (event) => {
    const nextValue = String(event?.target?.value || '');
    setSelections((prev) => ({
      ...prev,
      [activeCard.key]: nextValue ? [nextValue] : [],
    }));
  };

  const textInputValue = activeSelections[0] || '';
  const questionSubline = getHardcodedQuestionnaireSubline(activeCard.title) || activeCard.helper;

  return (
    <div className="family-history-page">
      <div className="family-history-page__header">
        <button className="family-history-page__back" type="button" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="family-history-page__title">{categoryHeading}</h1>
        <img src={ques2Icon} alt="" aria-hidden="true" className="family-history-page__header-icon" />
      </div>

      <p className="family-history-page__subtitle" ref={subtitleRef}>
        Knowing your family's health patterns helps us predict risks more accurately.
      </p>

      <div
        className="family-history-page__stack-wrap"
        ref={stackWrapRef}
        style={{ '--stack-space': `${stackSpace}px`, marginTop: `${stackTopGap}px` }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div key={activeCard.key} ref={cardRef} className="family-history-page__card">
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
          {questionSubline ? <p className="family-history-page__helper">{questionSubline}</p> : null}

          {activeCard.isTextInput ? (
            <div className="family-history-page__text-input-wrap">
              <input
                type="text"
                className="family-history-page__text-input"
                value={textInputValue}
                onChange={handleTextInputChange}
                placeholder="Type your answer"
                aria-label={activeCard.title || 'Answer'}
                onWheel={(event) => event.stopPropagation()}
              />
            </div>
          ) : (
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
          )}

          {hasOtherSelected ? (
            <div className="family-history-page__other-input-wrap">
              <input
                type="text"
                className="family-history-page__other-input"
                value={otherTextInputValue}
                onChange={handleOtherInputChange}
                placeholder="Please specify"
                aria-label={`${activeCard.title || 'Other'} - please specify`}
                onWheel={(event) => event.stopPropagation()}
              />
            </div>
          ) : null}
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
        <button
          type="button"
          className="family-history-page__done"
          onClick={() => {
            if (!hasVisibleCards) {
              onDone?.(selectionsRef.current);
              return;
            }
            if (!hasCardAnswer(activeCard, activeSelections)) {
              triggerCardShake();
              return;
            }

            onDraftSave?.(selectionsRef.current);
            onDone?.(selectionsRef.current);
          }}
        >
          Done
        </button>
      ) : null}

      {showInfoPopup && infoLines.length ? (
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
            {infoLines.map((line, index) => (
              <li key={`${line}-${index}`}>{line}</li>
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
    helper: '',
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

const resolveOptionChipValue = (option, label) => {
  const fromOptionValue = option?.option_value;
  if (fromOptionValue != null && String(fromOptionValue).trim() !== '') {
    return String(fromOptionValue).trim();
  }
  const fromValue = option?.value;
  if (fromValue != null && String(fromValue).trim() !== '') {
    return String(fromValue).trim();
  }
  return String(label || '').trim();
};

const toLifestyleApiCards = (questions = []) => {
  return questions
    .filter((question) => question?.is_visible !== false)
    .filter((question) => !isLikelyOtherTextQuestion(question))
    .map((question) => {
    const key = question?.question_key || `question-${question?.question_id}`;
    const isMulti = ['multi_choice', 'multiple_choice'].includes(String(question?.question_type || '').toLowerCase());
    const isTextInput = isTextQuestionWithoutOptions(question);
    const options = Array.isArray(question?.options)
      ? [...new Map(question.options.map((option) => {
          const label = String(option?.display_name || option?.option_value || option?.label || '').trim();
          const value = resolveOptionChipValue(option, label);
          return [value || label, {
            label: label || value,
            value: value || label,
            fullWidth: lifestyleFullWidthByQuestionKey[key]?.has(label) || shouldUseFullWidthOption(label || value),
          }];
        })).values()].filter((option) => option.label || option.value)
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
      options: moveOtherOptionToEnd(options),
      defaultSelected: [],
      multi: isMulti,
      maxSelections: key === 'wellness-priorities' || key === 'wellness_priorities' ? 2 : undefined,
      isTextInput,
      otherTextQuestionKey: findMappedOtherTextQuestion(questions, question)?.question_key || '',
    };
    });
};

const EMPTY_LIFESTYLE_ACTIVE_CARD = {
  key: 'empty',
  title: 'No questions available for this category yet.',
  helper: '',
  options: [],
  defaultSelected: [],
  multi: false,
};

const EmbeddedLifestyleHabitsPage = ({
  onBack,
  onDone,
  onDraftSave,
  questions = [],
  initialSelections = {},
  categoryHeading = 'Lifestyle & Habits',
  questionnairePreferences = {},
}) => {
  const [cardIndex, setCardIndex] = useState(0);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [selections, setSelections] = useState(() => {
    const initialVisible = computeQuestionsWithVisibility(questions, { preferences: questionnairePreferences });
    const cards = Array.isArray(questions) && questions.length > 0
      ? toLifestyleApiCards(initialVisible)
      : lifestyleCards;
    return buildSelectionStateFromCards(cards, initialSelections);
  });
  const visibleQuestions = useMemo(
    () => computeQuestionsWithVisibility(questions, { selections, preferences: questionnairePreferences }),
    [questions, selections, questionnairePreferences],
  );
  const cardsData = useMemo(() => {
    return Array.isArray(visibleQuestions) ? toLifestyleApiCards(visibleQuestions) : lifestyleCards;
  }, [visibleQuestions]);
  const selectionsRef = useRef(selections);
  selectionsRef.current = selections;
  const touchStartYRef = useRef(null);
  const lastWheelAtRef = useRef(0);
  const cardRef = useRef(null);

  useEffect(() => {
    setCardIndex(0);
    setShowInfoPopup(false);
    const initialVisible = computeQuestionsWithVisibility(questions, { preferences: questionnairePreferences });
    const cards = Array.isArray(questions) && questions.length > 0
      ? toLifestyleApiCards(initialVisible)
      : lifestyleCards;
    setSelections(buildSelectionStateFromCards(cards, initialSelections));
  }, [questions, initialSelections, questionnairePreferences]);

  useLiveQuestionnaireCardNavigation(cardsData, cardIndex, setCardIndex, setSelections);

  const totalCards = Math.max(cardsData.length, 1);
  const activeCard = useMemo(
    () => cardsData[cardIndex] || EMPTY_LIFESTYLE_ACTIVE_CARD,
    [cardsData, cardIndex],
  );
  const activeSelections = selections[activeCard.key] || [];
  const sourceQuestion = useMemo(
    () => findLifestyleSourceQuestion(visibleQuestions, activeCard.key),
    [visibleQuestions, activeCard.key],
  );
  const walkingMode = isWalkingDurationLifestyleCard(activeCard, sourceQuestion);
  const unitLabels = useMemo(
    () => getWalkingDurationUnitLabelsOrdered(sourceQuestion, activeCard),
    [sourceQuestion, activeCard],
  );
  const walkingWheel = readWalkingWheelFromSelections(selections, activeCard.key);
  const walkingTouchLastXRef = useRef(null);
  const walkingCurLabel = walkingWheel?.unitLabel || unitLabels[0];
  const walkingMax = /hour/i.test(String(walkingCurLabel || '')) ? 10 : 60;
  const walkingVal = Math.min(walkingMax, Math.max(0, Number(walkingWheel?.value ?? 0)));

  useEffect(() => {
    if (!walkingMode || !activeCard?.key) {
      return;
    }
    const cardKey = activeCard.key;
    const card = cardsData[cardIndex];
    if (!card || card.key !== cardKey) {
      return;
    }
    const sq = findLifestyleSourceQuestion(visibleQuestions, cardKey);
    setSelections((prev) => {
      if (readWalkingWheelFromSelections(prev, cardKey)) {
        return prev;
      }
      const wk = lifestyleWalkingWheelStorageKey(cardKey);
      const labels = getWalkingDurationUnitLabelsOrdered(sq, card);
      return {
        ...prev,
        [cardKey]: [],
        [wk]: { value: 0, unitLabel: labels[0] },
      };
    });
  }, [walkingMode, activeCard.key, cardIndex, cardsData, visibleQuestions]);

  const bumpWalkingValue = (delta) => {
    if (!walkingMode || !activeCard?.key) {
      return;
    }
    const wk = lifestyleWalkingWheelStorageKey(activeCard.key);
    setSelections((prev) => {
      const labels = getWalkingDurationUnitLabelsOrdered(sourceQuestion, activeCard);
      const cur = readWalkingWheelFromSelections(prev, activeCard.key) || { value: 0, unitLabel: labels[0] };
      const idx = Math.max(0, labels.findIndex((l) => String(l).toLowerCase() === String(cur.unitLabel).toLowerCase()));
      const unitLabel = labels[idx >= 0 ? idx : 0];
      const max = /hour/i.test(unitLabel) ? 10 : 60;
      const next = Math.min(max, Math.max(0, Number(cur.value) + delta));
      return {
        ...prev,
        [activeCard.key]: [],
        [wk]: { value: next, unitLabel },
      };
    });
  };

  const handleWalkingWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const raw = e.deltaX !== 0 ? e.deltaX : e.deltaY;
    const delta = raw > 0 ? 1 : -1;
    bumpWalkingValue(delta);
  };

  const handleWalkingTouchStart = (e) => {
    e.stopPropagation();
    walkingTouchLastXRef.current = e.touches[0].clientX;
  };

  const handleWalkingTouchMove = (e) => {
    e.stopPropagation();
    if (walkingTouchLastXRef.current == null) return;
    const x = e.touches[0].clientX;
    const delta = walkingTouchLastXRef.current - x;
    if (Math.abs(delta) >= 8) {
      bumpWalkingValue(Math.sign(delta));
      walkingTouchLastXRef.current = x;
    }
  };

  const handleWalkingTouchEnd = (e) => {
    e.stopPropagation();
    walkingTouchLastXRef.current = null;
  };

  const handleWalkingUnitChange = (nextLabel) => {
    if (!walkingMode || !activeCard?.key) {
      return;
    }
    const wk = lifestyleWalkingWheelStorageKey(activeCard.key);
    setSelections((prev) => {
      const max = /hour/i.test(nextLabel) ? 10 : 60;
      const cur = readWalkingWheelFromSelections(prev, activeCard.key) || { value: 0, unitLabel: unitLabels[0] };
      const nextVal = Math.min(max, Math.max(0, Number(cur.value)));
      return {
        ...prev,
        [activeCard.key]: [],
        [wk]: { value: nextVal, unitLabel: nextLabel },
      };
    });
  };

  const walkingAnswerContext = useMemo(
    () => ({ selections, questions }),
    [selections, questions],
  );

  const walkingLeftFar = Math.max(0, walkingVal - 2);
  const walkingLeftNear = Math.max(0, walkingVal - 1);
  const walkingRightNear = Math.min(walkingMax, walkingVal + 1);
  const walkingRightFar = Math.min(walkingMax, walkingVal + 2);

  const hasOtherOption = !activeCard.isTextInput
    && Array.isArray(activeCard.options)
    && activeCard.options.some((option) => isOtherOptionLabel(getOptionLabel(option)));
  const hasOtherSelected = hasOtherOption && activeSelections.some((option) => isOtherOptionLabel(option));
  const otherTextSelectionKey = getOtherTextSelectionKey(activeCard.key);
  const otherTextInputValue = (Array.isArray(selections[otherTextSelectionKey]) ? selections[otherTextSelectionKey][0] : '') || '';
  const progressNumerator = cardIndex + 1;
  const questionsLeft = totalCards - progressNumerator;
  const stackCardCount = questionsLeft >= 2 ? 2 : questionsLeft;
  const stackSpace = stackCardCount === 2 ? 36 : stackCardCount === 1 ? 18 : 0;
  const infoLines = normalizeInfoLines(activeCard.infoLines || []);
  const { subtitleRef, stackWrapRef, stackTopGap } = useCenteredQuestionGap([
    cardIndex,
    stackSpace,
    activeCard.title,
    activeCard.helper,
    walkingMode ? 5 : (activeCard.options?.length || 0),
  ]);

  const chipClass = (option) => {
    const token = String(option?.value || option?.label || '').trim();
    const selected = activeSelections.includes(token)
      || activeSelections.includes(String(option?.label || '').trim());
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
    if (!hasCardAnswer(activeCard, activeSelections, walkingAnswerContext)) {
      triggerCardShake();
      return;
    }

    onDraftSave?.(selectionsRef.current);

    goNext();
  };

  const handleTouchStart = (e) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartYRef.current == null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    if (Math.abs(deltaY) > 40) {
      if (deltaY < 0) {
        attemptGoNext();
      } else {
        goPrev();
      }
    }
    touchStartYRef.current = null;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastWheelAtRef.current < 340) return;
    lastWheelAtRef.current = now;

    if (e.deltaY > 0) {
      attemptGoNext();
    } else if (e.deltaY < 0) {
      goPrev();
    }
  };

  const handleChipClick = (option) => {
    const optionToken = String(option?.value || option?.label || '').trim();
    if (!optionToken) {
      return;
    }
    setSelections((prev) => {
      const current = prev[activeCard.key] || [];

      if (!activeCard.multi) {
        return {
          ...prev,
          [activeCard.key]: [optionToken],
        };
      }

      const exists = current.includes(optionToken);
      let next;

      if (exists) {
        next = current.filter((item) => item !== optionToken);
      } else {
        next = [...current, optionToken];
      }

      if (activeCard.maxSelections && next.length > activeCard.maxSelections) {
        next = next.slice(next.length - activeCard.maxSelections);
      }

      const nextState = {
        ...prev,
        [activeCard.key]: next,
      };

      const hasOtherInNext = next.some((item) => isOtherOptionLabel(item));
      if (!hasOtherInNext && Object.prototype.hasOwnProperty.call(nextState, otherTextSelectionKey)) {
        delete nextState[otherTextSelectionKey];
      }

      return nextState;
    });
  };

  const handleOtherInputChange = (event) => {
    const nextValue = String(event?.target?.value || '');
    setSelections((prev) => ({
      ...prev,
      [otherTextSelectionKey]: nextValue ? [nextValue] : [],
    }));
  };

  const handleTextInputChange = (event) => {
    const nextValue = String(event?.target?.value || '');
    setSelections((prev) => ({
      ...prev,
      [activeCard.key]: nextValue ? [nextValue] : [],
    }));
  };

  const textInputValue = activeSelections[0] || '';
  const questionSubline = getHardcodedQuestionnaireSubline(activeCard.title) || activeCard.helper;

  return (
    <div className="lifestyle-habits-page">
      <div className="lifestyle-habits-page__header">
        <button className="lifestyle-habits-page__back" type="button" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="lifestyle-habits-page__title">{categoryHeading}</h1>
        <img src={ques3Icon} alt="" aria-hidden="true" className="lifestyle-habits-page__header-icon" />
      </div>

      <p className="lifestyle-habits-page__subtitle" ref={subtitleRef}>
        Your routines help our system decode how your habits influence your health.
      </p>

      <div
        className="lifestyle-habits-page__stack-wrap"
        ref={stackWrapRef}
        style={{ '--stack-space': `${stackSpace}px`, marginTop: `${stackTopGap}px` }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div key={activeCard.key} ref={cardRef} className="lifestyle-habits-page__card">
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

          {questionSubline ? <p className="lifestyle-habits-page__helper">{questionSubline}</p> : null}

          {activeCard.isTextInput ? (
            <div className="lifestyle-habits-page__text-input-wrap">
              <input
                type="text"
                className="lifestyle-habits-page__text-input"
                value={textInputValue}
                onChange={handleTextInputChange}
                placeholder="Type your answer"
                aria-label={activeCard.title || 'Answer'}
                onWheel={(event) => event.stopPropagation()}
              />
            </div>
          ) : walkingMode ? (
            <div
              className="lifestyle-habits-page__walking-box"
              onWheel={handleWalkingWheel}
              onTouchStart={handleWalkingTouchStart}
              onTouchMove={handleWalkingTouchMove}
              onTouchEnd={handleWalkingTouchEnd}
              role="group"
              aria-label="Walking duration"
            >
              <FollowupUnitDropdown
                value={walkingCurLabel}
                options={unitLabels}
                onChange={handleWalkingUnitChange}
              />
              <div className="lifestyle-habits-page__walking-arrow-wrap">
                <AnthropometryTriangleArrow direction="down" />
              </div>
              <div className="lifestyle-habits-page__walking-h-row">
                <span className="lifestyle-habits-page__walking-faded lifestyle-habits-page__walking-faded--far">{walkingLeftFar}</span>
                <span className="lifestyle-habits-page__walking-faded lifestyle-habits-page__walking-faded--near">{walkingLeftNear}</span>
                <div className="lifestyle-habits-page__walking-selected-box">
                  <span className="lifestyle-habits-page__walking-selected-value">{walkingVal}</span>
                </div>
                <span className="lifestyle-habits-page__walking-faded lifestyle-habits-page__walking-faded--near">{walkingRightNear}</span>
                <span className="lifestyle-habits-page__walking-faded lifestyle-habits-page__walking-faded--far">{walkingRightFar}</span>
              </div>
              <div className="lifestyle-habits-page__walking-arrow-wrap">
                <AnthropometryTriangleArrow direction="up" />
              </div>
            </div>
          ) : (
            <div className={`lifestyle-habits-page__chips ${activeCard.multi ? 'lifestyle-habits-page__chips--multi' : ''}`}>
              {activeCard.options.map((option) => {
                const optionToken = String(option?.value || option?.label || '').trim();
                const selected = activeSelections.includes(optionToken)
                  || activeSelections.includes(String(option?.label || '').trim());
                return (
                  <button
                    key={optionToken || option.label}
                    type="button"
                    className={chipClass(option)}
                    onClick={() => handleChipClick(option)}
                  >
                    {activeCard.multi && selected ? (
                      <img src={tickIcon} alt="" aria-hidden="true" className="lifestyle-habits-page__tick" />
                    ) : null}
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {hasOtherSelected ? (
            <div className="lifestyle-habits-page__other-input-wrap">
              <input
                type="text"
                className="lifestyle-habits-page__other-input"
                value={otherTextInputValue}
                onChange={handleOtherInputChange}
                placeholder="Please specify"
                aria-label={`${activeCard.title || 'Other'} - please specify`}
                onWheel={(event) => event.stopPropagation()}
              />
            </div>
          ) : null}
        </div>

        {stackCardCount >= 1 ? <div className="lifestyle-habits-page__stack-card lifestyle-habits-page__stack-card--one" aria-hidden="true" /> : null}
        {stackCardCount >= 2 ? <div className="lifestyle-habits-page__stack-card lifestyle-habits-page__stack-card--two" aria-hidden="true" /> : null}
      </div>

      <p className="lifestyle-habits-page__swipe-hint">Scroll up / down to navigate</p>

      {cardIndex === totalCards - 1 ? (
        <button
          type="button"
          className="lifestyle-habits-page__done"
          onClick={() => {
            if (!hasCardAnswer(activeCard, activeSelections, walkingAnswerContext)) {
              triggerCardShake();
              return;
            }

            onDraftSave?.(selectionsRef.current);
            onDone?.(selectionsRef.current);
          }}
        >
          Done
        </button>
      ) : null}

      {showInfoPopup && infoLines.length ? (
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
            {infoLines.map((line, index) => (
              <li key={`${line}-${index}`}>{line}</li>
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

const isNutritionDietTypeCard = (card) => {
  if (!card || typeof card !== 'object') {
    return false;
  }
  const k = String(card.key || '').toLowerCase().replace(/-/g, '_');
  if (['diet_type', 'diet_type_primary', 'primary_diet', 'diet'].includes(k)) {
    return true;
  }
  const t = String(card.title || '').toLowerCase();
  return t.includes('type of diet') || (t.includes('diet') && t.includes('primarily'));
};

const isNutritionDailyFoodGroupsCard = (card) => {
  if (!card || typeof card !== 'object') {
    return false;
  }
  const k = String(card.key || '').toLowerCase().replace(/-/g, '_');
  if (k === 'daily_food_groups' || k === 'daily_food_groups_consumed' || k.includes('food_group')) {
    return true;
  }
  const t = String(card.title || '').toLowerCase();
  return t.includes('food groups') && (t.includes('every day') || t.includes('daily'));
};

/** Jain / Veg / Vegetarian: hide eggs and meat/fish. Eggetarian: hide chicken/fish only (eggs allowed). */
const mapNutritionDietChoiceToFoodGroupFilterMode = (choice) => {
  const d = String(choice || '').trim().toLowerCase();
  if (d === 'jain' || d === 'veg' || d === 'vegetarian') {
    return 'strict_veg';
  }
  if (d === 'eggetarian' || d === 'eggitarian') {
    return 'eggetarian';
  }
  return null;
};

const nutritionFoodGroupOptionHiddenByDiet = (optionLabel, mode) => {
  if (!mode) {
    return false;
  }
  const t = String(optionLabel || '').trim().toLowerCase();
  const isEggs = t === 'eggs' || /^eggs?\b/.test(t);
  const isMeatOrFish = t.includes('chicken') || t.includes('fish');
  if (mode === 'strict_veg') {
    return isEggs || isMeatOrFish;
  }
  if (mode === 'eggetarian') {
    return isMeatOrFish;
  }
  return false;
};

const getNutritionDietFoodGroupFilterMode = (selections, cardsData) => {
  if (!selections || typeof selections !== 'object' || !Array.isArray(cardsData)) {
    return null;
  }
  const dietCard = cardsData.find(isNutritionDietTypeCard);
  const dietKey = dietCard?.key;
  if (!dietKey) {
    return null;
  }
  const choice = (selections[dietKey] || [])[0];
  return mapNutritionDietChoiceToFoodGroupFilterMode(choice);
};

const filterNutritionFoodGroupOptionsForDiet = (options, selections, cardsData) => {
  if (!Array.isArray(options)) {
    return [];
  }
  const mode = getNutritionDietFoodGroupFilterMode(selections, cardsData);
  if (!mode) {
    return options;
  }
  return options.filter((opt) => !nutritionFoodGroupOptionHiddenByDiet(opt?.label, mode));
};

/** Drops daily food-group picks that conflict with the selected diet (same rules as option filtering). */
const pruneNutritionFoodGroupSelectionsForPayload = (prev, cardsData) => {
  if (!prev || typeof prev !== 'object' || !Array.isArray(cardsData)) {
    return prev;
  }
  const dietKey = cardsData.find(isNutritionDietTypeCard)?.key;
  const fgKey = cardsData.find(isNutritionDailyFoodGroupsCard)?.key;
  if (!dietKey || !fgKey) {
    return prev;
  }
  const mode = mapNutritionDietChoiceToFoodGroupFilterMode((prev[dietKey] || [])[0]);
  if (!mode) {
    return prev;
  }
  const cur = prev[fgKey];
  if (!Array.isArray(cur) || cur.length === 0) {
    return prev;
  }
  const next = cur.filter((label) => !nutritionFoodGroupOptionHiddenByDiet(label, mode));
  if (next.length === cur.length) {
    return prev;
  }
  const nextState = { ...prev, [fgKey]: next };
  const fgOtherKey = getOtherTextSelectionKey(fgKey);
  const hasOtherInNext = next.some((item) => isOtherOptionLabel(item));
  if (!hasOtherInNext && Object.prototype.hasOwnProperty.call(nextState, fgOtherKey)) {
    delete nextState[fgOtherKey];
  }
  return nextState;
};

const toNutritionApiCards = (questions = []) => {
  return questions
    .filter((question) => question?.is_visible !== false)
    .filter((question) => !isLikelyOtherTextQuestion(question))
    .map((question) => {
    const key = question?.question_key || `question-${question?.question_id}`;
    const isMulti = ['multi_choice', 'multiple_choice'].includes(String(question?.question_type || '').toLowerCase());
    const isTextInput = isTextQuestionWithoutOptions(question);
    const options = Array.isArray(question?.options)
      ? [...new Map(question.options.map((option) => {
          const label = String(option?.display_name || option?.option_value || option?.label || '').trim();
          const value = resolveOptionChipValue(option, label);
          return [value || label, {
            label: label || value,
            value: value || label,
            fullWidth: nutritionFullWidthByQuestionKey[key]?.has(label) || shouldUseFullWidthOption(label || value),
          }];
        })).values()].filter((option) => option.label || option.value)
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
      options: moveOtherOptionToEnd(options),
      defaultSelected: [],
      multi: isMulti,
      isTextInput,
      otherTextQuestionKey: findMappedOtherTextQuestion(questions, question)?.question_key || '',
    };
    });
};

const NUTRITION_LOG_EMPTY_CARD = {
  key: 'empty',
  title: 'No questions available for this category yet.',
  helper: '',
  options: [],
  defaultSelected: [],
  multi: false,
};

const NUTRITION_EMPTY_SELECTIONS = [];

const EmbeddedNutritionLogPage = ({
  onBack,
  onDone,
  onDraftSave,
  questions = [],
  initialSelections = {},
  categoryHeading = 'Nutrition Log',
  questionnairePreferences = {},
}) => {
  const [cardIndex, setCardIndex] = useState(0);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [selections, setSelections] = useState(() => {
    const initialVisible = computeQuestionsWithVisibility(questions, { preferences: questionnairePreferences });
    const cards = Array.isArray(questions) && questions.length > 0
      ? toNutritionApiCards(initialVisible)
      : nutritionCards;
    return buildSelectionStateFromCards(cards, initialSelections);
  });
  const visibleQuestions = useMemo(
    () => computeQuestionsWithVisibility(questions, { selections, preferences: questionnairePreferences }),
    [questions, selections, questionnairePreferences],
  );
  const cardsData = useMemo(() => {
    if (!Array.isArray(visibleQuestions) || visibleQuestions.length === 0) {
      return nutritionCards;
    }
    return toNutritionApiCards(visibleQuestions);
  }, [visibleQuestions]);
  const selectionsRef = useRef(selections);
  selectionsRef.current = selections;
  const touchStartYRef = useRef(null);
  const lastWheelAtRef = useRef(0);
  const cardRef = useRef(null);

  useEffect(() => {
    setCardIndex(0);
    setShowInfoPopup(false);
    const initialVisible = computeQuestionsWithVisibility(questions, { preferences: questionnairePreferences });
    const cards = Array.isArray(questions) && questions.length > 0
      ? toNutritionApiCards(initialVisible)
      : nutritionCards;
    setSelections(buildSelectionStateFromCards(cards, initialSelections));
  }, [questions, initialSelections, questionnairePreferences]);

  useLiveQuestionnaireCardNavigation(cardsData, cardIndex, setCardIndex, setSelections);

  const dietTypeCardKey = useMemo(() => cardsData.find(isNutritionDietTypeCard)?.key, [cardsData]);
  const dailyFoodGroupsCardKey = useMemo(() => cardsData.find(isNutritionDailyFoodGroupsCard)?.key, [cardsData]);

  const totalCards = Math.max(cardsData.length, 1);
  const activeCard = useMemo(
    () => cardsData[cardIndex] || NUTRITION_LOG_EMPTY_CARD,
    [cardsData, cardIndex],
  );
  const activeCardVisibleOptions = useMemo(() => {
    const opts = activeCard.options || [];
    if (isNutritionDailyFoodGroupsCard(activeCard)) {
      return filterNutritionFoodGroupOptionsForDiet(opts, selections, cardsData);
    }
    return opts;
  }, [activeCard, selections, cardsData]);

  const dietChoiceForFoodGroupFilter = dietTypeCardKey ? (selections[dietTypeCardKey]?.[0] ?? '') : '';
  const dailyFoodGroupSelections = useMemo(() => {
    if (!dailyFoodGroupsCardKey) {
      return NUTRITION_EMPTY_SELECTIONS;
    }
    const v = selections[dailyFoodGroupsCardKey];
    return Array.isArray(v) ? v : NUTRITION_EMPTY_SELECTIONS;
  }, [dailyFoodGroupsCardKey, selections]);

  useEffect(() => {
    setSelections((prev) => pruneNutritionFoodGroupSelectionsForPayload(prev, cardsData));
  }, [dietChoiceForFoodGroupFilter, dailyFoodGroupSelections, cardsData]);

  const activeSelections = useMemo(() => {
    const v = selections[activeCard.key];
    return Array.isArray(v) ? v : NUTRITION_EMPTY_SELECTIONS;
  }, [selections, activeCard.key]);
  const activeSelectionsAnswerable = useMemo(() => {
    if (!isNutritionDailyFoodGroupsCard(activeCard)) {
      return activeSelections;
    }
    const mode = getNutritionDietFoodGroupFilterMode(selections, cardsData);
    if (!mode) {
      return activeSelections;
    }
    return activeSelections.filter((label) => !nutritionFoodGroupOptionHiddenByDiet(label, mode));
  }, [activeCard, activeSelections, selections, cardsData]);
  const hasOtherOption = !activeCard.isTextInput
    && Array.isArray(activeCardVisibleOptions)
    && activeCardVisibleOptions.some((option) => isOtherOptionLabel(getOptionLabel(option)));
  const hasOtherSelected = hasOtherOption && activeSelections.some((option) => isOtherOptionLabel(option));
  const otherTextSelectionKey = getOtherTextSelectionKey(activeCard.key);
  const otherTextInputValue = (Array.isArray(selections[otherTextSelectionKey]) ? selections[otherTextSelectionKey][0] : '') || '';
  const progressNumerator = cardIndex + 1;
  const questionsLeft = totalCards - progressNumerator;
  const stackCardCount = questionsLeft >= 2 ? 2 : questionsLeft;
  const stackSpace = stackCardCount === 2 ? 36 : stackCardCount === 1 ? 18 : 0;
  const infoLines = normalizeInfoLines(activeCard.infoLines || []);
  const { subtitleRef, stackWrapRef, stackTopGap } = useCenteredQuestionGap([
    cardIndex,
    stackSpace,
    activeCard.title,
    activeCard.helper,
    activeCardVisibleOptions?.length || 0,
  ]);

  const chipClass = (option) => {
    const token = String(option?.value || option?.label || '').trim();
    const selected = activeSelections.includes(token)
      || activeSelections.includes(String(option?.label || '').trim());
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
    if (!hasCardAnswer(activeCard, activeSelectionsAnswerable)) {
      triggerCardShake();
      return;
    }

    onDraftSave?.(pruneNutritionFoodGroupSelectionsForPayload(selectionsRef.current, cardsData));

    goNext();
  };

  const handleTouchStart = (e) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartYRef.current == null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    if (Math.abs(deltaY) > 40) {
      if (deltaY < 0) {
        attemptGoNext();
      } else {
        goPrev();
      }
    }
    touchStartYRef.current = null;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastWheelAtRef.current < 340) return;
    lastWheelAtRef.current = now;

    if (e.deltaY > 0) {
      attemptGoNext();
    } else if (e.deltaY < 0) {
      goPrev();
    }
  };

  const handleChipClick = (option) => {
    const optionToken = String(option?.value || option?.label || '').trim();
    if (!optionToken) {
      return;
    }
    const optionIsNone = isNoneOptionLabel(optionToken) || isNoneOptionLabel(option?.label);
    setSelections((prev) => {
      const current = prev[activeCard.key] || [];

      if (!activeCard.multi) {
        return {
          ...prev,
          [activeCard.key]: [optionToken],
        };
      }

      if (optionIsNone) {
        return {
          ...prev,
          [activeCard.key]: [optionToken],
        };
      }

      const withoutNone = current.filter((item) => !isNoneOptionLabel(item));
      const exists = withoutNone.includes(optionToken);
      const next = exists ? withoutNone.filter((item) => item !== optionToken) : [...withoutNone, optionToken];

      const nextState = {
        ...prev,
        [activeCard.key]: next,
      };

      const hasOtherInNext = next.some((item) => isOtherOptionLabel(item));
      if (!hasOtherInNext && Object.prototype.hasOwnProperty.call(nextState, otherTextSelectionKey)) {
        delete nextState[otherTextSelectionKey];
      }

      return nextState;
    });
  };

  const handleOtherInputChange = (event) => {
    const nextValue = String(event?.target?.value || '');
    setSelections((prev) => ({
      ...prev,
      [otherTextSelectionKey]: nextValue ? [nextValue] : [],
    }));
  };

  const handleTextInputChange = (event) => {
    const nextValue = String(event?.target?.value || '');
    setSelections((prev) => ({
      ...prev,
      [activeCard.key]: nextValue ? [nextValue] : [],
    }));
  };

  const textInputValue = activeSelections[0] || '';
  const questionSubline = getHardcodedQuestionnaireSubline(activeCard.title) || activeCard.helper;

  return (
    <div className="nutrition-log-page">
      <div className="nutrition-log-page__header">
        <button className="nutrition-log-page__back" type="button" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="nutrition-log-page__title">{categoryHeading}</h1>
        <img src={ques4Icon} alt="" aria-hidden="true" className="nutrition-log-page__header-icon" />
      </div>

      <p className="nutrition-log-page__subtitle" ref={subtitleRef}>
        Your dietary data helps our system decode patterns that impact your metabolic health.
      </p>

      <div
        className="nutrition-log-page__stack-wrap"
        ref={stackWrapRef}
        style={{ '--stack-space': `${stackSpace}px`, marginTop: `${stackTopGap}px` }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div key={activeCard.key} ref={cardRef} className="nutrition-log-page__card">
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

          {questionSubline ? <p className="nutrition-log-page__helper">{questionSubline}</p> : null}

          {activeCard.isTextInput ? (
            <div className="nutrition-log-page__text-input-wrap">
              <input
                type="text"
                className="nutrition-log-page__text-input"
                value={textInputValue}
                onChange={handleTextInputChange}
                placeholder="Type your answer"
                aria-label={activeCard.title || 'Answer'}
                onWheel={(event) => event.stopPropagation()}
              />
            </div>
          ) : (
            <div className={`nutrition-log-page__chips ${activeCard.multi ? 'nutrition-log-page__chips--multi' : ''}`}>
              {activeCardVisibleOptions.map((option) => {
                const optionToken = String(option?.value || option?.label || '').trim();
                const selected = activeSelections.includes(optionToken)
                  || activeSelections.includes(String(option?.label || '').trim());
                return (
                  <button
                    key={optionToken || option.label}
                    type="button"
                    className={chipClass(option)}
                    onClick={() => handleChipClick(option)}
                  >
                    {activeCard.multi && selected ? (
                      <img src={tickIcon} alt="" aria-hidden="true" className="nutrition-log-page__tick" />
                    ) : null}
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {hasOtherSelected ? (
            <div className="nutrition-log-page__other-input-wrap">
              <input
                type="text"
                className="nutrition-log-page__other-input"
                value={otherTextInputValue}
                onChange={handleOtherInputChange}
                placeholder="Please specify"
                aria-label={`${activeCard.title || 'Other'} - please specify`}
                onWheel={(event) => event.stopPropagation()}
              />
            </div>
          ) : null}
        </div>

        {stackCardCount >= 1 ? <div className="nutrition-log-page__stack-card nutrition-log-page__stack-card--one" aria-hidden="true" /> : null}
        {stackCardCount >= 2 ? <div className="nutrition-log-page__stack-card nutrition-log-page__stack-card--two" aria-hidden="true" /> : null}
      </div>

      <p className="nutrition-log-page__swipe-hint">Scroll up / down to navigate</p>

      {cardIndex === totalCards - 1 ? (
        <button
          type="button"
          className="nutrition-log-page__done"
          onClick={() => {
            if (!hasCardAnswer(activeCard, activeSelectionsAnswerable)) {
              triggerCardShake();
              return;
            }

            const payload = pruneNutritionFoodGroupSelectionsForPayload(selectionsRef.current, cardsData);
            onDraftSave?.(payload);
            onDone?.(payload);
          }}
        >
          Done
        </button>
      ) : null}

      {showInfoPopup && infoLines.length ? (
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
            {infoLines.map((line, index) => (
              <li key={`${line}-${index}`}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

const formatVitalsTwoDigits = (value) => String(value).padStart(2, '0');
/** Placeholder / skip-submit values: shown as “00” until the user enters a reading. */
const VITALS_DEFAULTS = {
  systolic: 0,
  diastolic: 0,
};

const EmbeddedVitalsPage = ({ onBack, onDone, questions = [], initialValues = {}, categoryHeading = 'Vitals' }) => {
  const [systolic, setSystolic] = useState(() => normalizeStoredVitalReading(initialValues?.systolic));
  const [diastolic, setDiastolic] = useState(() => normalizeStoredVitalReading(initialValues?.diastolic));
  const [showSubmitPopup, setShowSubmitPopup] = useState(false);

  useEffect(() => {
    setSystolic(normalizeStoredVitalReading(initialValues?.systolic));
    setDiastolic(normalizeStoredVitalReading(initialValues?.diastolic));
  }, [initialValues]);

  const handleNumberInput = (setter) => (e) => {
    const raw = String(e.target.value || '').trim();
    if (raw === '') {
      setter(null);
      return;
    }

    const next = Number(raw);
    const clamped = Math.max(0, Math.min(299, Number.isNaN(next) ? 0 : next));
    setter(clamped);
  };

  const getQuestionText = (keys, fallback) => {
    const match = questions.find((question) => keys.includes(String(question?.question_key || '').toLowerCase()));
    return match?.question_text || fallback;
  };

  const systolicLabel = getQuestionText(['systolic_blood_pressure', 'systolic'], 'Systolic Blood Pressure');
  const diastolicLabel = getQuestionText(['diastolic_blood_pressure', 'diastolic'], 'Diastolic Blood Pressure');
  const systolicDisplay = systolic == null ? VITALS_DEFAULTS.systolic : systolic;
  const diastolicDisplay = diastolic == null ? VITALS_DEFAULTS.diastolic : diastolic;

  return (
    <div className="vitals-page">
      <div className="vitals-page__header">
        <button className="vitals-page__back" type="button" onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="vitals-page__title">{categoryHeading}</h1>
        <img src={ques5Icon} alt="" aria-hidden="true" className="vitals-page__header-icon" />
      </div>

      <p className="vitals-page__subtitle">
        Enter your systolic and diastolic blood pressure in mmHg.
      </p>

      <p className="vitals-page__label vitals-page__label--first">{systolicLabel}</p>
      <div className="vitals-page__box">
        <div className="vitals-page__score-box">
          <input
            className="vitals-page__score-input"
            type="number"
            min="0"
            max="299"
            value={systolic ?? ''}
            onChange={handleNumberInput(setSystolic)}
            aria-label="Systolic blood pressure"
          />
          <span className={`vitals-page__score-value ${systolic == null ? 'vitals-page__score-value--empty' : ''}`} aria-hidden="true">
            {formatVitalsTwoDigits(systolicDisplay)}
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
            value={diastolic ?? ''}
            onChange={handleNumberInput(setDiastolic)}
            aria-label="Diastolic blood pressure"
          />
          <span className={`vitals-page__score-value ${diastolic == null ? 'vitals-page__score-value--empty' : ''}`} aria-hidden="true">
            {formatVitalsTwoDigits(diastolicDisplay)}
          </span>
        </div>
        <span className="vitals-page__unit">mmHg</span>
      </div>

      <button type="button" className="vitals-page__skip" onClick={() => setShowSubmitPopup(true)}>
        Skip
      </button>
      <button
        type="button"
        className="vitals-page__done"
        onClick={() => setShowSubmitPopup(true)}
      >
        Submit
      </button>

      {showSubmitPopup ? (
        <div className="vitals-page__confirm-overlay" role="dialog" aria-label="Confirm questionnaire submit">
          <div className="vitals-page__confirm-popup">
            <h2 className="vitals-page__confirm-title">Submit Health Assessment?</h2>
            <p className="vitals-page__confirm-text">
              You cannot make changes later.
            </p>
            <div className="vitals-page__confirm-actions">
              <button
                type="button"
                className="vitals-page__confirm-btn vitals-page__confirm-btn--secondary"
                onClick={() => setShowSubmitPopup(false)}
              >
                Make Changes
              </button>
              <button
                type="button"
                className="vitals-page__confirm-btn vitals-page__confirm-btn--primary"
                onClick={() => {
                  setShowSubmitPopup(false);
                  onDone?.({
                    systolic: systolic != null ? systolic : null,
                    diastolic: diastolic != null ? diastolic : null,
                  });
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const defaultSteps = [
  { id: 'family-history', label: 'Family\nHistory', detail: 'Record hereditary health conditions', icon: ques2Icon, side: 'left' },
  { id: 'lifestyle-habits', label: 'Lifestyle &\nHabits', detail: 'Your daily routine & activities', icon: ques3Icon, side: 'right' },
  { id: 'nutrition-log', label: 'Nutrition\nLog', detail: 'Monitor your dietary intake', icon: ques4Icon, side: 'left' },
  { id: 'anthropometry', label: 'Anthropometry', detail: 'Track your height, weight & BMI', icon: ques1Icon, side: 'center' },
  { id: 'vitals', label: 'Vitals', detail: 'Blood pressure & more', icon: ques5Icon, side: 'center' },
];

const stepMetaByRoute = {
  anthropometry: { icon: ques1Icon, side: 'center', detail: 'Track your height, weight & BMI' },
  'family-history': { icon: ques2Icon, side: 'left', detail: 'Record hereditary health conditions' },
  'lifestyle-habits': { icon: ques3Icon, side: 'right', detail: 'Your daily routine & activities' },
  'nutrition-log': { icon: ques4Icon, side: 'left', detail: 'Monitor your dietary intake' },
  vitals: { icon: ques5Icon, side: 'center', detail: 'Blood pressure & more' },
};

const HealthAssessmentPage = ({
  progress = 0,
  onBack,
  steps = [],
  questionsByRouteId = {},
  initialResponsesByRoute = {},
  onStepComplete,
  onStepDraftSave,
  onAssessmentSubmit,
  isB2b = false,
}) => {
  const [questionnairePreferences, setQuestionnairePreferences] = useState({});
  const [activeSubPage, setActiveSubPage] = useState(null);
  const [showFollowup, setShowFollowup] = useState(false);
  const [anthropometryPrimaryValues, setAnthropometryPrimaryValues] = useState({});
  const [anthropometryFollowupValues, setAnthropometryFollowupValues] = useState({});
  const [familyHistorySelections, setFamilyHistorySelections] = useState({});
  const [lifestyleHabitsSelections, setLifestyleHabitsSelections] = useState({});
  const [nutritionLogSelections, setNutritionLogSelections] = useState({});
  const [vitalsValues, setVitalsValues] = useState({
    systolic: null,
    diastolic: null,
  });

  useEffect(() => {
    let cancelled = false;
    void getMyProfileCached()
      .then((profile) => {
        if (!cancelled) {
          setQuestionnairePreferences(getQuestionnairePreferencesFromProfile(profile));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQuestionnairePreferences({});
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleQuestionsByRoute = useMemo(() => {
    const routes = isB2b
      ? ['family-history', 'lifestyle-habits', 'nutrition-log', 'anthropometry']
      : ['family-history', 'lifestyle-habits', 'nutrition-log', 'anthropometry', 'vitals'];
    return routes.reduce((acc, routeId) => {
      const qs = questionsByRouteId[routeId] || [];
      acc[routeId] = computeQuestionsWithVisibility(qs, { preferences: questionnairePreferences })
        .filter((q) => q.is_visible !== false);
      return acc;
    }, {});
  }, [questionsByRouteId, questionnairePreferences, isB2b]);

  const hubSteps = useMemo(() => (
    isB2b ? defaultSteps.filter((step) => step.id !== 'vitals') : defaultSteps
  ), [isB2b]);

  const anthropometryInitialValues = useMemo(() => {
    return buildAnthropometryInitialValuesFromResponses(
      visibleQuestionsByRoute.anthropometry || [],
      initialResponsesByRoute['anthropometry'] || []
    );
  }, [visibleQuestionsByRoute, initialResponsesByRoute]);
  const familyInitialSelections = useMemo(() => {
    return buildSelectionStateFromResponses(
      visibleQuestionsByRoute['family-history'] || [],
      initialResponsesByRoute['family-history'] || []
    );
  }, [visibleQuestionsByRoute, initialResponsesByRoute]);
  const lifestyleInitialSelections = useMemo(() => {
    return buildSelectionStateFromResponses(
      visibleQuestionsByRoute['lifestyle-habits'] || [],
      initialResponsesByRoute['lifestyle-habits'] || []
    );
  }, [visibleQuestionsByRoute, initialResponsesByRoute]);
  const nutritionInitialSelections = useMemo(() => {
    return buildSelectionStateFromResponses(
      visibleQuestionsByRoute['nutrition-log'] || [],
      initialResponsesByRoute['nutrition-log'] || []
    );
  }, [visibleQuestionsByRoute, initialResponsesByRoute]);
  const vitalsInitialValues = useMemo(() => {
    return buildVitalsInitialValuesFromResponses(
      visibleQuestionsByRoute.vitals || [],
      initialResponsesByRoute.vitals || []
    );
  }, [visibleQuestionsByRoute, initialResponsesByRoute]);

  useEffect(() => {
    if (activeSubPage) {
      return;
    }

    setAnthropometryPrimaryValues(anthropometryInitialValues.primary || {});
    setAnthropometryFollowupValues(anthropometryInitialValues.followup || {});
    setFamilyHistorySelections(familyInitialSelections);
    setLifestyleHabitsSelections(lifestyleInitialSelections);
    setNutritionLogSelections(nutritionInitialSelections);
    setVitalsValues({
      systolic: normalizeStoredVitalReading(vitalsInitialValues?.systolic),
      diastolic: normalizeStoredVitalReading(vitalsInitialValues?.diastolic),
    });
  }, [
    activeSubPage,
    anthropometryInitialValues,
    familyInitialSelections,
    lifestyleInitialSelections,
    nutritionInitialSelections,
    vitalsInitialValues,
  ]);

  const resolvedSteps = hubSteps.map((defaultStep) => {
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

  const allCategoriesCompleteFromApi = Array.isArray(steps)
    && steps.length > 0
    && steps
      .filter((step) => !isB2b || step?.routeId !== 'vitals')
      .every((step) => String(step?.status || '').trim().toLowerCase() === 'complete');

  const optimisticNutritionLogDraft = useMemo(() => {
    const responses = initialResponsesByRoute['nutrition-log'];
    return Array.isArray(responses) && responses.length > 0;
  }, [initialResponsesByRoute]);

  const [nutritionLogDraftCheckResolved, setNutritionLogDraftCheckResolved] = useState(false);
  const [hasNutritionLogSubmittedDraft, setHasNutritionLogSubmittedDraft] = useState(false);
  const [questionnaireSubmitLocked, setQuestionnaireSubmitLocked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    hasSubmittedHealthQuestionnaire()
      .then((submitted) => {
        if (!cancelled) {
          setQuestionnaireSubmitLocked(Boolean(submitted));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQuestionnaireSubmitLocked(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const drafted = await hasNutritionLogQuestionnaireDraft();
        if (!cancelled) {
          setHasNutritionLogSubmittedDraft(drafted);
        }
      } catch {
        if (!cancelled) {
          setHasNutritionLogSubmittedDraft(false);
        }
      } finally {
        if (!cancelled) {
          setNutritionLogDraftCheckResolved(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const nutritionLogSubmittedUnlock = nutritionLogDraftCheckResolved
    ? hasNutritionLogSubmittedDraft
    : optimisticNutritionLogDraft;

  const canOpenAllSteps = !questionnaireSubmitLocked
    && (allCategoriesCompleteFromApi || nutritionLogSubmittedUnlock);

  const [hubMode, setHubMode] = useState('intro');
  const [hubVariant, setHubVariant] = useState('anthropometry');
  const [isStartingAssessment, setIsStartingAssessment] = useState(false);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
  const [loadingCategoryId, setLoadingCategoryId] = useState(null);
  const didSeedHubRef = useRef(false);

  const stepRouteStatusByRouteId = useMemo(() => {
    const map = Object.create(null);
    (Array.isArray(steps) ? steps : []).forEach((s) => {
      const id = String(s?.routeId || '').trim();
      if (!id) {
        return;
      }
      map[id] = String(s?.status || '').trim().toLowerCase();
    });
    return map;
  }, [steps]);

  const hubCategories = useMemo(() => {
    return resolvedSteps.map((step, index) => {
      const matched = Array.isArray(steps)
        ? steps.find((s) => s?.routeId === step.id || s?.id === step.id)
        : null;
      const categoryId = Number(matched?.category_id) || index + 1;
      return {
        id: categoryId,
        category_id: categoryId,
        category_key: HA_ROUTE_CATEGORY_KEY[step.id] || step.id,
        display_name: String(step.label || '').replace(/\n/g, ' '),
        status: matched?.status,
        routeId: step.id,
      };
    });
  }, [resolvedSteps, steps]);

  const filledRouteIds = useMemo(() => (
    hubCategories
      .filter((category) => {
        const routeId = category.routeId;
        if (isB2b && routeId === 'vitals') {
          return false;
        }
        if (String(category.status || '').trim().toLowerCase() === 'complete') {
          return true;
        }
        return isHealthAssessmentRouteFilled(routeId, {
          questions: questionsByRouteId[routeId] || [],
          responses: initialResponsesByRoute[routeId] || [],
          preferences: questionnairePreferences,
          anthropometryPrimary: anthropometryPrimaryValues,
          anthropometryFollowup: anthropometryFollowupValues,
          vitalsValues,
        });
      })
      .map((category) => category.routeId)
  ), [
    hubCategories,
    isB2b,
    questionsByRouteId,
    initialResponsesByRoute,
    questionnairePreferences,
    anthropometryPrimaryValues,
    anthropometryFollowupValues,
    vitalsValues,
  ]);

  const completedCategoryIds = useMemo(() => (
    hubCategories
      .filter((category) => filledRouteIds.includes(category.routeId))
      .map((category) => Number(category.category_id))
  ), [hubCategories, filledRouteIds]);

  const isRouteCompleted = (routeId) => filledRouteIds.includes(routeId);

  const firstIncompleteRouteId = useMemo(() => {
    const next = hubCategories.find((category) => !filledRouteIds.includes(category.routeId));
    return next?.routeId || null;
  }, [hubCategories, filledRouteIds]);

  useEffect(() => {
    if (activeSubPage) {
      return;
    }

    // Wait until category status is available (or clearly empty) before choosing intro vs hub.
    const hasApiStatus = Array.isArray(steps) && steps.some((step) => step?.status != null || step?.category_id != null);
    if (!hasApiStatus && Number(progress || 0) === 0 && !canOpenAllSteps) {
      setHubMode('intro');
      return;
    }

    if (filledRouteIds.length === 0) {
      if (!didSeedHubRef.current) {
        didSeedHubRef.current = true;
        setHubMode('intro');
      }
      return;
    }

    const lastFilled = resolvedSteps
      .filter((step) => filledRouteIds.includes(step.id))
      .at(-1);
    setHubVariant(HA_ROUTE_HUB_VARIANT[lastFilled?.id] || 'anthropometry');
    if (!didSeedHubRef.current || hubMode === 'intro') {
      setHubMode('section-complete');
    }
    didSeedHubRef.current = true;
  }, [
    activeSubPage,
    canOpenAllSteps,
    filledRouteIds,
    hubMode,
    progress,
    resolvedSteps,
    steps,
  ]);

  const openRoute = (routeId) => {
    if (!routeId || (isB2b && routeId === 'vitals')) {
      return;
    }
    const category = hubCategories.find((item) => item.routeId === routeId);
    if (category) {
      setLoadingCategoryId(Number(category.category_id));
    }
    setActiveSubPage(routeId);
    setLoadingCategoryId(null);
  };

  const handleStartAssessment = () => {
    setIsStartingAssessment(true);
    try {
      openRoute(firstIncompleteRouteId || hubCategories[0]?.routeId);
    } finally {
      setIsStartingAssessment(false);
    }
  };

  const handleSelectHubCategory = (category) => {
    const routeId = category?.routeId
      || hubCategories.find((item) => Number(item.category_id) === Number(category?.category_id))?.routeId;
    openRoute(routeId);
  };

  const handleFinalContinue = async () => {
    if (isSubmittingFinal || questionnaireSubmitLocked) {
      return;
    }
    setIsSubmittingFinal(true);
    try {
      await onAssessmentSubmit?.();
      setQuestionnaireSubmitLocked(true);
    } catch (error) {
      console.error('Failed to submit assessment:', error);
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  if (activeSubPage) {
    const matchedCategory = Array.isArray(steps)
      ? steps.find((step) => step?.routeId === activeSubPage || step?.id === activeSubPage)
      : null;
    const assessmentInstanceId = Number(matchedCategory?.assessment_instance_id || 0);
    const categoryId = Number(matchedCategory?.category_id || 0);
    const questionsForRoute = questionsByRouteId[activeSubPage]
      || visibleQuestionsByRoute[activeSubPage]
      || [];

    return (
      <HealthAssessmentScenario2Category
        routeId={activeSubPage}
        questions={questionsForRoute}
        draftResponses={initialResponsesByRoute[activeSubPage] || []}
        assessmentInstanceId={assessmentInstanceId}
        categoryId={categoryId}
        anthropometryPrimary={anthropometryPrimaryValues}
        anthropometryFollowup={anthropometryFollowupValues}
        vitalsInitial={vitalsValues}
        buildAnthropometryResponses={buildAnthropometryResponses}
        buildVitalsResponses={buildVitalsResponses}
        onBack={() => {
          setShowFollowup(false);
          setActiveSubPage(null);
          setHubMode(filledRouteIds.length > 0 ? 'section-complete' : 'intro');
        }}
        onStepDraftSave={(routeId, responses) => {
          onStepDraftSave?.(routeId, responses);
        }}
        onStepComplete={async (routeId, responses, meta) => {
          if (routeId === 'anthropometry' && meta?.primary) {
            setAnthropometryPrimaryValues(meta.primary || {});
            setAnthropometryFollowupValues(meta.followup || {});
          }
          if (routeId === 'vitals' && meta?.vitals) {
            setVitalsValues({
              systolic: normalizeStoredVitalReading(meta.vitals?.systolic),
              diastolic: normalizeStoredVitalReading(meta.vitals?.diastolic),
            });
          }
          if (routeId === 'nutrition-log') {
            setHasNutritionLogSubmittedDraft(true);
          }

          setHubVariant(HA_ROUTE_HUB_VARIANT[routeId] || 'anthropometry');
          setHubMode('section-complete');
          setShowFollowup(false);
          setActiveSubPage(null);
          await onStepComplete?.(routeId, responses);
        }}
      />
    );
  }

  const backdropSrc = hubMode === 'section-complete'
    ? haHubBackdropForVariant(hubVariant)
    : backgroundAssessmentSvg;

  return (
    <PageBackdrop mobileBackgroundSrc={backdropSrc}>
      <div className="flex h-full min-w-0 flex-col">
        {(hubMode === 'intro' || hubMode === 'section-complete' || canOpenAllSteps || questionnaireSubmitLocked) ? (
          <div className="absolute left-[16px] top-[52px] z-10">
            <button
              type="button"
              onClick={onBack}
              className="flex size-8 items-center justify-start text-white"
              aria-label="Go back"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M19 12H5M5 12L12 19M5 12L12 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        ) : null}

        {hubMode === 'intro' ? (
          <HealthAssessmentStep
            categories={hubCategories}
            completedCategoryIds={completedCategoryIds}
            isStarting={isStartingAssessment}
            onStartAssessment={handleStartAssessment}
          />
        ) : (
          <SectionCompleteHub
            variant={hubVariant}
            categories={hubCategories}
            completedCategoryIds={completedCategoryIds}
            isLoadingCategoryId={loadingCategoryId}
            isContinuing={isSubmittingFinal}
            canSelectCategory={(category) => {
              if (canOpenAllSteps || questionnaireSubmitLocked) {
                return true;
              }
              const routeId = category?.routeId
                || hubCategories.find((item) => Number(item.category_id) === Number(category?.category_id))?.routeId;
              if (!routeId || (isB2b && routeId === 'vitals')) {
                return false;
              }
              if (isRouteCompleted(routeId)) {
                return true;
              }
              const draftBatch = initialResponsesByRoute[routeId];
              if (Array.isArray(draftBatch) && draftBatch.length > 0) {
                return true;
              }
              const status = String(stepRouteStatusByRouteId[routeId] || '').toLowerCase();
              if (status === 'in_progress') {
                return true;
              }
              return routeId === firstIncompleteRouteId;
            }}
            onSelectCategory={handleSelectHubCategory}
            onContinue={handleFinalContinue}
          />
        )}
      </div>
    </PageBackdrop>
  );
};


export {
  EmbeddedAnthropometryPage,
  EmbeddedAnthropometryFollowupPage,
  EmbeddedFamilyHistoryPage,
  EmbeddedLifestyleHabitsPage,
  EmbeddedNutritionLogPage,
  EmbeddedVitalsPage,
  buildAnthropometryInitialValuesFromResponses,
  buildAnthropometryResponses,
  buildSelectionStateFromResponses,
  buildResponsesFromSelections,
  coerceResponsesToOptionKeys,
  buildVitalsInitialValuesFromResponses,
  buildVitalsResponses,
  buildNutritionLogResponsesForSave,
  normalizeStoredVitalReading,
  toNutritionApiCards,
  toFamilyApiCards,
  findFamilyHistoryCardKeys,
  isNoneOptionLabel,
  findMappedOtherTextQuestion,
  isLikelyOtherTextQuestion,
};

export default HealthAssessmentPage;
