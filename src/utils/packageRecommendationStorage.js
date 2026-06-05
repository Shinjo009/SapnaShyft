const STORAGE_PREFIX = 'supershyft_package_onboarding_v1';
const ELIGIBILITY_PREFIX = 'supershyft_package_onboarding_eligible_v1';

const getStorageKey = (scopeId) => {
  const id = String(scopeId || '').trim();
  if (!id) {
    return null;
  }
  return `${STORAGE_PREFIX}_${id}`;
};

const getEligibilityKey = (scopeId) => {
  const id = String(scopeId || '').trim();
  if (!id) {
    return null;
  }
  return `${ELIGIBILITY_PREFIX}_${id}`;
};

export const isPackageOnboardingEligible = (scopeId) => {
  try {
    const key = getEligibilityKey(scopeId);
    if (!key) {
      return false;
    }
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
};

export const setPackageOnboardingEligible = (scopeId, eligible) => {
  try {
    const key = getEligibilityKey(scopeId);
    if (!key) {
      return;
    }

    if (eligible) {
      window.localStorage.setItem(key, '1');
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    /* ignore quota / private mode */
  }
};

export const isPackageOnboardingComplete = (scopeId) => {
  try {
    const key = getStorageKey(scopeId);
    if (!key) {
      return false;
    }
    return window.localStorage.getItem(key) != null;
  } catch {
    return false;
  }
};

/** True when For you uses engine-ranked packages (questionnaire or profile-only skip). */
export const hasPersonalizedForYouRecommendations = (scopeIdOrResult) => {
  const result = scopeIdOrResult && typeof scopeIdOrResult === 'object' && 'rankedPackages' in scopeIdOrResult
    ? scopeIdOrResult
    : loadPackageOnboardingResult(scopeIdOrResult);

  return Boolean(result?.rankedPackages?.length);
};

export const loadPackageOnboardingResult = (scopeId) => {
  try {
    const key = getStorageKey(scopeId);
    if (!key) {
      return null;
    }

    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const rankedPackages = Array.isArray(parsed.rankedPackages)
      ? parsed.rankedPackages
        .map((row, index) => ({
          packageId: Number(row?.packageId),
          score: Number(row?.score) || 0,
          label: row?.label ? String(row.label) : null,
          rank: Number(row?.rank) || index + 1,
        }))
        .filter((row) => Number.isFinite(row.packageId) && row.packageId > 0)
      : [];

    return {
      completedAt: parsed.completedAt || null,
      skipped: Boolean(parsed.skipped),
      source: String(parsed.source || 'questionnaire'),
      persona: String(parsed.persona || ''),
      primaryConcern: String(parsed.primaryConcern || ''),
      otherConcerns: Array.isArray(parsed.otherConcerns)
        ? parsed.otherConcerns.map((item) => String(item)).filter(Boolean)
        : [],
      concerns: Array.isArray(parsed.concerns)
        ? parsed.concerns.map((item) => String(item)).filter(Boolean)
        : [],
      rankedPackages,
    };
  } catch {
    return null;
  }
};

export const savePackageOnboardingResult = (scopeId, payload) => {
  try {
    const key = getStorageKey(scopeId);
    if (!key || !payload || typeof payload !== 'object') {
      return;
    }

    const safe = {
      completedAt: new Date().toISOString(),
      skipped: Boolean(payload.skipped),
      source: String(payload.source || (payload.skipped ? 'profile_only' : 'questionnaire')),
      persona: String(payload.persona || ''),
      primaryConcern: String(payload.primaryConcern || ''),
      otherConcerns: Array.isArray(payload.otherConcerns)
        ? payload.otherConcerns.map((item) => String(item)).filter(Boolean)
        : [],
      concerns: Array.isArray(payload.concerns)
        ? payload.concerns.map((item) => String(item)).filter(Boolean)
        : [],
      rankedPackages: Array.isArray(payload.rankedPackages)
        ? payload.rankedPackages.map((row, index) => ({
          packageId: Number(row?.packageId),
          score: Number(row?.score) || 0,
          label: row?.label ? String(row.label) : null,
          rank: Number(row?.rank) || index + 1,
        }))
        : [],
    };

    window.localStorage.setItem(key, JSON.stringify(safe));
  } catch {
    /* ignore quota / private mode */
  }
};
