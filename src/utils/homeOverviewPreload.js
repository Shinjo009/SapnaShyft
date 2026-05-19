/** Marker on `preloadedHomeData` when App finished `preloadHomeScreenData` (success or empty). */
export const HOME_PRELOAD_COMPLETE_KEY = '__preloadComplete';

export function hasRenderableOverviewData(data) {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const metabolicAge = Number(data?.metabolicAgeValue);
  const hasMetabolic = Number.isFinite(metabolicAge);
  const hasPositiveWins = Boolean(data?.positiveWinsData && typeof data.positiveWinsData === 'object');
  const hasRiskAnalysis = Array.isArray(data?.riskAnalysisData) && data.riskAnalysisData.length > 0;

  return hasMetabolic || hasPositiveWins || hasRiskAnalysis;
}

export function createEmptyPreloadedHome() {
  return {
    [HOME_PRELOAD_COMPLETE_KEY]: true,
    metabolicAgeValue: '-',
    positiveWinsData: null,
    riskAnalysisData: [],
    healthSpanScores: null,
  };
}
