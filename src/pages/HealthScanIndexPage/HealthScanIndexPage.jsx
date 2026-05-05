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

  const formattedDate = React.useMemo(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  }, []);

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
                    <span>Healthy</span>
                    <span className="health-scan-page__legend-range">(0-25)</span>
                  </span>
                </div>
                <div className="health-scan-page__legend-item">
                  <span className="health-scan-page__legend-dot health-scan-page__legend-dot--increased" />
                  <span className="health-scan-page__legend-text">
                    <span>Increased Risk</span>
                    <span className="health-scan-page__legend-range">(26-50)</span>
                  </span>
                </div>
                <div className="health-scan-page__legend-item">
                  <span className="health-scan-page__legend-dot health-scan-page__legend-dot--high" />
                  <span className="health-scan-page__legend-text">
                    <span>High Risk</span>
                    <span className="health-scan-page__legend-range">(51-75)</span>
                  </span>
                </div>
                <div className="health-scan-page__legend-item">
                  <span className="health-scan-page__legend-dot health-scan-page__legend-dot--very-high" />
                  <span className="health-scan-page__legend-text">
                    <span>Very High Risk</span>
                    <span className="health-scan-page__legend-range">(76-100)</span>
                  </span>
                </div>
              </div>

              <div className="health-scan-page__divider" />

              <div className="health-scan-page__metrics-header">
                <h2 className="health-scan-page__metrics-title">Fitness Metrics</h2>
                <span className="health-scan-page__metrics-date">As on {formattedDate}</span>
              </div>

              <div className="health-scan-page__metric-card health-scan-page__metric-card--full">
                <div className="health-scan-page__metric-title">
                  <img src={bloodPressureIcon} alt="" aria-hidden="true" />
                  <span>Blood pressure</span>
                </div>
                <div className="health-scan-page__metric-value health-scan-page__metric-value--within">
                  <span>{toText(fitness?.blood_pressure)}</span>
                  <span className="health-scan-page__metric-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
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
                <div className="health-scan-page__metric-value health-scan-page__metric-value--below">
                  <span>{toNumberText(fitness?.basal_metabolic_rate?.value, fitness?.basal_metabolic_rate?.unit)}</span>
                  <span className="health-scan-page__metric-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.66792 5.21802V13.3327H7.33459V5.21802L3.75858 8.79401L2.81592 7.85135L8.00125 2.66602L13.1866 7.85135L12.2439 8.79401L8.66792 5.21802Z" fill="currentColor" />
                    </svg>
                  </span>
                </div>
                <span className="health-scan-page__metric-range-container">
                  <span className="health-scan-page__metric-range-label">Ideal range</span>
                  <span className="health-scan-page__metric-range-value">{toText(fitness?.basal_metabolic_rate?.healthy_range)}</span>
                </span>
              </div>

              <div className="health-scan-page__metrics-grid">
                <div className="health-scan-page__metric-card">
                  <div className="health-scan-page__metric-title">
                    <img src={waistIcon} alt="" aria-hidden="true" />
                    <span>Waist</span>
                  </div>
                  <div className="health-scan-page__metric-value health-scan-page__metric-value--above">
                    <span>{toNumberText(fitness?.waist)}</span>
                    <span className="health-scan-page__metric-icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.66792 5.21802V13.3327H7.33459V5.21802L3.75858 8.79401L2.81592 7.85135L8.00125 2.66602L13.1866 7.85135L12.2439 8.79401L8.66792 5.21802Z" fill="currentColor" />
                      </svg>
                    </span>
                  </div>
                  <span className="health-scan-page__metric-range-container">
                    <span className="health-scan-page__metric-range-label">Ideal range</span>
                    <span className="health-scan-page__metric-range-value">-</span>
                  </span>
                </div>

                <div className="health-scan-page__metric-card">
                  <div className="health-scan-page__metric-title">
                    <img src={bodyFatIcon} alt="" aria-hidden="true" />
                    <span>Body fat</span>
                  </div>
                  <div className="health-scan-page__metric-value health-scan-page__metric-value--above">
                    <span>{toNumberText(fitness?.estimated_body_fat?.value, fitness?.estimated_body_fat?.unit)}</span>
                    <span className="health-scan-page__metric-icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.66792 5.21802V13.3327H7.33459V5.21802L3.75858 8.79401L2.81592 7.85135L8.00125 2.66602L13.1866 7.85135L12.2439 8.79401L8.66792 5.21802Z" fill="currentColor" />
                      </svg>
                    </span>
                  </div>
                  <span className="health-scan-page__metric-range-container">
                    <span className="health-scan-page__metric-range-label">Ideal range</span>
                    <span className="health-scan-page__metric-range-value">{toText(fitness?.estimated_body_fat?.healthy_range)}</span>
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
                    <span>Healthy</span>
                    <span className="health-scan-page__legend-range">(0-25)</span>
                  </span>
                </div>
                <div className="health-scan-page__legend-item">
                  <span className="health-scan-page__legend-dot health-scan-page__legend-dot--increased" />
                  <span className="health-scan-page__legend-text">
                    <span>Increased Risk</span>
                    <span className="health-scan-page__legend-range">(26-50)</span>
                  </span>
                </div>
                <div className="health-scan-page__legend-item">
                  <span className="health-scan-page__legend-dot health-scan-page__legend-dot--high" />
                  <span className="health-scan-page__legend-text">
                    <span>High Risk</span>
                    <span className="health-scan-page__legend-range">(51-75)</span>
                  </span>
                </div>
                <div className="health-scan-page__legend-item">
                  <span className="health-scan-page__legend-dot health-scan-page__legend-dot--very-high" />
                  <span className="health-scan-page__legend-text">
                    <span>Very High Risk</span>
                    <span className="health-scan-page__legend-range">(76-100)</span>
                  </span>
                </div>
              </div>

              <div className="health-scan-page__divider" />

              <div className="health-scan-page__metrics-header">
                <h2 className="health-scan-page__metrics-title">Macro nutrients</h2>
                <span className="health-scan-page__metrics-date">As on {formattedDate}</span>
              </div>

              <div className="health-scan-page__metrics-grid">
                <div className="health-scan-page__metric-card">
                  <div className="health-scan-page__metric-title">
                    <img src={carbsIcon} alt="" aria-hidden="true" />
                    <span>Carbs</span>
                  </div>
                  <div className="health-scan-page__metric-value health-scan-page__metric-value--above">
                    <span>{formatMacroRange(nutrition?.carbs)}</span>
                    <span className="health-scan-page__metric-icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.66792 5.21802V13.3327H7.33459V5.21802L3.75858 8.79401L2.81592 7.85135L8.00125 2.66602L13.1866 7.85135L12.2439 8.79401L8.66792 5.21802Z" fill="currentColor" />
                      </svg>
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
                  <div className="health-scan-page__metric-value health-scan-page__metric-value--high">
                    <span>{formatMacroRange(nutrition?.fats)}</span>
                    <span className="health-scan-page__metric-icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.66792 5.21802V13.3327H7.33459V5.21802L3.75858 8.79401L2.81592 7.85135L8.00125 2.66602L13.1866 7.85135L12.2439 8.79401L8.66792 5.21802Z" fill="currentColor" />
                      </svg>
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
                  <div className="health-scan-page__metric-value health-scan-page__metric-value--below">
                    <span>{formatMacroRange(nutrition?.protein)}</span>
                    <span className="health-scan-page__metric-icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.33459 10.782V2.66732H8.66792V10.782L12.2439 7.20598L13.1866 8.14865L8.00125 13.334L2.81592 8.14865L3.75858 7.20598L7.33459 10.782Z" fill="currentColor" />
                      </svg>
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
                  <div className="health-scan-page__metric-value health-scan-page__metric-value--within">
                    <span>{formatMacroRange(nutrition?.fibre)}</span>
                    <span className="health-scan-page__metric-icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
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
                <div className="health-scan-page__metric-value health-scan-page__metric-value--within">
                  <span>{waterIntakeText}</span>
                  <span className="health-scan-page__metric-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
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
                    <span>Healthy</span>
                    <span className="health-scan-page__legend-range">(0-25)</span>
                  </span>
                </div>
                <div className="health-scan-page__legend-item">
                  <span className="health-scan-page__legend-dot health-scan-page__legend-dot--increased" />
                  <span className="health-scan-page__legend-text">
                    <span>Increased Risk</span>
                    <span className="health-scan-page__legend-range">(26-50)</span>
                  </span>
                </div>
                <div className="health-scan-page__legend-item">
                  <span className="health-scan-page__legend-dot health-scan-page__legend-dot--high" />
                  <span className="health-scan-page__legend-text">
                    <span>High Risk</span>
                    <span className="health-scan-page__legend-range">(51-75)</span>
                  </span>
                </div>
                <div className="health-scan-page__legend-item">
                  <span className="health-scan-page__legend-dot health-scan-page__legend-dot--very-high" />
                  <span className="health-scan-page__legend-text">
                    <span>Very High Risk</span>
                    <span className="health-scan-page__legend-range">(76-100)</span>
                  </span>
                </div>
              </div>

              <div className="health-scan-page__divider" />

              <div className="health-scan-page__metrics-header">
                <h2 className="health-scan-page__metrics-title">Lifestyle Parameters</h2>
                <span className="health-scan-page__metrics-date">As on {formattedDate}</span>
              </div>

              <div className="health-scan-page__metric-card health-scan-page__metric-card--full health-scan-page__metric-card--physical-activity health-scan-page__metric-card--lifestyle">
                <div className="health-scan-page__metric-title">
                  <img src={physicalActivityIcon} alt="" aria-hidden="true" />
                  <span>Physical Activity</span>
                </div>
                <div className="health-scan-page__metric-value health-scan-page__metric-value--mixed">
                  <span className="health-scan-page__metric-value-neutral">{toText(lifestyle?.physical_activity)}</span>
                </div>
              </div>

              <div className="health-scan-page__metrics-grid">
                <div className="health-scan-page__metric-card health-scan-page__metric-card--lifestyle">
                  <div className="health-scan-page__metric-title">
                    <img src={smokeIcon} alt="" aria-hidden="true" />
                    <span>Smoke</span>
                  </div>
                  <div className="health-scan-page__metric-value health-scan-page__metric-value--mixed">
                    <span className="health-scan-page__metric-value-neutral">{toText(lifestyle?.smoke)}</span>
                  </div>
                </div>

                <div className="health-scan-page__metric-card health-scan-page__metric-card--lifestyle">
                  <div className="health-scan-page__metric-title">
                    <img src={alcoholIcon} alt="" aria-hidden="true" />
                    <span>Alcohol</span>
                  </div>
                  <div className="health-scan-page__metric-value health-scan-page__metric-value--within">
                    <span>{toText(lifestyle?.alcohol)}</span>
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
                    <span className="health-scan-page__metric-value-neutral">{toText(lifestyle?.sleep)}</span>
                  </div>
                  <span className="health-scan-page__metric-range-container health-scan-page__metric-range-container--sleep">
                    <span className="health-scan-page__metric-range-label">Ideal</span>
                    <span className="health-scan-page__metric-range-value">-</span>
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
