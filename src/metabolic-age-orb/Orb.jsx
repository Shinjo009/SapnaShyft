import { useRef, useEffect, useCallback } from "react";

// Outer limit of the center fade (fraction of blob radius). Inner clarity is mostly from the gradient stops below.
const DEFAULT_CENTER_HOLE_RADIUS = 0.72;
const MAX_CENTER_HOLE_RADIUS = 0.92;

const defaultConfig = {
  size: 500,
  baseColor: "rgba(30, 45, 55, 1)",
  amberGlowColor: "rgba(200, 140, 30, 0.8)",
  blueGlowColor: "rgba(120, 130, 220, 0.7)",
  tealTintColor: "rgba(80, 130, 110, 0.5)",
  darkCoreColor: "rgba(10, 15, 20, 0.9)",
  ringColor: "rgba(180, 180, 170, 0.15)",
  outerRingColor: "rgba(210, 200, 170, 0.35)",
  orbitalRingCount: 3,
  starCount: 30,
  starColor: "rgba(220, 220, 210, 0.7)",
  amberGlowX: 0.35,
  amberGlowY: 0.55,
  amberGlowRadius: 0.3,
  blueGlowX: 0.62,
  blueGlowY: 0.42,
  blueGlowRadius: 0.35,
  outerRingGap: 10,
  rotationSpeed: 0.65,
  ageGap: 0,
  /** Outer radius of the center fade (fraction of orb radius). */
  centerHoleRadius: DEFAULT_CENTER_HOLE_RADIUS
};

const withAlpha = (rgba, alpha) =>
  rgba.replace(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/, `rgba($1, $2, $3, ${alpha})`);

const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;

const darken = ([r, g, b], factor) => [
  Math.max(0, Math.round(r * factor)),
  Math.max(0, Math.round(g * factor)),
  Math.max(0, Math.round(b * factor))
];

const getRiskBand = (ageGap) => {
  if (ageGap <= 0) return 0; // green
  if (ageGap <= 4) return 1; // yellow
  if (ageGap <= 8) return 2; // orange
  return 3; // red
};

