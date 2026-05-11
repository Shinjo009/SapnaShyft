import React from 'react';
import './HealthScanIndexPage.css';
import HealthScanNavBar from '../../components/HealthScanNavBar';
import CircularProgressCard from '../../components/HomePage/CircularProgressCard';
import { fetchLatestHealthSpanIndex } from '../../services/reportService';
import bgImage from '../../images/BG-2.png';
import waistIcon from '../../images/Waist.svg';
import bodyFatIcon from '../../images/fatguy.svg';
import bloodPressureIcon from '../../images/BP.svg';
import bmrIcon from '../../images/Basal.svg';
import carbsIcon from '../../images/Carbs.svg';
import fatsIcon from '../../images/Fats.svg';
import proteinsIcon from '../../images/Proteins.svg';
import fibreIcon from '../../images/Fibre.svg';
import intakeIcon from '../../images/Intake.svg';
import physicalActivityIcon from '../../images/PhysicalActivity.svg';
import smokeIcon from '../../images/Smoke.svg';
import alcoholIcon from '../../images/Alcohol.svg';
import sleepIcon from '../../images/Sleep.svg';
import familyHistoryIcon from '../../images/FamilyHistory.svg';

/**
 * HealthScanIndexPage - Detail page for Health Span Index with tab navigation
 */
