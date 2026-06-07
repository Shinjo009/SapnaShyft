import React from 'react';
import './SuperCarePlanCard.css';

/**
 * Super Care consult plan card — hero image, stats row, pricing + CTA.
 */
export default function SuperCarePlanCard({
  title,
  subtitle,
  imageSrc,
  metrics,
  priceNow,
  priceOld,
  discountLabel,
  onViewPlan,
  ariaLabel,
}) {
  return (
    <article className="supercare-plan-card" aria-label={ariaLabel || title}>
      <div className="supercare-plan-card__hero">
        <img className="supercare-plan-card__image" src={imageSrc} alt="" aria-hidden="true" />
        <div className="supercare-plan-card__copy">
          <h2 className="supercare-plan-card__title">{title}</h2>
          <p className="supercare-plan-card__subtitle">{subtitle}</p>
        </div>
      </div>

      <div className="supercare-plan-card__metrics" aria-label="Plan highlights">
        {metrics.map((metric, index) => (
          <div key={`${metric.value}-${metric.label}`} className="supercare-plan-card__metric">
            <span className="supercare-plan-card__metric-value">{metric.value}</span>
            <span className="supercare-plan-card__metric-label">{metric.label}</span>
            {index < metrics.length - 1 ? (
              <span className="supercare-plan-card__metric-separator" aria-hidden="true" />
            ) : null}
          </div>
        ))}
      </div>

      <div className="supercare-plan-card__price-row">
        <div className="supercare-plan-card__price-wrap">
          <div className="supercare-plan-card__price-top">
            <span className="supercare-plan-card__price-now">₹ {priceNow}</span>
            {discountLabel ? (
              <span className="supercare-plan-card__off-pill">{discountLabel}</span>
            ) : null}
          </div>
          {priceOld ? (
            <span className="supercare-plan-card__price-old">₹ {priceOld}</span>
          ) : null}
        </div>

        <button type="button" className="supercare-plan-card__cta" onClick={onViewPlan}>
          View Plan
        </button>
      </div>
    </article>
  );
}
