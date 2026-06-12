import React from 'react';
import executiveFemaleCardBg from '../../images/PackagesPage/executive-female-card-bg.png';
import executiveMaleCardBg from '../../images/PackagesPage/executive-male-card-bg.png';
import PackageFaceCard, {
  getPackageTitle,
  getPopularGenderBadges,
  normalizePackageTitle,
} from './PackageFaceCard';

const isExecutiveTitle = (pkg) => {
  const title = getPackageTitle(pkg);
  return /\bexecutive\b/i.test(title) && !/wellness/i.test(title);
};

export const isExecutiveFemalePackage = (pkg) => {
  if (!isExecutiveTitle(pkg)) {
    return false;
  }

  const title = getPackageTitle(pkg);
  const gender = String(pkg?.apiData?.gender_suitability || '').trim().toLowerCase();
  if (gender === 'male' || /♂|\bmale\b/i.test(title)) {
    return false;
  }

  return gender === 'female' || /♀|female/i.test(title);
};

export const isExecutiveMalePackage = (pkg) => {
  if (!isExecutiveTitle(pkg)) {
    return false;
  }

  const title = getPackageTitle(pkg);
  const gender = String(pkg?.apiData?.gender_suitability || '').trim().toLowerCase();
  if (gender === 'female' || /♀|female/i.test(title)) {
    return false;
  }

  return gender === 'male' || /♂|\bmale\b/i.test(title);
};

export const isExecutivePackage = (pkg) => (
  isExecutiveFemalePackage(pkg) || isExecutiveMalePackage(pkg) || isExecutiveTitle(pkg)
);

const ExecutivePackageCard = ({ pkg, onOpenDetails, onBook }) => {
  const isFemale = isExecutiveFemalePackage(pkg);
  const badges = getPopularGenderBadges(pkg);
  const displayTitle = normalizePackageTitle(pkg?.title || pkg?.apiData?.package_name);
  const cardBg = isFemale ? executiveFemaleCardBg : executiveMaleCardBg;

  const cardClassName = [
    'packages-card',
    'packages-card--elite-performance',
    'packages-card--executive',
    isFemale ? 'packages-card--executive-female' : 'packages-card--executive-male',
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

export default ExecutivePackageCard;
