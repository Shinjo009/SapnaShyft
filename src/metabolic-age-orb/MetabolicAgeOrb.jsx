import React, { useMemo } from "react";
import "./metabolic-age-orb.css";
import Orb, { defaultConfig } from "./Orb";

const parseAgeGapFromDetail = (detailText) => {
  const match = `${detailText || ""}`.match(/([\d.]+)\s*years?\s*(older|younger)/i);
  if (!match) return 0;
  const years = Number.parseFloat(match[1]);
  if (!Number.isFinite(years)) return 0;
  return match[2].toLowerCase() === "older" ? years : -years;
};

const toNumber = (value) => {
  const n = Number.parseFloat(`${value}`);
  return Number.isFinite(n) ? n : null;
};

const getRiskGlow = (ageGap) => {
  // <= 0 : green, 1-4 : yellow, >4-8 : orange, >8 : red
  if (ageGap <= 0) {
    return {
      glow: "rgba(84, 188, 114, 0.78)",
      tint: "rgba(82, 170, 120, 0.52)",
      stars: "rgba(206, 236, 206, 0.76)"
    };
  }
  if (ageGap <= 4) {
    return {
      glow: "rgba(221, 198, 78, 0.82)",
      tint: "rgba(196, 170, 92, 0.50)",
      stars: "rgba(232, 226, 170, 0.78)"
    };
  }
  if (ageGap <= 8) {
    return {
      glow: "rgba(235, 152, 74, 0.84)",
      tint: "rgba(204, 134, 86, 0.52)",
      stars: "rgba(242, 205, 173, 0.78)"
    };
  }
  return {
    glow: "rgba(136, 8, 8, 0.86)",
    tint: "rgba(136, 8, 8, 0.54)",
    stars: "rgba(230, 150, 150, 0.80)"
  };
};

const getRiskBand = (ageGap) => {
  if (ageGap <= 0) return 0; // green
  if (ageGap <= 4) return 1; // yellow
  if (ageGap <= 8) return 2; // orange
  return 3; // red
};

const formatYearsForDetail = (yearsAbs) => {
  if (!Number.isFinite(yearsAbs)) return "0";
  const rounded = Math.round(yearsAbs * 10) / 10;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(1).replace(/\.?0+$/, "");
};

const bandToRgb = (band) => {
  if (band === 0) return [144, 223, 158]; // #90DF9E
  if (band === 1) return [218, 193, 90]; // #DAC15A
  if (band === 2) return [238, 139, 72]; // #EE8B48
  return [136, 8, 8]; // #880808
};

export default function MetabolicAgeOrb({
  value = "32.4",
  currentAge,
  label = "METABOLIC AGE",
  detail = "0.8 years younger",
  /** When set, center shows this number; gap/colors come from `detail` text (not value/currentAge math). */
  absoluteMetabolicAge,
}) {
  const metabolicDelta = toNumber(value);
  const ageBase = toNumber(currentAge);
  const absMeta = toNumber(absoluteMetabolicAge);
  const combinedAge = metabolicDelta !== null && ageBase !== null ? ageBase + metabolicDelta : null;
  const centerValue =
    absMeta !== null ? `${Math.round(absMeta)}` : combinedAge !== null ? `${combinedAge}` : `${value}`;

  const ageGap = useMemo(() => {
    if (absMeta !== null) {
      return parseAgeGapFromDetail(detail);
    }
    return metabolicDelta !== null ? metabolicDelta : parseAgeGapFromDetail(detail);
  }, [absMeta, metabolicDelta, detail]);
  const riskBand = getRiskBand(ageGap);

  const displayDetail = useMemo(() => {
    if (absMeta !== null) {
      if (detail && detail !== '-') return detail;
      return 'Add profile age for comparison';
    }
    if (metabolicDelta !== null) {
      if (ageGap === 0) return "Same as chronological age";
      const n = formatYearsForDetail(Math.abs(ageGap));
      return ageGap > 0 ? `${n} years older` : `${n} years younger`;
    }
    return detail;
  }, [absMeta, metabolicDelta, ageGap, detail]);

  const config = useMemo(() => {
    const riskGlow = getRiskGlow(ageGap);
    const band = getRiskBand(ageGap);
    const [r, g, b] = bandToRgb(band);
    const activeGlow = `rgba(${r}, ${g}, ${b}, 0.88)`;
    const activeTint = `rgba(${r}, ${g}, ${b}, 0.46)`;

    return {
      ...defaultConfig,
      size: 265,
      ageGap,
      // Make all major glow blobs (including the old amber/yellow one) follow range color.
      amberGlowColor: activeGlow,
      // Default blueGlow is purple/blue and stayed on the right; match active tone so red (and other bands) read evenly.
      blueGlowColor: activeGlow,
      tealTintColor: activeTint,
      starColor: riskGlow.stars
    };
  }, [ageGap]);

  return (
    <div className="metabolic-orb" data-risk-band={riskBand}>
      <div className="metabolic-orb__container" aria-label="Metabolic age">
        <Orb config={config} className="metabolic-orb__canvas" />

        <div className="metabolic-orb__overlay">
          <div className="metabolic-orb__value">{centerValue}</div>
          <div className="metabolic-orb__label">{label}</div>
          <div className="metabolic-orb__detail">{displayDetail}</div>
        </div>
      </div>
    </div>
  );
}

