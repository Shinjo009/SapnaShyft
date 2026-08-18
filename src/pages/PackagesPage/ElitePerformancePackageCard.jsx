import React from 'react';
import elitePerformanceFemaleCardBg from '../../images/PackagesPage/elite-performance-female-card-bg.png';
import elitePerformanceMaleCardBg from '../../images/PackagesPage/elite-performance-male-card-bg.png';
import elitePerformanceGradient from '../../images/PackagesPage/Gradient.svg';
import { getComplimentaryConsultationContent } from '../../utils/complimentaryConsultation';
import { getPackageGenderSuitability } from '../../utils/packageGenderIcon';
import {
  getPopularGenderBadges,
  normalizePackageTitle,
  PackageFaceCardDetails,
  PackageFaceCardPricing,
  PackageFaceCardTitleRow,
} from './PackageFaceCard';

const isElitePerformanceTitle = (pkg) => {
  const title = String(pkg?.title || pkg?.apiData?.package_name || '').trim().toLowerCase();
  return title.includes('elite performance');
};

export const isElitePerformanceFemalePackage = (pkg) => (
  isElitePerformanceTitle(pkg) && getPackageGenderSuitability(pkg) === 'female'
);

export const isElitePerformanceMalePackage = (pkg) => (
  isElitePerformanceTitle(pkg) && getPackageGenderSuitability(pkg) === 'male'
);

const ElitePerformancePackageCard = ({
  pkg,
  onOpenDetails,
  onBook,
}) => {
  const isFemale = isElitePerformanceFemalePackage(pkg);
  const isMale = isElitePerformanceMalePackage(pkg);
  const consultation = getComplimentaryConsultationContent(pkg?.apiData || pkg);
  const badges = getPopularGenderBadges(pkg);
  const displayTitle = normalizePackageTitle(pkg?.title || pkg?.apiData?.package_name) || null;
  const cardBg = isFemale ? elitePerformanceFemaleCardBg : elitePerformanceMaleCardBg;
  const cardClassName = [
    'packages-card',
    'packages-card--elite-performance',
    isFemale ? 'packages-card--elite-performance-female' : '',
    isMale ? 'packages-card--elite-performance-male' : '',
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
                  <div className="packages-card__elite-badges">
                    {badges.map((badge, index) => (
                      <span key={`${pkg.id}-elite-badge-${index}`} className="packages-card__elite-badge">
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

export default ElitePerformancePackageCard;
