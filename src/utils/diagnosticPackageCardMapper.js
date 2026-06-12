import { applyPackageCardMetricFallbacks } from './packageCardMetricFallbacks';

export const MISSING_VALUE = '-';

export const normalizePackageTitle = (value) => String(value || '')
  .replace(/[♂♀]/g, '')
  .replace(/\b(male|female)\b/gi, '')
  .replace(/\s+/g, ' ')
  .trim();

export const hasCardDisplayValue = (value) => {
  const text = String(value ?? '').trim();
  return text.length > 0 && text !== MISSING_VALUE;
};

const normalizeText = (value) => String(value || '').trim();

export const packageHasFastingData = (pkg) => {
  const preparations = Array.isArray(pkg?.preparations) ? pkg.preparations : [];
  const hasFastingSteps = preparations.some((item) => {
    if (!/fast/i.test(normalizeText(item?.preparation_title))) {
      return false;
    }

    const steps = Array.isArray(item?.steps)
      ? item.steps.map((step) => normalizeText(step)).filter(Boolean)
      : [];

    return steps.length > 0;
  });

  if (hasFastingSteps) {
    return true;
  }

  return hasCardDisplayValue(pkg?.fasting_hours ?? pkg?.fasting_duration ?? pkg?.fasting);
};

export const packageHasReportDuration = (pkg) => {
  const hours = Number(pkg?.report_duration_hours);
  return Number.isFinite(hours) && hours > 0;
};

const formatGenderBadge = (genderSuitability) => {
  const gender = normalizeText(genderSuitability).toLowerCase();
  if (gender === 'male') {
    return 'Men';
  }
  if (gender === 'female') {
    return 'Women';
  }
  return null;
};

const extractFilterChipLabels = (pkg) => {
  const values = [];
  const seen = new Set();

  const pushValue = (value) => {
    const normalized = normalizeText(value);
    if (!normalized) {
      return;
    }

    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    values.push(normalized);
  };

  const rawFilterChip = pkg?.filter_chip ?? pkg?.filter_chips;

  if (typeof rawFilterChip === 'string') {
    rawFilterChip
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach(pushValue);
  } else if (Array.isArray(rawFilterChip)) {
    rawFilterChip.forEach((item) => {
      if (typeof item === 'string' || typeof item === 'number') {
        pushValue(item);
        return;
      }

      if (item && typeof item === 'object') {
        pushValue(item?.display_name || item?.filter_chip || item?.chip_key || item?.name);
      }
    });
  } else if (rawFilterChip && typeof rawFilterChip === 'object') {
    pushValue(
      rawFilterChip?.display_name
      || rawFilterChip?.filter_chip
      || rawFilterChip?.chip_key
      || rawFilterChip?.name,
    );
  }

  return values;
};

export const formatReportDurationHours = (hours) => {
  const value = Number(hours);
  if (!Number.isFinite(value) || value <= 0) {
    return MISSING_VALUE;
  }

  return `${value} hrs`;
};

export const extractFastingLabel = (pkg) => {
  const preparations = Array.isArray(pkg?.preparations) ? pkg.preparations : [];
  const fastingPrep = preparations.find((item) => (
    /fast/i.test(normalizeText(item?.preparation_title))
  ));

  if (fastingPrep) {
    const steps = Array.isArray(fastingPrep.steps)
      ? fastingPrep.steps.map((step) => normalizeText(step)).filter(Boolean)
      : [];

    if (steps.length > 0) {
      return steps.join(', ');
    }
  }

  const directValue = pkg?.fasting_hours ?? pkg?.fasting_duration ?? pkg?.fasting;
  const directText = normalizeText(directValue);
  if (directText) {
    return directText;
  }

  return MISSING_VALUE;
};

export const extractParametersCount = (pkg) => {
  const count = pkg?.no_of_tests ?? pkg?.tests_count ?? pkg?.parameters_count;
  if (count == null || count === '') {
    return MISSING_VALUE;
  }

  return String(count);
};

export const buildPackageFaceBadges = (pkg) => {
  const badges = [];
  const seen = new Set();

  const addBadge = (label) => {
    const normalized = normalizeText(label);
    if (!normalized) {
      return;
    }

    let display = normalized;
    const lower = normalized.toLowerCase();
    if (lower === 'most popular') {
      display = 'Popular';
    } else if (lower === 'male') {
      display = 'Men';
    } else if (lower === 'female') {
      display = 'Women';
    }
    const key = display.toLowerCase();
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    badges.push(display);
  };

  extractFilterChipLabels(pkg).forEach(addBadge);

  if (pkg?.is_most_popular) {
    addBadge('Popular');
  }

  const genderBadge = formatGenderBadge(pkg?.gender_suitability);
  if (genderBadge) {
    addBadge(genderBadge);
  }

  return badges;
};

export const toDiscountText = (discountPercent, nowPrice, originalPrice) => {
  if (Number(discountPercent) > 0) {
    return `${Math.round(Number(discountPercent))}% OFF`;
  }

  if (Number(originalPrice) > Number(nowPrice) && Number(nowPrice) > 0) {
    const computedPercent = Math.round(
      ((Number(originalPrice) - Number(nowPrice)) / Number(originalPrice)) * 100,
    );
    if (computedPercent > 0) {
      return `${computedPercent}% OFF`;
    }
  }

  return MISSING_VALUE;
};

export const mapDiagnosticPackageToCard = (pkg, index) => {
  const resolvedNowPrice = Number(pkg?.price);
  const resolvedOldPrice = Number(pkg?.original_price);
  const now = Number.isFinite(resolvedNowPrice) && resolvedNowPrice > 0 ? resolvedNowPrice : null;
  const old = Number.isFinite(resolvedOldPrice) && resolvedOldPrice > 0 ? resolvedOldPrice : null;
  const badges = buildPackageFaceBadges(pkg);

  const mappedTags = Array.isArray(pkg?.tags)
    ? pkg.tags
      .map((tag) => {
        if (typeof tag === 'string' || typeof tag === 'number') {
          return String(tag).trim();
        }

        if (tag && typeof tag === 'object') {
          return String(tag.tag_name || tag.name || '').trim();
        }

        return '';
      })
      .filter(Boolean)
      .slice(0, 4)
    : [];

  const offText = toDiscountText(pkg?.discount_percent, now, old);
  const packageName = String(pkg?.package_name || '').trim();
  const metrics = applyPackageCardMetricFallbacks(packageName, {
    parameters: extractParametersCount(pkg),
    reportsIn: formatReportDurationHours(pkg?.report_duration_hours),
    fasting: extractFastingLabel(pkg),
  });

  return {
    id: Number(pkg?.diagnostic_package_id) || `package-${index}`,
    theme: index % 2 === 0 ? 'teal' : 'pink',
    badges,
    title: normalizePackageTitle(packageName) || null,
    chips: mappedTags,
    metrics,
    pricing: {
      now,
      old: old && now && old > now ? old : null,
      off: offText !== MISSING_VALUE ? offText : null,
    },
    apiData: pkg,
  };
};
