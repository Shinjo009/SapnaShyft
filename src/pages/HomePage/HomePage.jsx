import React, { useEffect, useMemo, useState } from 'react';
import './HomePage.css';
import Header from '../../components/HomePage/Header';
import MetabolicAgeOrb from '../../metabolic-age-orb/MetabolicAgeOrb.jsx';
import HealthParametersSection from '../../components/HomePage/HealthParametersSection';
import PositiveWinsSection from '../../components/HomePage/PositiveWinsSection/PositiveWinsSection';
import RiskAnalysisSection from '../../components/HomePage/RiskAnalysisSection';
import NavBar from '../../components/NavBar';
import { fetchLatestAssessmentReport } from '../../services/reportService';

const resolveOverviewPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return null;
  if (payload.data && typeof payload.data === 'object') return payload.data;
  if (payload.result && typeof payload.result === 'object') return payload.result;
  if (payload.item && typeof payload.item === 'object') return payload.item;
  return payload;
};

const HomePage = ({ userName = 'User', userAge = null, preloadedData = null, forceRefreshFromProfile = false, onNavigateToHealthScan, onNavigateToHealthScanTab, onNavigateToProfile, onNavigateToRiskAnalysis, onNavigateToDiseaseDetail, onOpenHealthAssessment, onNavigateToBloodMarkers, onNavigateToPackages, onNavigateToDoctors, onNavigateToSuperClub }) => {
  const [metabolicAgeValue, setMetabolicAgeValue] = useState(preloadedData?.metabolicAgeValue || '-');
  const [positiveWinsData, setPositiveWinsData] = useState(preloadedData?.positiveWinsData || null);
  const [riskAnalysisData, setRiskAnalysisData] = useState(preloadedData?.riskAnalysisData || []);

  const metabolicAgeDetail = useMemo(() => {
    const chronologicalAge = Number(userAge);
    const metabolicAge = Number(metabolicAgeValue);

    if (!Number.isFinite(chronologicalAge) || chronologicalAge <= 0 || !Number.isFinite(metabolicAge)) {
      return '-';
    }

    const delta = Math.round(metabolicAge - chronologicalAge);
    if (delta > 0) {
      return `${delta} year${delta === 1 ? '' : 's'} older`;
    }

    if (delta < 0) {
      const yearsYounger = Math.abs(delta);
      return `${yearsYounger} year${yearsYounger === 1 ? '' : 's'} younger`;
    }

    return 'Same as your age';
  }, [metabolicAgeValue, userAge]);

  /** MetabolicAgeOrb: delta + currentAge when both known; else absoluteMetabolicAge + detail; else demo defaults. */
  const metabolicOrbProps = useMemo(() => {
    const metabolic = Number(metabolicAgeValue);
    const chrono = Number(userAge);

    if (Number.isFinite(metabolic) && Number.isFinite(chrono) && chrono > 0) {
      return {
        value: String(Math.round(metabolic - chrono)),
        currentAge: chrono,
        label: 'Metabolic age',
        detail: metabolicAgeDetail,
        absoluteMetabolicAge: undefined,
      };
    }

    if (Number.isFinite(metabolic)) {
      return {
        value: '0',
        currentAge: undefined,
        label: 'Metabolic age',
        detail: metabolicAgeDetail,
        absoluteMetabolicAge: metabolic,
      };
    }

    return {
      value: '-',
      currentAge: undefined,
      label: 'Metabolic age',
      detail: '-',
      absoluteMetabolicAge: undefined,
    };
  }, [metabolicAgeValue, userAge, metabolicAgeDetail]);

  useEffect(() => {
    let isActive = true;

    const loadOverviewData = async () => {
      try {
        const { response } = await fetchLatestAssessmentReport(
          (assessmentId) => `/reports/${assessmentId}/overview`,
          forceRefreshFromProfile ? 0 : 45000,
        );
        const overview = resolveOverviewPayload(response);

        if (!overview || typeof overview !== 'object') {
          if (isActive) {
            setMetabolicAgeValue('-');
            setPositiveWinsData(null);
            setRiskAnalysisData([]);
          }
          return;
        }

        const metabolicAge = Number(overview?.metabolic_age);
        const metabolicAgeDisplay = Number.isFinite(metabolicAge) ? String(Math.round(metabolicAge)) : '-';

        if (isActive) {
          setMetabolicAgeValue(metabolicAgeDisplay);
          setPositiveWinsData(overview?.positive_wins && typeof overview.positive_wins === 'object' ? overview.positive_wins : null);
          setRiskAnalysisData(Array.isArray(overview?.risk_analysis) ? overview.risk_analysis : []);
        }
      } catch {
        if (isActive) {
          setMetabolicAgeValue('-');
          setPositiveWinsData(null);
          setRiskAnalysisData([]);
        }
      }
    };

    loadOverviewData();

    return () => {
      isActive = false;
    };
  }, [forceRefreshFromProfile]);

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

    if (itemId === 'super-sync' && onNavigateToDoctors) {
      onNavigateToDoctors();
      return;
    }

    if (itemId === 'super-club' && onNavigateToSuperClub) {
      onNavigateToSuperClub();
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

      <MetabolicAgeOrb
        value={metabolicOrbProps.value}
        currentAge={metabolicOrbProps.currentAge}
        label={metabolicOrbProps.label}
        detail={metabolicOrbProps.detail}
        absoluteMetabolicAge={metabolicOrbProps.absoluteMetabolicAge}
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

      <PositiveWinsSection apiPositiveWins={positiveWinsData} />

      {/* Risk Analysis Section */}
      <RiskAnalysisSection
        apiRiskAnalysis={riskAnalysisData}
        onSeeMore={handleRiskAnalysisSeeMore}
        onDiseaseSelect={onNavigateToDiseaseDetail}
        onBloodMarkersSeeMore={handleBloodMarkersSeeMore}
      />

      <NavBar defaultActive="home" onNavigate={handleNavigate} />
    </div>
  );
};

export default HomePage;
