import React, { useState } from 'react';
import './HealthScanNavBar.css';

/**
 * HealthScanNavBar Component - Segmented control navigation for Health Span Index page
 * 
 * Props:
 * - defaultActive: Default active tab (0, 1, or 2)
 * - onTabChange: Callback when tab is clicked
 */
const HealthScanNavBar = ({ defaultActive = 0, onTabChange }) => {
  const [activeTab, setActiveTab] = useState(defaultActive);

  const tabs = ['Fitness score', 'Nutrition score', 'Lifestyle score'];

  const handleTabClick = (index) => {
    setActiveTab(index);
    if (onTabChange) {
      onTabChange(index);
    }
  };

  return (
    <div className="health-scan-navbar">
      <div className="health-scan-navbar__container">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`health-scan-navbar__tab ${activeTab === index ? 'health-scan-navbar__tab--active' : ''}`}
            onClick={() => handleTabClick(index)}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HealthScanNavBar;
