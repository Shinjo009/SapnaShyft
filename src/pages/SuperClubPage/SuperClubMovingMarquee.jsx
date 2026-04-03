import React, { useEffect, useMemo, useState } from 'react';
import { ROUND_MARQUEE_ICONS } from './superClubRoundMarqueeIcons';
import marqueeEllipseGlow from '../../images/Superclub/marquee-ellipse-glow.svg';

const PATTERN_A = [0, 1, 2, 3, 4, 5, 6, 0, 2, 4, 6, 1];
const PATTERN_B = [3, 5, 1, 6, 0, 4, 2, 5, 3, 1, 4, 0];

const MARQUEE_DURATION_SEC = 48;

/** Top + bottom highlight indices whose icon kinds differ (never same Round icon glowing together). */
function pickDistinctHighlightIndices() {
  const lenA = PATTERN_A.length;
  const lenB = PATTERN_B.length;
  const orderTop = Array.from({ length: lenA }, (_, i) => i).sort(() => Math.random() - 0.5);

  for (const top of orderTop) {
    const kindTop = PATTERN_A[top];
    const bottomCandidates = [];
    for (let b = 0; b < lenB; b += 1) {
      if (PATTERN_B[b] !== kindTop) {
        bottomCandidates.push(b);
      }
    }
    if (bottomCandidates.length > 0) {
      const bottom = bottomCandidates[Math.floor(Math.random() * bottomCandidates.length)];
      return [top, bottom];
    }
  }

  const top = Math.floor(Math.random() * lenA);
  let bottom = Math.floor(Math.random() * lenB);
  let guard = 0;
  while (PATTERN_B[bottom] === PATTERN_A[top] && guard < lenB) {
    bottom = (bottom + 1) % lenB;
    guard += 1;
  }
  return [top, bottom];
}

function MarqueeSlot({ kind, active }) {
  return (
    <div className="super-club-marquee__slot">
      {active ? (
        <div className="super-club-marquee__active-ellipse" aria-hidden>
          <img src={marqueeEllipseGlow} alt="" width={243} height={243} draggable={false} />
        </div>
      ) : null}
      <div className={`super-club-marquee__orb${active ? ' super-club-marquee__orb--active' : ''}`}>
        <img
          src={ROUND_MARQUEE_ICONS[kind]}
          alt=""
          className="super-club-marquee__orb-img"
          draggable={false}
        />
      </div>
    </div>
  );
}

function PatternRow({ pattern, activeIndex, rowClassName, keyPrefix }) {
  const half = useMemo(() => pattern.map((kind, i) => ({ kind, i })), [pattern]);

  return (
    <div className={`super-club-marquee__row${rowClassName ? ` ${rowClassName}` : ''}`}>
      <div className="super-club-marquee__half" aria-hidden={false}>
        {half.map(({ kind, i }) => (
          <MarqueeSlot key={`${keyPrefix}-h1-${i}`} kind={kind} active={activeIndex === i} />
        ))}
      </div>
      <div className="super-club-marquee__half" aria-hidden>
        {half.map(({ kind, i }) => (
          <MarqueeSlot key={`${keyPrefix}-h2-${i}`} kind={kind} active={activeIndex === i} />
        ))}
      </div>
    </div>
  );
}

/** Single scroll strip so both rows share one translate speed; bottom row uses transform for stagger. */
export default function SuperClubMovingMarquee() {
  const [activeTop, setActiveTop] = useState(null);
  const [activeBottom, setActiveBottom] = useState(null);

  useEffect(() => {
    const tick = () => {
      const [top, bottom] = pickDistinctHighlightIndices();
      setActiveTop(top);
      setActiveBottom(bottom);
    };
    tick();
    const id = setInterval(tick, 700 + Math.random() * 500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="super-club-marquee" aria-hidden>
      <div className="super-club-marquee__track">
        <div
          className="super-club-marquee__content"
          style={{ animationDuration: `${MARQUEE_DURATION_SEC}s` }}
        >
          <div className="super-club-marquee__segment">
            <PatternRow pattern={PATTERN_A} activeIndex={activeTop} keyPrefix="a" />
            <PatternRow
              pattern={PATTERN_B}
              activeIndex={activeBottom}
              rowClassName="super-club-marquee__row--bottom"
              keyPrefix="b"
            />
          </div>
          <div className="super-club-marquee__segment" aria-hidden>
            <PatternRow pattern={PATTERN_A} activeIndex={activeTop} keyPrefix="a2" />
            <PatternRow
              pattern={PATTERN_B}
              activeIndex={activeBottom}
              rowClassName="super-club-marquee__row--bottom"
              keyPrefix="b2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
