import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './AppTooltipTour.css';

const TOUR_STEPS = [
  {
    id: 'home-profile',
    page: 'home',
    text: 'Find your profile and the app settings here',
    target: '[data-tour="home-profile"]',
    placement: 'bottom-right',
  },
  {
    id: 'home-health-score',
    page: 'home',
    text: 'See your Health score details here',
    target: '[data-tour="home-health-see-more"]',
    placement: 'top-right',
  },
  {
    id: 'home-risk-analysis',
    page: 'home',
    text: 'See all the Health Areas and their Risk scores here',
    target: '[data-tour="home-risk-see-more"]',
    placement: 'top-right',
  },
  {
    id: 'home-blood-markers',
    page: 'home',
    text: 'See all the Blood markers and their details here',
    target: '[data-tour="home-blood-markers-see-more"]',
    placement: 'top-right',
  },
  {
    id: 'home-super-care',
    page: 'home',
    text: 'Find personalized expert consultations here',
    target: '[data-tour="nav-super-care"]',
    placement: 'top-left',
  },
  {
    id: 'home-packages',
    page: 'home',
    text: 'Explore personalized test packages here',
    target: '[data-tour="nav-packages"]',
    placement: 'top-left',
  },
  {
    id: 'profile-appointments',
    page: 'profile',
    text: 'View all your appointments and its details here',
    target: '[data-tour="profile-all-appointments-text"]',
    placement: 'top-left',
  },
  {
    id: 'profile-add-account',
    page: 'profile',
    text: 'Add multiple accounts linked to your profile',
    target: '[data-tour="profile-add-account-text"]',
    placement: 'top-left',
  },
  {
    id: 'profile-switch-account',
    page: 'profile',
    text: 'Go to different profiles by clicking on Switch',
    target: '[data-tour="profile-switch-account"]',
    placement: 'bottom-left',
    targetOffset: -2,
  },
  {
    id: 'risk-disease',
    page: 'disease-risk-analysis',
    text: 'Tap on the Diseases to get detailed insights',
    target: '[data-tour="risk-disease-item"]',
    placement: 'left-top',
  },
  {
    id: 'packages-custom',
    page: 'packages',
    text: 'Create customized packages here',
    target: '[data-tour="packages-custom"]',
    placement: 'bottom-left',
  },
  {
    id: 'package-details-cards',
    page: 'package-details',
    text: 'Click the cards for more information',
    target: '[data-tour="package-details-cards"]',
    placement: 'top-right',
  },
];

const getBubblePosition = (rect, placement, viewport) => {
  const margin = 12;
  const maxWidth = Math.min(192, viewport.width - margin * 2);
  const estimatedHeight = 144;

  let left = rect.left;
  let top = rect.top;

  if (placement === 'bottom-right') {
    left = rect.right - maxWidth;
    top = rect.bottom + 14;
  } else if (placement === 'top-right') {
    left = rect.right - maxWidth;
    top = rect.top - estimatedHeight - 14;
  } else if (placement === 'top-left') {
    left = rect.left;
    top = rect.top - estimatedHeight - 14;
  } else if (placement === 'left-top') {
    left = rect.left - maxWidth - 14;
    top = rect.top;
  } else {
    left = rect.left;
    top = rect.bottom + 14;
  }

  left = Math.max(margin, Math.min(left, viewport.width - maxWidth - margin));
  top = Math.max(margin, Math.min(top, viewport.height - estimatedHeight - margin));

  return { left, top, maxWidth };
};

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const getRectCenter = (rect) => ({
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2,
});

