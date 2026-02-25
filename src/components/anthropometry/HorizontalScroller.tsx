import { useRef, useCallback, useEffect } from "react";

interface HorizontalScrollerProps {
  value: number;
  onChange: (v: number) => void;
  unit: string;
}

const ITEM_WIDTH = 48;
const MIN = 20;
const MAX = 60;

/** Matches AnthropometryFrame background so overlay blends seamlessly */
const FRAME_BG = "rgba(0, 0, 0, 0.25)";

const HorizontalScroller = ({ value, onChange, unit }: HorizontalScrollerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  useEffect(() => {
    if (scrollRef.current && !isScrolling.current) {
      const offset = (value - MIN) * ITEM_WIDTH;
      scrollRef.current.scrollLeft = offset;
    }
  }, [value]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    isScrolling.current = true;
    const scrollLeft = scrollRef.current.scrollLeft;
    const newVal = Math.round(scrollLeft / ITEM_WIDTH) + MIN;
    const clamped = Math.max(MIN, Math.min(MAX, newVal));
    onChange(clamped);
    setTimeout(() => { isScrolling.current = false; }, 100);
  }, [onChange]);

  const items = Array.from({ length: MAX - MIN + 1 }, (_, i) => MIN + i);

  return (
    <div
      className="relative mx-auto rounded-xl overflow-hidden flex-shrink-0"
      style={{
        width: "264px",
        height: "80px",
        minHeight: "80px",
        background: "transparent",
        border: "none",
      }}
    >
      {/* Overlay: gradient hides numbers under badge, blends with frame */}
      <div
        className="absolute top-0 bottom-0 right-0 pointer-events-none rounded-r-xl"
        style={{
          width: "60px",
          background: `linear-gradient(to right, transparent 0%, ${FRAME_BG} 100%)`,
          zIndex: 2,
        }}
      />

      {/* Unit badge - same position & style as HeightPicker Cm/Kg */}
      <div
        className="absolute rounded-md px-2 py-0.5 flex items-center gap-1 cursor-default"
        style={{
          top: "12px",
          right: "12px",
          background: "rgba(255,255,255,0.1)",
          color: "#FFF",
          fontFamily: '"DM Sans", sans-serif',
          fontSize: "12px",
          fontWeight: 300,
          zIndex: 3,
        }}
      >
        {unit}
        <svg width="11" height="7.7" viewBox="0 0 10 7" fill="none" style={{ aspectRatio: "10/7" }}>
          <path d="M3.74486 6.56072C4.14368 7.11907 4.97351 7.11907 5.37233 6.56072L8.92914 1.58119C9.4019 0.919321 8.92878 -4.9205e-05 8.1154 -4.92761e-05L1.00178 -4.9898e-05C0.18841 -4.99691e-05 -0.284713 0.91932 0.18805 1.58119L3.74486 6.56072Z" fill="#FFF"/>
        </svg>
      </div>

      {/* Up arrow */}
      <button
        type="button"
        onClick={() => onChange(Math.min(MAX, value + 1))}
        className="absolute left-1/2 -translate-x-1/2 cursor-pointer p-1 bg-transparent border-0"
        style={{ top: "4px", zIndex: 2 }}
        aria-label="Increase value"
      >
        <svg width="20" height="14" viewBox="0 0 19 14" fill="none" style={{ transform: "rotate(180deg)" }}>
          <path d="M8.24486 12.8608C8.64368 13.4191 9.47351 13.4191 9.87233 12.8608L17.9291 1.58124C18.4019 0.919369 17.9288 0 17.1154 0L1.00178 0C0.188412 0 -0.284713 0.919368 0.188051 1.58124L8.24486 12.8608Z" fill="#CC203B"/>
        </svg>
      </button>
      {/* Down arrow */}
      <button
        type="button"
        onClick={() => onChange(Math.max(MIN, value - 1))}
        className="absolute left-1/2 -translate-x-1/2 cursor-pointer p-1 bg-transparent border-0"
        style={{ bottom: "4px", zIndex: 2 }}
        aria-label="Decrease value"
      >
        <svg width="20" height="14" viewBox="0 0 19 14" fill="none">
          <path d="M8.24486 12.8608C8.64368 13.4191 9.47351 13.4191 9.87233 12.8608L17.9291 1.58124C18.4019 0.919369 17.9288 0 17.1154 0L1.00178 0C0.188412 0 -0.284713 0.919368 0.188051 1.58124L8.24486 12.8608Z" fill="#CC203B"/>
        </svg>
      </button>

      {/* Box around selected value - centered like HeightPicker */}
      <div
        className="absolute top-0 bottom-0 left-1/2 pointer-events-none rounded -translate-x-1/2"
        style={{
          width: "48px",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "8px",
          zIndex: 1,
        }}
      />

      {/* Scrollable row - full width, same centering as HeightPicker */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full flex items-center overflow-x-auto scrollbar-none"
        style={{
          scrollSnapType: "x mandatory",
          paddingLeft: "calc(50% - 24px)",
          paddingRight: "calc(50% - 24px)",
        }}
      >
        {items.map((num) => {
          const isActive = num === value;
          return (
            <div
              key={num}
              className="flex-shrink-0 flex items-center justify-center"
              style={{
                width: ITEM_WIDTH + "px",
                height: "100%",
                scrollSnapAlign: "center",
                color: isActive ? "#FFF" : "rgba(255, 255, 255, 0.30)",
                textAlign: "center",
                fontFamily: '"DM Sans", sans-serif',
                fontStyle: "normal",
                fontSize: isActive ? "24px" : "20px",
                fontWeight: isActive ? 700 : 600,
                lineHeight: "25.38px",
                transition: "all 0.15s ease",
              }}
            >
              {num}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HorizontalScroller;