import React, { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import Header from '../../components/HomePage/Header';
import NavBar from '../../components/NavBar';
import { buildPlaylistCardsFromSelection } from './superclubPlaylistFromSelection';
import line365 from '../../images/Superclub2/Line 365.svg';
import line368 from '../../images/Superclub2/Line 368.svg';
import line363 from '../../images/Superclub2/Line 363.svg';
import bookmarkIcon from '../../images/Superclub2/playlist-tile-bookmark.svg';
import './SuperclubPlaylistConfirmPage.css';

/** Figma 4558:17391 — tile sizes 159.5×159.5; `left` keeps fan overlap; one shared `top` so wave crest/trough align on screen. */
const FAN_SLOT_TOP_PX = 35;
const FAN_SLOTS = [
  { slot: 'tile5', left: 321.05, top: FAN_SLOT_TOP_PX, z: 1, shell: 't5' },
  { slot: 'tile10', left: -21.95, top: FAN_SLOT_TOP_PX, z: 2, shell: 't10' },
  { slot: 'tile2', left: 89.05, top: FAN_SLOT_TOP_PX, z: 3, shell: 't2' },
  { slot: 'tile7', left: 208.05, top: FAN_SLOT_TOP_PX, z: 4, shell: 't7' },
];

const SLOT_ORDER = ['tile5', 'tile10', 'tile2', 'tile7'];

const SLOT_LEFT_PX = Object.fromEntries(FAN_SLOTS.map((s) => [s.slot, s.left]));

function cardForSlot(slotId, cards) {
  const n = Math.min(cards.length, 4);
  if (n <= 0) return null;
  const firstIdx = 4 - n;
  const idx = SLOT_ORDER.indexOf(slotId);
  if (idx < firstIdx) return null;
  return cards[idx - firstIdx];
}

function parseMarqueeDurationMs(cssValue) {
  const raw = (cssValue || '').trim();
  if (!raw) return 22000;
  const n = parseFloat(raw);
  if (Number.isNaN(n) || n <= 0) return 22000;
  if (raw.endsWith('ms')) return n;
  return n * 1000;
}

function playlistFanTiles(cards, idSuffix, listItem) {
  return FAN_SLOTS.map(({ slot, left, top, z, shell }) => {
    const card = cardForSlot(slot, cards);
    if (!card) return null;
    return (
      <article
        key={`${slot}-${idSuffix}`}
        data-pc-slot={slot}
        data-pc-slab={idSuffix}
        className={`superclub-pc__tile superclub-pc__tile--${shell}`}
        style={{ left, top, zIndex: z }}
        role={listItem ? 'listitem' : undefined}
      >
        <div className="superclub-pc__tile-motion">
          <div className="superclub-pc__tile-media">
            <img src={card.image} alt="" className="superclub-pc__tile-img" draggable={false} loading="lazy" />
          </div>
          <div className="superclub-pc__tile-ghost" aria-hidden>
            <img src={card.image} alt="" className="superclub-pc__tile-ghost-img" draggable={false} />
          </div>
          <div className="superclub-pc__tile-grad-a" aria-hidden />
          <div className="superclub-pc__tile-grad-b" aria-hidden />
          <div className="superclub-pc__tile-body">
            <p className="superclub-pc__tile-cat">{shell === 't5' ? 'Sport' : card.category}</p>
            <p className="superclub-pc__tile-title">{card.title}</p>
            <p className="superclub-pc__tile-sub">{card.subtitle}</p>
          </div>
          {shell === 't5' ? (
            <div className="superclub-pc__tile-bookmark" aria-hidden>
              <img src={bookmarkIcon} alt="" width={16} height={16} />
            </div>
          ) : null}
          <div className="superclub-pc__tile-rim" aria-hidden />
        </div>
      </article>
    );
  });
}

/**
 * Post–early-access playlist confirmation (Figma 4558:17284).
 */
export default function SuperclubPlaylistConfirmPage({
  userName = 'there',
  playlistPayload = null,
  onMenuClick,
  onNavigateHome,
  onNavigateToDoctors,
  onNavigateToPackages,
  onNavigateToSuperClub,
  onStayUpdated,
}) {
  const cards = useMemo(() => buildPlaylistCardsFromSelection(playlistPayload || {}), [playlistPayload]);
  const fanMarqueeRef = useRef(null);
  const fanTrackRef = useRef(null);

  useLayoutEffect(() => {
    const root = fanMarqueeRef.current;
    const track = fanTrackRef.current;
    if (!root || !track || cards.length === 0) {
      return undefined;
    }

    track.getAnimations?.().forEach((a) => a.cancel());
    track.classList.remove('superclub-pc__fan-marquee-inner--css-fallback');

    const lanePxFromCss = () => {
      const raw = getComputedStyle(root).getPropertyValue('--pc-fan-w').trim();
      const n = parseFloat(raw);
      return Number.isFinite(n) && n > 0 ? n : 502.5;
    };

    let rafId = 0;
    let alive = true;
    let lanePx = lanePxFromCss();
    let durationMs = parseMarqueeDurationMs(getComputedStyle(root).getPropertyValue('--pc-marquee-duration'));
    const t0 = performance.now();

    const syncMetrics = () => {
      lanePx = lanePxFromCss();
      durationMs = parseMarqueeDurationMs(getComputedStyle(root).getPropertyValue('--pc-marquee-duration'));
    };

    const clearTileWave = () => {
      track.querySelectorAll('article[data-pc-slot]').forEach((el) => {
        el.style.removeProperty('transform');
      });
    };

    const TWO_PI = Math.PI * 2;
    const WAVE_AMP_PX = 18;
    const WAVE_LENGTH_PX = 220;
    const WAVE_TIME_HZ = 0.1;

    const frame = (now) => {
      if (!alive) return;
      const u = ((now - t0) % durationMs) / durationMs;
      const xTrack = (-1 + u) * lanePx;
      track.style.transform = `translate3d(${xTrack.toFixed(2)}px, 0, 0)`;

      const tSec = (now - t0) / 1000;
      const k = TWO_PI / WAVE_LENGTH_PX;
      track.querySelectorAll('article[data-pc-slot]').forEach((art) => {
        const slot = art.getAttribute('data-pc-slot');
        const slab = art.getAttribute('data-pc-slab');
        const slabOffset = slab === 'b' ? lanePx : 0;
        const leftPx = slot ? SLOT_LEFT_PX[slot] ?? 0 : 0;
        const sAlong = leftPx + slabOffset + xTrack;
        const phase = k * sAlong + TWO_PI * WAVE_TIME_HZ * tSec;
        const dy = WAVE_AMP_PX * Math.sin(phase);
        art.style.transform = `translate3d(0, ${dy.toFixed(2)}px, 0)`;
      });

      rafId = window.requestAnimationFrame(frame);
    };

    syncMetrics();
    rafId = window.requestAnimationFrame(frame);

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => syncMetrics()) : null;
    ro?.observe(root);

    return () => {
      alive = false;
      window.cancelAnimationFrame(rafId);
      ro?.disconnect();
      track.getAnimations?.().forEach((a) => a.cancel());
      track.style.removeProperty('transform');
      clearTileWave();
    };
  }, [cards.length, playlistPayload]);

  const handleNav = useCallback(
    (itemId) => {
      if (itemId === 'home' && onNavigateHome) {
        onNavigateHome();
        return;
      }
      if (itemId === 'super-sync' && onNavigateToDoctors) {
        onNavigateToDoctors();
        return;
      }
      if (itemId === 'packages' && onNavigateToPackages) {
        onNavigateToPackages();
        return;
      }
      if (itemId === 'super-club' && onNavigateToSuperClub) {
        onNavigateToSuperClub();
      }
    },
    [onNavigateHome, onNavigateToDoctors, onNavigateToPackages, onNavigateToSuperClub]
  );

  const handleStay = useCallback(() => {
    if (onStayUpdated) {
      onStayUpdated();
      return;
    }
    onNavigateHome?.();
  }, [onStayUpdated, onNavigateHome]);

  return (
    <div className="superclub-pc">
      <div className="superclub-pc__top">
        <Header name={userName} onMenuClick={onMenuClick} />
        <button type="button" className="superclub-pc__search" aria-label="Search">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M10.5 18C14.6421 18 18 14.6421 18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18Z"
              stroke="white"
              strokeWidth="1.75"
            />
            <path d="M16 16L21 21" stroke="white" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <main className="superclub-pc__main">
        <div className="superclub-pc__col">
          <p className="superclub-pc__kicker">You&apos;ll love what&apos;s coming</p>

          <div className="superclub-pc__block">
            <div className="superclub-pc__copy">
              <h1 className="superclub-pc__headline">Those were some Interesting Choices!</h1>
              <p className="superclub-pc__lede">Something built for your active life is on its way.</p>
            </div>

            <div className={`superclub-pc__fan-wrap${cards.length === 0 ? ' superclub-pc__fan-wrap--collapsed' : ''}`}>
              {cards.length === 0 ? (
                <p className="superclub-pc__empty">Select sports on the previous screen to build your playlist preview.</p>
              ) : (
                <>
                  <div className="superclub-pc__lines" aria-hidden>
                    <img src={line365} alt="" className="superclub-pc__fan-line superclub-pc__fan-line--365" draggable={false} />
                    <img src={line368} alt="" className="superclub-pc__fan-line superclub-pc__fan-line--368" draggable={false} />
                    <img src={line363} alt="" className="superclub-pc__fan-line superclub-pc__fan-line--363" draggable={false} />
                  </div>
                  <div ref={fanMarqueeRef} className="superclub-pc__fan superclub-pc__fan--marquee">
                    <div ref={fanTrackRef} className="superclub-pc__fan-marquee-inner">
                      <div className="superclub-pc__fan-slab" role="list" aria-label="Your selected sports">
                        {playlistFanTiles(cards, 'a', true)}
                      </div>
                      <div className="superclub-pc__fan-slab" aria-hidden="true">
                        {playlistFanTiles(cards, 'b', false)}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="superclub-pc__cta-margin">
              <button type="button" className="superclub-pc__cta" onClick={handleStay}>
                Stay Updated
              </button>
            </div>
          </div>
        </div>
      </main>

      <NavBar defaultActive="super-club" onNavigate={handleNav} />
    </div>
  );
}
