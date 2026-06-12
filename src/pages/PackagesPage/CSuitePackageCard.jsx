import React from 'react';
import cSuiteCardBg from '../../images/PackagesPage/c-suite-card-bg.png';
import cSuiteFemaleCardBg from '../../images/PackagesPage/c-suite-female-card-bg.png';
import elitePerformanceFemaleDiscountIcon from '../../images/PackagesPage/elite-performance-female-discount-icon.png';
import elitePerformanceGradient from '../../images/PackagesPage/Gradient.svg';
import packagesArrowIcon from '../../images/PackagesPage/Packages arrow.svg';
import { getComplimentaryConsultationContent } from '../../utils/complimentaryConsultation';
import { buildPackageFaceBadges } from '../../utils/diagnosticPackageCardMapper';
import {
  normalizePackageTitle,
  PackageFaceCardMetrics,
  PackageFaceCardPricing,
} from './PackageFaceCard';

const MISSING_VALUE = '-';

const isCSuiteTitle = (pkg) => {
  const title = String(pkg?.title || pkg?.apiData?.package_name || '').trim().toLowerCase();
  return /c-?suite|c suite/.test(title) || title.includes('csuite');
};

export const isCSuiteFemalePackage = (pkg) => {
  if (!isCSuiteTitle(pkg)) {
    return false;
  }

  const title = String(pkg?.title || pkg?.apiData?.package_name || '').trim().toLowerCase();
  const gender = String(pkg?.apiData?.gender_suitability || '').trim().toLowerCase();
  if (gender === 'male' || /♂|\bmale\b/i.test(title)) {
    return false;
  }

  return gender === 'female' || /♀|female/i.test(title);
};

export const isCSuiteMalePackage = (pkg) => {
  if (!isCSuiteTitle(pkg)) {
    return false;
  }

  const title = String(pkg?.title || pkg?.apiData?.package_name || '').trim().toLowerCase();
  const gender = String(pkg?.apiData?.gender_suitability || '').trim().toLowerCase();
  if (gender === 'female' || /♀|female/i.test(title)) {
    return false;
  }

  return gender === 'male' || /♂|\bmale\b/i.test(title);
};

export const isCSuitePackage = (pkg) => (
  isCSuiteFemalePackage(pkg) || isCSuiteMalePackage(pkg) || isCSuiteTitle(pkg)
);

const CSuitePackageCard = ({
  pkg,
  onOpenDetails,
  onBook,
}) => {
  const isFemale = isCSuiteFemalePackage(pkg);
  const isMale = isCSuiteMalePackage(pkg);
  const consultation = getComplimentaryConsultationContent(pkg?.apiData || pkg);
  const apiPkg = pkg?.apiData && typeof pkg.apiData === 'object' ? pkg.apiData : pkg;
  const badges = Array.isArray(pkg?.badges) && pkg.badges.length > 0
    ? pkg.badges.filter((badge) => badge && badge !== MISSING_VALUE)
    : buildPackageFaceBadges(apiPkg);
  const displayTitle = normalizePackageTitle(pkg?.title || pkg?.apiData?.package_name) || null;
  const cardBg = isFemale ? cSuiteFemaleCardBg : cSuiteCardBg;

  const cardClassName = [
    'packages-card',
    'packages-card--elite-performance',
    'packages-card--c-suite',
    isFemale ? 'packages-card--c-suite-female' : '',
    isMale ? 'packages-card--c-suite-male' : '',
  ].filter(Boolean).join(' ');

  return (
    <article
      className={cardClassName}
      onClick={onOpenDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpenDetails?.();
        }
      }}
    >
      <div className="packages-card__elite-photo" aria-hidden="true">
        <img src={cardBg} alt="" className="packages-card__elite-photo-image" />
      </div>
      <div
        className="packages-card__elite-gradient"
        style={{ backgroundImage: `url(${elitePerformanceGradient})` }}
        aria-hidden="true"
      />

      {consultation ? (
        <div className="packages-card__elite-promo">
          <span className="packages-card__elite-promo-icon-wrap" aria-hidden="true">
            <img
              src={elitePerformanceFemaleDiscountIcon}
              alt=""
              className="packages-card__elite-promo-icon"
            />
          </span>
          <span className="packages-card__elite-promo-label">{consultation.topPillLabel}</span>
        </div>
      ) : null}

      <div className="packages-card__elite-content">
        <div className="packages-card__elite-margin">
          <div className="packages-card__elite-stack">
            <div className="packages-card__elite-header-wrap">
              <div className="packages-card__elite-header">
                {badges.length > 0 ? (
                  <div className="packages-card__elite-badges packages-card__elite-badges--c-suite">
                    {badges.map((badge, index) => (
                      <span key={`${pkg.id}-csuite-badge-${index}`} className="packages-card__elite-badge">
                        {badge}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="packages-card__elite-title-row">
                  {displayTitle ? (
                    <h2 className="packages-card__elite-title">{displayTitle}</h2>
                  ) : null}
                  <button
                    type="button"
                    className="packages-card__elite-open-btn"
                    aria-label="Open package details"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenDetails?.();
                    }}
                  >
                    <img src={packagesArrowIcon} alt="" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            <PackageFaceCardMetrics metrics={pkg.metrics} />

            <div className="packages-card__elite-footer">
              <PackageFaceCardPricing pricing={pkg.pricing} />
              <button
                type="button"
                className="packages-card__elite-view-btn"
                onClick={(event) => {
                  event.stopPropagation();
                  onBook?.();
                }}
              >
                View Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default CSuitePackageCard;
