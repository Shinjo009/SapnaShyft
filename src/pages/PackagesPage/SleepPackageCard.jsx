import React from 'react';
import sleepCardBg from '../../images/PackagesPage/sleep-card-bg.png';
import PackageFaceCard, {
  getPackageTitle,
  getPopularGenderBadges,
  normalizePackageTitle,
} from './PackageFaceCard';

export const isSleepPackage = (pkg) => /\bsleep\b/i.test(getPackageTitle(pkg));

const SleepPackageCard = ({ pkg, onOpenDetails, onBook }) => {
  const badges = getPopularGenderBadges(pkg);
  const displayTitle = normalizePackageTitle(pkg?.title || pkg?.apiData?.package_name);

  return (
    <PackageFaceCard
      pkg={pkg}
      cardBg={sleepCardBg}
      cardClassName="packages-card packages-card--elite-performance packages-card--sleep"
      badges={badges}
      displayTitle={displayTitle}
      onOpenDetails={onOpenDetails}
      onBook={onBook}
    />
  );
};

export default SleepPackageCard;
