import { useRef, useEffect, useCallback } from "react";

interface HeightPickerProps {
  value: number;
  onChange: (v: number) => void;
  unit: "Cm" | "Ft";
  onToggleUnit: () => void;
  min: number;
  max: number;
}

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 3;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const HeightPicker = ({ value, onChange, unit, onToggleUnit, min, max }: HeightPickerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isUserScrolling = useRef(false);

  useEffect(() => {
    if (scrollRef.current && !isUserScrolling.current) {
      const offset = (value - min) * ITEM_HEIGHT;
      scrollRef.current.scrollTop = offset;
    }
  }, [value, min]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    isUserScrolling.current = true;
    const scrollTop = scrollRef.current.scrollTop;
    const newVal = Math.round(scrollTop / ITEM_HEIGHT) + min;
    const clamped = Math.max(min, Math.min(max, newVal));
    onChange(clamped);
    setTimeout(() => { isUserScrolling.current = false; }, 100);
  }, [onChange, min, max]);

  const items = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div
      className="relative mx-auto rounded-xl flex-shrink-0"
      style={{
        width: "280px",
        height: CONTAINER_HEIGHT + "px",
        minHeight: CONTAINER_HEIGHT + "px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        overflow: "hidden",
      }}
    >
      {/* Unit toggle */}
      <button
        onClick={onToggleUnit}
        className="absolute top-2 right-3 rounded-md px-2 py-0.5 flex items-center gap-1"
        style={{
          background: "rgba(255,255,255,0.1)",
          color: "#FFF",
          textAlign: "center",
          fontFamily: '"DM Sans", sans-serif',
          fontSize: "12px",
          fontStyle: "normal",
          fontWeight: 300,
          lineHeight: "normal",
          zIndex: 3,
          border: "none",
        }}
      >
        {unit}
        <svg width="11" height="7.7" viewBox="0 0 10 7" fill="none" style={{ aspectRatio: "10/7" }}>
          <path d="M3.74486 6.56072C4.14368 7.11907 4.97351 7.11907 5.37233 6.56072L8.92914 1.58119C9.4019 0.919321 8.92878 -4.9205e-05 8.1154 -4.92761e-05L1.00178 -4.9898e-05C0.18841 -4.99691e-05 -0.284713 0.91932 0.18805 1.58119L3.74486 6.56072Z" fill="#FFF"/>
        </svg>
      </button>

      {/* Selection highlight band */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          top: ITEM_HEIGHT + "px",
          height: ITEM_HEIGHT + "px",
          borderTop: "1px solid rgba(255,255,255,0.15)",
          borderBottom: "1px solid rgba(255,255,255,0.15)",
          zIndex: 1,
        }}
      />

      {/* Left arrow: 16×13.714px, rotate(-90deg), fill #CC203B */}
      <div
        className="absolute pointer-events-none"
        style={{ left: "16px", top: ITEM_HEIGHT + (ITEM_HEIGHT / 2) - 6.857 + "px", zIndex: 2 }}
      >
        <svg width="16" height="13.714" viewBox="0 0 19 14" fill="none" style={{ transform: "rotate(-90deg)", aspectRatio: "7/6" }}>
          <path d="M8.24486 12.8608C8.64368 13.4191 9.47351 13.4191 9.87233 12.8608L17.9291 1.58124C18.4019 0.919369 17.9288 0 17.1154 0L1.00178 0C0.188412 0 -0.284713 0.919368 0.188051 1.58124L8.24486 12.8608Z" fill="#CC203B"/>
        </svg>
      </div>
      {/* Right arrow */}
      <div
        className="absolute pointer-events-none"
        style={{ right: "16px", top: ITEM_HEIGHT + (ITEM_HEIGHT / 2) - 6.857 + "px", zIndex: 2 }}
      >
        <svg width="16" height="13.714" viewBox="0 0 19 14" fill="none" style={{ transform: "rotate(90deg)", aspectRatio: "7/6" }}>
          <path d="M8.24486 12.8608C8.64368 13.4191 9.47351 13.4191 9.87233 12.8608L17.9291 1.58124C18.4019 0.919369 17.9288 0 17.1154 0L1.00178 0C0.188412 0 -0.284713 0.919368 0.188051 1.58124L8.24486 12.8608Z" fill="#CC203B"/>
        </svg>
      </div>

      {/* Scrollable list */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-y-auto scrollbar-none"
        style={{
          height: CONTAINER_HEIGHT + "px",
          scrollSnapType: "y mandatory",
          paddingTop: ITEM_HEIGHT + "px",
          paddingBottom: ITEM_HEIGHT + "px",
        }}
      >
        {items.map((num) => {
          const isActive = num === value;
          return (
            <div
              key={num}
              className="flex items-center justify-center"
              style={{
                height: ITEM_HEIGHT + "px",
                scrollSnapAlign: "start",
                color: isActive ? "#FFF" : "rgba(255, 255, 255, 0.30)",
                textAlign: "center",
                fontFamily: '"DM Sans", sans-serif',
                fontStyle: "normal",
                fontSize: isActive ? "24px" : "18px",
                fontWeight: isActive ? 700 : 500,
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

export default HeightPicker;