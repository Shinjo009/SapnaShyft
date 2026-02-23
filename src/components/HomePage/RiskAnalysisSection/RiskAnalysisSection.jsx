import React from 'react';
import './RiskAnalysisSection.css';
import RiskAnalysisCard from '../RiskAnalysisCard';
import oxidativeStressIcon from '../../../images/Oxidative.png';
import dyslipidemiaIcon from '../../../images/Dyslipidemia.png';
import cardiacHealthIcon from '../../../images/Cardiac Health.png';

/**
 * RiskAnalysisSection Component - Displays risk analysis parameters
 * 
 * Props:
 * - data: Array of card data [{value: 85, label: "Oxidative Stress", icon: path}, ...]
 */
const RiskAnalysisSection = ({ data = [
  { value: 85, label: 'Oxidative Stress', icon: oxidativeStressIcon },
  { value: 55, label: 'Dyslipidemia', icon: dyslipidemiaIcon },
  { value: 65, label: 'Cardiac Health', icon: cardiacHealthIcon }
], onSeeMore }) => {
  const bloodMarkers = [
    { name: 'Albumin', value: '23.5 mg/dL', profile: 'Liver Profile', risk: 'High Risk' },
    { name: 'Albumin', value: '23.5 mg/dL', profile: 'Liver Profile', risk: 'High Risk' },
    { name: 'Albumin', value: '23.5 mg/dL', profile: 'Heart Profile', risk: 'High Risk' }
  ];

  return (
    <section className="risk-analysis">
      <div className="risk-analysis__box">
        <div className="risk-analysis__text-group">
          <div className="risk-analysis__top-row">
            <p className="risk-analysis__subheading">Risk Analysis</p>
            <button onClick={onSeeMore} className="risk-analysis__see-more">See more</button>
          </div>
          <p className="risk-analysis__note">Tap the disease to know more</p>
        </div>

        <div className="risk-analysis__cards">
          {data.map((item, index) => (
            <RiskAnalysisCard 
              key={index}
              value={item.value}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </div>
      </div>

      <div className="blood-markers__box">
        <div className="blood-markers__header">
          <p className="blood-markers__title">Blood Markers</p>
          <button className="blood-markers__see-more">See more</button>
        </div>
        <p className="blood-markers__note">Tap the card to know more</p>

        <div className="blood-markers__list">
          {bloodMarkers.map((marker, index) => (
            <div key={`${marker.name}-${index}`} className="blood-marker-card">
              <div className="blood-marker-card__left">
                <div className="blood-marker-card__title-row">
                  <span className="blood-marker-card__name">{marker.name}</span>
                  <span className="blood-marker-card__value">{marker.value}</span>
                  <span className="blood-marker-card__arrow" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <g clipPath="url(#clip0_915_2436)">
                        <path d="M8.66792 5.21802V13.3327H7.33459V5.21802L3.75858 8.79401L2.81592 7.85135L8.00125 2.66602L13.1866 7.85135L12.2439 8.79401L8.66792 5.21802Z" fill="#E95D5C" />
                      </g>
                      <defs>
                        <clipPath id="clip0_915_2436">
                          <rect width="16" height="16" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </span>
                </div>
                <span className="blood-marker-card__profile">{marker.profile}</span>
              </div>

              <div className="blood-marker-card__risk">
                <span className="blood-marker-card__dot" aria-hidden="true" />
                <span className="blood-marker-card__risk-text">{marker.risk}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RiskAnalysisSection;
