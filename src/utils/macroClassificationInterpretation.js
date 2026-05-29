import macroData from '../data/macroClassification.json';

const { rows: CLASSIFICATION_ROWS, equationName: DEFAULT_EQUATION_NAME, carbGuidelineName: DEFAULT_CARB_GUIDELINE } = macroData;

const TONE_UI_LABELS = {
  optimal: 'Optimal',
  stable: 'Stable',
  vulnerable: 'Vulnerable',
  critical: 'Critical',
};

const GOAL_ALIASES = [
  { key: 'Weight Loss', patterns: [/weight\s*loss/i, /lose\s*weight/i, /fat\s*loss/i] },
  { key: 'Building Muscle Mass', patterns: [/build(ing)?\s*muscle/i, /muscle\s*mass/i, /gain\s*muscle/i] },
  { key: 'Increasing Energy Levels', patterns: [/energy\s*level/i, /more\s*energy/i, /increasing\s*energy/i] },
  { key: 'Improving Metabolic Health', patterns: [/metabolic\s*health/i, /improv(e|ing)\s*metabol/i] },
  { key: 'Improving Physical Endurance', patterns: [/physical\s*endurance/i, /endurance/i, /cardio/i] },
  { key: 'Increasing Strength', patterns: [/increasing\s*strength/i, /\bstrength\b/i] },
];

const CATEGORY_TONE_MAP = {
  healthy: 'optimal',
  suboptimal: 'stable',
  'increased risk': 'vulnerable',
  insufficient: 'vulnerable',
  'high risk': 'critical',
};

const MACRO_SHEET_FIELD_BY_KIND = {
  carbs: 'carbsPercent',
  fats: 'fatsPercent',
  protein: 'proteinPercent',
  fibre: 'fibreG',
};

const MACRO_CARD_CONFIG = {
  carbs: {
    cardTitle: 'Carbs %',
    iconModifierClass: 'health-scan-page__bmr-insight-icon--carbs',
    valueKind: 'percent',
  },
  fats: {
    cardTitle: 'Fats %',
    iconModifierClass: 'health-scan-page__bmr-insight-icon--fats',
    valueKind: 'percent',
  },
  protein: {
    cardTitle: 'Protein %',
    iconModifierClass: 'health-scan-page__bmr-insight-icon--protein',
    valueKind: 'percent',
  },
  fibre: {
    cardTitle: 'Fibre',
    iconModifierClass: 'health-scan-page__bmr-insight-icon--fibre',
    valueKind: 'grams',
  },
};

const normalizeDashes = (value) => String(value || '')
  .replace(/\u2013/g, '-')
  .replace(/\u2014/g, '-')
  .replace(/–/g, '-');

export const normalizeMacroGoal = (rawGoal) => {
  const text = String(rawGoal || '').trim();
  if (!text) return 'Weight Loss';

  const direct = CLASSIFICATION_ROWS.find((row) => row.goal.toLowerCase() === text.toLowerCase());
  if (direct) return direct.goal;

  for (const entry of GOAL_ALIASES) {
    if (entry.patterns.some((pattern) => pattern.test(text))) {
      return entry.key;
    }
  }

  if (/for\s+(.+)/i.test(text)) {
    const inner = text.replace(/^for\s+/i, '').trim();
    const nested = normalizeMacroGoal(inner);
    if (nested !== 'Weight Loss' || /weight/i.test(inner)) return nested;
  }

  return 'Weight Loss';
};

export const normalizePatientGender = (sources = {}) => {
  const candidates = [
    sources.gender,
    sources.sex,
    sources.user_gender,
    sources.patient_gender,
    sources.profile_gender,
    sources.user?.gender,
    sources.patient?.gender,
    sources.profile?.gender,
  ];

  for (const candidate of candidates) {
    const normalized = String(candidate || '').trim().toLowerCase();
    if (normalized === 'm' || normalized === 'male' || normalized === 'man') return 'M';
    if (normalized === 'f' || normalized === 'female' || normalized === 'woman') return 'F';
  }

  return 'F';
};

