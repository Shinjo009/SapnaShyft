export const PERSONA_OPTIONS = [
  'Student',
  'Working Professional',
  'Manager',
  'Founder / CXO',
];

export const CONCERN_OPTIONS = [
  'General Health',
  'Energy & Fatigue',
  'Peak Performance',
  'Executive Wellness',
  'Sleep Issues',
  'Hair Health',
  "Women's Health",
  'Cancer Screening',
  'Allergies',
  'Weight Loss',
  'Building Muscle Mass',
  'Increasing Energy Levels',
  'Improving Metabolic Health',
  'Improving Physical Endurance',
  'Increasing Strength',
];

const PERSONA_RULES = {
  Student: {
    prioritize: ['genz', 'core', 'sleep'],
    boost: ['fitness', 'energy'],
    budgetCap: 4000,
    priWeight: 12,
    boostWeight: 6,
  },
  'Working Professional': {
    prioritize: ['core', 'executive', 'fatigue', 'sleep', 'peak'],
    boost: ['metabolic', 'fatigue'],
    budgetCap: null,
    priWeight: 12,
    boostWeight: 6,
  },
  Manager: {
    prioritize: ['executive', 'peak', 'sleep'],
    boost: ['cardiac', 'hormonal', 'stress'],
    budgetCap: null,
    priWeight: 15,
    boostWeight: 8,
  },
  'Founder / CXO': {
    prioritize: ['csuite', 'executive', 'peak'],
    boost: ['longevity', 'cancer', 'metabolic', 'stress'],
    budgetCap: null,
    priWeight: 18,
    boostWeight: 10,
  },
};

const AGE_RULES = [
  {
    range: [16, 22],
    boost: ['genz', 'core', 'fitness', 'energy'],
    reduce: ['executive', 'csuite', 'longevity'],
    boostW: 10,
    reduceW: -8,
  },
  {
    range: [23, 30],
    boost: ['core', 'peak', 'sleep', 'fitness'],
    reduce: [],
    moderate: ['executive'],
    boostW: 10,
    reduceW: 0,
    moderateW: -3,
  },
  {
    range: [31, 40],
    boost: ['executive', 'peak', 'fatigue', 'preventive'],
    reduce: [],
    boostW: 12,
    reduceW: 0,
  },
  {
    range: [41, 50],
    boost: ['executive', 'cancer', 'csuite', 'cardiac', 'metabolic'],
    reduce: [],
    boostW: 18,
    reduceW: 0,
  },
  {
    range: [51, 120],
    boost: ['csuite', 'cancer', 'executive', 'preventive', 'organ', 'longevity'],
    reduce: ['genz'],
    boostW: 22,
    reduceW: -10,
  },
];

const CONCERN_MAP = {
  'General Health': { primary: ['core', 'general'], secondary: ['peak'], priW: 20, secW: 8 },
  'Energy & Fatigue': { primary: ['fatigue', 'energy'], secondary: ['executive'], priW: 22, secW: 10 },
  'Peak Performance': { primary: ['peak', 'performance'], secondary: ['executive'], priW: 25, secW: 12 },
  'Executive Wellness': { primary: ['executive', 'csuite'], secondary: ['peak'], priW: 25, secW: 10 },
  'Sleep Issues': { primary: ['sleep'], secondary: ['fatigue'], priW: 22, secW: 8 },
  'Hair Health': { primary: ['hair'], secondary: ['hormonal'], priW: 25, secW: 8 },
  "Women's Health": { primary: ['menstrual', 'womens'], secondary: ['performance'], priW: 25, secW: 8 },
  'Cancer Screening': { primary: ['cancer', 'oncology', 'csuite'], secondary: ['preventive'], priW: 28, secW: 10 },
  Allergies: { primary: ['allergy'], secondary: ['core'], priW: 28, secW: 6 },
  'Weight Loss': { primary: ['peak', 'metabolic'], secondary: ['core'], priW: 20, secW: 8 },
  'Building Muscle Mass': { primary: ['peak', 'performance'], secondary: ['genz'], priW: 22, secW: 8 },
  'Increasing Energy Levels': { primary: ['fatigue', 'energy'], secondary: ['sleep'], priW: 22, secW: 8 },
  'Improving Metabolic Health': { primary: ['executive', 'metabolic'], secondary: ['csuite'], priW: 22, secW: 10 },
  'Improving Physical Endurance': { primary: ['peak', 'performance'], secondary: ['genz'], priW: 22, secW: 8 },
  'Increasing Strength': { primary: ['peak', 'performance'], secondary: ['genz'], priW: 22, secW: 8 },
};

