import React from 'react';
import fatigueCardBg from '../../images/PackagesPage/fatigue-card-bg.png';
import PackageFaceCard, {
  getPackageTitle,
  getPopularGenderBadges,
  normalizePackageTitle,
} from './PackageFaceCard';

export const isFatiguePackage = (pkg) => /\bfatigue\b/i.test(getPackageTitle(pkg));

const FatiguePackageCard = ({ pkg, onOpenDetails, onBook }) => {
  const badges = getPopularGenderBadges(pkg);
  const displayTitle = normalizePackageTitle(pkg?.title || pkg?.apiData?.package_name);

  return (
    <PackageFaceCard
      pkg={pkg}
      cardBg={fatigueCardBg}
      cardClassName="packages-card packages-card--elite-performance packages-card--fatigue"
      badges={badges}
      displayTitle={displayTitle}
      onOpenDetails={onOpenDetails}
      onBook={onBook}
    />
  );
};

export default FatiguePackageCard;