export const categoryToTone = (category) => {
  const key = String(category || '').trim().toLowerCase();
  return CATEGORY_TONE_MAP[key] || 'stable';
};

export const splitInterpretationText = (text) => {
  const trimmed = String(text || '').trim();
  if (!trimmed) {
    return { headline: '', body: '' };
  }

  const match = trimmed.match(/^([^.!?]+[.!?])\s*([\s\S]*)$/);
  if (match && match[2].trim()) {
    return { headline: match[1].trim(), body: match[2].trim() };
  }

  return { headline: trimmed, body: '' };
};

export const extractGenderSegment = (raw, gender = 'F') => {
  const normalized = normalizeDashes(raw);
  const letter = gender === 'M' ? 'M' : 'F';

  if (/\(F\)|\(M\)/i.test(normalized)) {
    const parts = normalized.split(/\s+\/\s+/).map((part) => part.trim());
    const match = parts.find((part) => part.includes(`(${letter})`));
    if (match) {
      return match.replace(/\((F|M)\)/gi, '').trim();
    }
  }

  if (/F:|M:/i.test(normalized)) {
    const parts = normalized.split('|').map((part) => part.trim());
    const prefix = `${letter}:`;
    const match = parts.find((part) => part.toUpperCase().startsWith(prefix));
    if (match) {
      return match.slice(2).trim();
    }
  }

  return normalized.trim();
};

/**
 * @returns {{ min: number|null, max: number|null, minInclusive: boolean, maxInclusive: boolean }}
 */
export const parseNumericBounds = (segment) => {
  let text = normalizeDashes(segment)
    .replace(/kcal\/day/gi, '')
    .replace(/%/g, '')
    .replace(/grams?/gi, '')
    .replace(/\bg\b/gi, '')
    .trim();

  const betweenMatch = text.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
  if (betweenMatch) {
    return {
      min: Number(betweenMatch[1]),
      max: Number(betweenMatch[2]),
      minInclusive: true,
      maxInclusive: true,
    };
  }

  const gtMatch = text.match(/>\s*(\d+(?:\.\d+)?)/);
  if (gtMatch) {
    return {
      min: Number(gtMatch[1]),
      max: null,
      minInclusive: false,
      maxInclusive: true,
    };
  }

  const gteMatch = text.match(/(?:≥|>=)\s*(\d+(?:\.\d+)?)/);
  if (gteMatch) {
    return {
      min: Number(gteMatch[1]),
      max: null,
      minInclusive: true,
      maxInclusive: true,
    };
  }

  const ltMatch = text.match(/<\s*(\d+(?:\.\d+)?)/);
  if (ltMatch) {
    return {
      min: null,
      max: Number(ltMatch[1]),
      minInclusive: true,
      maxInclusive: false,
    };
  }

  const lteMatch = text.match(/(?:≤|<=)\s*(\d+(?:\.\d+)?)/);
  if (lteMatch) {
    return {
      min: null,
      max: Number(lteMatch[1]),
      minInclusive: true,
      maxInclusive: true,
    };
  }

  return {
    min: null,
    max: null,
    minInclusive: true,
    maxInclusive: true,
  };
};

export const valueInBounds = (value, bounds) => {
  if (!Number.isFinite(value) || !bounds) return false;

  const { min, max, minInclusive, maxInclusive } = bounds;

  if (min != null) {
    if (minInclusive) {
      if (value < min) return false;
    } else if (value <= min) {
      return false;
    }
  }

  if (max != null) {
    if (maxInclusive) {
      if (value > max) return false;
    } else if (value >= max) {
      return false;
    }
  }

  return true;
};

export const getRowsForGoal = (goal) => {
  const goalKey = normalizeMacroGoal(goal);
  return CLASSIFICATION_ROWS.filter((row) => row.goal === goalKey);
};

