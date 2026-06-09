const getProfileKey = (marker) => {
  const profile = String(marker?.disease || marker?.profile || '').trim().toLowerCase();
  return profile || 'general';
};

/**
 * Round-robin high-risk markers across profiles so the home screen shows
 * one high from each profile first, then additional highs before any lower risk.
 */
export const orderHighMarkersByProfileDiversity = (highMarkers) => {
  const source = Array.isArray(highMarkers) ? highMarkers : [];
  if (source.length === 0) {
    return [];
  }

  const byProfile = new Map();
  const profileOrder = [];

  source.forEach((marker) => {
    const key = getProfileKey(marker);
    if (!byProfile.has(key)) {
      byProfile.set(key, []);
      profileOrder.push(key);
    }
    byProfile.get(key).push(marker);
  });

  const ordered = [];
  let hasMore = true;

  while (hasMore) {
    hasMore = false;
    profileOrder.forEach((profileKey) => {
      const queue = byProfile.get(profileKey);
      if (queue.length > 0) {
        ordered.push(queue.shift());
        hasMore = true;
      }
    });
  }

  return ordered;
};

export const orderHomeBloodMarkersByHierarchy = (markers) => {
  const source = Array.isArray(markers) ? markers : [];
  const high = source.filter((item) => item.riskKey === 'high');
  const low = source.filter((item) => item.riskKey === 'low');
  const optimal = source.filter((item) => item.riskKey === 'optimal');

  if (high.length === 0 && low.length === 0) {
    return optimal;
  }

  return [...orderHighMarkersByProfileDiversity(high), ...low, ...optimal];
};
