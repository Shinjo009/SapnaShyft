import React from 'react';
import './HomePage.css';
import Header from '../../components/HomePage/Header';
import MetabolicAgeCard from '../../components/HomePage/MetabolicAgeCard';
import HealthParametersSection from '../../components/HomePage/HealthParametersSection';
import PositiveWinsSection from '../../components/HomePage/PositiveWinsSection/PositiveWinsSection';
import RiskAnalysisSection from '../../components/HomePage/RiskAnalysisSection';
import NavBar from '../../components/NavBar';

const HomePage = ({ userName = 'User', onNavigateToHealthScan, onNavigateToProfile, onNavigateToRiskAnalysis, onNavigateToDiseaseDetail, onOpenHealthAssessment, onNavigateToBloodMarkers }) => {
  const handleMenuClick = () => {
    console.log('Menu clicked');
    if (onNavigateToProfile) {
      onNavigateToProfile();
    }
  };

  const handleSearchClick = () => {
    console.log('Search clicked');
    if (onOpenHealthAssessment) {
      onOpenHealthAssessment();
    }
  };

  const handleNavigate = (itemId) => {
    console.log('Navigating to:', itemId);
    // Handle navigation logic here
  };

  const handleHealthScanSeeMore = () => {
    if (onNavigateToHealthScan) {
      onNavigateToHealthScan();
    }
  };

  const handleRiskAnalysisSeeMore = () => {
    if (onNavigateToRiskAnalysis) {
      onNavigateToRiskAnalysis();
    }
  };

  const handleBloodMarkersSeeMore = () => {
    if (onNavigateToBloodMarkers) {
      onNavigateToBloodMarkers();
    }
  };

  return (
    <div className="home-page">
      {/* Header */}
      <Header 
        name={userName} 
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
          { percentage: 45, label: 'Nutrition score' },
          { percentage: 20, label: 'Fitness score' }
        ]}
        onSeeMore={handleHealthScanSeeMore}
      />

      <PositiveWinsSection />

      {/* Risk Analysis Section */}
      <RiskAnalysisSection
        onSeeMore={handleRiskAnalysisSeeMore}
        onDiseaseSelect={onNavigateToDiseaseDetail}
        onBloodMarkersSeeMore={handleBloodMarkersSeeMore}
      />

      <NavBar defaultActive="home" onNavigate={handleNavigate} />
    </div>
  );
};

export default HomePage;