export const buildTierDefinitions = (goal, { gender = 'F', metric = 'bmr' } = {}) => {
  const goalRows = getRowsForGoal(goal);

  return goalRows.map((row) => {
    const tone = categoryToTone(row.category);
    const sheetField = MACRO_SHEET_FIELD_BY_KIND[metric];
    const rawRange = metric === 'bmr'
      ? row.bmrRangeRaw
      : metric === 'bodyFat'
        ? row.bodyFatRangeRaw
        : sheetField
          ? row[sheetField]
          : row.carbsPercent;

    const segment = sheetField || metric === 'carbs'
      ? rawRange
      : extractGenderSegment(rawRange, gender);
    const bounds = parseNumericBounds(segment);
    const display = formatMetricDisplay(segment, metric);

    return {
      id: tone,
      tone,
      label: TONE_UI_LABELS[tone],
      category: row.category,
      range: display.range,
      unit: display.unit,
      bounds,
      interpretation: metric === 'bmr'
        ? row.bmrInterpretation
        : metric === 'bodyFat'
          ? row.bodyFatInterpretation
          : row.carbsPercent,
    };
  });
};

const formatMetricDisplay = (segment, metric) => {
  const cleaned = normalizeDashes(segment).trim();

  if (metric === 'bmr') {
    const withoutUnit = cleaned.replace(/\s*kcal\/day/gi, '').trim();
    return { range: withoutUnit, unit: 'kcal/day' };
  }

  if (metric === 'bodyFat') {
    const withoutPercent = cleaned.replace(/%/g, '').trim();
    return { range: withoutPercent, unit: '%' };
  }

  if (metric === 'fibre') {
    const withoutUnit = cleaned.replace(/\s*g\b/gi, '').trim();
    return { range: withoutUnit, unit: 'g' };
  }

  if (metric === 'fats' || metric === 'protein' || metric === 'carbs') {
    const percentRange = cleaned.includes('%') ? cleaned : `${cleaned}%`;
    return { range: percentRange, unit: '' };
  }

  const fallbackRange = cleaned.includes('%') ? cleaned : `${cleaned}%`;
  return { range: fallbackRange, unit: '' };
};

export const classifyByTiers = (value, tiers) => {
  if (!Number.isFinite(value) || !Array.isArray(tiers) || tiers.length === 0) {
    return null;
  }

  const matches = tiers.filter((tier) => valueInBounds(value, tier.bounds));
  if (matches.length > 0) {
    return matches[matches.length - 1];
  }

  return null;
};

const distanceToBounds = (value, bounds) => {
  if (valueInBounds(value, bounds)) {
    return 0;
  }

  const { min, max } = bounds;

  if (min != null && value < min) {
    return min - value;
  }

  if (max != null && value > max) {
    return value - max;
  }

  if (min != null && max == null) {
    if (value >= min) {
      return 0;
    }
    return min - value;
  }

  if (max != null && min == null) {
    if (value <= max) {
      return 0;
    }
    return value - max;
  }

  return Number.POSITIVE_INFINITY;
};

/**
 * When a value falls outside all sheet bands (e.g. 14% BF below female WL optimal 21%),
 * pick the nearest tier — never map to critical just because API ideal band differs.
 */
export const findBestFitTier = (value, tiers) => {
  if (!Number.isFinite(value) || !Array.isArray(tiers) || tiers.length === 0) {
    return null;
  }

  const matched = classifyByTiers(value, tiers);
  if (matched) {
    return matched;
  }

  const first = tiers[0];
  const last = tiers[tiers.length - 1];

  if (first?.bounds?.min != null && value < first.bounds.min) {
    return first;
  }

  if (last?.bounds?.min != null && value > last.bounds.min && !valueInBounds(value, last.bounds)) {
    return last;
  }

  let bestTier = tiers[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  tiers.forEach((tier) => {
    const distance = distanceToBounds(value, tier.bounds);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestTier = tier;
    }
  });

  return bestTier;
};

