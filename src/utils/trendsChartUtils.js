const BAND_COUNT = 7;
export const TRENDS_BAND_HEIGHT = 16;
export const TRENDS_CHART_HEIGHT = BAND_COUNT * TRENDS_BAND_HEIGHT;

export const getTrendsBandCenterY = (bandIndex) => (
  (bandIndex * TRENDS_BAND_HEIGHT) + (TRENDS_BAND_HEIGHT / 2)
);

export const getTrendsZoneCenterY = (startBandIndex, endBandIndex) => {
  const startY = startBandIndex * TRENDS_BAND_HEIGHT;
  const endY = (endBandIndex + 1) * TRENDS_BAND_HEIGHT;
  return (startY + endY) / 2;
};

/** Y-axis labels aligned to risk zone centers (Normal spans paired bands). */
export const TRENDS_Y_AXIS_LABELS = [
  { label: 'High', centerY: getTrendsBandCenterY(0) },
  { label: 'Normal', centerY: getTrendsZoneCenterY(1, 2) },
  { label: 'Low', centerY: getTrendsBandCenterY(3) },
  { label: 'Normal', centerY: getTrendsZoneCenterY(4, 5) },
  { label: 'High', centerY: getTrendsBandCenterY(6) },
];

export const TRENDS_BAND_BACKGROUNDS = [
  'rgba(204, 32, 59, 0.20)',
  'rgba(238, 139, 72, 0.20)',
  'rgba(218, 193, 90, 0.20)',
  'rgba(144, 223, 158, 0.20)',
  'rgba(218, 193, 90, 0.20)',
  'rgba(238, 139, 72, 0.20)',
  'rgba(204, 32, 59, 0.20)',
];

export const TRENDS_BAND_DOT_COLORS = [
  '#CC203B',
  '#EE8B48',
  '#DAC15A',
  '#90DF9E',
  '#DAC15A',
  '#EE8B48',
  '#CC203B',
];

const DETAIL_HIGH_RISK_DISPLAY_PADDING = 30;

export const getMarkerPercentForValue = (value, normalMin, normalMax) => {
  if (value >= normalMin && value <= normalMax) {
    const normalSpan = Math.max(1e-6, normalMax - normalMin);
    const ratio = (value - normalMin) / normalSpan;
    return 40 + (ratio * 20);
  }

  if (value < normalMin) {
    const deviation = normalMin - value;
    const deviationPercent = (deviation / Math.max(Math.abs(normalMin), 1e-6)) * 100;

    if (deviationPercent <= 15) {
      const ratio = deviationPercent / 15;
      return 40 - (ratio * 20);
    }

    const ratio = Math.min((deviationPercent - 15) / 35, 1);
    return 20 - (ratio * 20);
  }

  const deviation = value - normalMax;
  const deviationPercent = (deviation / Math.max(Math.abs(normalMax), 1e-6)) * 100;

  if (deviationPercent <= 15) {
    const ratio = deviationPercent / 15;
    return 60 + (ratio * 20);
  }

  const ratio = Math.min((deviationPercent - 15) / 35, 1);
  return 80 + (ratio * 20);
};

export const getDiseaseMarkerPercent = (score) => {
  const clamped = Math.max(0, Math.min(100, Number(score) || 0));
  return 50 + (clamped / 100) * 50;
};

export const getBandIndexForMarkerPercent = (markerPercent) => {
  const clamped = Math.max(0, Math.min(100, markerPercent));
  const inverted = 100 - clamped;
  const index = Math.floor((inverted / 100) * BAND_COUNT);
  return Math.max(0, Math.min(BAND_COUNT - 1, index));
};

export const getDotColorForMarkerPercent = (markerPercent) => {
  const bandIndex = getBandIndexForMarkerPercent(markerPercent);
  return TRENDS_BAND_DOT_COLORS[bandIndex];
};

export const markerPercentToChartY = (markerPercent, chartHeight = TRENDS_CHART_HEIGHT) => {
  const clamped = Math.max(0, Math.min(100, markerPercent));
  return ((100 - clamped) / 100) * chartHeight;
};

export const clampBloodValueForTrends = (value, normalMin, normalMax) => {
  const minScale = normalMin - DETAIL_HIGH_RISK_DISPLAY_PADDING;
  const maxScale = normalMax + DETAIL_HIGH_RISK_DISPLAY_PADDING;
  return Math.max(minScale, Math.min(maxScale, value));
};

export const formatTrendDateLabel = (isoDate) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return String(isoDate || '');
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-GB', { month: 'short' });
  const year = String(date.getFullYear()).slice(-2);
  return `${day} ${month} '${year}`;
};

