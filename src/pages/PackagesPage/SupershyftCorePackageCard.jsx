import React from 'react';
import supershyftCoreCardBg from '../../images/PackagesPage/supershyft-core-card-bg.png';
import supershyftCorePlusCardBg from '../../images/PackagesPage/supershyft-core-plus-card-bg.png';
import elitePerformanceGradient from '../../images/PackagesPage/Gradient.svg';
import { getComplimentaryConsultationContent } from '../../utils/complimentaryConsultation';
import {
  getPopularGenderBadges,
  normalizePackageTitle,
  PackageFaceCardDetails,
  PackageFaceCardPricing,
  PackageFaceCardTitleRow,
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

export default SupershyftCorePackageCard;
