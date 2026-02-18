import { motion } from "framer-motion";

interface WeightGaugeProps {
  value: number;
  onChange: (v: number) => void;
  unit: "Kg" | "Lbs";
  onToggleUnit: () => void;
  min: number;
  max: number;
}

const WeightGauge = ({ value, onChange, unit, onToggleUnit, min, max }: WeightGaugeProps) => {
  const clamped = Math.max(min, Math.min(max, value));
  const angle = ((clamped - min) / (max - min)) * 240 - 120;

  return (
    <div
      className="relative mx-auto rounded-xl flex flex-col items-center"
      style={{
        width: "280px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        padding: "16px",
      }}
    >
      {/* Unit toggle */}
      <button
        onClick={onToggleUnit}
        className="absolute top-2 right-3 rounded-md px-2 py-0.5 flex items-center gap-1"
        style={{
          background: "rgba(255,255,255,0.1)",
          color: "#FFF",
          fontFamily: '"DM Sans", sans-serif',
          fontSize: "12px",
          fontWeight: 300,
          border: "none",
        }}
      >
        {unit}
        <svg width="11" height="7.7" viewBox="0 0 10 7" fill="none" style={{ aspectRatio: "10/7" }}>
          <path d="M3.74486 6.56072C4.14368 7.11907 4.97351 7.11907 5.37233 6.56072L8.92914 1.58119C9.4019 0.919321 8.92878 -4.9205e-05 8.1154 -4.92761e-05L1.00178 -4.9898e-05C0.18841 -4.99691e-05 -0.284713 0.91932 0.18805 1.58119L3.74486 6.56072Z" fill="#FFF"/>
        </svg>
      </button>

      {/* Gauge arc */}
      <div className="relative" style={{ width: "160px", height: "90px", overflow: "hidden" }}>
        <svg viewBox="0 0 160 90" width="160" height="90">
          <path
            d="M 15 85 A 70 70 0 0 1 145 85"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {Array.from({ length: 13 }).map((_, i) => {
            const a = (-120 + i * 20) * (Math.PI / 180);
            const cx = 80, cy = 85, r1 = 65, r2 = 58;
            return (
              <line
                key={i}
                x1={cx + r1 * Math.cos(a)}
                y1={cy + r1 * Math.sin(a)}
                x2={cx + r2 * Math.cos(a)}
                y2={cy + r2 * Math.sin(a)}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>

        <motion.div
          className="absolute"
          style={{
            bottom: "5px",
            left: "50%",
            width: "2px",
            height: "50px",
            background: "linear-gradient(to top, #CC203B, transparent)",
            transformOrigin: "bottom center",
            marginLeft: "-1px",
          }}
          animate={{ rotate: angle }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: "2px",
            left: "50%",
            width: "8px",
            height: "8px",
            background: "#CC203B",
            marginLeft: "-4px",
          }}
        />
      </div>

      {/* Input */}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="text-center bg-transparent outline-none"
        style={{
          color: "#FFF",
          textAlign: "center",
          fontFamily: '"DM Sans", sans-serif',
          fontSize: "24px",
          fontStyle: "normal",
          fontWeight: 700,
          lineHeight: "25.38px",
          width: "80px",
          marginTop: "8px",
          border: "none",
        }}
      />
    </div>
  );
};

export default WeightGauge;
