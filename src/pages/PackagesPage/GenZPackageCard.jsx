import React from 'react';
import genZFemaleCardBg from '../../images/PackagesPage/gen-z-female-card-bg.png';
import genZMaleCardBg from '../../images/PackagesPage/gen-z-male-card-bg.png';
import PackageFaceCard, {
  getPackageTitle,
  getPopularGenderBadges,
  normalizePackageTitle,
} from './PackageFaceCard';

const isGenZTitle = (pkg) => /gen-?\s*z|genz/i.test(getPackageTitle(pkg));

export const isGenZFemalePackage = (pkg) => {
  if (!isGenZTitle(pkg)) {
    return false;
  }

  const title = getPackageTitle(pkg);
  const gender = String(pkg?.apiData?.gender_suitability || '').trim().toLowerCase();
  if (gender === 'male' || /♂|\bmale\b/i.test(title)) {
    return false;
  }

  return gender === 'female' || /♀|female/i.test(title);
};

export const isGenZMalePackage = (pkg) => {
  if (!isGenZTitle(pkg)) {
    return false;
  }

  const title = getPackageTitle(pkg);
  const gender = String(pkg?.apiData?.gender_suitability || '').trim().toLowerCase();
  if (gender === 'female' || /♀|female/i.test(title)) {
    return false;
  }

  return gender === 'male' || /♂|\bmale\b/i.test(title);
};

export const isGenZPackage = (pkg) => (
  isGenZFemalePackage(pkg) || isGenZMalePackage(pkg) || isGenZTitle(pkg)
);

const GenZPackageCard = ({ pkg, onOpenDetails, onBook }) => {
  const isFemale = isGenZFemalePackage(pkg);
  const badges = getPopularGenderBadges(pkg);
  const displayTitle = normalizePackageTitle(pkg?.title || pkg?.apiData?.package_name);
  const cardBg = isFemale ? genZFemaleCardBg : genZMaleCardBg;

  const cardClassName = [
    'packages-card',
    'packages-card--elite-performance',
    'packages-card--gen-z',
    isFemale ? 'packages-card--gen-z-female' : 'packages-card--gen-z-male',
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

export default GenZPackageCard;