const getConnectionPointOnRect = (rect, towardPoint, outwardOffset = 0) => {
  const center = getRectCenter(rect);
  const dx = towardPoint.x - center.x;
  const dy = towardPoint.y - center.y;

  const halfWidth = Math.max(rect.width / 2, 1);
  const halfHeight = Math.max(rect.height / 2, 1);
  const scaledX = Math.abs(dx) / halfWidth;
  const scaledY = Math.abs(dy) / halfHeight;

  if (scaledX >= scaledY) {
    const side = dx >= 0 ? 1 : -1;
    const y = center.y + (dy / Math.max(Math.abs(dx), 1)) * halfWidth;
    return {
      x: center.x + side * (halfWidth + outwardOffset),
      y: clamp(y, rect.top + 4, rect.bottom - 4),
      side: side > 0 ? 'right' : 'left',
    };
  }

  const side = dy >= 0 ? 1 : -1;
  const x = center.x + (dx / Math.max(Math.abs(dy), 1)) * halfHeight;
  return {
    x: clamp(x, rect.left + 4, rect.right - 4),
    y: center.y + side * (halfHeight + outwardOffset),
    side: side > 0 ? 'bottom' : 'top',
  };
};

const getSideVector = (side) => {
  if (side === 'top') return { x: 0, y: -1 };
  if (side === 'right') return { x: 1, y: 0 };
  if (side === 'bottom') return { x: 0, y: 1 };
  return { x: -1, y: 0 };
};

