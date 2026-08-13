import React from 'react';
import elitePerformanceGradient from '../../images/PackagesPage/Gradient.svg';
import packagesArrowIcon from '../../images/PackagesPage/Packages arrow.svg';
import { getComplimentaryConsultationContent } from '../../utils/complimentaryConsultation';
import {
  buildPackageFaceBadges,
  hasCardDisplayValue,
  normalizePackageTitle,
} from '../../utils/diagnosticPackageCardMapper';
import {
  getPackageGenderIconSrc,
  getPackageGenderSuitability,
} from '../../utils/packageGenderIcon';

export { normalizePackageTitle };

export const MISSING_VALUE = '-';

export const ComplimentaryConsultationPromoIcon = () => (
  <svg
    className="packages-card__elite-promo-icon"
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M8.99238 2.44343C8.86732 2.30376 8.71421 2.19203 8.54305 2.11554C8.37189 2.03905 8.18652 1.99951 7.99905 1.99951C7.81157 1.99951 7.6262 2.03905 7.45504 2.11554C7.28388 2.19203 7.13077 2.30376 7.00571 2.44343L6.53905 2.96476C6.40567 3.11376 6.24049 3.23085 6.05574 3.30736C5.87098 3.38387 5.67138 3.41784 5.47171 3.40676L4.77171 3.36809C4.58448 3.35777 4.39718 3.38706 4.22204 3.45404C4.0469 3.52102 3.88785 3.6242 3.75529 3.75682C3.62273 3.88944 3.51963 4.04854 3.45273 4.22371C3.38583 4.39889 3.35664 4.5862 3.36705 4.77343L3.40571 5.47276C3.41669 5.67231 3.38267 5.87178 3.30616 6.05642C3.22965 6.24105 3.11262 6.40612 2.96371 6.53943L2.44238 7.00609C2.3026 7.13115 2.19078 7.2843 2.11422 7.45552C2.03766 7.62675 1.99809 7.8122 1.99809 7.99976C1.99809 8.18732 2.03766 8.37277 2.11422 8.54399C2.19078 8.71522 2.3026 8.86836 2.44238 8.99343L2.96371 9.46009C3.11271 9.59347 3.2298 9.75865 3.30631 9.9434C3.38282 10.1282 3.41679 10.3278 3.40571 10.5274L3.36705 11.2274C3.35673 11.4147 3.38601 11.602 3.45299 11.7771C3.51998 11.9522 3.62315 12.1113 3.75577 12.2438C3.8884 12.3764 4.04749 12.4795 4.22267 12.5464C4.39784 12.6133 4.58515 12.6425 4.77238 12.6321L5.47171 12.5934C5.67127 12.5824 5.87074 12.6165 6.05537 12.693C6.24001 12.7695 6.40508 12.8865 6.53838 13.0354L7.00505 13.5568C7.13011 13.6965 7.28325 13.8084 7.45448 13.8849C7.6257 13.9615 7.81115 14.001 7.99871 14.001C8.18627 14.001 8.37172 13.9615 8.54295 13.8849C8.71417 13.8084 8.86732 13.6965 8.99238 13.5568L9.45905 13.0354C9.59242 12.8864 9.7576 12.7693 9.94236 12.6928C10.1271 12.6163 10.3267 12.5823 10.5264 12.5934L11.2264 12.6321C11.4136 12.6424 11.6009 12.6131 11.7761 12.5461C11.9512 12.4792 12.1102 12.376 12.2428 12.2434C12.3754 12.1107 12.4785 11.9516 12.5454 11.7765C12.6123 11.6013 12.6415 11.414 12.631 11.2268L12.5924 10.5274C12.5814 10.3279 12.6154 10.1284 12.6919 9.94377C12.7684 9.75913 12.8855 9.59406 13.0344 9.46076L13.5557 8.99409C13.6955 8.86903 13.8073 8.71588 13.8839 8.54466C13.9604 8.37344 14 8.18799 14 8.00043C14 7.81287 13.9604 7.62742 13.8839 7.45619C13.8073 7.28497 13.6955 7.13182 13.5557 7.00676L13.0344 6.54009C12.8854 6.40672 12.7683 6.24154 12.6918 6.05678C12.6153 5.87202 12.5813 5.67242 12.5924 5.47276L12.631 4.77276C12.6413 4.58558 12.6119 4.39836 12.5449 4.22329C12.4779 4.04823 12.3747 3.88927 12.2421 3.75678C12.1094 3.62429 11.9504 3.52126 11.7753 3.4544C11.6001 3.38754 11.4129 3.35836 11.2257 3.36876L10.5264 3.40743C10.3268 3.4184 10.1274 3.38438 9.94272 3.30788C9.75809 3.23137 9.59302 3.11433 9.45971 2.96543L8.99238 2.44343Z"
      stroke="currentColor"
      strokeWidth="1.33333"
    />
    <path
      d="M9.66406 6.3335H9.6574V6.34016H9.66406V6.3335ZM6.33073 9.66683H6.32406V9.6735H6.33073V9.66683Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M6 6L10 10"
      stroke="currentColor"
      strokeWidth="1.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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

export const PackageFaceCardConsultation = ({ consultation }) => {
  if (!consultation) {
    return null;
  }

  return (
    <div className="packages-card__elite-consult">
      <span className="packages-card__elite-consult-icon" aria-hidden="true">
        <ComplimentaryConsultationPromoIcon />
      </span>
      <span className="packages-card__elite-consult-label">{consultation.topPillLabel}</span>
    </div>
  );
};

export const PackageFaceCardDetails = ({ pkg, consultation }) => {
  const hasMetrics = getVisibleCardMetrics(pkg?.metrics).length > 0;
  if (!hasMetrics && !consultation) {
    return null;
  }

  return (
    <div className="packages-card__elite-details">
      <PackageFaceCardMetrics metrics={pkg.metrics} />
      <PackageFaceCardConsultation consultation={consultation} />
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
  const gender = getPackageGenderSuitability(pkg);
  if (gender === 'male') {
    return 'Male';
  }
  if (gender === 'female') {
    return 'Female';
  }
  return null;
};

export const isFemalePackage = (pkg) => getPackageGenderSuitability(pkg) === 'female';
export const isMalePackage = (pkg) => getPackageGenderSuitability(pkg) === 'male';

export const PackageFaceCardTitleRow = ({
  pkg,
  displayTitle,
  onOpenDetails,
}) => {
  const gender = getPackageGenderSuitability(pkg);
  const genderIconSrc = getPackageGenderIconSrc(pkg);

  return (
    <div className="packages-card__elite-title-row">
      <div className="packages-card__elite-title-group">
        {displayTitle ? (
          <h2 className="packages-card__elite-title">{displayTitle}</h2>
        ) : null}
        {genderIconSrc ? (
          <img
            src={genderIconSrc}
            alt=""
            aria-hidden="true"
            className={[
              'packages-card__elite-gender-icon',
              gender === 'male' ? 'packages-card__elite-gender-icon--male' : '',
              gender === 'female' ? 'packages-card__elite-gender-icon--female' : '',
            ].filter(Boolean).join(' ')}
          />
        ) : null}
      </div>
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
  );
};

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

export default PackageFaceCard;
