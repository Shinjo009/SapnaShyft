import React from 'react';
import supershyftCoreCardBg from '../../images/PackagesPage/supershyft-core-card-bg.png';
import supershyftCorePlusCardBg from '../../images/PackagesPage/supershyft-core-plus-card-bg.png';
import elitePerformanceFemaleDiscountIcon from '../../images/PackagesPage/elite-performance-female-discount-icon.png';
import elitePerformanceGradient from '../../images/PackagesPage/Gradient.svg';
import packagesArrowIcon from '../../images/PackagesPage/Packages arrow.svg';
import { getComplimentaryConsultationContent } from '../../utils/complimentaryConsultation';
import {
  getPopularGenderBadges,
  normalizePackageTitle,
  PackageFaceCardMetrics,
  PackageFaceCardPricing,
} from './PackageFaceCard';

const getPackageTitle = (pkg) => String(pkg?.title || pkg?.apiData?.package_name || '').trim().toLowerCase();

export const isSupershyftCorePlusPackage = (pkg) => {
  const title = getPackageTitle(pkg);
  return /supershyft\s*core\s*\+|supershyft\s*core\s*plus|core\s*\+/.test(title);
};

export const isSupershyftCorePackage = (pkg) => {
  if (isSupershyftCorePlusPackage(pkg)) {
    return false;
  }

  const title = getPackageTitle(pkg);
  return /supershyft\s*core\b/.test(title)
    || (title.includes('supershyft') && /\bcore\b/.test(title));
};

export const isSupershyftCoreFamilyPackage = (pkg) => (
  isSupershyftCorePackage(pkg) || isSupershyftCorePlusPackage(pkg)
);

const SupershyftCorePackageCard = ({
  pkg,
  onOpenDetails,
  onBook,
}) => {
  const isCorePlus = isSupershyftCorePlusPackage(pkg);
  const consultation = getComplimentaryConsultationContent(pkg?.apiData || pkg);
  const badges = getPopularGenderBadges(pkg);
  const displayTitle = normalizePackageTitle(pkg?.title || pkg?.apiData?.package_name) || null;
  const cardBg = isCorePlus ? supershyftCorePlusCardBg : supershyftCoreCardBg;

  const cardClassName = [
    'packages-card',
    'packages-card--elite-performance',
    isCorePlus ? 'packages-card--supershyft-core-plus' : 'packages-card--supershyft-core',
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
                  <div className="packages-card__elite-badges">
                    {badges.map((badge, index) => (
                      <span key={`${pkg.id}-core-badge-${index}`} className="packages-card__elite-badge">
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

export default SupershyftCorePackageCard;
