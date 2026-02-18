interface BodyFatSliderProps {
  value: number;
  onChange: (v: number) => void;
}

const BodyFatSlider = ({ value, onChange }: BodyFatSliderProps) => {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div
      className="relative mx-auto rounded-xl flex flex-col items-center gap-3"
      style={{
        width: "280px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        padding: "16px 20px",
      }}
    >
      {/* Value display */}
      <span
        style={{
          color: "#FFF",
          fontFamily: '"DM Sans", sans-serif',
          fontSize: "24px",
          fontWeight: 700,
          lineHeight: "25.38px",
        }}
      >
        {pct}%
      </span>

      {/* Slider track */}
      <div className="relative w-full" style={{ height: "20px" }}>
        <div
          className="absolute top-1/2 left-0 right-0 rounded-full overflow-hidden"
          style={{
            height: "10px",
            transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.15)",
          }}
        >
          {/* Filled portion */}
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: "#CC203B",
              transition: "width 0.1s ease",
            }}
          />
        </div>
        {/* Invisible range input */}
        <input
          type="range"
          min={0}
          max={100}
          value={pct}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: 2 }}
        />
        {/* Visible thumb */}
        <div
          className="absolute top-1/2 rounded-full border-2 pointer-events-none"
          style={{
            width: "18px",
            height: "18px",
            background: "#FFF",
            borderColor: "#CC203B",
            transform: "translate(-50%, -50%)",
            left: `${pct}%`,
            transition: "left 0.1s ease",
            zIndex: 1,
          }}
        />
      </div>
    </div>
  );
};

export default BodyFatSlider;