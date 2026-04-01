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
    glow: "rgba(224, 82, 82, 0.86)",
    tint: "rgba(190, 98, 98, 0.54)",
    stars: "rgba(238, 182, 182, 0.80)"
  };
};

const getRiskBand = (ageGap) => {
  if (ageGap <= 0) return 0; // green
  if (ageGap <= 4) return 1; // yellow
  if (ageGap <= 8) return 2; // orange
  return 3; // red
};

const bandToRgb = (band) => {
  if (band === 0) return [144, 223, 158]; // #90DF9E
  if (band === 1) return [218, 193, 90]; // #DAC15A
  if (band === 2) return [238, 139, 72]; // #EE8B48
  return [233, 93, 92]; // #E95D5C
};

export default function MetabolicAgeOrb({
  value = "32.4",
  currentAge,
  label = "METABOLIC AGE",
  detail = "0.8 years younger"
}) {
  const metabolicDelta = toNumber(value);
  const ageBase = toNumber(currentAge);
  const combinedAge = metabolicDelta !== null && ageBase !== null ? ageBase + metabolicDelta : null;
  const centerValue = combinedAge !== null ? `${combinedAge}` : `${value}`;

  const ageGap = useMemo(
    () => (metabolicDelta !== null ? metabolicDelta : parseAgeGapFromDetail(detail)),
    [metabolicDelta, detail]
  );
  const riskBand = getRiskBand(ageGap);

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
          <div className="metabolic-orb__detail">{detail}</div>
        </div>
      </div>
    </div>
  );
}