const WEIGHT_ONE = 0.10;
const WEIGHT_TWO = 0.20;
const WEIGHT_THREE = 0.20;
const WEIGHT_FOUR = 0.50;

const ENGINE_TAG_VOCAB = new Set([
  'core', 'general', 'basic', 'affordable', 'budget', 'performance', 'fitness', 'energy',
  'strength', 'peak', 'metabolic', 'male', 'female', 'genz', 'youth', 'muscle', 'cancer',
  'oncology', 'preventive', 'screening', 'executive', 'comprehensive', 'cardiac', 'hormonal',
  'stress', 'csuite', 'longevity', 'hair', 'menstrual', 'womens', 'sleep', 'fatigue', 'allergy',
  'immune', 'organ',
]);

const TAG_INFERENCE_RULES = [
  { test: (haystack) => /core\s*\+|core plus/i.test(haystack), tags: ['core', 'general', 'basic', 'affordable'] },
  {
    test: (haystack) => /\bcore\b/i.test(haystack) && !/core\s*\+|core plus/i.test(haystack),
    tags: ['core', 'general', 'budget', 'affordable'],
  },
  { test: (haystack) => /elite performance|elite perf/i.test(haystack), tags: ['performance', 'fitness', 'energy', 'strength'] },
  { test: (haystack) => /peak performance|peak perf|\bpeak\b/i.test(haystack), tags: ['performance', 'peak', 'fitness', 'energy', 'strength', 'metabolic'] },
  { test: (haystack) => /gen\s*z|genz/i.test(haystack), tags: ['genz', 'youth', 'fitness', 'energy', 'muscle'] },
  { test: (haystack) => /oncocare|onco care|cancer/i.test(haystack), tags: ['cancer', 'oncology', 'preventive', 'screening'] },
  { test: (haystack) => /executive/i.test(haystack), tags: ['executive', 'comprehensive', 'metabolic', 'cardiac', 'hormonal', 'stress'] },
  { test: (haystack) => /c-?suite|c suite|csuite/i.test(haystack), tags: ['csuite', 'longevity', 'cancer', 'comprehensive', 'executive', 'metabolic'] },
  { test: (haystack) => /hair/i.test(haystack), tags: ['hair', 'hormonal'] },
  { test: (haystack) => /menstrual|period/i.test(haystack), tags: ['menstrual', 'womens', 'hormonal'] },
  { test: (haystack) => /women.*peak|women peak/i.test(haystack), tags: ['performance', 'womens', 'energy'] },
  { test: (haystack) => /men peak|men peak performance/i.test(haystack), tags: ['performance', 'energy'] },
  { test: (haystack) => /\bsleep\b/i.test(haystack), tags: ['sleep', 'fatigue', 'stress'] },
  { test: (haystack) => /\bfatigue\b/i.test(haystack), tags: ['fatigue', 'energy', 'sleep'] },
  { test: (haystack) => /bio-?allergy|allergy/i.test(haystack), tags: ['allergy', 'immune'] },
  { test: (haystack) => /metabolic/i.test(haystack), tags: ['metabolic', 'executive'] },
  { test: (haystack) => /preventive|screening/i.test(haystack), tags: ['preventive', 'screening'] },
  { test: (haystack) => /longevity/i.test(haystack), tags: ['longevity'] },
  { test: (haystack) => /cardiac|heart/i.test(haystack), tags: ['cardiac'] },
  { test: (haystack) => /performance|perf/i.test(haystack), tags: ['performance', 'fitness'] },
  { test: (haystack) => /fitness|fit\b/i.test(haystack), tags: ['fitness'] },
  { test: (haystack) => /energy/i.test(haystack), tags: ['energy'] },
  { test: (haystack) => /general|basic|essential/i.test(haystack), tags: ['general', 'core'] },
  { test: (haystack) => /affordable|budget|value/i.test(haystack), tags: ['affordable', 'budget'] },
];