export const resolveTierForValue = (value, tiers, metricObj, statusObj) => {
  let tier = classifyByTiers(value, tiers);
  if (!tier && Number.isFinite(value)) {
    tier = findBestFitTier(value, tiers);
  }
  if (!tier && !Number.isFinite(value)) {
    const apiTone = resolveToneFromApi(metricObj, statusObj);
    tier = tiers.find((entry) => entry.tone === apiTone) || tiers[0];
  }
  if (!tier) {
    tier = tiers[0];
  }
  return tier;
};

export const metricToneToStatusClass = (tone) => {
  const map = {
    optimal: 'health-scan-page__metric-value--within',
    stable: 'health-scan-page__metric-value--below',
    vulnerable: 'health-scan-page__metric-value--high',
    critical: 'health-scan-page__metric-value--above',
  };
  return map[tone] || map.optimal;
};

export const resolveToneFromApi = (metricObj, statusObj) => {
  const raw = String(
    metricObj?.severity
    ?? metricObj?.tier
    ?? metricObj?.status
    ?? metricObj?.risk_level
    ?? metricObj?.zone
    ?? '',
  ).trim().toLowerCase();

  if (raw.includes('critical') || raw === 'red' || raw === 'high risk') return 'critical';
  if (raw.includes('vulnerable') || raw.includes('increased') || raw.includes('insufficient') || raw === 'orange') return 'vulnerable';
  if (raw.includes('stable') || raw.includes('suboptimal') || raw === 'yellow' || raw === 'below') return 'stable';
  if (raw.includes('optimal') || raw.includes('healthy') || raw === 'green' || raw === 'within') return 'optimal';

  const severity = String(statusObj?.severity || '').trim().toLowerCase();
  if (severity === 'red') return 'critical';
  if (severity === 'orange') return 'vulnerable';
  if (severity === 'yellow') return 'stable';
  if (severity === 'within') return 'optimal';

  return null;
};

export const getMacroPercentValue = (macro) => {
  const low = Number(macro?.estimated_low);
  const high = Number(macro?.estimated_high);
  if (Number.isFinite(low) && Number.isFinite(high)) {
    return (low + high) / 2;
  }
  return Number(macro?.value);
};

export const formatGoalSubtitle = (goal) => {
  const goalKey = normalizeMacroGoal(goal);
  return `For ${goalKey}`;
};

const buildInsightFromTier = (tier, tiers, { cardTitle, iconSrc, iconModifierClass, equationName, guidelineName, goal }) => {
  const { headline, body } = splitInterpretationText(tier?.interpretation || '');

  const base = {
    cardTitle,
    iconSrc,
    iconModifierClass,
    goalLabel: formatGoalSubtitle(goal),
    tone: tier.tone,
    headline,
    body,
    activeTierId: tier.id,
    tiers: tiers.map(({ id, label, range, unit, tone }) => ({
      id,
      label,
      range,
      unit,
      tone,
    })),
  };

  if (equationName) {
    return { ...base, equationName };
  }

  return { ...base, guidelineName: guidelineName || DEFAULT_CARB_GUIDELINE };
};

export const getMacroNutritionValue = (macro, metricKind) => {
  const config = MACRO_CARD_CONFIG[metricKind];
  if (config?.valueKind === 'grams' || config?.valueKind === 'percent') {
    const low = Number(macro?.estimated_low);
    const high = Number(macro?.estimated_high);
    if (Number.isFinite(low) && Number.isFinite(high)) {
      return (low + high) / 2;
    }
    return Number(macro?.value);
  }
  return Number(macro?.value);
};

const resolveMetricValue = (metricObj, metricKind) => {
  if (MACRO_SHEET_FIELD_BY_KIND[metricKind]) {
    return getMacroNutritionValue(metricObj, metricKind);
  }
  return Number(metricObj?.value);
};

