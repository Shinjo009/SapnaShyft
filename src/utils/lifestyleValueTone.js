/** @typedef {'optimal' | 'stable' | 'vulnerable' | 'critical' | 'neutral'} LifestyleTone */

export const LIFESTYLE_TONE_CLASS = {
  optimal: 'health-scan-page__metric-value-tone--optimal',
  stable: 'health-scan-page__metric-value-tone--stable',
  vulnerable: 'health-scan-page__metric-value-tone--vulnerable',
  critical: 'health-scan-page__metric-value-tone--critical',
  neutral: 'health-scan-page__metric-value-tone--neutral',
};

/** Collapse "1 to 3" / "1-3" / "1 – 3" into the same canonical form before tone lookup. */
export const normalizeLifestyleAnswer = (value) => String(value ?? '')
  .trim()
  .toLowerCase()
  .replace(/[–—]/g, '-')
  .replace(/\s+/g, ' ')
  .replace(/(\d+)\s+to\s+(\d+)/g, '$1-$2')
  .replace(/\s*-\s*/g, '-');

const parseNumbersFromText = (value) => {
  const matches = String(value ?? '').match(/\d+(?:\.\d+)?/g);
  if (!matches) return [];
  return matches.map(Number).filter(Number.isFinite);
};

const getSleepTone = (normalized) => {
  if (/less than 5|under 5|<\s*5/.test(normalized)) return 'critical';
  if (/more than 9|over 9|>\s*9/.test(normalized)) return 'stable';
  if (/between\s+7(-| to )9|7(-| to )9\s*hours?/.test(normalized)) return 'optimal';
  if (/between\s+5(-| to )7|5(-| to )7\s*hours?/.test(normalized)) return 'stable';

  const numbers = parseNumbersFromText(normalized);
  if (numbers.length === 0) return 'neutral';

  const min = numbers[0];
  const max = numbers.length > 1 ? numbers[1] : numbers[0];

  if (max < 5) return 'critical';
  if (min > 9) return 'stable';
  if (min >= 7 && max <= 9) return 'optimal';
  if (min >= 5 && max <= 7) return 'stable';
  if (min < 5) return 'critical';
  if (max > 9) return 'stable';

  return 'neutral';
};

const ALCOHOL_TONE_BY_LABEL = {
  'i do not drink alcohol': 'optimal',
  'i quit alcohol': 'optimal',
  '1-2 times in 3 months': 'stable',
  '1-2 times in 6 months': 'stable',
  '3 servings per week or less': 'vulnerable',
  'more than 3 servings per week': 'critical',
};

const getAlcoholTone = (normalized) => {
  if (ALCOHOL_TONE_BY_LABEL[normalized]) {
    return ALCOHOL_TONE_BY_LABEL[normalized];
  }

  if (/do not drink|don't drink|never drink|no alcohol/.test(normalized)) return 'optimal';
  if (/quit alcohol/.test(normalized)) return 'optimal';
  if (/1-2 times in (3|6) months/.test(normalized)) return 'stable';
  if (/more than 3 servings|>\s*3 servings/.test(normalized)) return 'critical';
  if (/3 servings per week or less|<=?\s*3 servings/.test(normalized)) return 'vulnerable';

  return 'neutral';
};

const SMOKE_TONE_BY_LABEL = {
  'i do not smoke': 'optimal',
  'i quit smoking': 'optimal',
  '1-2 times a month': 'stable',
  '4-5 times a month': 'stable',
  '1-3 times a week': 'vulnerable',
  '5-7 times a week': 'critical',
  'more than 7 times a week': 'critical',
};

const getSmokeTone = (normalized) => {
  if (SMOKE_TONE_BY_LABEL[normalized]) {
    return SMOKE_TONE_BY_LABEL[normalized];
  }

  if (/do not smoke|don't smoke|never smoke|non-smok/.test(normalized)) return 'optimal';
  if (/quit smok/.test(normalized)) return 'optimal';
  if (/more than 7|>\s*7\s*times/.test(normalized)) return 'critical';
  if (/(5|6|7)(-| to )7\s*times\s*a\s*week/.test(normalized)) return 'critical';
  if (/5-7 times a week/.test(normalized)) return 'critical';
  if (/1-3 times a week/.test(normalized)) return 'vulnerable';
  if (/1-2 times a month|4-5 times a month/.test(normalized)) return 'stable';

  return 'neutral';
};

const getPhysicalActivityTone = (normalized) => {
  const PHYSICAL_ACTIVITY_TONE_BY_LABEL = {
    'more than 60 minutes a day': 'optimal',
    '30-60 minutes a day': 'optimal',
    'less than 30 minutes a day': 'stable',
    'rarely or never': 'critical',
  };

  if (PHYSICAL_ACTIVITY_TONE_BY_LABEL[normalized]) {
    return PHYSICAL_ACTIVITY_TONE_BY_LABEL[normalized];
  }

  if (/more than 60|>\s*60/.test(normalized)) return 'optimal';
  if (/30-60|30 to 60/.test(normalized)) return 'optimal';
  if (/less than 30|<\s*30/.test(normalized)) return 'stable';
  if (/rarely or never|never exercise|never work out/.test(normalized)) return 'critical';

  return 'neutral';
};

/** @returns {LifestyleTone} */
export const getLifestyleValueTone = (kind, value) => {
  const normalized = normalizeLifestyleAnswer(value);
  if (!normalized) return 'neutral';

  switch (kind) {
    case 'sleep':
      return getSleepTone(normalized);
    case 'alcohol':
      return getAlcoholTone(normalized);
    case 'smoke':
      return getSmokeTone(normalized);
    case 'physical_activity':
      return getPhysicalActivityTone(normalized);
    default:
      return 'neutral';
  }
};

export const getLifestyleValueToneClass = (kind, value) => (
  LIFESTYLE_TONE_CLASS[getLifestyleValueTone(kind, value)] || LIFESTYLE_TONE_CLASS.neutral
);