const buildPackageHaystack = (card) => {
  const parts = [
    String(card?.title || ''),
    String(card?.apiData?.package_name || ''),
    ...(Array.isArray(card?.badges) ? card.badges : []),
    ...(Array.isArray(card?.chips) ? card.chips : []),
  ];

  const rawTags = Array.isArray(card?.apiData?.tags) ? card.apiData.tags : [];
  rawTags.forEach((tag) => {
    if (typeof tag === 'string' || typeof tag === 'number') {
      parts.push(String(tag));
      return;
    }

    if (tag && typeof tag === 'object') {
      parts.push(
        tag.tag_name,
        tag.name,
        tag.filter_chip,
        tag.chip_key,
        tag.display_name,
      );
    }
  });

  return parts
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
};

export const normalizeEngineGender = (profileGender) => {
  const gender = String(profileGender || '').trim().toLowerCase();
  if (gender === 'male' || gender === 'm' || gender === 'man') {
    return 'male';
  }
  if (gender === 'female' || gender === 'f' || gender === 'woman') {
    return 'female';
  }
  return 'other';
};

export const getConcernOptionsForGender = (gender) => {
  const engineGender = normalizeEngineGender(gender);
  if (engineGender === 'male') {
    return CONCERN_OPTIONS.filter((concern) => concern !== "Women's Health");
  }
  return [...CONCERN_OPTIONS];
};

export const buildConcernsFromMcq = (primaryConcern, otherConcerns = []) => {
  const primary = String(primaryConcern || '').trim();
  if (!primary) {
    return [];
  }

  const others = (Array.isArray(otherConcerns) ? otherConcerns : [])
    .map((item) => String(item || '').trim())
    .filter((item) => item && item !== primary);

  return [primary, ...others];
};

export const inferPackageEngineTags = (card) => {
  const haystack = buildPackageHaystack(card);
  const tags = new Set();

  TAG_INFERENCE_RULES.forEach((rule) => {
    if (rule.test(haystack)) {
      rule.tags.forEach((tag) => tags.add(tag));
    }
  });

  const suitability = String(card?.apiData?.gender_suitability || '').trim().toLowerCase();
  if (suitability === 'male') {
    tags.add('male');
  } else if (suitability === 'female') {
    tags.add('female');
  }

  if (/women|♀|female/i.test(haystack) && !/\bmen\b|♂|male/i.test(haystack)) {
    tags.add('female');
    tags.add('womens');
  }
  if (/\bmen\b|♂|\bmale\b/i.test(haystack) && !/women|♀|female/i.test(haystack)) {
    tags.add('male');
  }

  haystack.split(/[^a-z0-9+]+/).forEach((token) => {
    if (ENGINE_TAG_VOCAB.has(token)) {
      tags.add(token);
    }
  });

  if (tags.size === 0) {
    tags.add('core');
    tags.add('general');
  }

  return Array.from(tags);
};

export const toEnginePackage = (card) => {
  const price = Number(card?.pricing?.now ?? card?.apiData?.price);
  const discountPct = Number(card?.apiData?.discount_percent);
  const testsRaw = card?.metrics?.parameters ?? card?.apiData?.no_of_tests;
  const testsParsed = Number(testsRaw);

  const suitability = String(card?.apiData?.gender_suitability || 'both').trim().toLowerCase();
  let gender = 'both';
  if (suitability === 'male' || suitability === 'female') {
    gender = suitability;
  }

  return {
    id: String(card?.id ?? card?.apiData?.diagnostic_package_id ?? ''),
    displayName: String(card?.title || card?.apiData?.package_name || 'Package'),
    price: Number.isFinite(price) && price > 0 ? price : 0,
    discountPct: Number.isFinite(discountPct) && discountPct > 0 ? discountPct : 0,
    tests: Number.isFinite(testsParsed) && testsParsed > 0 ? testsParsed : 0,
    gender,
    tags: inferPackageEngineTags(card),
    cardRef: card,
  };
};

const catchOne = (packages, gender) => {
  const scores = {};

  packages.forEach((pkg) => {
    if (pkg.gender === 'both') {
      scores[pkg.id] = 0;
    } else if ((gender === 'male' || gender === 'female') && pkg.gender === gender) {
      scores[pkg.id] = 5;
    } else if ((gender === 'male' || gender === 'female') && pkg.gender !== gender) {
      scores[pkg.id] = -9999;
    } else {
      scores[pkg.id] = pkg.gender === 'both' ? 0 : -9999;
    }
  });

  return scores;
};