function drawBlobPath(ctx, cx, cy, radius, t) {
  const points = 96;
  for (let i = 0; i <= points; i += 1) {
    const a = (i / points) * Math.PI * 2;
    // Multi-wave wobble creates a liquid blob silhouette.
    const wobble =
      1
      + 0.018 * Math.sin(a * 2.0 + t * 1.0)
      + 0.012 * Math.sin(a * 3.0 - t * 0.8)
      + 0.008 * Math.sin(a * 5.0 + t * 1.2);
    const r = radius * wobble;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawOrb(ctx, config, rotation) {
  const { size } = config;
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - config.outerRingGap * 2) / 2 - 4;
  const riskBand = getRiskBand(config.ageGap ?? 0);
  // One phase for clip + outer edge so the silhouette never "slides" apart (avoids a dark seam).
  const blobPhase = rotation * 5.0;

  ctx.clearRect(0, 0, size, size);
  const greenRgb = [144, 223, 158]; // #90DF9E
  const yellowRgb = [218, 193, 90]; // #DAC15A
  const orangeRgb = [238, 139, 72]; // #EE8B48 (for 5-8 range)
  const redRgb = [136, 8, 8]; // #880808
  const activeToneRgb =
    riskBand === 0 ? greenRgb
      : riskBand === 1 ? yellowRgb
        : riskBand === 2 ? orangeRgb
          : redRgb;
  const activeTint = activeToneRgb;

  // Intentionally do NOT draw the extra outermost ring stroke.
  // (We only render the orb body + inner edge/gloss.)

  ctx.save();
  ctx.beginPath();
  drawBlobPath(ctx, cx, cy, radius, blobPhase);
  ctx.clip();

  ctx.fillStyle = config.baseColor;
  ctx.fillRect(0, 0, size, size);

  const tealGrad = ctx.createRadialGradient(cx * 1.1, cy * 0.9, 0, cx, cy, radius);
  tealGrad.addColorStop(0, config.tealTintColor);
  tealGrad.addColorStop(1, "transparent");
  ctx.fillStyle = tealGrad;
  ctx.fillRect(0, 0, size, size);

  const ax = config.amberGlowX * size;
  const ay = config.amberGlowY * size;
  const ar = config.amberGlowRadius * size;
  const amberGrad = ctx.createRadialGradient(ax, ay, 0, ax, ay, ar);
  amberGrad.addColorStop(0, config.amberGlowColor);
  amberGrad.addColorStop(0.6, withAlpha(config.amberGlowColor, 0.3));
  amberGrad.addColorStop(1, "transparent");
  ctx.fillStyle = amberGrad;
  ctx.fillRect(0, 0, size, size);

  const coreGrad = ctx.createRadialGradient(cx * 0.9, cy * 1.05, 0, cx, cy, radius * 0.5);
  coreGrad.addColorStop(0, config.darkCoreColor);
  coreGrad.addColorStop(1, "transparent");
  ctx.fillStyle = coreGrad;
  ctx.fillRect(0, 0, size, size);

  const bx = config.blueGlowX * size;
  const by = config.blueGlowY * size;
  const br = config.blueGlowRadius * size;
  const blueGrad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
  blueGrad.addColorStop(0, config.blueGlowColor);
  blueGrad.addColorStop(0.5, withAlpha(config.blueGlowColor, 0.3));
  blueGrad.addColorStop(1, "transparent");
  ctx.fillStyle = blueGrad;
  ctx.fillRect(0, 0, size, size);

  const bottomWash = ctx.createRadialGradient(cx * 1.0, cy * 1.5, 0, cx, cy * 1.3, radius * 0.6);
  bottomWash.addColorStop(
    0,
    rgba(activeToneRgb[0], activeToneRgb[1], activeToneRgb[2], riskBand === 3 ? 0.38 : riskBand >= 2 ? 0.32 : 0.26)
  );
  bottomWash.addColorStop(1, "transparent");
  ctx.fillStyle = bottomWash;
  ctx.fillRect(0, 0, size, size);

  // Always-on health shades (match the reference spread); intensity follows riskBand below.

  // Soft full-orb wash so the active health range reads clearly at a glance.
  const washGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.92);
  washGrad.addColorStop(0, rgba(activeToneRgb[0], activeToneRgb[1], activeToneRgb[2], riskBand >= 2 ? 0.14 : 0.10));
  washGrad.addColorStop(0.55, rgba(activeToneRgb[0], activeToneRgb[1], activeToneRgb[2], riskBand >= 2 ? 0.08 : 0.05));
  washGrad.addColorStop(1, "transparent");
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = washGrad;
  ctx.fillRect(0, 0, size, size);

  const tones = [
    // Same spread, but all tones switch to the active range color.
    // radii are fractions of canvas size to match the "yellow blob" feel.
    { key: "shade-a", rgb: activeToneRgb, x: 0.72, y: 0.62, radius: 0.30, baseAlpha: 0.34 }, // right/lower
    { key: "shade-b", rgb: activeToneRgb, x: 0.50, y: 0.58, radius: 0.27, baseAlpha: 0.30 }, // center
    { key: "shade-c", rgb: activeToneRgb, x: 0.82, y: 0.50, radius: 0.33, baseAlpha: 0.34 }  // right/upper
  ];

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  tones.forEach((tone) => {
    let radiusScale = 1.0;
    // Whole-orb tinting by range — higher bands read as more urgent.
    let alphaScale = riskBand === 3 ? 1.42 : riskBand === 2 ? 1.32 : riskBand === 1 ? 1.22 : 1.18;
    let darkenFactor = riskBand === 3 ? 0.62 : riskBand === 2 ? 0.68 : riskBand === 1 ? 0.74 : 0.78;
    if (riskBand === 3) radiusScale = 1.14;
    if (riskBand === 2) radiusScale = 1.06;

    const [dr, dg, db] = darkenFactor < 1 ? darken(tone.rgb, darkenFactor) : tone.rgb;

    const gx = tone.x * size;
    const gy = tone.y * size;
    // Use size-based radius so the blobs match the soft "yellow" glow shape.
    const gr = size * tone.radius * radiusScale;
    // Keep tones visible at all times.
    const a0 = Math.min(0.96, tone.baseAlpha * alphaScale);
    const a1 = Math.min(0.62, tone.baseAlpha * alphaScale * 0.62);

    const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
    grad.addColorStop(0, rgba(dr, dg, db, a0));
    // Match the "yellow blob" falloff curve.
    grad.addColorStop(0.60, rgba(dr, dg, db, a1));
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  });
  ctx.restore();

  // Glass tint bloom across the body (adds premium shiny depth).
  const glassBloom = ctx.createRadialGradient(cx * 1.05, cy * 0.88, radius * 0.12, cx, cy, radius * 1.05);
  glassBloom.addColorStop(0, "rgba(220, 235, 255, 0.14)");
  glassBloom.addColorStop(0.45, "rgba(190, 214, 255, 0.08)");
  glassBloom.addColorStop(1, "transparent");
  ctx.fillStyle = glassBloom;
  ctx.fillRect(0, 0, size, size);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  for (let i = 0; i < config.orbitalRingCount; i += 1) {
    const ringRadius = radius * (0.42 + i * 0.19);
    ctx.beginPath();
    ctx.ellipse(0, 0, ringRadius, ringRadius * 0.95, (i * Math.PI) / 8, 0, Math.PI * 2);
    ctx.strokeStyle = config.ringColor;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  ctx.restore();

  const seededRandom = (seed) => {
    const x = Math.sin(seed * 127.1) * 43758.5453;
    return x - Math.floor(x);
  };
  for (let i = 0; i < config.starCount; i += 1) {
    const angle = seededRandom(i) * Math.PI * 2;
    const dist = seededRandom(i + 100) * radius * 0.9;
    const sx = cx + Math.cos(angle + rotation * 0.5) * dist;
    const sy = cy + Math.sin(angle + rotation * 0.5) * dist;
    const sr = seededRandom(i + 200) * 2.5 + 0.5;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = config.starColor;
    ctx.fill();
  }

  // Main specular hotspot (top-left).
  const specGrad = ctx.createRadialGradient(cx * 0.68, cy * 0.30, 0, cx * 0.7, cy * 0.38, radius * 0.30);
  specGrad.addColorStop(0, "rgba(245, 250, 255, 0.28)");
  specGrad.addColorStop(0.35, "rgba(220, 235, 255, 0.14)");
  specGrad.addColorStop(1, "transparent");
  ctx.fillStyle = specGrad;
  ctx.fillRect(0, 0, size, size);

  // Colored "glass glow" above the specular hotspot for pop.
  // Uses activeTint so green/red feel more vivid.
  // If red is active, shift the tint away from the top-left so red doesn't create
  // a "corner" highlight. (Your other colors/shades remain unchanged.)
  const tintCx = riskBand === 3 ? cx * 0.78 : cx * 0.69;
  const tintCy = riskBand === 3 ? cy * 0.52 : cy * 0.33;
  const tintCx2 = riskBand === 3 ? cx * 0.80 : cx * 0.70;
  const tintCy2 = riskBand === 3 ? cy * 0.56 : cy * 0.40;
  const tintR = riskBand === 3 ? radius * 0.22 : radius * 0.26;
  const tintA0 = riskBand === 3 ? 0.34 : riskBand === 2 ? 0.40 : riskBand === 1 ? 0.38 : 0.36;
  const tintA1 = riskBand === 3 ? 0.18 : riskBand === 2 ? 0.22 : 0.24;

  const tintGrad = ctx.createRadialGradient(tintCx, tintCy, 0, tintCx2, tintCy2, tintR);
  tintGrad.addColorStop(0, rgba(activeTint[0], activeTint[1], activeTint[2], tintA0));
  tintGrad.addColorStop(0.45, rgba(activeTint[0], activeTint[1], activeTint[2], tintA1));
  tintGrad.addColorStop(1, "transparent");
  ctx.fillStyle = tintGrad;
  ctx.fillRect(0, 0, size, size);

  // Soft inner rim reflection to make edge feel glass-thick.
  const innerRim = ctx.createRadialGradient(cx, cy, radius * 0.58, cx, cy, radius * 1.02);
  innerRim.addColorStop(0, "transparent");
  innerRim.addColorStop(0.72, "rgba(195, 215, 240, 0.04)");
  innerRim.addColorStop(1, "rgba(230, 240, 255, 0.18)");
  ctx.fillStyle = innerRim;
  ctx.fillRect(0, 0, size, size);

  ctx.restore();

  // Edge shading: avoid near-black (reads as a "black border"); match blob phase to clip.
  ctx.beginPath();
  drawBlobPath(ctx, cx, cy, radius, blobPhase);
  const edgeGrad = ctx.createRadialGradient(cx, cy, radius * 0.78, cx, cy, radius);
  edgeGrad.addColorStop(0, "transparent");
  edgeGrad.addColorStop(0.88, "transparent");
  edgeGrad.addColorStop(
    0.96,
    rgba(
      Math.round(activeToneRgb[0] * 0.45),
      Math.round(activeToneRgb[1] * 0.45),
      Math.round(activeToneRgb[2] * 0.45),
      riskBand >= 2 ? 0.22 : 0.14
    )
  );
  edgeGrad.addColorStop(1, "rgba(32, 48, 62, 0.22)");
  ctx.fillStyle = edgeGrad;
  ctx.fill();

  // Final soft rim — no harsh dark outline.
  ctx.beginPath();
  drawBlobPath(ctx, cx, cy, radius * 0.998, blobPhase);
  ctx.strokeStyle = "rgba(236, 244, 255, 0.22)";
  ctx.lineWidth = 0.85;
  ctx.stroke();

  // Center “donut hole”: destination-out alpha must stay high across most of holeR or the clear area
  // stays tiny even when holeR is large (old stops dropped to ~0.4 alpha by 28% of holeR).
  const holeFrac = Math.min(
    MAX_CENTER_HOLE_RADIUS,
    Math.max(0.14, config.centerHoleRadius ?? DEFAULT_CENTER_HOLE_RADIUS)
  );
  const holeR = radius * holeFrac;
  ctx.save();
  ctx.beginPath();
  drawBlobPath(ctx, cx, cy, radius, blobPhase);
  ctx.clip();
  ctx.globalCompositeOperation = "destination-out";

  // Fully open core (guarantees a large truly transparent disc, not a pinprick).
  const coreR = holeR * 0.30;
  ctx.fillStyle = "rgba(255, 255, 255, 1)";
  ctx.beginPath();
  ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
  ctx.fill();

  // Feather from core edge to holeR so color smokes back in at the rim only.
  const holeGrad = ctx.createRadialGradient(cx, cy, coreR * 0.98, cx, cy, holeR);
  holeGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
  holeGrad.addColorStop(0.22, "rgba(255, 255, 255, 0.72)");
  holeGrad.addColorStop(0.48, "rgba(255, 255, 255, 0.32)");
  holeGrad.addColorStop(0.72, "rgba(255, 255, 255, 0.09)");
  holeGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = holeGrad;
  ctx.fillRect(0, 0, size, size);

  ctx.restore();
}

export { defaultConfig };

export default function Orb({ config, className = "" }) {
  const canvasRef = useRef(null);
  const rotationRef = useRef(0);
  const animRef = useRef(0);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    rotationRef.current += config.rotationSpeed * 0.005;
    drawOrb(ctx, config, rotationRef.current);
    animRef.current = requestAnimationFrame(animate);
  }, [config]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    canvas.width = config.size;
    canvas.height = config.size;
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [config, animate]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: config.size, height: config.size }}
    />
  );
}