const AppTooltipTour = ({ currentPage, enabled, scopeKey = 'global' }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [targetRect, setTargetRect] = useState(null);
  const [bubbleSize, setBubbleSize] = useState({ width: 192, height: 132 });
  const bubbleRef = useRef(null);

  const currentStep = TOUR_STEPS[currentStepIndex] || null;

  useEffect(() => {
    setCurrentStepIndex(0);
    setDismissed(false);
    setTargetRect(null);
  }, [scopeKey]);

  const isVisibleOnPage = useMemo(() => {
    if (!enabled || dismissed || !currentStep) {
      return false;
    }

    return currentStep.page === currentPage;
  }, [currentPage, currentStep, dismissed, enabled]);

  useLayoutEffect(() => {
    if (!isVisibleOnPage || !currentStep) {
      setTargetRect(null);
      return undefined;
    }

    let frameId = 0;
    let timeoutId = 0;
    let attempts = 0;
    const maxAttempts = 90;

    const updateTarget = () => {
      const targetElement = document.querySelector(currentStep.target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setTargetRect(rect);
        return;
      }

      attempts += 1;
      if (attempts < maxAttempts) {
        timeoutId = window.setTimeout(() => {
          frameId = window.requestAnimationFrame(updateTarget);
        }, 120);
      }
    };

    updateTarget();

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [currentStep, isVisibleOnPage]);

  useEffect(() => {
    if (!isVisibleOnPage || !currentStep) {
      return undefined;
    }

    const updatePosition = () => {
      const targetElement = document.querySelector(currentStep.target);
      if (!targetElement) {
        return;
      }

      const rect = targetElement.getBoundingClientRect();
      setTargetRect(rect);
    };

    const scrollContainer = document.querySelector('.app-scroll');
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', updatePosition);
    }

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', updatePosition);
      }
    };
  }, [currentStep, isVisibleOnPage]);

  useEffect(() => {
    if (!isVisibleOnPage || !currentStep) {
      return;
    }

    const targetElement = document.querySelector(currentStep.target);
    if (!targetElement) {
      return;
    }

    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  }, [currentStepIndex, currentStep, isVisibleOnPage]);

  useLayoutEffect(() => {
    if (!isVisibleOnPage || !bubbleRef.current) {
      return;
    }

    const measureBubble = () => {
      const rect = bubbleRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setBubbleSize((prev) => {
          if (Math.abs(prev.width - rect.width) < 0.5 && Math.abs(prev.height - rect.height) < 0.5) {
            return prev;
          }

          return {
            width: rect.width,
            height: rect.height,
          };
        });
      }
    };

    measureBubble();
    window.addEventListener('resize', measureBubble);

    return () => {
      window.removeEventListener('resize', measureBubble);
    };
  }, [currentStepIndex, isVisibleOnPage, targetRect]);

  if (!isVisibleOnPage || !targetRect || !currentStep) {
    return null;
  }

  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const bubble = getBubblePosition(targetRect, currentStep.placement, viewport);
  const spotlightPadding = 18;
  const spotlightSoftness = 22;
  const spotlightCenterX = clamp(targetRect.left + targetRect.width / 2, 0, viewport.width);
  const spotlightCenterY = clamp(targetRect.top + targetRect.height / 2, 0, viewport.height);
  const spotlightRx = Math.max(14, targetRect.width / 2 + spotlightPadding);
  const spotlightRy = Math.max(14, targetRect.height / 2 + spotlightPadding);
  const bubbleRect = {
    left: bubble.left,
    top: bubble.top,
    width: bubbleSize.width,
    height: bubbleSize.height,
    right: bubble.left + bubbleSize.width,
    bottom: bubble.top + bubbleSize.height,
  };

  const targetCenter = getRectCenter(targetRect);
  const bubbleCenter = getRectCenter(bubbleRect);

  // Hard-connect both ends to element borders.
  const arrowStart = getConnectionPointOnRect(bubbleRect, targetCenter, 0);
  const arrowEnd = getConnectionPointOnRect(targetRect, bubbleCenter, Number(currentStep.targetOffset || 0));

  const dx = arrowEnd.x - arrowStart.x;
  const dy = arrowEnd.y - arrowStart.y;
  const distance = Math.hypot(dx, dy);
  const handleLength = clamp(distance * 0.35, 18, 44);

  const startVector = getSideVector(arrowStart.side);
  const endVector = getSideVector(arrowEnd.side);

  const controlPoint1 = {
    x: arrowStart.x + startVector.x * handleLength,
    y: arrowStart.y + startVector.y * handleLength,
  };

  const controlPoint2 = {
    x: arrowEnd.x + endVector.x * handleLength,
    y: arrowEnd.y + endVector.y * handleLength,
  };

  const hasNext = currentStepIndex < TOUR_STEPS.length - 1;

  return (
    <div className="app-tooltip-tour" aria-live="polite">
      <div
        className="app-tooltip-tour__backdrop"
        style={{
          '--spotlight-x': `${spotlightCenterX}px`,
          '--spotlight-y': `${spotlightCenterY}px`,
          '--spotlight-rx': `${spotlightRx}px`,
          '--spotlight-ry': `${spotlightRy}px`,
          '--spotlight-rx-soft': `${spotlightRx + spotlightSoftness}px`,
          '--spotlight-ry-soft': `${spotlightRy + spotlightSoftness}px`,
        }}
        aria-hidden="true"
      />
      <svg className="app-tooltip-tour__arrow-layer" width="100%" height="100%" aria-hidden="true">
        <defs>
          <marker id="app-tooltip-arrowhead" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto">
            <path d="M0,0 L0,8 L7,4 z" fill="#CCC" />
          </marker>
        </defs>
        <path
          d={`M ${arrowStart.x} ${arrowStart.y} C ${controlPoint1.x} ${controlPoint1.y} ${controlPoint2.x} ${controlPoint2.y} ${arrowEnd.x} ${arrowEnd.y}`}
          className="app-tooltip-tour__arrow-path"
          markerEnd="url(#app-tooltip-arrowhead)"
        />
      </svg>

      <div
        ref={bubbleRef}
        className="app-tooltip-tour__bubble"
        style={{ left: `${bubble.left}px`, top: `${bubble.top}px`, maxWidth: `${bubble.maxWidth}px` }}
      >
        <p className="app-tooltip-tour__text">{currentStep.text}</p>
        <div className="app-tooltip-tour__actions">
          <button
            type="button"
            className="app-tooltip-tour__action-btn app-tooltip-tour__action-btn--skip"
            onClick={() => setDismissed(true)}
          >
            Skip
          </button>
          <button
            type="button"
            className="app-tooltip-tour__action-btn app-tooltip-tour__action-btn--next"
            onClick={() => {
              if (hasNext) {
                setCurrentStepIndex((prev) => prev + 1);
              } else {
                setDismissed(true);
              }
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppTooltipTour;
