import React from 'react';
import elitePerformanceFemaleCardBg from '../../images/PackagesPage/elite-performance-female-card-bg.png';
import elitePerformanceFemaleDiscountIcon from '../../images/PackagesPage/elite-performance-female-discount-icon.png';
import elitePerformanceMaleCardBg from '../../images/PackagesPage/elite-performance-male-card-bg.png';
import elitePerformanceGradient from '../../images/PackagesPage/Gradient.svg';
import packagesArrowIcon from '../../images/PackagesPage/Packages arrow.svg';
import { getComplimentaryConsultationContent } from '../../utils/complimentaryConsultation';
import {
  getPopularGenderBadges,
  normalizePackageTitle,
  PackageFaceCardMetrics,
  PackageFaceCardPricing,
} from './PackageFaceCard';

export const isElitePerformanceFemalePackage = (pkg) => {
  const title = String(pkg?.title || pkg?.apiData?.package_name || '').trim().toLowerCase();
  if (!title.includes('elite performance')) {
    return false;
  }

  const gender = String(pkg?.apiData?.gender_suitability || '').trim().toLowerCase();
  if (gender === 'male' || /♂|\bmale\b/i.test(title)) {
    return false;
  }

  return gender === 'female' || /♀|female/i.test(title);
};

export const isElitePerformanceMalePackage = (pkg) => {
  const title = String(pkg?.title || pkg?.apiData?.package_name || '').trim().toLowerCase();
  if (!title.includes('elite performance')) {
    return false;
  }

  const gender = String(pkg?.apiData?.gender_suitability || '').trim().toLowerCase();
  if (gender === 'female' || /♀|female/i.test(title)) {
    return false;
  }

  return gender === 'male' || /♂|\bmale\b/i.test(title);
};

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
  const cardBg = isFemale ? elitePerformanceMaleCardBg : elitePerformanceFemaleCardBg;
  const discountIcon = elitePerformanceFemaleDiscountIcon;

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

      {consultation ? (
        <div className="packages-card__elite-promo">
          <span className="packages-card__elite-promo-icon-wrap" aria-hidden="true">
            <img
              src={discountIcon}
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
                  <div className="packages-card__elite-badges">
                    {badges.map((badge, index) => (
                      <span key={`${pkg.id}-elite-badge-${index}`} className="packages-card__elite-badge">
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

export default ElitePerformancePackageCard;
