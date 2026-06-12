import React from 'react';
import bioAllergyPlusCardBg from '../../images/PackagesPage/bio-allergy-plus-card-bg.png';
import PackageFaceCard, {
  getPackageTitle,
  getPopularGenderBadges,
  normalizePackageTitle,
} from './PackageFaceCard';

export const isBioAllergyPlusPackage = (pkg) => {
  const title = getPackageTitle(pkg);
  return /bio-?allergy\s*\+|bio\s*allergy\s*plus/i.test(title);
};

const BioAllergyPlusPackageCard = ({ pkg, onOpenDetails, onBook }) => {
  const badges = getPopularGenderBadges(pkg);
  const displayTitle = normalizePackageTitle(pkg?.title || pkg?.apiData?.package_name);

  return (
    <PackageFaceCard
      pkg={pkg}
      cardBg={bioAllergyPlusCardBg}
      cardClassName="packages-card packages-card--elite-performance packages-card--bio-allergy-plus"
      badges={badges}
      displayTitle={displayTitle}
      onOpenDetails={onOpenDetails}
      onBook={onBook}
    />
  );
};

export default BioAllergyPlusPackageCard;
