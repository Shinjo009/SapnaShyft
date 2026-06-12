import React from 'react';
import oncocareFemaleCardBg from '../../images/PackagesPage/oncocare-female-card-bg.png';
import oncocareMaleCardBg from '../../images/PackagesPage/oncocare-male-card-bg.png';
import PackageFaceCard, {
  getPackageTitle,
  getPopularGenderBadges,
  isFemalePackage,
  normalizePackageTitle,
} from './PackageFaceCard';

const isOncoCareTitle = (pkg) => {
  const title = getPackageTitle(pkg);
  return /oncocare|onco care|onco-care|onco\s*care/.test(title);
};

export const isOncoCareFemalePackage = (pkg) => {
  if (!isOncoCareTitle(pkg)) {
    return false;
  }

  const title = getPackageTitle(pkg);
  const gender = String(pkg?.apiData?.gender_suitability || '').trim().toLowerCase();
  if (gender === 'male' || /♂|\bmale\b/i.test(title)) {
    return false;
  }

  return gender === 'female' || /♀|female/i.test(title);
};

export const isOncoCareMalePackage = (pkg) => {
  if (!isOncoCareTitle(pkg)) {
    return false;
  }

  const title = getPackageTitle(pkg);
  const gender = String(pkg?.apiData?.gender_suitability || '').trim().toLowerCase();
  if (gender === 'female' || /♀|female/i.test(title)) {
    return false;
  }

  return gender === 'male' || /♂|\bmale\b/i.test(title);
};

export const isOncoCarePackage = (pkg) => (
  isOncoCareFemalePackage(pkg) || isOncoCareMalePackage(pkg) || isOncoCareTitle(pkg)
);

const OncoCarePackageCard = ({ pkg, onOpenDetails, onBook }) => {
  const isFemale = isOncoCareFemalePackage(pkg) || (!isOncoCareMalePackage(pkg) && isFemalePackage(pkg));
  const badges = getPopularGenderBadges(pkg);
  const displayTitle = normalizePackageTitle(pkg?.title || pkg?.apiData?.package_name);
  const cardBg = isFemale ? oncocareFemaleCardBg : oncocareMaleCardBg;

  const cardClassName = [
    'packages-card',
    'packages-card--elite-performance',
    'packages-card--oncocare',
    isFemale ? 'packages-card--oncocare-female' : 'packages-card--oncocare-male',
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

export default OncoCarePackageCard;