/** Compact card timeline label, e.g. Sep'24 */
export const formatBloodMarkerHistoryDate = (isoDate) => {
  const raw = String(isoDate || '').trim();
  if (!raw) {
    return '';
  }

  const date = new Date(raw);
  if (!Number.isNaN(date.getTime())) {
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = String(date.getFullYear()).slice(-2);
    return `${month}'${year}`;
  }

  // Already-compact labels from backend (Sep'24 / Sep 24).
  const compact = raw.match(/^([A-Za-z]{3})[^\d]*'?(\d{2})$/);
  if (compact) {
    return `${compact[1]}'${compact[2]}`;
  }

  return raw;
};

/**
 * Build up to 3 timeline points for blood-marker stack cards.
 * Prefers embedded history; otherwise uses trends points.
 */
export const buildBloodMarkerHistoryTimeline = ({
  historyPoints = [],
  currentValue = null,
  currentDate = '',
  maxPoints = 3,
} = {}) => {
  const merged = [];

  (Array.isArray(historyPoints) ? historyPoints : []).forEach((point) => {
    const value = Number(point?.value);
    if (!Number.isFinite(value)) {
      return;
    }
    merged.push({
      date: String(point?.date || '').trim(),
      value,
    });
  });

  const current = Number(currentValue);
  if (Number.isFinite(current)) {
    const currentKey = String(currentDate || '').trim();
    const last = merged[merged.length - 1];
    const sameAsLast = last
      && last.value === current
      && (!currentKey || !last.date || last.date === currentKey);
    if (!sameAsLast) {
      merged.push({ date: currentKey, value: current });
    } else if (currentKey && !last.date) {
      last.date = currentKey;
    }
  }

  const dated = merged
    .map((point, index) => ({ ...point, index }))
    .sort((a, b) => {
      const aTime = a.date ? new Date(a.date).getTime() : NaN;
      const bTime = b.date ? new Date(b.date).getTime() : NaN;
      if (Number.isFinite(aTime) && Number.isFinite(bTime)) {
        return aTime - bTime;
      }
      return a.index - b.index;
    });

  if (dated.length < 2) {
    return [];
  }

  return dated.slice(-Math.max(2, maxPoints)).map(({ date, value }) => ({ date, value }));
};

export const normalizeTrendsPayload = (payload, variant = 'blood') => {
  const root = payload?.data && typeof payload.data === 'object'
    ? payload.data
    : payload;

  const rawPoints = Array.isArray(root?.data_points) ? root.data_points : [];

  const points = rawPoints
    .map((point) => {
      const value = variant === 'disease'
        ? Number(point?.risk_score_scaled)
        : Number(point?.value);

      return {
        date: String(point?.date || '').trim(),
        value,
        engagementId: point?.engagement_id ?? null,
      };
    })
    .filter((point) => point.date && Number.isFinite(point.value))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    parameter: String(root?.parameter || '').trim(),
    unit: String(root?.unit || '').trim(),
    points,
  };
};

const deviationFromNormalCenter = (value, normalMin, normalMax) => {
  const center = (normalMin + normalMax) / 2;
  const halfSpan = Math.max((normalMax - normalMin) / 2, 1e-6);
  return Math.abs(value - center) / halfSpan;
};

export const buildTrendSummaryText = ({
  points,
  variant = 'blood',
  normalMin,
  normalMax,
}) => {
  if (!Array.isArray(points) || points.length < 2) {
    return null;
  }

  const latest = points[points.length - 1];
  const previous = points[points.length - 2];

  if (variant === 'disease') {
    const diff = latest.value - previous.value;
    if (diff === 0) {
      return 'No change from last result';
    }

    const pct = previous.value !== 0
      ? Math.round(Math.abs((diff / previous.value) * 100))
      : Math.round(Math.abs(diff));

    return diff > 0
      ? `${pct} % Worse than last result`
      : `${pct} % Better than last result`;
  }

  const latestDeviation = deviationFromNormalCenter(latest.value, normalMin, normalMax);
  const previousDeviation = deviationFromNormalCenter(previous.value, normalMin, normalMax);

  if (latestDeviation === previousDeviation) {
    return 'No change from last result';
  }

  const pct = previousDeviation !== 0
    ? Math.round(Math.abs(((latestDeviation - previousDeviation) / previousDeviation) * 100))
    : Math.round(Math.abs(latestDeviation - previousDeviation) * 100);

  return latestDeviation > previousDeviation
    ? `${pct} % Worse than last result`
    : `${pct} % Better than last result`;
};

export const buildSmoothTrendPath = (plotPoints) => {
  if (!Array.isArray(plotPoints) || plotPoints.length < 2) {
    return '';
  }

  if (plotPoints.length === 2) {
    return `M ${plotPoints[0].x} ${plotPoints[0].y} L ${plotPoints[1].x} ${plotPoints[1].y}`;
  }

  const path = [`M ${plotPoints[0].x} ${plotPoints[0].y}`];

  for (let index = 0; index < plotPoints.length - 1; index += 1) {
    const p0 = plotPoints[index - 1] || plotPoints[index];
    const p1 = plotPoints[index];
    const p2 = plotPoints[index + 1];
    const p3 = plotPoints[index + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
  }

  return path.join(' ');
};

export const toBloodParameterKey = (marker = {}) => {
  const explicit = String(marker.parameter_key || marker.parameterKey || '').trim();
  if (explicit) {
    return explicit.toLowerCase();
  }

  return String(marker.title || marker.marker || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};
