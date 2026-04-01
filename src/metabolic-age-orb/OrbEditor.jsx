import React from "react";

function ColorInput({ label, value, onChange }) {
  const rgbaMatch = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  const hex = rgbaMatch
    ? `#${[1, 2, 3].map((i) => parseInt(rgbaMatch[i], 10).toString(16).padStart(2, "0")).join("")}`
    : "#000000";
  const alphaMatch = value.match(/([\d.]+)\)$/);
  const alpha = alphaMatch ? parseFloat(alphaMatch[1]) : 1;

  return (
    <div className="orb-editor__row">
      <label className="orb-editor__label">{label}</label>
      <input
        type="color"
        value={hex}
        onChange={(e) => {
          const r = parseInt(e.target.value.slice(1, 3), 16);
          const g = parseInt(e.target.value.slice(3, 5), 16);
          const b = parseInt(e.target.value.slice(5, 7), 16);
          onChange(`rgba(${r}, ${g}, ${b}, ${alpha})`);
        }}
      />
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={alpha}
        onChange={(e) => onChange(value.replace(/([\d.]+)\)$/, `${e.target.value})`))}
      />
      <span>{alpha.toFixed(2)}</span>
    </div>
  );
}

function SliderInput({ label, value, min, max, step, onChange }) {
  return (
    <div className="orb-editor__row">
      <label className="orb-editor__label">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <span>{value % 1 === 0 ? value : value.toFixed(2)}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="orb-editor__section">
      <h4>{title}</h4>
      {children}
    </div>
  );
}

export default function OrbEditor({ config, onChange }) {
  const set = (key, value) => onChange({ ...config, [key]: value });

  return (
    <div className="orb-editor">
      <h3>Orb Editor</h3>

      <Section title="Size & Speed">
        <SliderInput label="Size" value={config.size} min={200} max={800} step={10} onChange={(v) => set("size", v)} />
        <SliderInput label="Rotation Speed" value={config.rotationSpeed} min={0} max={2} step={0.05} onChange={(v) => set("rotationSpeed", v)} />
        <SliderInput label="Outer Ring Gap" value={config.outerRingGap} min={0} max={50} step={1} onChange={(v) => set("outerRingGap", v)} />
      </Section>

      <Section title="Colors">
        <ColorInput label="Base" value={config.baseColor} onChange={(v) => set("baseColor", v)} />
        <ColorInput label="Amber Glow" value={config.amberGlowColor} onChange={(v) => set("amberGlowColor", v)} />
        <ColorInput label="Blue Glow" value={config.blueGlowColor} onChange={(v) => set("blueGlowColor", v)} />
        <ColorInput label="Teal Tint" value={config.tealTintColor} onChange={(v) => set("tealTintColor", v)} />
        <ColorInput label="Dark Core" value={config.darkCoreColor} onChange={(v) => set("darkCoreColor", v)} />
        <ColorInput label="Ring Color" value={config.ringColor} onChange={(v) => set("ringColor", v)} />
        <ColorInput label="Outer Ring" value={config.outerRingColor} onChange={(v) => set("outerRingColor", v)} />
        <ColorInput label="Star Color" value={config.starColor} onChange={(v) => set("starColor", v)} />
      </Section>
    </div>
  );
}
