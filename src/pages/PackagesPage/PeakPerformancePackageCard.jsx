import React from 'react';
import peakPerformanceFemaleCardBg from '../../images/PackagesPage/peak-performance-female-card-bg.png';
import peakPerformanceMaleCardBg from '../../images/PackagesPage/peak-performance-male-card-bg.png';
import elitePerformanceGradient from '../../images/PackagesPage/Gradient.svg';
import { getComplimentaryConsultationContent } from '../../utils/complimentaryConsultation';
import { getPackageGenderSuitability } from '../../utils/packageGenderIcon';
import {
  ComplimentaryConsultationPromoIcon,
  getPopularGenderBadges,
  normalizePackageTitle,
  PackageFaceCardMetrics,
  PackageFaceCardPricing,
  PackageFaceCardTitleRow,
} from './PackageFaceCard';

const isPeakPerformanceTitle = (pkg) => {
  const title = String(pkg?.title || pkg?.apiData?.package_name || '').trim().toLowerCase();
  return title.includes('peak performance');
};

export const isPeakPerformanceFemalePackage = (pkg) => (
  isPeakPerformanceTitle(pkg) && getPackageGenderSuitability(pkg) === 'female'
);

export const isPeakPerformanceMalePackage = (pkg) => (
  isPeakPerformanceTitle(pkg) && getPackageGenderSuitability(pkg) === 'male'
);

const PeakPerformancePackageCard = ({
  pkg,
  onOpenDetails,
  onBook,
}) => {
  const isFemale = isPeakPerformanceFemalePackage(pkg);
  const isMale = isPeakPerformanceMalePackage(pkg);
  const consultation = getComplimentaryConsultationContent(pkg?.apiData || pkg);
  const badges = getPopularGenderBadges(pkg);
  const displayTitle = normalizePackageTitle(pkg?.title || pkg?.apiData?.package_name) || null;
  const cardBg = isFemale ? peakPerformanceFemaleCardBg : peakPerformanceMaleCardBg;

  const cardClassName = [
    'packages-card',
    'packages-card--elite-performance',
    'packages-card--peak-performance',
    isFemale ? 'packages-card--peak-performance-female' : '',
    isMale ? 'packages-card--peak-performance-male' : '',
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
            <ComplimentaryConsultationPromoIcon />
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
                  <div className="packages-card__elite-badges">
                    {badges.map((badge, index) => (
                      <span key={`${pkg.id}-peak-badge-${index}`} className="packages-card__elite-badge">
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

export default PeakPerformancePackageCard;
