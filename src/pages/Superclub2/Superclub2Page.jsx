import React, { useEffect, useLayoutEffect, useRef } from 'react';
import Header from '../../components/HomePage/Header';
import NavBar from '../../components/NavBar';
import './Superclub2Page.css';

import imgPaddle2 from '../../images/Superclub2/Paddle 2.svg';
import imgCycling from '../../images/Superclub2/Cycling.svg';
import imgRunning from '../../images/Superclub2/Running.svg';
import imgBadminton from '../../images/Superclub2/Badminton2.svg';
import imgYoga from '../../images/Superclub2/Yoga2.svg';
import imgPilates from '../../images/Superclub2/Pilates.svg';
import imgGym from '../../images/Superclub2/Gym.svg';
import imgFootball from '../../images/Superclub2/Football.svg';
import imgCricket from '../../images/Superclub2/Cricket (1).svg';
import imgMeditation from '../../images/Superclub2/Meditation.svg';
import { preloadSuperclub2TileImages } from '../../utils/superclub2ImagePreload';

preloadSuperclub2TileImages();

/** One duplicated slab (half of the stacked track) scrolls by in this many ms. */
const SUPERCLUB2_MARQUEE_LOOP_MS = 14000;

/**
 * Decorative background only — do not tie to prefers-reduced-motion, or many Windows
 * / Android “turn off animations” settings hide it entirely while the rest of the app animates.
 */
const MARQUEE_ALWAYS_RUN = true;

/**
 * Super Club “homepage” grid + early-access card (Figma node 4568:17681).
 * Uses SVGs from `src/images/Superclub2/`.
 */
const TILES = [
  { id: 'padel-1', title: 'Padel Games', src: imgPaddle2, col: '1 / 3', row: '1 / 3', variant: 'gradient-bottom' },
  { id: 'hyrox', title: 'Hyrox Base', src: imgCycling, col: '1 / 3', row: '3 / 4', variant: 'overlay' },
  { id: 'running', title: 'Running', src: imgRunning, col: '1 / 3', row: '4 / 6', variant: 'gradient-bottom' },
  { id: 'badminton-1', title: 'Badminton', src: imgBadminton, col: '3 / 5', row: '1 / 2', variant: 'overlay' },
  { id: 'yoga', title: 'Yoga Flow', src: imgYoga, col: '3 / 5', row: '2 / 4', variant: 'gradient-bottom' },
  { id: 'pilates', title: 'Pilates', src: imgPilates, col: '3 / 5', row: '4 / 5', variant: 'overlay' },
  { id: 'strength-r', title: 'Strength Training', src: imgGym, col: '3 / 5', row: '5 / 6', variant: 'overlay' },
  { id: 'strength-l', title: 'Strength Training', src: imgGym, col: '1 / 3', row: '6 / 7', variant: 'overlay' },
  { id: 'cricket', title: 'Turf Cricket', src: imgCricket, col: '3 / 4', row: '6 / 7', variant: 'accent' },
  { id: 'meditation', title: 'Meditation', src: imgMeditation, col: '4 / 5', row: '6 / 8', variant: 'accent-tall' },
  { id: 'functional', title: 'Functional Training', src: imgFootball, col: '1 / 4', row: '7 / 8', variant: 'accent-wide' },
  { id: 'badminton-2', title: 'Badminton', src: imgBadminton, col: '3 / 5', row: '8 / 9', variant: 'overlay' },
  { id: 'padel-2', title: 'Padel Games', src: imgPaddle2, col: '1 / 3', row: '8 / 9', variant: 'gradient-bottom' },
];

function SportMasonryGrid({ slabKey }) {
  return (
    <div className="superclub2__grid">
      {TILES.map((tile) => (
        <article
          key={`${tile.id}-${slabKey}`}
          className={`superclub2__tile superclub2__tile--${tile.variant}`}
          style={{ gridColumn: tile.col, gridRow: tile.row }}
        >
          <div className="superclub2__tile-media">
            <img src={tile.src} alt="" className="superclub2__tile-img" draggable={false} loading="eager" decoding="async" />
          </div>
          {tile.variant === 'gradient-bottom' ? <div className="superclub2__tile-shade superclub2__tile-shade--bottom" aria-hidden /> : null}
          {tile.variant === 'overlay' ? <div className="superclub2__tile-shade superclub2__tile-shade--flat" aria-hidden /> : null}
          {(tile.variant === 'accent' || tile.variant === 'accent-tall' || tile.variant === 'accent-wide') ? (
            <div className="superclub2__tile-shade superclub2__tile-shade--accent" aria-hidden />
          ) : null}
          <div className="superclub2__tile-label-wrap">
            <span className="superclub2__tile-label">{tile.title}</span>
          </div>
          <div className="superclub2__tile-rim" aria-hidden />
        </article>
      ))}
    </div>
  );
}

