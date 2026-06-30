import React, { useEffect, useMemo, useRef, useState } from 'react';
import './TrendsChart.css';
import { fetchReportTrends } from '../../services/reportService';
import {
  TRENDS_BAND_BACKGROUNDS,
  TRENDS_BAND_HEIGHT,
  TRENDS_CHART_HEIGHT,
  TRENDS_Y_AXIS_LABELS,
  buildSmoothTrendPath,
  buildTrendSummaryText,
  clampBloodValueForTrends,
  formatTrendDateLabel,
  getDiseaseMarkerPercent,
  getDotColorForMarkerPercent,
  getMarkerPercentForValue,
  markerPercentToChartY,
  normalizeTrendsPayload,
} from '../../utils/trendsChartUtils';

const getChartHorizontalInset = (plotWidth) => Math.max(14, Math.round(plotWidth * 0.1));

const TrendsChartPlot = ({
  points,
  variant,
  normalMin,
  normalMax,
}) => {
  const plotRef = useRef(null);
  const gradientId = React.useId().replace(/:/g, '');
  const [plotWidth, setPlotWidth] = useState(0);

  useEffect(() => {
    const element = plotRef.current;
    if (!element) {
      return undefined;
    }

    const updateWidth = () => {
      setPlotWidth(element.clientWidth);
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const chartPoints = useMemo(() => {
    if (!Array.isArray(points) || points.length === 0 || plotWidth <= 0) {
      return [];
    }

    const horizontalInset = getChartHorizontalInset(plotWidth);
    const usableWidth = Math.max(plotWidth - horizontalInset * 2, 1);
    const xStep = points.length === 1 ? 0 : usableWidth / (points.length - 1);

    return points.map((point, index) => {
      const markerPercent = variant === 'disease'
        ? getDiseaseMarkerPercent(point.value)
        : getMarkerPercentForValue(
          clampBloodValueForTrends(point.value, normalMin, normalMax),
          normalMin,
          normalMax,
        );

      const x = points.length === 1
        ? plotWidth / 2
        : horizontalInset + (xStep * index);

      return {
        ...point,
        x,
        y: markerPercentToChartY(markerPercent, TRENDS_CHART_HEIGHT),
        markerPercent,
        color: getDotColorForMarkerPercent(markerPercent),
      };
    });
  }, [normalMax, normalMin, plotWidth, points, variant]);

  const trendPath = useMemo(() => buildSmoothTrendPath(chartPoints), [chartPoints]);

  const datePositions = useMemo(() => {
    if (!chartPoints.length || plotWidth <= 0) {
      return [];
    }

    return chartPoints.map((point) => ({
      date: point.date,
      label: formatTrendDateLabel(point.date),
      leftPercent: (point.x / plotWidth) * 100,
    }));
  }, [chartPoints, plotWidth]);

  if (!points.length) {
    return (
      <div className="trends-chart-section__plot-wrap">
        <p className="trends-chart-section__status">No trend data available yet.</p>
      </div>
    );
  }

  return (
    <div className="trends-chart-section__plot-wrap">
      <div className="trends-chart-section__plot" ref={plotRef} style={{ height: `${TRENDS_CHART_HEIGHT}px` }}>
        {plotWidth > 0 ? (
          <svg
            className="trends-chart-section__svg"
            style={{ height: `${TRENDS_CHART_HEIGHT}px` }}
            viewBox={`0 0 ${plotWidth} ${TRENDS_CHART_HEIGHT}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {TRENDS_BAND_BACKGROUNDS.map((fill, index) => (
              <rect
                key={`band-${index}`}
                x="0"
                y={index * TRENDS_BAND_HEIGHT}
                width={plotWidth}
                height={TRENDS_BAND_HEIGHT}
                fill={fill}
              />
            ))}

            {Array.from({ length: TRENDS_BAND_BACKGROUNDS.length + 1 }, (_, index) => (
              <line
                key={`h-grid-${index}`}
                x1="0"
                y1={index * TRENDS_BAND_HEIGHT}
                x2={plotWidth}
                y2={index * TRENDS_BAND_HEIGHT}
                stroke="rgba(241, 241, 241, 0.30)"
                strokeWidth="0.657"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {chartPoints.map((point) => (
              <line
                key={`v-grid-${point.date}`}
                x1={point.x}
                y1="0"
                x2={point.x}
                y2={TRENDS_CHART_HEIGHT}
                stroke="rgba(196, 196, 196, 0.30)"
                strokeWidth="0.657"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {chartPoints.length > 1 ? (
              <defs>
                <linearGradient
                  id={gradientId}
                  gradientUnits="userSpaceOnUse"
                  x1={chartPoints[0].x}
                  y1={chartPoints[0].y}
                  x2={chartPoints[chartPoints.length - 1].x}
                  y2={chartPoints[chartPoints.length - 1].y}
                >
                  {chartPoints.map((point, index) => (
                    <stop
                      key={`stop-${point.date}`}
                      offset={`${(index / Math.max(chartPoints.length - 1, 1)) * 100}%`}
                      stopColor={point.color}
                    />
                  ))}
                </linearGradient>
              </defs>
            ) : null}

            {trendPath ? (
              <path
                d={trendPath}
                fill="none"
                stroke={chartPoints.length > 1 ? `url(#${gradientId})` : chartPoints[0]?.color || '#DAC15A'}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}

            {chartPoints.map((point) => (
              <circle
                key={`dot-${point.date}`}
                cx={point.x}
                cy={point.y}
                r="4"
                fill={point.color}
              />
            ))}
          </svg>
        ) : null}
      </div>

      {datePositions.length > 0 ? (
        <div className="trends-chart-section__dates" aria-hidden="true">
          {datePositions.map((item) => (
              <span
                key={item.date}
                className="trends-chart-section__date"
                style={{
                  position: 'absolute',
                  left: `${item.leftPercent}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                {item.label}
              </span>
            ))}
        </div>
      ) : null}
    </div>
  );
};

const TrendsChart = ({
  variant = 'blood',
  bloodParameter = null,
  diseaseCode = null,
  normalMin = null,
  normalMax = null,
  className = '',
  subtitle = 'We recommend testing every 16 weeks',
}) => {
  const [points, setPoints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const hasBloodRange = Number.isFinite(Number(normalMin)) && Number.isFinite(Number(normalMax));

  useEffect(() => {
    let isActive = true;
    const queryKey = variant === 'disease' ? diseaseCode : bloodParameter;

    const loadTrends = async () => {
      if (!queryKey || (variant === 'blood' && !hasBloodRange)) {
        if (isActive) {
          setPoints([]);
          setIsLoading(false);
          setLoadError(false);
        }
        return;
      }

      if (isActive) {
        setIsLoading(true);
        setLoadError(false);
      }

      try {
        const response = await fetchReportTrends(
          variant === 'disease'
            ? { disease: queryKey }
            : { bloodParameter: queryKey },
        );

        if (!isActive) {
          return;
        }

        const normalized = normalizeTrendsPayload(response, variant);
        setPoints(normalized.points);
        setLoadError(false);
      } catch {
        if (isActive) {
          setPoints([]);
          setLoadError(true);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadTrends();

    return () => {
      isActive = false;
    };
  }, [bloodParameter, diseaseCode, hasBloodRange, normalMax, normalMin, variant]);

  const summaryText = useMemo(() => {
    if (variant === 'blood' && !hasBloodRange) {
      return null;
    }

    return buildTrendSummaryText({
      points,
      variant,
      normalMin: Number(normalMin),
      normalMax: Number(normalMax),
    });
  }, [hasBloodRange, normalMax, normalMin, points, variant]);

  const queryKey = variant === 'disease' ? diseaseCode : bloodParameter;
  const canFetchTrends = Boolean(queryKey) && (variant !== 'blood' || hasBloodRange);
  const hasTrendData = !isLoading && !loadError && points.length > 0;

  if (!canFetchTrends || !hasTrendData) {
    return null;
  }

  const sectionClassName = [
    'trends-chart-section',
    variant === 'disease' ? 'trends-chart-section--disease' : 'trends-chart-section--blood',
    className,
  ].filter(Boolean).join(' ');

  return (
    <section className={sectionClassName} aria-label="Trends">
      <h2 className="trends-chart-section__title">Trends</h2>
      <p className="trends-chart-section__subtitle">{subtitle}</p>

      <div className="trends-chart-section__shell">
        <div className="trends-chart-section__body">
          <div
            className="trends-chart-section__y-labels"
            style={{ height: `${TRENDS_CHART_HEIGHT}px` }}
            aria-hidden="true"
          >
            {TRENDS_Y_AXIS_LABELS.map(({ label, centerY }, index) => (
              <span
                key={`${label}-${index}`}
                className="trends-chart-section__y-label"
                style={{ top: `${centerY}px` }}
              >
                {label}
              </span>
            ))}
          </div>

          <TrendsChartPlot
            points={points}
            variant={variant}
            normalMin={Number(normalMin)}
            normalMax={Number(normalMax)}
          />
        </div>
      </div>

      {summaryText ? (
        <p className="trends-chart-section__summary">{summaryText}</p>
      ) : null}
    </section>
  );
};

export default TrendsChart;