const catchTwo = (packages, persona) => {
  const rules = PERSONA_RULES[persona] || {};
  const priTags = rules.prioritize || [];
  const boostTags = rules.boost || [];
  const priW = rules.priWeight || 10;
  const boostW = rules.boostWeight || 5;
  const budgetCap = rules.budgetCap;

  const scores = {};

  packages.forEach((pkg) => {
    let score = 0;
    pkg.tags.forEach((tag) => {
      if (priTags.includes(tag)) {
        score += priW;
      } else if (boostTags.includes(tag)) {
        score += boostW;
      }
    });

    if (budgetCap && pkg.price > budgetCap) {
      score -= 20;
    }

    scores[pkg.id] = score;
  });

  return scores;
};

const catchThree = (packages, age) => {
  const scores = Object.fromEntries(packages.map((pkg) => [pkg.id, 0]));
  const safeAge = Number.isFinite(Number(age)) ? Number(age) : 28;

  const rule = AGE_RULES.find((item) => safeAge >= item.range[0] && safeAge <= item.range[1]);

  if (!rule) {
    return scores;
  }

  const boostTags = rule.boost || [];
  const reduceTags = rule.reduce || [];
  const moderateTags = rule.moderate || [];
  const boostW = rule.boostW || 10;
  const reduceW = rule.reduceW || -8;
  const moderateW = rule.moderateW || -4;

  packages.forEach((pkg) => {
    pkg.tags.forEach((tag) => {
      if (boostTags.includes(tag)) {
        scores[pkg.id] += boostW;
      }
      if (reduceTags.includes(tag)) {
        scores[pkg.id] += reduceW;
      }
      if (moderateTags.includes(tag)) {
        scores[pkg.id] += moderateW;
      }
    });
  });

  return scores;
};

const catchFour = (packages, concerns, gender) => {
  const scores = Object.fromEntries(packages.map((pkg) => [pkg.id, 0]));
  const coverage = Object.fromEntries(packages.map((pkg) => [pkg.id, new Set()]));

  concerns.forEach((concern) => {
    if (concern === "Women's Health" && gender !== 'female') {
      return;
    }

    const rules = CONCERN_MAP[concern] || {};
    const priTags = rules.primary || [];
    const secTags = rules.secondary || [];
    const priW = rules.priW || 20;
    const secW = rules.secW || 8;

    packages.forEach((pkg) => {
      pkg.tags.forEach((tag) => {
        if (priTags.includes(tag)) {
          scores[pkg.id] += priW;
          coverage[pkg.id].add(concern);
        } else if (secTags.includes(tag)) {
          scores[pkg.id] += secW;
        }
      });
    });
  });

  packages.forEach((pkg) => {
    const overlapCount = coverage[pkg.id].size;
    if (overlapCount > 1) {
      scores[pkg.id] += (overlapCount - 1) * 15;
    }
  });

  return scores;
};

const computeOriginalPrice = (price, discountPct) => {
  if (!Number.isFinite(price) || price <= 0) {
    return price;
  }
  if (!Number.isFinite(discountPct) || discountPct <= 0 || discountPct >= 100) {
    return price;
  }
  const raw = price / (1 - discountPct / 100);
  return Math.ceil(raw / 50) * 50;
};