export default function Superclub2Page({
  userName = 'there',
  onMenuClick,
  onNavigateHome,
  onNavigateToDoctors,
  onNavigateToPackages,
  onJoinEarlyAccess,
}) {
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  const marqueeRef = useRef(null);

  /** Pixel rAF marquee: half of track height = one slab (two identical slabs stacked). */
  useLayoutEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    let rafId = 0;
    let lastT = performance.now();
    let offsetPx = 0;
    let loopPx = 400;

    const measureLoopPx = () => {
      void marquee.offsetHeight;
      const total = marquee.scrollHeight;
      if (total > 24) {
        loopPx = Math.max(24, Math.round(total / 2));
        return;
      }
      const first = marquee.firstElementChild;
      if (first instanceof HTMLElement) {
        const h = Math.max(first.offsetHeight, Math.round(first.getBoundingClientRect().height));
        if (h > 24) loopPx = h;
      }
      if (loopPx < 24) {
        loopPx = Math.max(400, Math.round(window.innerHeight || 640));
      }
    };

    const stop = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      marquee.style.removeProperty('transform');
    };

    const frame = (t) => {
      measureLoopPx();
      const dt = Math.min(48, Math.max(0, t - lastT));
      lastT = t;

      let lp = loopPx;
      if (!Number.isFinite(lp) || lp < 24) lp = 400;

      const speed = lp / SUPERCLUB2_MARQUEE_LOOP_MS;
      offsetPx -= speed * dt;
      if (!Number.isFinite(offsetPx)) offsetPx = 0;
      while (offsetPx <= -lp) offsetPx += lp;
      while (offsetPx > 0) offsetPx -= lp;

      marquee.style.transform = `translate3d(0, ${Math.round(offsetPx * 100) / 100}px, 0)`;
      rafId = requestAnimationFrame(frame);
    };

    const start = () => {
      stop();
      offsetPx = 0;
      lastT = performance.now();
      measureLoopPx();
      rafId = requestAnimationFrame(frame);
    };

    const mq = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

    const arm = () => {
      if (!MARQUEE_ALWAYS_RUN && mq?.matches) {
        stop();
        return;
      }
      requestAnimationFrame(() => {
        measureLoopPx();
        start();
      });
    };

    arm();

    const ro = new ResizeObserver(() => {
      measureLoopPx();
    });
    ro.observe(marquee);

    const onMq = () => {
      offsetPx = 0;
      arm();
    };
    mq?.addEventListener('change', onMq);

    return () => {
      mq?.removeEventListener('change', onMq);
      ro.disconnect();
      stop();
    };
  }, []);

  const handleNav = (itemId) => {
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
    if (itemId === 'super-club') {
      return;
    }
  };

  return (
    <div className="superclub2">
      <div className="superclub2__ambient" aria-hidden="true">
        <div className="superclub2__ambient-gradient" />
      </div>

      <div className="superclub2__bg-strip" aria-hidden="true">
        <div className="superclub2__bg-strip-viewport">
          <div className="superclub2__marquee" ref={marqueeRef}>
            <div className="superclub2__marquee-slab">
              <SportMasonryGrid slabKey="a" />
            </div>
            <div className="superclub2__marquee-slab">
              <SportMasonryGrid slabKey="b" />
            </div>
          </div>
        </div>
      </div>

      <div className="superclub2__top">
        <Header name={userName} onMenuClick={onMenuClick} showGreeting={false} />
        <button type="button" className="superclub2__search" aria-label="Search">
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

      <main className="superclub2__main">
        <div className="superclub2__modal" role="dialog" aria-labelledby="superclub2-modal-title">
          <div className="superclub2__modal-glass" />
          <div className="superclub2__modal-inner">
            <h2 id="superclub2-modal-title" className="superclub2__modal-title">
              Your personalized sports playlist is coming soon.
            </h2>
            <p className="superclub2__modal-body">
              From Hyrox to Pilates workshops, Padel, and Pickleball, find your next game.
            </p>
            <button type="button" className="superclub2__modal-cta" onClick={() => onJoinEarlyAccess?.()}>
              Join Early Access
            </button>
          </div>
        </div>
      </main>

      <NavBar defaultActive="super-club" onNavigate={handleNav} />
    </div>
  );
}
