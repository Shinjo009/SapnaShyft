import React, { useEffect, useRef } from 'react';

const LOGICAL_SIZE = 600;
const BASE_NUM_LINES = 122;
const BASE_SEGS = 468;
const DESKTOP_MIN_WIDTH_PX = 769;

/**
 * Topographic orb — calm motion; line colours follow metabolic risk band (same ranges as legacy Orb).
 */
export default function MetabolicAgeOrb2({ className = '', riskBand = 0 }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const riskBandRef = useRef(riskBand);
  riskBandRef.current = Math.min(3, Math.max(0, riskBand | 0));

  const renderProfileRef = useRef({
    scale: 1,
    numLines: BASE_NUM_LINES,
    segs: BASE_SEGS,
    visible: true,
    perfScale: 1,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return undefined;

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return undefined;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
    if (typeof ctx.imageSmoothingQuality !== 'undefined') {
      ctx.imageSmoothingQuality = 'high';
    }

    const SIZE = LOGICAL_SIZE;
    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const RADIUS = 252;

    const syncCanvasResolution = () => {
      const cssSize = Math.max(1, Math.round(Math.min(root.clientWidth, root.clientHeight) || 252));
      const isDesktop = typeof window !== 'undefined'
        && window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH_PX}px)`).matches;
      const deviceDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

      const targetDpr = isDesktop
        ? Math.min(3, Math.max(2.25, deviceDpr))
        : Math.min(1.75, Math.max(1, deviceDpr * 0.92));

      const profile = renderProfileRef.current;
      const maxBuffer = isDesktop ? 1080 : 520;
      const bufferSize = Math.min(
        maxBuffer,
        Math.max(280, Math.round(cssSize * targetDpr * profile.perfScale)),
      );
      const scale = bufferSize / SIZE;

      profile.scale = scale;
      const detailFactor = Math.min(1.12, Math.max(0.74, scale / 2.05));
      profile.numLines = Math.max(96, Math.round(BASE_NUM_LINES * detailFactor));
      profile.segs = Math.max(320, Math.round(BASE_SEGS * detailFactor));

      const nextWidth = Math.round(SIZE * scale);
      const nextHeight = Math.round(SIZE * scale);
      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }
    };

    syncCanvasResolution();

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => {
        syncCanvasResolution();
      })
      : null;
    resizeObserver?.observe(root);

    const intersectionObserver = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(
        (entries) => {
          renderProfileRef.current.visible = entries.some((entry) => entry.isIntersecting);
        },
        { root: null, threshold: 0.05 },
      )
      : null;
    intersectionObserver?.observe(root);

    /** Global volume — very small so mean radius stays ~constant. */
    function slowBreath(bx, by, bz, t) {
      const w =
        Math.sin(bx * 0.58 + bz * 0.45 + t * 0.55) * Math.cos(by * 0.52 - t * 0.42) * 0.5 +
        Math.sin((bx + by + bz) * 0.35 + t * 0.32) * 0.32;
      return Math.max(-1, Math.min(1, w));
    }

    /**
     * Outline “tension”: wavy but bounded — reads as liquid silk held in a circle.
     */
    function edgeWobble(theta, phi, t) {
      const a = Math.sin(theta * 2.12 + t * 0.48) * Math.cos(phi * 2.28 - t * 0.36);
      const b = Math.sin(theta * 3.35 - phi * 1.75 + t * 0.58) * 0.52;
      const c = Math.cos(theta * 1.05 + phi * 3.05 + t * 0.28) * Math.sin(phi * 1.95) * 0.42;
      return Math.max(-1, Math.min(1, (a + b + c) * 0.36));
    }

    /** Main wind + traveling billow. */
    function clothWind(bx, by, bz, tIn, tOut) {
      const u = bx * 1.05 + bz * 0.96;
      const v = bx * 0.4 - bz * 1.08 + by * 0.56;
      const angle = Math.atan2(bz, bx);
      const spiral =
        Math.sin(angle * 2.45 + by * 2.05 - tIn * 1.55 + tOut * 0.12) *
        Math.cos(by * 1.65 + angle * 0.85 + tIn * 0.82);
      const billow =
        Math.sin(u * 3.32 - tIn * 1.62 + tOut * 0.16) * Math.cos(by * 2.02 + tIn * 0.68 + tOut * 0.2);
      const fold =
        Math.sin(u * 6.45 - tIn * 2.55) * 0.42 * Math.sin(v * 2.72 + tIn * 1.38);
      const ripple =
        Math.sin(bx * 5.2 + tIn * 2.35) * Math.cos(bz * 4.65 - tIn * 2.05) * 0.34 +
        Math.sin(bz * 5.75 - tIn * 2.75 + bx * 1.15) * Math.cos(by * 3.05 + tIn * 1.85) * 0.2;
      return billow * 0.52 + spiral * 0.34 + fold + ripple;
    }

    /** Moving creases / pinch zones (folding). */
    function foldCrease(bx, by, bz, tIn, tOut) {
      const g1 = bx * 1.08 + by * 0.52 + bz * 0.92;
      const g2 = bx * 0.52 - by * 1.02 + bz * 0.78;
      const c1 =
        Math.sin(g1 * 5.45 - tIn * 2.15 + tOut * 0.18) * Math.cos(g2 * 3.15 + tIn * 1.28);
      const c2 = Math.sin(g1 * 8.0 - tIn * 3.05) * 0.36 * Math.sin(by * 3.95 + tIn * 1.68);
      const c3 = Math.sin(g2 * 6.2 + tIn * 2.4) * Math.cos(bx * 4.1 - tIn * 1.92) * 0.24;
      return c1 * 0.55 + c2 + c3;
    }

    /** Latitude-aware swirl (vortex-like U-shapes in the lines). */
    function spiralFold(theta, phi, tIn, tOut) {
      return (
        Math.sin(theta * 2.75 + phi * 3.1 - tIn * 1.45 + tOut * 0.11) *
          Math.cos(phi * 1.68 + theta * 1.15 + tIn * 0.95) +
        Math.sin(theta * 4.2 - phi * 2.4 + tIn * 1.92) * 0.38 * Math.sin(phi * 2.8 - tIn * 1.35)
      );
    }

    /**
     * Same idea as legacy `bandToRgb` + displacement norm: green / yellow / orange / red ramps.
     */
    function rgbForBandAndNorm(band, norm) {
      const b = Math.min(3, Math.max(0, band | 0));
      const n = Math.max(0, Math.min(1, norm));

      if (b === 0) {
        if (n < 0.28) {
          const t2 = n / 0.28;
          return { cr: 0, cg: Math.round(40 + t2 * 75), cb: Math.round(8 + t2 * 18) };
        }
        if (n < 0.55) {
          const t2 = (n - 0.28) / 0.27;
          return { cr: 0, cg: Math.round(115 + t2 * 100), cb: Math.round(26 + t2 * 74) };
        }
        if (n < 0.76) {
          const t2 = (n - 0.55) / 0.21;
          return { cr: Math.round(t2 * 55), cg: Math.round(215 + t2 * 35), cb: Math.round(100 + t2 * 135) };
        }
        const t2 = Math.min(1, (n - 0.76) / 0.24);
        return { cr: Math.round(55 + t2 * 190), cg: 250, cb: Math.round(235 + t2 * 20) };
      }

      if (b === 1) {
        if (n < 0.28) {
          const t2 = n / 0.28;
          return { cr: Math.round(48 + t2 * 52), cg: Math.round(42 + t2 * 78), cb: Math.round(14 + t2 * 32) };
        }
        if (n < 0.55) {
          const t2 = (n - 0.28) / 0.27;
          return {
            cr: Math.round(100 + t2 * 85),
            cg: Math.round(120 + t2 * 62),
            cb: Math.round(46 + t2 * 38),
          };
        }
        if (n < 0.76) {
          const t2 = (n - 0.55) / 0.21;
          return {
            cr: Math.round(185 + t2 * 28),
            cg: Math.round(182 + t2 * 28),
            cb: Math.round(84 + t2 * 42),
          };
        }
        const t2 = Math.min(1, (n - 0.76) / 0.24);
        return { cr: Math.round(213 + t2 * 32), cg: Math.round(210 + t2 * 35), cb: Math.round(126 + t2 * 88) };
      }

      if (b === 2) {
        if (n < 0.28) {
          const t2 = n / 0.28;
          return { cr: Math.round(62 + t2 * 58), cg: Math.round(32 + t2 * 48), cb: Math.round(10 + t2 * 22) };
        }
        if (n < 0.55) {
          const t2 = (n - 0.28) / 0.27;
          return {
            cr: Math.round(120 + t2 * 72),
            cg: Math.round(80 + t2 * 42),
            cb: Math.round(32 + t2 * 28),
          };
        }
        if (n < 0.76) {
          const t2 = (n - 0.55) / 0.21;
          return {
            cr: Math.round(192 + t2 * 38),
            cg: Math.round(122 + t2 * 38),
            cb: Math.round(60 + t2 * 32),
          };
        }
        const t2 = Math.min(1, (n - 0.76) / 0.24);
        return { cr: Math.round(230 + t2 * 25), cg: Math.round(160 + t2 * 85), cb: Math.round(92 + t2 * 118) };
      }

      if (n < 0.28) {
        const t2 = n / 0.28;
        return { cr: Math.round(52 + t2 * 48), cg: Math.round(4 + t2 * 12), cb: Math.round(4 + t2 * 12) };
      }
      if (n < 0.55) {
        const t2 = (n - 0.28) / 0.27;
        return { cr: Math.round(100 + t2 * 52), cg: Math.round(16 + t2 * 32), cb: Math.round(16 + t2 * 32) };
      }
      if (n < 0.76) {
        const t2 = (n - 0.55) / 0.21;
        return { cr: Math.round(152 + t2 * 48), cg: Math.round(48 + t2 * 42), cb: Math.round(48 + t2 * 42) };
      }
      const t2 = Math.min(1, (n - 0.76) / 0.24);
      return { cr: Math.round(200 + t2 * 55), cg: Math.round(90 + t2 * 110), cb: Math.round(90 + t2 * 110) };
    }

    function innerNoise(x, y, t) {
      const w1 = Math.sin(x * 1.58 - t * 3.15 + y * 0.88) * Math.cos(y * 0.98 + t * 2.25) * 0.52;
      const w2 = Math.sin(x * 3.28 + t * 2.35) * Math.cos(y * 2.58 - t * 1.92) * 0.28;
      const w3 = Math.sin(x * 6.35 - t * 4.0 + y * 1.58) * Math.cos(y * 5.15 + t * 3.35) * 0.12;
      const w4 = Math.sin(x * 0.74 + t * 1.38) * Math.cos(y * 0.54 - t * 1.0) * 0.65;
      const w5 = Math.sin(x * 8.4 + t * 3.65 - y * 2.0) * Math.cos(y * 6.8 - t * 3.35) * 0.032;
      return w1 + w2 + w3 + w4 + w5;
    }

    function draw(tOuter, tInner) {
      const profile = renderProfileRef.current;
      const drawScale = profile.scale;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(drawScale, 0, 0, drawScale, 0, 0);

      const tInnerWave = tInner * 0.9;
      const NUM_LINES = profile.numLines;
      const SEGS = profile.segs;

      const focalX = cx - RADIUS * 0.32;
      const focalY = cy + RADIUS * 0.2;

      for (let li = 0; li <= NUM_LINES; li += 1) {
        const phi = (li / NUM_LINES) * Math.PI;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        if (sinPhi < 0.001) continue;

        const linePhase = (li / NUM_LINES) * Math.PI * 4;

        const points = [];

        for (let si = 0; si <= SEGS; si += 1) {
          const theta = (si / SEGS) * Math.PI * 2;

          const bx = sinPhi * Math.cos(theta);
          const by = cosPhi;
          const bz = sinPhi * Math.sin(theta);

          const breath = slowBreath(bx, by, bz, tOuter);
          const edge = edgeWobble(theta, phi, tOuter);
          const rSphere = RADIUS * (1.0 + breath * 0.02 + edge * 0.048);

          const cloth = clothWind(bx, by, bz, tInnerWave, tOuter);
          const crease = foldCrease(bx, by, bz, tInnerWave, tOuter);
          const innerFine = innerNoise(
            bx * 2.82 + bz * 1.62 + linePhase * 0.085,
            by * 2.52 + linePhase * 0.118,
            tInnerWave,
          );

          const swirl = spiralFold(theta, phi, tInnerWave, tOuter);
          const totalDisp = cloth * 0.48 + crease * 0.28 + innerFine * 0.34 + swirl * 0.18;

          const innerDrape = innerNoise(bx * 2.02 + linePhase * 0.068, by * 1.52 + 5.0, tInnerWave);

          const yDrape =
            cloth * 30 * sinPhi +
            crease * 20 * sinPhi +
            swirl * 17 * sinPhi +
            innerDrape * 18 * sinPhi;

          const shear =
            (cloth * 0.55 + crease * 0.35 + innerFine * 0.25) *
            sinPhi *
            Math.sin(theta * 2.05 + phi * 1.15 + tInnerWave * 0.72) *
            9.5;

          const wx = rSphere * sinPhi * Math.cos(theta) + shear;
          const wy = rSphere * cosPhi + yDrape;
          const wz = rSphere * sinPhi * Math.sin(theta);

          const tilt = 0.18;
          const projY = wy * Math.cos(tilt) - wz * Math.sin(tilt);
          const projZ = wy * Math.sin(tilt) + wz * Math.cos(tilt);

          points.push({ x: cx + wx, y: cy + projY, z: projZ, disp: totalDisp });
        }

        for (let si = 0; si < points.length - 1; si += 1) {
          const p0 = points[si];
          const p1 = points[si + 1];

          const avgZ = (p0.z + p1.z) / 2;
          const avgDisp = (p0.disp + p1.disp) / 2;

          if (avgZ < -RADIUS * 0.88) continue;

          const depthAlpha = Math.max(0, (avgZ + RADIUS) / (RADIUS * 1.75));
          const norm = Math.max(0, Math.min(1, (avgDisp + 1.65) / 3.3));

          let { cr, cg, cb } = rgbForBandAndNorm(riskBandRef.current, norm);

          const midX = (p0.x + p1.x) * 0.5;
          const midY = (p0.y + p1.y) * 0.5;
          const lx = (midX - cx) / RADIUS;
          const ly = (midY - cy) / RADIUS;
          let faceLight = Math.max(0, Math.min(1, 0.36 + (-lx) * 0.44 + ly * 0.38));

          const distF = Math.hypot(midX - focalX, midY - focalY) / (RADIUS * 1.05);
          const focalGlow = Math.max(0, Math.min(1, 1.12 - distF * 1.08));
          faceLight = Math.min(1, faceLight * 0.42 + focalGlow * 0.68);

          cr = Math.min(255, Math.round(cr + (255 - cr) * 0.8 * faceLight));
          cg = Math.min(255, Math.round(cg + (255 - cg) * 0.72 * faceLight));
          cb = Math.min(255, Math.round(cb + (255 - cb) * 0.62 * faceLight));

          const dim = 0.58 + 0.42 * (1 - faceLight * 0.9);
          cr = Math.round(cr * dim);
          cg = Math.round(cg * dim);
          cb = Math.round(cb * dim);

          const alpha = Math.min(0.98, depthAlpha * (0.56 + norm * 0.78));

          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.strokeStyle = `rgba(${cr},${cg},${cb},${alpha})`;
          ctx.lineWidth = 0.66;
          ctx.stroke();
        }
      }
    }

    /**
     * Time-based target phase + light exponential smoothing (frame-rate independent).
     * Eats micro-jitter when fps wobbles; tracks a little faster than before for readability.
     */
    const OUTER_SPEED = 0.072;
    const INNER_SPEED = 1.05;
    const SMOOTH_OMEGA = 8.2;
    let startMs = 0;
    let lastMs = 0;
    let smoothOuter = 0;
    let smoothInner = 0;
    const frameDurations = [];
    let perfCooldownUntil = 0;

    function animate(nowMs) {
      if (startMs === 0) {
        startMs = nowMs;
        lastMs = nowMs;
      }

      let dtSec = (nowMs - lastMs) / 1000;
      lastMs = nowMs;
      if (dtSec > 0.14) dtSec = 0.14;

      const elapsedSec = (nowMs - startMs) / 1000;
      const targetOuter = elapsedSec * OUTER_SPEED;
      const targetInner = elapsedSec * INNER_SPEED;

      const blend = 1 - Math.exp(-SMOOTH_OMEGA * dtSec);
      smoothOuter += (targetOuter - smoothOuter) * blend;
      smoothInner += (targetInner - smoothInner) * blend;

      const profile = renderProfileRef.current;
      if (profile.visible) {
        draw(smoothOuter, smoothInner);

        frameDurations.push(dtSec);
        if (frameDurations.length > 24) {
          frameDurations.shift();
        }

        if (nowMs > perfCooldownUntil && frameDurations.length >= 12) {
          const avgFrame = frameDurations.reduce((sum, value) => sum + value, 0) / frameDurations.length;
          const prevPerf = profile.perfScale;

          if (avgFrame > 0.024 && profile.perfScale > 0.82) {
            profile.perfScale = Math.max(0.82, profile.perfScale * 0.94);
          } else if (avgFrame < 0.015 && profile.perfScale < 1) {
            profile.perfScale = Math.min(1, profile.perfScale * 1.03);
          }

          if (Math.abs(prevPerf - profile.perfScale) > 0.02) {
            syncCanvasResolution();
            perfCooldownUntil = nowMs + 1200;
          }
        }
      }

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
      }}
    >
      <canvas
        ref={canvasRef}
        className="metabolic-orb__canvas-surface"
        style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
        aria-hidden
      />
    </div>
  );
}
