import React from 'react';
import './HomePage.css';
import Header from '../../components/HomePage/Header';
import MetabolicAgeCard from '../../components/HomePage/MetabolicAgeCard';
import HealthParametersSection from '../../components/HomePage/HealthParametersSection';
import PositiveWinsSection from '../../components/HomePage/PositiveWinsSection/PositiveWinsSection';
import RiskAnalysisSection from '../../components/HomePage/RiskAnalysisSection';
import NavBar from '../../components/NavBar';

const HomePage = ({ userName = 'User', onNavigateToHealthScan, onNavigateToHealthScanTab, onNavigateToProfile, onNavigateToRiskAnalysis, onNavigateToDiseaseDetail, onOpenHealthAssessment, onNavigateToBloodMarkers, onNavigateToPackages }) => {
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
    if (itemId === 'packages' && onNavigateToPackages) {
      onNavigateToPackages();
      return;
    }

    if (itemId === 'home') {
      return;
    }
  };

  const handleHealthScanSeeMore = () => {
    if (onNavigateToHealthScan) {
      onNavigateToHealthScan();
    }
  };

  const handleHealthScanCircleClick = (item) => {
    const tabByLabel = {
      'Fitness score': 0,
      'Nutrition score': 1,
      'Lifestyle score': 2,
    };

    const tabIndex = tabByLabel[item?.label] ?? 0;

    if (onNavigateToHealthScanTab) {
      onNavigateToHealthScanTab(tabIndex);
      return;
    }

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
          { percentage: 20, label: 'Fitness score' },
          { percentage: 45, label: 'Nutrition score' },
          { percentage: 75, label: 'Lifestyle score' }
        ]}
        onSeeMore={handleHealthScanSeeMore}
        onCardClick={handleHealthScanCircleClick}
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
