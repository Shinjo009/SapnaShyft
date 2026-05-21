/** Marker on `preloadedHomeData` when App finished `preloadHomeScreenData` (success or empty). */
export const HOME_PRELOAD_COMPLETE_KEY = '__preloadComplete';

export function hasRenderableOverviewApiPayload(overview) {
  if (!overview || typeof overview !== 'object') {
    return false;
  }

  const metabolicAge = Number(overview?.metabolic_age);
  const hasMetabolic = Number.isFinite(metabolicAge);
  const positiveWins = overview?.positive_wins;
  const hasPositiveWins = Boolean(positiveWins && typeof positiveWins === 'object');
  const hasRiskAnalysis = Array.isArray(overview?.risk_analysis) && overview.risk_analysis.length > 0;
  const hasTopLevelPositiveWinsFields = Object.prototype.hasOwnProperty.call(overview, 'healthy_habits')
    || Object.prototype.hasOwnProperty.call(overview, 'healthy_profiles')
    || Object.prototype.hasOwnProperty.call(overview, 'low_risk');

  return hasMetabolic || hasPositiveWins || hasTopLevelPositiveWinsFields || hasRiskAnalysis;
}

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
    anchorAssessmentId: null,
    anchorEngagementId: null,
  };
}
