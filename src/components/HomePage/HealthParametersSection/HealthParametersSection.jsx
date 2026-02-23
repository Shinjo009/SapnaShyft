import React from 'react';
import './HealthParametersSection.css';
import CircularProgressCard from '../CircularProgressCard';

/**
 * HealthParametersSection Component - Displays health parameters with circular progress cards
 * 
 * Props:
 * - data: Array of card data [{percentage: 75, label: "Lifestyle score"}, ...]
 * - onSeeMore: Callback when "See more" is clicked
 */
const HealthParametersSection = ({ data = [
  { percentage: 100, label: 'Lifestyle score' },
  { percentage: 75, label: 'Nutrition score' },
  { percentage: 75, label: 'Fitness score' }
], onSeeMore }) => {
  const handleSeeMore = (e) => {
    e.preventDefault();
    if (onSeeMore) {
      onSeeMore();
    }
  };

  return (
    <section className="health-parameters">
      <div className="health-parameters__header">
        <h2 className="health-parameters__title">Health Parameters To Focus</h2>
      </div>

      <div className="health-parameters__box">
        <div className="health-parameters__text-group">
          <div className="health-parameters__top-row">
            <p className="health-parameters__subheading">Health Scan Index</p>
            <button type="button" onClick={handleSeeMore} className="health-parameters__see-more" style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer' }}>See more</button>
          </div>
          <p className="health-parameters__note">Tap the card to know more</p>
        </div>

        <div className="health-parameters__cards">
          {data.map((item, index) => (
            <CircularProgressCard 
              key={index}
              percentage={item.percentage}
              label={item.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HealthParametersSection;