const HealthScanIndexPage = ({ onBack, initialTab = 0 }) => {
  const [activeTab, setActiveTab] = React.useState(initialTab);
  const [healthSpanDetails, setHealthSpanDetails] = React.useState(null);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const result = await fetchLatestHealthSpanIndex({ includeDetails: true, ttlMs: 45000 });
        if (!cancelled) {
          setHealthSpanDetails(result || null);
        }
      } catch {
        if (!cancelled) {
          setHealthSpanDetails(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleTabChange = (index) => {
    setActiveTab(index);
    console.log('Active tab:', index);
  };

  const tabTitles = ['Fitness score', 'Nutrition score', 'Lifestyle score'];
  const scoreByTab = {
    0: healthSpanDetails?.scores?.fitnessScore ?? null,
    1: healthSpanDetails?.scores?.nutritionScore ?? null,
    2: healthSpanDetails?.scores?.lifestyleScore ?? null,
  };

  const detailsRoot = healthSpanDetails?.response?.data && typeof healthSpanDetails.response.data === 'object'
    ? healthSpanDetails.response.data
    : (healthSpanDetails?.response && typeof healthSpanDetails.response === 'object' ? healthSpanDetails.response : {});
  const fitness = detailsRoot?.fitness && typeof detailsRoot.fitness === 'object' ? detailsRoot.fitness : {};
  const nutrition = detailsRoot?.nutrition && typeof detailsRoot.nutrition === 'object' ? detailsRoot.nutrition : {};
  const lifestyle = detailsRoot?.lifestyle && typeof detailsRoot.lifestyle === 'object' ? detailsRoot.lifestyle : {};

  const toText = (value, fallback = '-') => {
    const text = String(value ?? '').trim();
    return text || fallback;
  };

  const toNumberText = (value, unit = '') => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return '-';
    const rounded = Number.isInteger(parsed) ? String(parsed) : String(parsed);
    return unit ? `${rounded} ${unit}` : rounded;
  };

  const toCompactNumberText = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return '';
    if (Number.isInteger(parsed)) return String(parsed);
    return String(parsed);
  };

  const formatBloodPressureText = (bloodPressureValue) => {
    if (bloodPressureValue && typeof bloodPressureValue === 'object') {
      const systolic = toCompactNumberText(
        bloodPressureValue.systolic
        ?? bloodPressureValue.systolic_bp
        ?? bloodPressureValue.sys
      );
      const diastolic = toCompactNumberText(
        bloodPressureValue.diastolic
        ?? bloodPressureValue.diastolic_bp
        ?? bloodPressureValue.dia
      );
      const unit = toText(bloodPressureValue.unit, '').trim() || 'mmHg';
      if (systolic && diastolic) return `${systolic}/${diastolic} ${unit}`;
    }

    const raw = String(bloodPressureValue ?? '').trim();
    if (!raw) return '-';

    const slashParts = raw.split('/');
    if (slashParts.length >= 2) {
      const systolicRaw = slashParts[0].trim();
      const rightSide = slashParts.slice(1).join('/').trim();
      const rightTokens = rightSide.split(/\s+/);
      const diastolicRaw = rightTokens[0] || '';
      const unitRaw = rightTokens.slice(1).join(' ').trim();
      const systolic = toCompactNumberText(systolicRaw) || systolicRaw;
      const diastolic = toCompactNumberText(diastolicRaw) || diastolicRaw;
      const unit = unitRaw || 'mmHg';
      return `${systolic}/${diastolic} ${unit}`.trim();
    }

    const numbers = raw.match(/\d+(?:\.\d+)?/g) || [];
    if (numbers.length >= 2) {
      const systolic = toCompactNumberText(numbers[0]) || numbers[0];
      const diastolic = toCompactNumberText(numbers[1]) || numbers[1];
      return `${systolic}/${diastolic} mmHg`;
    }

    return raw;
  };

  const parseNumbersFromText = (value) => {
    const text = String(value ?? '');
    const matches = text.match(/\d+(?:\.\d+)?/g);
    if (!matches) return [];
    return matches
      .map((token) => Number(token))
      .filter((num) => Number.isFinite(num));
  };

  const getLifestyleValueToneClass = (kind, value) => {
    const text = String(value ?? '').trim().toLowerCase();
    if (!text) return 'health-scan-page__metric-value-tone--neutral';

    if (kind === 'physical_activity') {
      const numbers = parseNumbersFromText(text);
      const minutes = numbers.length > 0 ? numbers[0] : null;
      if (!Number.isFinite(minutes)) return 'health-scan-page__metric-value-tone--neutral';
      if (minutes >= 60) return 'health-scan-page__metric-value-tone--positive';
      if (minutes >= 45) return 'health-scan-page__metric-value-tone--warning';
      return 'health-scan-page__metric-value-tone--critical';
    }

    if (kind === 'smoke' || kind === 'alcohol') {
      if (/(do not|don't|never|no\s+smok|non[\s-]?smok|teetotal|no\s+alcohol)/.test(text)) {
        return 'health-scan-page__metric-value-tone--positive';
      }
      if (/(occasion|social|rare|sometimes)/.test(text)) {
        return 'health-scan-page__metric-value-tone--warning';
      }
      return 'health-scan-page__metric-value-tone--critical';
    }

    if (kind === 'sleep') {
      const numbers = parseNumbersFromText(text);
      const minHours = numbers.length > 0 ? numbers[0] : null;
      if (!Number.isFinite(minHours)) return 'health-scan-page__metric-value-tone--neutral';
      const deficit = 6 - minHours;
      if (deficit <= 0) return 'health-scan-page__metric-value-tone--positive';
      if (deficit <= 1) return 'health-scan-page__metric-value-tone--warning';
      return 'health-scan-page__metric-value-tone--critical';
    }

    return 'health-scan-page__metric-value-tone--neutral';
  };

  const renderValueWithNumberHighlight = (kind, value) => {
    const text = toText(value);
    const toneClass = getLifestyleValueToneClass(kind, value);
    const numberWithUnitMatch = text.match(
      /\d+(?:\.\d+)?(?:\s*(?:-|to)\s*\d+(?:\.\d+)?)?\s*(?:hours?|hrs?|hr|minutes?|mins?|min)?/i
    );

    if (!numberWithUnitMatch || typeof numberWithUnitMatch.index !== 'number') {
      return <span className="health-scan-page__metric-value-text health-scan-page__metric-value-text--plain">{text}</span>;
    }

    const start = numberWithUnitMatch.index;
    const end = start + numberWithUnitMatch[0].length;
    const before = text.slice(0, start);
    const highlighted = text.slice(start, end);
    const after = text.slice(end);

    return (
      <>
        {before ? <span className="health-scan-page__metric-value-text health-scan-page__metric-value-text--plain">{before}</span> : null}
        <span className={`health-scan-page__metric-value-text ${toneClass}`}>{highlighted}</span>
        {after ? <span className="health-scan-page__metric-value-text health-scan-page__metric-value-text--plain">{after}</span> : null}
      </>
    );
  };

  const formatMacroRange = (macro) => {
    if (!macro || typeof macro !== 'object') return '-';
    const low = Number(macro.estimated_low);
    const high = Number(macro.estimated_high);
    if (!Number.isFinite(low) || !Number.isFinite(high)) return '-';
    return `${low}-${high} %`;
  };

  const formatMacroIdeal = (macro) => {
    if (!macro || typeof macro !== 'object') return '-';
    const low = Number(macro.ideal_low);
    const high = Number(macro.ideal_high);
    if (!Number.isFinite(low) || !Number.isFinite(high)) return '-';
    return `${low}-${high}`;
  };

  const buildMetricStatus = ({ direction = 'within', severity = 'within' } = {}) => {
    const classBySeverity = {
      within: 'health-scan-page__metric-value--within',
      yellow: 'health-scan-page__metric-value--below',
      orange: 'health-scan-page__metric-value--high',
      red: 'health-scan-page__metric-value--above',
    };

    return {
      direction,
      severity,
      className: classBySeverity[severity] || classBySeverity.within,
    };
  };

  const getMacroMetricStatus = (macro) => {
    const estimatedLow = Number(macro?.estimated_low);
    const estimatedHigh = Number(macro?.estimated_high);
    const idealLow = Number(macro?.ideal_low);
    const idealHigh = Number(macro?.ideal_high);

    if (![estimatedLow, estimatedHigh, idealLow, idealHigh].every((value) => Number.isFinite(value))) {
      return buildMetricStatus();
    }

    if (estimatedHigh < idealLow) {
      const delta = idealLow - estimatedHigh;
      if (delta >= 10) return buildMetricStatus({ direction: 'down', severity: 'red' });
      if (delta >= 5) return buildMetricStatus({ direction: 'down', severity: 'orange' });
      if (delta >= 2) return buildMetricStatus({ direction: 'down', severity: 'yellow' });
      return buildMetricStatus();
    }

    if (estimatedLow > idealHigh) {
      const delta = estimatedLow - idealHigh;
      if (delta >= 10) return buildMetricStatus({ direction: 'up', severity: 'red' });
      if (delta >= 5) return buildMetricStatus({ direction: 'up', severity: 'orange' });
      if (delta >= 2) return buildMetricStatus({ direction: 'up', severity: 'yellow' });
      return buildMetricStatus();
    }

    return buildMetricStatus();
  };

  const getWaterMetricStatus = (water) => {
    const estimated = Number(water?.estimated_litres);
    const idealLow = Number(water?.ideal_low_litres);
    const idealHigh = Number(water?.ideal_high_litres);

    if (![estimated, idealLow, idealHigh].every((value) => Number.isFinite(value))) {
      return buildMetricStatus();
    }

    if (estimated < idealLow) {
      const delta = idealLow - estimated;
      if (delta >= 1.5) return buildMetricStatus({ direction: 'down', severity: 'red' });
      if (delta >= 1) return buildMetricStatus({ direction: 'down', severity: 'orange' });
      if (delta >= 0.5) return buildMetricStatus({ direction: 'down', severity: 'yellow' });
      return buildMetricStatus();
    }

    if (estimated > idealHigh) {
      const delta = estimated - idealHigh;
      if (delta >= 1.5) return buildMetricStatus({ direction: 'up', severity: 'red' });
      if (delta >= 1) return buildMetricStatus({ direction: 'up', severity: 'orange' });
      if (delta >= 0.5) return buildMetricStatus({ direction: 'up', severity: 'yellow' });
      return buildMetricStatus();
    }

    return buildMetricStatus();
  };

  const formatIdealRangeBand = (band) => {
    if (!band || typeof band !== 'object') return '-';
    const low = Number(band.low);
    const high = Number(band.high);
    const unit = String(band.unit ?? '').trim();
    if (!Number.isFinite(low) || !Number.isFinite(high)) return '-';
    const range = `${toCompactNumberText(low)}-${toCompactNumberText(high)}`;
    return unit ? `${range} ${unit}` : range;
  };

  const getFitnessIdealBandStatus = (value, idealBand) => {
    const v = Number(value);
    const lo = Number(idealBand?.low);
    const hi = Number(idealBand?.high);
    if (!Number.isFinite(v) || !Number.isFinite(lo) || !Number.isFinite(hi)) {
      return buildMetricStatus();
    }
    if (v >= lo && v <= hi) {
      return buildMetricStatus({ severity: 'within' });
    }
    const span = Math.max(hi - lo, 1e-6);
    if (v < lo) {
      const delta = lo - v;
      const ratio = delta / span;
      if (ratio >= 0.35 || delta >= span * 0.5) return buildMetricStatus({ direction: 'down', severity: 'red' });
      if (ratio >= 0.15) return buildMetricStatus({ direction: 'down', severity: 'orange' });
      return buildMetricStatus({ direction: 'down', severity: 'yellow' });
    }
    const delta = v - hi;
    const ratio = delta / span;
    if (ratio >= 0.35 || delta >= span * 0.5) return buildMetricStatus({ direction: 'up', severity: 'red' });
    if (ratio >= 0.15) return buildMetricStatus({ direction: 'up', severity: 'orange' });
    return buildMetricStatus({ direction: 'up', severity: 'yellow' });
  };

  const getFitnessBloodPressureStatus = (fit) => {
    const bp = fit?.blood_pressure;
    let sys;
    let dia;
    if (bp && typeof bp === 'object') {
      sys = Number(bp.systolic ?? bp.systolic_bp ?? bp.sys);
      dia = Number(bp.diastolic ?? bp.diastolic_bp ?? bp.dia);
    } else {
      sys = Number(fit?.systolic_blood_pressure);
      dia = Number(fit?.diastolic_blood_pressure);
    }
    if (!Number.isFinite(sys) || !Number.isFinite(dia)) return buildMetricStatus();
    if (sys <= 120 && dia <= 80) return buildMetricStatus({ severity: 'within' });
    const sysOver = Math.max(0, sys - 120);
    const diaOver = Math.max(0, dia - 80);
    const score = sysOver / 40 + diaOver / 30;
    if (score >= 1.5) return buildMetricStatus({ direction: 'up', severity: 'red' });
    if (score >= 0.6) return buildMetricStatus({ direction: 'up', severity: 'orange' });
    return buildMetricStatus({ direction: 'up', severity: 'yellow' });
  };

  const renderMetricStatusIcon = (status) => {
    if (status.direction === 'up') {
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.66792 5.21802V13.3327H7.33459V5.21802L3.75858 8.79401L2.81592 7.85135L8.00125 2.66602L13.1866 7.85135L12.2439 8.79401L8.66792 5.21802Z" fill="currentColor" />
        </svg>
      );
    }

    if (status.direction === 'down') {
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.33459 10.782V2.66732H8.66792V10.782L12.2439 7.20598L13.1866 8.14865L8.00125 13.334L2.81592 8.14865L3.75858 7.20598L7.33459 10.782Z" fill="currentColor" />
        </svg>
      );
    }

    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  const waterIntakeText = (() => {
    const litres = Number(nutrition?.water?.estimated_litres);
    if (!Number.isFinite(litres)) return '-';
    return `${litres} litres`;
  })();

  const waterIdealText = (() => {
    const low = Number(nutrition?.water?.ideal_low_litres);
    const high = Number(nutrition?.water?.ideal_high_litres);
    if (!Number.isFinite(low) || !Number.isFinite(high)) return '-';
    return `${low}-${high} litres`;
  })();

  const carbsStatus = getMacroMetricStatus(nutrition?.carbs);
  const fatsStatus = getMacroMetricStatus(nutrition?.fats);
  const proteinStatus = getMacroMetricStatus(nutrition?.protein);
  const fibreStatus = getMacroMetricStatus(nutrition?.fibre);
  const waterStatus = getWaterMetricStatus(nutrition?.water);

  const fitnessBloodPressureDisplay = formatBloodPressureText(
    fitness?.blood_pressure
    ?? (
      fitness?.systolic_blood_pressure != null && fitness?.diastolic_blood_pressure != null
        ? `${String(fitness.systolic_blood_pressure).trim()}/${String(fitness.diastolic_blood_pressure).trim()} mmHg`
        : null
    ),
  );

  const bmrIdealRangeDisplay = (() => {
    const hr = String(fitness?.basal_metabolic_rate?.healthy_range ?? '').trim();
    if (hr) return hr;
    return formatIdealRangeBand(fitness?.ideal_bmr);
  })();

  const bodyFatIdealRangeDisplay = (() => {
    const hr = String(fitness?.estimated_body_fat?.healthy_range ?? '').trim();
    if (hr) return hr;
    return formatIdealRangeBand(fitness?.ideal_body_fat);
  })();

  const waistIdealRangeDisplay = (() => {
    const band = fitness?.ideal_waist;
    if (!band || typeof band !== 'object') return '-';
    const low = Number(band.low);
    const high = Number(band.high);
    const unit = String(band.unit ?? '').trim();
    if (!Number.isFinite(low) || !Number.isFinite(high)) return '-';
    const range = `${toCompactNumberText(low)}-${toCompactNumberText(high)}`;
    const normalizedUnit = /^(in|inch|inches)$/i.test(unit) ? '(in)' : unit;
    return normalizedUnit ? `${range} ${normalizedUnit}` : range;
  })();

  const waistDisplayText = (() => {
    const w = Number(fitness?.waist);
    const unit = String(fitness?.ideal_waist?.unit ?? '').trim();
    if (!Number.isFinite(w)) return '-';
    return unit ? `${toCompactNumberText(w)} ${unit}` : toCompactNumberText(w);
  })();

  const fitnessBpStatus = getFitnessBloodPressureStatus(fitness);
  const fitnessBmrStatus = getFitnessIdealBandStatus(
    fitness?.basal_metabolic_rate?.value,
    fitness?.ideal_bmr,
  );
  const fitnessWaistStatus = getFitnessIdealBandStatus(fitness?.waist, fitness?.ideal_waist);
  const fitnessBodyFatStatus = getFitnessIdealBandStatus(
    fitness?.estimated_body_fat?.value,
    fitness?.ideal_body_fat,
  );

  return (
    <div className="health-scan-page">
      {/* Background Image */}
      <div className="health-scan-page__background">
        <img src={bgImage} alt="" className="health-scan-page__bg-image" />
      </div>

      {/* Content */}
      <div className="health-scan-page__content">
        {/* Back Button Header */}
        <div className="health-scan-page__header">
          <button
            className="health-scan-page__back-btn"
            onClick={onBack}
            aria-label="Go back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="health-scan-page__header-title">Health Span Index</h1>
          <div className="health-scan-page__header-spacer"></div>
        </div>

        {/* Tab Content */}
        <div className="health-scan-page__tab-content">
          <div className="health-scan-page__circle-container">
            <div className="health-scan-page__progress-card">
              <CircularProgressCard
                percentage={scoreByTab[activeTab]}
                label={tabTitles[activeTab]}
              />
            </div>
          </div>

          {activeTab === 0 && (
            <div className="health-scan-page__fitness-info">
              <p className="health-scan-page__intro-text">
                This score reflects how your metrics influence long-term risk.
              </p>

              <div className="health-scan-page__legend">
                <div className="health-scan-page__legend-item">
                  <span className="health-scan-page__legend-dot health-scan-page__legend-dot--healthy" />
                  <span className="health-scan-page__legend-text">
                    <span>Optimal Score</span>
                    <span className="health-scan-page__legend-range">(0-25)</span>
                  </span>
                </div>
                <div className="health-scan-page__legend-item">
                  <span className="health-scan-page__legend-dot health-scan-page__legend-dot--increased" />
                  <span className="health-scan-page__legend-text">
                    <span>Stable Score</span>
                    <span className="health-scan-page__legend-range">(26-50)</span>
                  </span>
                </div>
                <div className="health-scan-page__legend-item">
                  <span className="health-scan-page__legend-dot health-scan-page__legend-dot--high" />
                  <span className="health-scan-page__legend-text">
                    <span>Vulnerable Score</span>
                    <span className="health-scan-page__legend-range">(51-75)</span>
                  </span>
                </div>
                <div className="health-scan-page__legend-item">
                  <span className="health-scan-page__legend-dot health-scan-page__legend-dot--very-high" />
                  <span className="health-scan-page__legend-text">
                    <span>Critical Score</span>
                    <span className="health-scan-page__legend-range">(76-100)</span>
                  </span>
                </div>
              </div>

              <div className="health-scan-page__divider" />

              <div className="health-scan-page__metrics-header">
                <h2 className="health-scan-page__metrics-title">Fitness Metrics</h2>
              </div>

              <div className="health-scan-page__metric-card health-scan-page__metric-card--full">
                <div className="health-scan-page__metric-title">
                  <img src={bloodPressureIcon} alt="" aria-hidden="true" />
                  <span>Blood pressure</span>
                </div>
                <div className={`health-scan-page__metric-value ${fitnessBpStatus.className}`}>
                  <span>{fitnessBloodPressureDisplay}</span>
                  <span className="health-scan-page__metric-icon" aria-hidden="true">
                    {renderMetricStatusIcon(fitnessBpStatus)}
                  </span>
                </div>
                <span className="health-scan-page__metric-range-container">
                  <span className="health-scan-page__metric-range-label">Ideal range</span>
                  <span className="health-scan-page__metric-range-value">&lt;=120/80</span>
                </span>
              </div>

              <div className="health-scan-page__metric-card health-scan-page__metric-card--full">
                <div className="health-scan-page__metric-title">
                  <img src={bmrIcon} alt="" aria-hidden="true" />
                  <span>Basal Metabolic Rate</span>
                </div>
                <div className={`health-scan-page__metric-value ${fitnessBmrStatus.className}`}>
                  <span>{toNumberText(fitness?.basal_metabolic_rate?.value, fitness?.basal_metabolic_rate?.unit)}</span>
                  <span className="health-scan-page__metric-icon" aria-hidden="true">
                    {renderMetricStatusIcon(fitnessBmrStatus)}
                  </span>
                </div>
                <span className="health-scan-page__metric-range-container">
                  <span className="health-scan-page__metric-range-label">Ideal range</span>
                  <span className="health-scan-page__metric-range-value">{toText(bmrIdealRangeDisplay, '-')}</span>
                </span>
              </div>

              <div className="health-scan-page__metrics-grid">
                <div className="health-scan-page__metric-card">
                  <div className="health-scan-page__metric-title">
                    <img src={waistIcon} alt="" aria-hidden="true" />
                    <span>Waist</span>
                  </div>
                  <div className={`health-scan-page__metric-value ${fitnessWaistStatus.className}`}>
                    <span>{waistDisplayText}</span>
                    <span className="health-scan-page__metric-icon" aria-hidden="true">
                      {renderMetricStatusIcon(fitnessWaistStatus)}
                    </span>
                  </div>
                  <span className="health-scan-page__metric-range-container">
                    <span className="health-scan-page__metric-range-label">Ideal</span>
                    <span className="health-scan-page__metric-range-value">{toText(waistIdealRangeDisplay, '-')}</span>
                  </span>
                </div>

                <div className="health-scan-page__metric-card">
                  <div className="health-scan-page__metric-title">
                    <img src={bodyFatIcon} alt="" aria-hidden="true" />
                    <span>Body fat</span>
                  </div>
                  <div className={`health-scan-page__metric-value ${fitnessBodyFatStatus.className}`}>
                    <span>{toNumberText(fitness?.estimated_body_fat?.value, fitness?.estimated_body_fat?.unit)}</span>
                    <span className="health-scan-page__metric-icon" aria-hidden="true">
                      {renderMetricStatusIcon(fitnessBodyFatStatus)}
                    </span>
                  </div>
                  <span className="health-scan-page__metric-range-container">
                    <span className="health-scan-page__metric-range-label">Ideal</span>
                    <span className="health-scan-page__metric-range-value">{toText(bodyFatIdealRangeDisplay, '-')}</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="health-scan-page__fitness-info">
              <p className="health-scan-page__intro-text">
                This score reflects how your nutrition influences long-term risk.
              </p>

              <div className="health-scan-page__legend">
                <div className="health-scan-page__legend-item">
                  <span className="health-scan-page__legend-dot health-scan-page__legend-dot--healthy" />
                  <span className="health-scan-page__legend-text">
                    <span>Optimal Score</span>
                    <span className="health-scan-page__legend-range">(0-25)</span>
                  </span>
                </div>
                <div className="health-scan-page__legend-item">
                  <span className="health-scan-page__legend-dot health-scan-page__legend-dot--increased" />
                  <span className="health-scan-page__legend-text">
                    <span>Stable Score</span>
                    <span className="health-scan-page__legend-range">(26-50)</span>
                  </span>
                </div>
                <div className="health-scan-page__legend-item">
                  <span className="health-scan-page__legend-dot health-scan-page__legend-dot--high" />
                  <span className="health-scan-page__legend-text">
                    <span>Vulnerable Score</span>
                    <span className="health-scan-page__legend-range">(51-75)</span>
                  </span>
                </div>
                <div className="health-scan-page__legend-item">
                  <span className="health-scan-page__legend-dot health-scan-page__legend-dot--very-high" />
                  <span className="health-scan-page__legend-text">
                    <span>Critical Score</span>
                    <span className="health-scan-page__legend-range">(76-100)</span>
                  </span>
                </div>
              </div>

              <div className="health-scan-page__divider" />

              <div className="health-scan-page__metrics-header">
                <h2 className="health-scan-page__metrics-title">Macro nutrients</h2>
              </div>

              <div className="health-scan-page__metrics-grid">
                <div className="health-scan-page__metric-card">
                  <div className="health-scan-page__metric-title">
                    <img src={carbsIcon} alt="" aria-hidden="true" />
                    <span>Carbs</span>
                  </div>
                  <div className={`health-scan-page__metric-value ${carbsStatus.className}`}>
                    <span>{formatMacroRange(nutrition?.carbs)}</span>
                    <span className="health-scan-page__metric-icon" aria-hidden="true">
                      {renderMetricStatusIcon(carbsStatus)}
                    </span>
                  </div>
                  <span className="health-scan-page__metric-range-container">
                    <span className="health-scan-page__metric-range-label">Ideal range</span>
                    <span className="health-scan-page__metric-range-value">{formatMacroIdeal(nutrition?.carbs)}</span>
                  </span>
                </div>

                <div className="health-scan-page__metric-card">
                  <div className="health-scan-page__metric-title">
                    <img src={fatsIcon} alt="" aria-hidden="true" />
                    <span>Fats</span>
                  </div>
                  <div className={`health-scan-page__metric-value ${fatsStatus.className}`}>
                    <span>{formatMacroRange(nutrition?.fats)}</span>
                    <span className="health-scan-page__metric-icon" aria-hidden="true">
                      {renderMetricStatusIcon(fatsStatus)}
                    </span>
                  </div>
                  <span className="health-scan-page__metric-range-container">
                    <span className="health-scan-page__metric-range-label">Ideal range</span>
                    <span className="health-scan-page__metric-range-value">{formatMacroIdeal(nutrition?.fats)}</span>
                  </span>
                </div>
              </div>

              <div className="health-scan-page__metrics-grid">
                <div className="health-scan-page__metric-card">
                  <div className="health-scan-page__metric-title">
                    <img src={proteinsIcon} alt="" aria-hidden="true" />
                    <span>Proteins</span>
                  </div>
                  <div className={`health-scan-page__metric-value ${proteinStatus.className}`}>
                    <span>{formatMacroRange(nutrition?.protein)}</span>
                    <span className="health-scan-page__metric-icon" aria-hidden="true">
                      {renderMetricStatusIcon(proteinStatus)}
                    </span>
                  </div>
                  <span className="health-scan-page__metric-range-container">
                    <span className="health-scan-page__metric-range-label">Ideal range</span>
                    <span className="health-scan-page__metric-range-value">{formatMacroIdeal(nutrition?.protein)}</span>
                  </span>
                </div>

                <div className="health-scan-page__metric-card">
                  <div className="health-scan-page__metric-title">
                    <img src={fibreIcon} alt="" aria-hidden="true" />
                    <span>Fibre</span>
                  </div>
                  <div className={`health-scan-page__metric-value ${fibreStatus.className}`}>
                    <span>{formatMacroRange(nutrition?.fibre)}</span>
                    <span className="health-scan-page__metric-icon" aria-hidden="true">
                      {renderMetricStatusIcon(fibreStatus)}
                    </span>
                  </div>
                  <span className="health-scan-page__metric-range-container">
                    <span className="health-scan-page__metric-range-label">Ideal range</span>
                    <span className="health-scan-page__metric-range-value">{formatMacroIdeal(nutrition?.fibre)}</span>
                  </span>
                </div>
              </div>

              <div className="health-scan-page__metric-card health-scan-page__metric-card--full">
                <div className="health-scan-page__metric-title">
                  <img src={intakeIcon} alt="" aria-hidden="true" />
                  <span>Water Intake</span>
                </div>
                <div className={`health-scan-page__metric-value ${waterStatus.className}`}>
                  <span>{waterIntakeText}</span>
                  <span className="health-scan-page__metric-icon" aria-hidden="true">
                    {renderMetricStatusIcon(waterStatus)}
                  </span>
                </div>
                <span className="health-scan-page__metric-range-container">
                  <span className="health-scan-page__metric-range-label">Ideal range</span>
                  <span className="health-scan-page__metric-range-value">{waterIdealText}</span>
                </span>
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div className="health-scan-page__fitness-info">
              <p className="health-scan-page__intro-text">
                This score reflects how your lifestyle influences long-term risk.
              </p>

              <div className="health-scan-page__legend">
                <div className="health-scan-page__legend-item">
                  <span className="health-scan-page__legend-dot health-scan-page__legend-dot--healthy" />
                  <span className="health-scan-page__legend-text">
                    <span>Optimal Score</span>
                    <span className="health-scan-page__legend-range">(0-25)</span>
                  </span>
                </div>
                <div className="health-scan-page__legend-item">
                  <span className="health-scan-page__legend-dot health-scan-page__legend-dot--increased" />
                  <span className="health-scan-page__legend-text">
                    <span>Stable Score</span>
                    <span className="health-scan-page__legend-range">(26-50)</span>
                  </span>
                </div>
                <div className="health-scan-page__legend-item">
                  <span className="health-scan-page__legend-dot health-scan-page__legend-dot--high" />
                  <span className="health-scan-page__legend-text">
                    <span>Vulnerable Score</span>
                    <span className="health-scan-page__legend-range">(51-75)</span>
                  </span>
                </div>
                <div className="health-scan-page__legend-item">
                  <span className="health-scan-page__legend-dot health-scan-page__legend-dot--very-high" />
                  <span className="health-scan-page__legend-text">
                    <span>Critical Score</span>
                    <span className="health-scan-page__legend-range">(76-100)</span>
                  </span>
                </div>
              </div>

              <div className="health-scan-page__divider" />

              <div className="health-scan-page__metrics-header">
                <h2 className="health-scan-page__metrics-title">Lifestyle Parameters</h2>
              </div>

              <div className="health-scan-page__metric-card health-scan-page__metric-card--full health-scan-page__metric-card--physical-activity health-scan-page__metric-card--lifestyle">
                <div className="health-scan-page__metric-title">
                  <img src={physicalActivityIcon} alt="" aria-hidden="true" />
                  <span>Physical Activity</span>
                </div>
                <div className="health-scan-page__metric-value health-scan-page__metric-value--mixed">
                  {renderValueWithNumberHighlight('physical_activity', lifestyle?.physical_activity)}
                </div>
              </div>

              <div className="health-scan-page__metrics-grid">
                <div className="health-scan-page__metric-card health-scan-page__metric-card--lifestyle">
                  <div className="health-scan-page__metric-title">
                    <img src={smokeIcon} alt="" aria-hidden="true" />
                    <span>Smoke</span>
                  </div>
                  <div className="health-scan-page__metric-value health-scan-page__metric-value--mixed">
                    <span className={`health-scan-page__metric-value-text ${getLifestyleValueToneClass('smoke', lifestyle?.smoke)}`}>
                      {toText(lifestyle?.smoke)}
                    </span>
                  </div>
                </div>

                <div className="health-scan-page__metric-card health-scan-page__metric-card--lifestyle">
                  <div className="health-scan-page__metric-title">
                    <img src={alcoholIcon} alt="" aria-hidden="true" />
                    <span>Alcohol</span>
                  </div>
                  <div className="health-scan-page__metric-value health-scan-page__metric-value--within">
                    <span className={`health-scan-page__metric-value-text ${getLifestyleValueToneClass('alcohol', lifestyle?.alcohol)}`}>
                      {toText(lifestyle?.alcohol)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="health-scan-page__metrics-grid">
                <div className="health-scan-page__metric-card health-scan-page__metric-card--lifestyle">
                  <div className="health-scan-page__metric-title">
                    <img src={sleepIcon} alt="" aria-hidden="true" />
                    <span>Sleep</span>
                  </div>
                  <div className="health-scan-page__metric-value health-scan-page__metric-value--mixed">
                    {renderValueWithNumberHighlight('sleep', lifestyle?.sleep)}
                  </div>
                  <span className="health-scan-page__metric-range-container health-scan-page__metric-range-container--sleep">
                    <span className="health-scan-page__metric-range-label">Ideal</span>
                    <span className="health-scan-page__metric-range-value">6-8 hours</span>
                  </span>
                </div>

                <div className="health-scan-page__metric-card health-scan-page__metric-card--lifestyle">
                  <div className="health-scan-page__metric-title">
                    <img src={familyHistoryIcon} alt="" aria-hidden="true" />
                    <span>Family History</span>
                  </div>
                  <div className="health-scan-page__family-history">
                    <span>{toText(lifestyle?.family_history)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Navbar - Bottom */}
        <div className="health-scan-page__navbar">
          <HealthScanNavBar
            defaultActive={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      </div>
    </div>
  );
};

export default HealthScanIndexPage;
