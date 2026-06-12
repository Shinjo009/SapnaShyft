import React from 'react';
import menstrualHealthCardBg from '../../images/PackagesPage/menstrual-health-card-bg.png';
import PackageFaceCard, {
  getPackageTitle,
  getPopularGenderBadges,
  normalizePackageTitle,
} from './PackageFaceCard';

export const isMenstrualHealthPackage = (pkg) => {
  const title = getPackageTitle(pkg);
  return /menstrual/.test(title);
};

const MenstrualHealthPackageCard = ({ pkg, onOpenDetails, onBook }) => {
  const badges = getPopularGenderBadges(pkg);
  const displayTitle = normalizePackageTitle(pkg?.title || pkg?.apiData?.package_name);

  return (
    <PackageFaceCard
      pkg={pkg}
      cardBg={menstrualHealthCardBg}
      cardClassName="packages-card packages-card--elite-performance packages-card--menstrual-health"
      badges={badges}
      displayTitle={displayTitle}
      onOpenDetails={onOpenDetails}
      onBook={onBook}
    />
  );
};

export default MenstrualHealthPackageCard;