export const buildMacroNutrientInterpretation = ({
  macro,
  goal,
  metricKind,
}) => {
  const config = MACRO_CARD_CONFIG[metricKind];
  if (!config) {
    throw new Error(`Unknown macro nutrient kind: ${metricKind}`);
  }

  const goalKey = normalizeMacroGoal(goal);
  const fieldKey = MACRO_SHEET_FIELD_BY_KIND[metricKind];
  const tiers = getRowsForGoal(goalKey).map((row) => {
    const tone = categoryToTone(row.category);
    const raw = row[fieldKey];
    const bounds = parseNumericBounds(raw);
    const display = formatMetricDisplay(raw, metricKind);
    return {
      id: tone,
      tone,
      label: TONE_UI_LABELS[tone],
      range: display.range,
      unit: display.unit,
      bounds,
    };
  });

  const value = getMacroNutritionValue(macro, metricKind);
  const tier = resolveTierForValue(value, tiers, macro, null);

  return {
    cardTitle: config.cardTitle,
    iconModifierClass: config.iconModifierClass,
    goalLabel: formatGoalSubtitle(goalKey),
    tone: tier.tone,
    guidelineName: DEFAULT_CARB_GUIDELINE,
    zones: tiers.map(({ id, label, range, unit, tone }) => ({
      id,
      label,
      range,
      unit,
      tone,
    })),
    activeZoneId: tier.id,
  };
};

export const getMacroIdealRangeDisplay = (interpretation) => {
  const optimalZone = interpretation?.zones?.find((zone) => zone.tone === 'optimal');
  if (!optimalZone?.range) {
    return '';
  }
  if (optimalZone.unit) {
    return `${optimalZone.range} ${optimalZone.unit}`;
  }
  return optimalZone.range;
};

export const buildBmrInterpretation = ({
  bmr,
  goal,
  genderSources = {},
  statusObj = null,
}) => {
  const goalKey = normalizeMacroGoal(goal);
  const gender = normalizePatientGender(genderSources);
  const tiers = buildTierDefinitions(goalKey, { gender, metric: 'bmr' });
  const value = resolveMetricValue(bmr, 'bmr');
  const tier = resolveTierForValue(value, tiers, bmr, statusObj);

  return buildInsightFromTier(tier, tiers, {
    cardTitle: 'BMR Interpretation',
    iconSrc: null,
    iconModifierClass: '',
    equationName: DEFAULT_EQUATION_NAME,
    goal: goalKey,
  });
};

export const buildBodyFatInterpretation = ({
  bodyFat,
  goal,
  genderSources = {},
  statusObj = null,
}) => {
  const goalKey = normalizeMacroGoal(goal);
  const gender = normalizePatientGender(genderSources);
  const tiers = buildTierDefinitions(goalKey, { gender, metric: 'bodyFat' });
  const value = resolveMetricValue(bodyFat, 'bodyFat');
  const tier = resolveTierForValue(value, tiers, bodyFat, statusObj);

  return buildInsightFromTier(tier, tiers, {
    cardTitle: 'Body Fat % Interpretation',
    iconSrc: null,
    iconModifierClass: 'health-scan-page__bmr-insight-icon--body-fat',
    equationName: DEFAULT_EQUATION_NAME,
    goal: goalKey,
  });
};

export const buildCarbsInterpretation = ({ carbs, goal }) => (
  buildMacroNutrientInterpretation({ macro: carbs, goal, metricKind: 'carbs' })
);

export const buildFatsInterpretation = ({ fats, goal }) => (
  buildMacroNutrientInterpretation({ macro: fats, goal, metricKind: 'fats' })
);

export const buildProteinInterpretation = ({ protein, goal }) => (
  buildMacroNutrientInterpretation({ macro: protein, goal, metricKind: 'protein' })
);

export const buildFibreInterpretation = ({ fibre, goal }) => (
  buildMacroNutrientInterpretation({ macro: fibre, goal, metricKind: 'fibre' })
);