export const computePackageRecommendations = ({
  age,
  gender,
  persona,
  concerns,
  packageCards = [],
}) => {
  const engineGender = normalizeEngineGender(gender);
  const packages = (Array.isArray(packageCards) ? packageCards : [])
    .map(toEnginePackage)
    .filter((pkg) => pkg.id);

  if (packages.length === 0) {
    return [];
  }

  const c1 = catchOne(packages, engineGender);
  const c2 = catchTwo(packages, persona);
  const c3 = catchThree(packages, age);
  const c4 = catchFour(packages, concerns, engineGender);

  const ranked = [];

  packages.forEach((pkg) => {
    const identityScore = c1[pkg.id] ?? 0;
    if (identityScore <= -9999) {
      return;
    }

    const total = (
      identityScore * WEIGHT_ONE
      + (c2[pkg.id] ?? 0) * WEIGHT_TWO
      + (c3[pkg.id] ?? 0) * WEIGHT_THREE
      + (c4[pkg.id] ?? 0) * WEIGHT_FOUR
      + pkg.tests * 0.05
    );

    ranked.push({
      package: pkg,
      score: Math.round(total * 100) / 100,
      originalPrice: computeOriginalPrice(pkg.price, pkg.discountPct),
      catchScores: {
        identity: Math.round(identityScore * 100) / 100,
        persona: Math.round((c2[pkg.id] ?? 0) * 100) / 100,
        age: Math.round((c3[pkg.id] ?? 0) * 100) / 100,
        concern: Math.round((c4[pkg.id] ?? 0) * 100) / 100,
      },
    });
  });

  ranked.sort((a, b) => b.score - a.score);

  if (ranked.length >= 3) {
    ranked[0].label = 'Best Match';
    const bestPrice = ranked[0].package.price;
    const premiumIdx = ranked.findIndex((row, index) => (
      index > 0 && row.package.price >= bestPrice * 1.2
    ));
    const resolvedPremiumIdx = premiumIdx >= 0 ? premiumIdx : 1;
    ranked[resolvedPremiumIdx].label = 'Premium Upgrade';

    const budgetIdx = ranked.findIndex((row, index) => (
      row.package.price < bestPrice && index !== 0 && index !== resolvedPremiumIdx
    ));
    const resolvedBudgetIdx = budgetIdx >= 0 ? budgetIdx : 2;
    ranked[resolvedBudgetIdx].label = 'Budget Alternative';
  } else if (ranked.length >= 1) {
    ranked[0].label = 'Best Match';
  }

  return ranked;
};

const PROFILE_ONLY_WEIGHT_ONE = WEIGHT_ONE / (WEIGHT_ONE + WEIGHT_THREE);
const PROFILE_ONLY_WEIGHT_THREE = WEIGHT_THREE / (WEIGHT_ONE + WEIGHT_THREE);

export const computeProfileOnlyPackageRecommendations = ({
  age,
  gender,
  packageCards = [],
}) => {
  const engineGender = normalizeEngineGender(gender);
  const packages = (Array.isArray(packageCards) ? packageCards : [])
    .map(toEnginePackage)
    .filter((pkg) => pkg.id);

  if (packages.length === 0) {
    return [];
  }

  const c1 = catchOne(packages, engineGender);
  const c3 = catchThree(packages, age);

  const ranked = [];

  packages.forEach((pkg) => {
    const identityScore = c1[pkg.id] ?? 0;
    if (identityScore <= -9999) {
      return;
    }

    const total = (
      identityScore * PROFILE_ONLY_WEIGHT_ONE
      + (c3[pkg.id] ?? 0) * PROFILE_ONLY_WEIGHT_THREE
      + pkg.tests * 0.05
    );

    ranked.push({
      package: pkg,
      score: Math.round(total * 100) / 100,
      originalPrice: computeOriginalPrice(pkg.price, pkg.discountPct),
      catchScores: {
        identity: Math.round(identityScore * 100) / 100,
        persona: 0,
        age: Math.round((c3[pkg.id] ?? 0) * 100) / 100,
        concern: 0,
      },
    });
  });

  ranked.sort((a, b) => b.score - a.score);

  if (ranked.length >= 3) {
    ranked[0].label = 'Best Match';
    const bestPrice = ranked[0].package.price;
    const premiumIdx = ranked.findIndex((row, index) => (
      index > 0 && row.package.price >= bestPrice * 1.2
    ));
    const resolvedPremiumIdx = premiumIdx >= 0 ? premiumIdx : 1;
    ranked[resolvedPremiumIdx].label = 'Premium Upgrade';

    const budgetIdx = ranked.findIndex((row, index) => (
      row.package.price < bestPrice && index !== 0 && index !== resolvedPremiumIdx
    ));
    const resolvedBudgetIdx = budgetIdx >= 0 ? budgetIdx : 2;
    ranked[resolvedBudgetIdx].label = 'Budget Alternative';
  } else if (ranked.length >= 1) {
    ranked[0].label = 'Best Match';
  }

  return ranked;
};
