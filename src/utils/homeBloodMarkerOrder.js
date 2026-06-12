const getProfileKey = (marker) => {
  const profile = String(marker?.disease || marker?.profile || '').trim().toLowerCase();
  return profile || 'general';
};

const RISK_TIER_ORDER = ['high', 'low', 'optimal'];

/**
 * Pick up to `limit` home blood markers: high risk first, then marginal/low, then optimal.
 * Each profile/category (e.g. Liver) appears at most once.
 */
export const orderHomeBloodMarkersByHierarchy = (markers, limit = 3) => {
  const source = Array.isArray(markers) ? markers : [];
  const safeLimit = Number.isFinite(Number(limit)) && Number(limit) > 0
    ? Math.floor(Number(limit))
    : 3;

  const picked = [];
  const seenCategories = new Set();

  RISK_TIER_ORDER.forEach((riskKey) => {
    if (picked.length >= safeLimit) {
      return;
    }

    source.forEach((marker) => {
      if (picked.length >= safeLimit || marker?.riskKey !== riskKey) {
        return;
      }

      const categoryKey = getProfileKey(marker);
      if (seenCategories.has(categoryKey)) {
        return;
      }

      seenCategories.add(categoryKey);
      picked.push(marker);
    });
  });

  return picked;
};
