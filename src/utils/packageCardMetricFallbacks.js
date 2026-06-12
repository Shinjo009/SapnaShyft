const STANDARD_REPORTS_IN = '48-72 hrs';
const STANDARD_FASTING = '10-12 hrs';

const STANDARD_METRICS = {
  reportsIn: STANDARD_REPORTS_IN,
  fasting: STANDARD_FASTING,
};

export const slugifyPackageName = (name) => String(name || '')
  .replace(/[♂♀]/g, '')
  .replace(/\b(male|female)\b/gi, '')
  .replace(/\+/g, ' plus')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const PACKAGE_METRIC_MATCHERS = [
  { test: (slug) => /supershyft core plus|^core plus$/.test(slug), metrics: STANDARD_METRICS },
  { test: (slug) => /supershyft core\b|^core$/.test(slug) && !/plus/.test(slug), metrics: STANDARD_METRICS },
  { test: (slug) => /elite performance/.test(slug), metrics: STANDARD_METRICS },
  { test: (slug) => /peak performance/.test(slug), metrics: STANDARD_METRICS },
  { test: (slug) => /^gen z$|^genz$/.test(slug), metrics: STANDARD_METRICS },
  { test: (slug) => /^oncocare$|^onco care$/.test(slug), metrics: STANDARD_METRICS },
  { test: (slug) => /^executive$/.test(slug), metrics: STANDARD_METRICS },
  { test: (slug) => /^c suite$/.test(slug), metrics: STANDARD_METRICS },
  { test: (slug) => /^hair health$/.test(slug), metrics: STANDARD_METRICS },
  { test: (slug) => /^menstrual health$/.test(slug), metrics: STANDARD_METRICS },
  { test: (slug) => /^sleep$/.test(slug), metrics: STANDARD_METRICS },
  { test: (slug) => /^fatigue$/.test(slug), metrics: STANDARD_METRICS },
  { test: (slug) => /^bio allergy plus$|^bio allergy$/.test(slug), metrics: STANDARD_METRICS },
];

export const getHardcodedPackageMetrics = (packageName) => {
  const slug = slugifyPackageName(packageName);
  if (!slug) {
    return null;
  }

  const match = PACKAGE_METRIC_MATCHERS.find(({ test }) => test(slug));
  return match?.metrics ?? null;
};

export const applyPackageCardMetricFallbacks = (packageName, metrics = {}) => {
  const fallback = getHardcodedPackageMetrics(packageName);
  if (!fallback) {
    return metrics;
  }

  return {
    ...metrics,
    reportsIn: fallback.reportsIn,
    fasting: fallback.fasting,
  };
};
