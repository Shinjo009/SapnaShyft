import React from 'react';
import cSuiteCardBg from '../../images/PackagesPage/c-suite-card-bg.png';
import cSuiteFemaleCardBg from '../../images/PackagesPage/c-suite-female-card-bg.png';
import elitePerformanceGradient from '../../images/PackagesPage/Gradient.svg';
import { getComplimentaryConsultationContent } from '../../utils/complimentaryConsultation';
import { buildPackageFaceBadges } from '../../utils/diagnosticPackageCardMapper';
import { getPackageGenderSuitability } from '../../utils/packageGenderIcon';
import {
  normalizePackageTitle,
  PackageFaceCardDetails,
  PackageFaceCardPricing,
  PackageFaceCardTitleRow,
} from './PackageFaceCard';

const MISSING_VALUE = '-';

const isCSuiteTitle = (pkg) => {
  const title = String(pkg?.title || pkg?.apiData?.package_name || '').trim().toLowerCase();
  return /c-?suite|c suite/.test(title) || title.includes('csuite');
};

export const isCSuiteFemalePackage = (pkg) => (
  isCSuiteTitle(pkg) && getPackageGenderSuitability(pkg) === 'female'
);

export const isCSuiteMalePackage = (pkg) => (
  isCSuiteTitle(pkg) && getPackageGenderSuitability(pkg) === 'male'
);

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

                <PackageFaceCardTitleRow
                  pkg={pkg}
                  displayTitle={displayTitle}
                  onOpenDetails={onOpenDetails}
                />
              </div>
            </div>

            <PackageFaceCardDetails pkg={pkg} consultation={consultation} />

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
