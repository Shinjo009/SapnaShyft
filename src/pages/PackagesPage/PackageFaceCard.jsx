import React from 'react';
import elitePerformanceFemaleDiscountIcon from '../../images/PackagesPage/elite-performance-female-discount-icon.png';
import elitePerformanceGradient from '../../images/PackagesPage/Gradient.svg';
import packagesArrowIcon from '../../images/PackagesPage/Packages arrow.svg';
import { getComplimentaryConsultationContent } from '../../utils/complimentaryConsultation';
import {
  buildPackageFaceBadges,
  hasCardDisplayValue,
  normalizePackageTitle,
} from '../../utils/diagnosticPackageCardMapper';

export { normalizePackageTitle };

export const MISSING_VALUE = '-';

export const getPackageTitle = (pkg) => String(pkg?.title || pkg?.apiData?.package_name || '').trim().toLowerCase();

export const formatFaceCardPrice = (value) => {
  if (!Number.isFinite(Number(value)) || Number(value) <= 0) {
    return null;
  }

  return `₹${Number(value).toLocaleString('en-IN')}`;
};

export const getVisibleCardMetrics = (metrics) => (
  [
    { key: 'parameters', value: metrics?.parameters, label: 'Parameters' },
    { key: 'reportsIn', value: metrics?.reportsIn, label: 'Reports in' },
    { key: 'fasting', value: metrics?.fasting, label: 'Fasting' },
  ].filter((metric) => hasCardDisplayValue(metric.value))
);

const getCardClassName = (classPrefix, suffix) => (
  classPrefix === 'packages-card'
    ? `packages-card__${suffix}`
    : `${classPrefix}-${suffix}`
);

export const PackageFaceCardMetrics = ({ metrics, classPrefix = 'packages-card__elite' }) => {
  const visibleMetrics = getVisibleCardMetrics(metrics);

  if (visibleMetrics.length === 0) {
    return null;
  }

  return (
    <div className={getCardClassName(classPrefix, 'metrics')}>
      {visibleMetrics.map((metric, index) => (
        <React.Fragment key={metric.key}>
          {index > 0 ? (
            <div className={getCardClassName(classPrefix, 'metric-separator')} aria-hidden="true" />
          ) : null}
          <div className={getCardClassName(classPrefix, 'metric')}>
            <span className={getCardClassName(classPrefix, 'metric-value')}>{metric.value}</span>
            <span className={getCardClassName(classPrefix, 'metric-label')}>{metric.label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export const PackageFaceCardPricing = ({
  pricing,
  classPrefix = 'packages-card__elite',
}) => {
  const priceNow = formatFaceCardPrice(pricing?.now);
  const priceOld = formatFaceCardPrice(pricing?.old);
  const offText = hasCardDisplayValue(pricing?.off) ? pricing.off : null;

  if (!priceNow && !priceOld && !offText) {
    return null;
  }

  return (
    <div className={getCardClassName(classPrefix, 'price-wrap')}>
      {priceNow || offText ? (
        <div className={getCardClassName(classPrefix, 'price-top')}>
          {priceNow ? <span className={getCardClassName(classPrefix, 'price-now')}>{priceNow}</span> : null}
          {offText ? <span className={getCardClassName(classPrefix, 'off-pill')}>{offText}</span> : null}
        </div>
      ) : null}
      {priceOld ? <span className={getCardClassName(classPrefix, 'price-old')}>{priceOld}</span> : null}
    </div>
  );
};

export const getGenderLabel = (pkg) => {
  const title = getPackageTitle(pkg);
  const gender = String(pkg?.apiData?.gender_suitability || '').trim().toLowerCase();

  if (gender === 'male' || /♂|\bmale\b/i.test(title)) {
    return 'Male';
  }

  if (gender === 'female' || /♀|female/i.test(title)) {
    return 'Female';
  }

  return null;
};

export const isFemalePackage = (pkg) => getGenderLabel(pkg) === 'Female';
export const isMalePackage = (pkg) => getGenderLabel(pkg) === 'Male';

export const getPopularGenderBadges = (pkg) => {
  const mappedBadges = Array.isArray(pkg?.badges)
    ? pkg.badges.filter((badge) => badge && badge !== MISSING_VALUE)
    : [];

  if (mappedBadges.length > 0) {
    return mappedBadges;
  }

  const apiPkg = pkg?.apiData && typeof pkg.apiData === 'object' ? pkg.apiData : pkg;
  return buildPackageFaceBadges(apiPkg);
};

const PackageFaceCard = ({
  pkg,
  cardBg,
  cardClassName,
  badges,
  displayTitle,
  onOpenDetails,
  onBook,
}) => {
  const consultation = getComplimentaryConsultationContent(pkg?.apiData || pkg);

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
        <img src={cardBg} alt="" className="packages-card__elite-photo-image" loading="lazy" decoding="async" />
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
                      <span key={`${pkg.id}-face-badge-${index}`} className="packages-card__elite-badge">
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

export default PackageFaceCard;
