import React from 'react';
import './HomePage.css';
import bg1 from '../../images/HP-BG-1.png';
import bg2 from '../../images/HP-BG-2.png';
import Header from '../../components/HomePage/Header';
import MetabolicAgeCard from '../../components/HomePage/MetabolicAgeCard';
import HealthParametersSection from '../../components/HomePage/HealthParametersSection';
import RiskAnalysisSection from '../../components/HomePage/RiskAnalysisSection';
import NavBar from '../../components/NavBar';

const HomePage = () => {
  const handleMenuClick = () => {
    console.log('Menu clicked');
  };

  const handleSearchClick = () => {
    console.log('Search clicked');
  };

  const handleNavigate = (itemId) => {
    console.log('Navigating to:', itemId);
    // Handle navigation logic here
  };

  return (
    <div className="home-page">
      {/* Header */}
      <Header 
        name="Neha" 
        onMenuClick={handleMenuClick}
        onSearchClick={handleSearchClick}
      />

      {/* Metabolic Age Card */}
      <MetabolicAgeCard 
        age={28}
        label="Metabolic age"
        detail="5 years older"
      />

      {/* Health Parameters Section */}
      <HealthParametersSection 
        data={[
          { percentage: 75, label: 'Lifestyle score' },
          { percentage: 75, label: 'Nutrition score' },
          { percentage: 75, label: 'Fitness score' }
        ]}
      />

      {/* Risk Analysis Section */}
      <RiskAnalysisSection />

      <div className="home-page__background">
        <img src={bg1} alt="" className="home-page__image" />
        <img src={bg2} alt="" className="home-page__image" />

        {/* Content will be added here */}
      </div>
      <NavBar defaultActive="home" onNavigate={handleNavigate} />
    </div>
  );
};

export default HomePage;
