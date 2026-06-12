import React from 'react';
import hairHealthFemaleCardBg from '../../images/PackagesPage/hair-health-female-card-bg.png';
import hairHealthMaleCardBg from '../../images/PackagesPage/hair-health-male-card-bg.png';
import PackageFaceCard, {
  getPackageTitle,
  getPopularGenderBadges,
  isFemalePackage,
  normalizePackageTitle,
} from './PackageFaceCard';

const isHairHealthTitle = (pkg) => {
  const title = getPackageTitle(pkg);
  return /hair health|hair\s*health/.test(title);
};

export const isHairHealthFemalePackage = (pkg) => {
  if (!isHairHealthTitle(pkg)) {
    return false;
  }

  const title = getPackageTitle(pkg);
  const gender = String(pkg?.apiData?.gender_suitability || '').trim().toLowerCase();
  if (gender === 'male' || /♂|\bmale\b/i.test(title)) {
    return false;
  }

  return gender === 'female' || /♀|female/i.test(title);
};

export const isHairHealthMalePackage = (pkg) => {
  if (!isHairHealthTitle(pkg)) {
    return false;
  }

  const title = getPackageTitle(pkg);
  const gender = String(pkg?.apiData?.gender_suitability || '').trim().toLowerCase();
  if (gender === 'female' || /♀|female/i.test(title)) {
    return false;
  }

  return gender === 'male' || /♂|\bmale\b/i.test(title);
};

export const isHairHealthPackage = (pkg) => (
  isHairHealthFemalePackage(pkg) || isHairHealthMalePackage(pkg) || isHairHealthTitle(pkg)
);

const HairHealthPackageCard = ({ pkg, onOpenDetails, onBook }) => {
  const isFemale = isHairHealthFemalePackage(pkg) || (!isHairHealthMalePackage(pkg) && isFemalePackage(pkg));
  const badges = getPopularGenderBadges(pkg);
  const displayTitle = normalizePackageTitle(pkg?.title || pkg?.apiData?.package_name);
  const cardBg = isFemale ? hairHealthFemaleCardBg : hairHealthMaleCardBg;

  const cardClassName = [
    'packages-card',
    'packages-card--elite-performance',
    'packages-card--hair-health',
    isFemale ? 'packages-card--hair-health-female' : 'packages-card--hair-health-male',
  ].join(' ');

  return (
    <PackageFaceCard
      pkg={pkg}
      cardBg={cardBg}
      cardClassName={cardClassName}
      badges={badges}
      displayTitle={displayTitle}
      onOpenDetails={onOpenDetails}
      onBook={onBook}
    />
  );
};

export default HairHealthPackageCard;
