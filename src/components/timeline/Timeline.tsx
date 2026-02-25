import TimelineItem, { type TimelinePosition } from "./TimelineItem";

export interface CategoryData {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  position: TimelinePosition;
  isCompleted: boolean;
}

interface TimelineProps {
  categories: CategoryData[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNavigate: (id: string) => void;
  iconScale?: number;
  nodeScale?: number;
  isMobile?: boolean;
  animateCapsule?: boolean;
}

const SIDE_IDS = ["family-history", "lifestyle-habits", "nutrition-log"];
const PILL_HEIGHT = 72;
const PILL_WIDTH = 264;
const DOT_PADDING = 18;

const Timeline = ({ categories, activeId, onSelect, onNavigate, iconScale = 1, nodeScale = 1, isMobile = false, animateCapsule = false }: TimelineProps) => {
  const nodeSize = isMobile ? 80 : 88;
  const rowHeight = nodeSize + (isMobile ? 28 : 0);
  const topOffset = rowHeight + 8;
  const bottomOffset = rowHeight + 8;
  const dotPad = isMobile ? 12 : DOT_PADDING;

  const activeIndex = activeId ? categories.findIndex((c) => c.id === activeId) : -1;
  const hasCapsuleGap = activeId && SIDE_IDS.includes(activeId) && activeIndex >= 0;
  const capsuleTop = hasCapsuleGap
    ? activeIndex * (rowHeight + dotPad) + (rowHeight - PILL_HEIGHT) / 2
    : 0;
  const gapStart = hasCapsuleGap ? capsuleTop - topOffset : 0;
  const gapEnd = gapStart + PILL_HEIGHT;

  /* evenodd: outer rect first, then cutout rect - line hidden behind capsule */
  const clipPath =
    hasCapsuleGap && gapStart > 0
      ? `polygon(evenodd, 0 0, 0 100%, 100% 100%, 100% 0, 0 0, 0 ${gapStart}px, 100% ${gapStart}px, 100% ${gapEnd}px, 0 ${gapEnd}px, 0 ${gapStart}px)`
      : undefined;

  return (
    <div className="relative flex flex-col items-center" style={{ gap: "0px" }}>
      {/* Vertical spine - clip-path cuts out capsule region (line not visible behind capsule) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          top: `${topOffset}px`,
          bottom: `${bottomOffset}px`,
          width: "2px",
          zIndex: 0,
          ...(clipPath && {
            clipPath,
            WebkitClipPath: clipPath,
          }),
        }}
      >
        {categories.map((cat, i) => {
          if (i === categories.length - 1) return null;
          const segmentCompleted = cat.isCompleted;
          const segmentHeight = `${100 / (categories.length - 1)}%`;
          const isActiveSegment = cat.id === activeId || categories[i + 1]?.id === activeId;
          return (
            <div
              key={`spine-${i}`}
              className={isActiveSegment || segmentCompleted ? "ha-spine-glow" : "ha-spine-default"}
              style={{
                height: segmentHeight,
                width: "2px",
                opacity: 1,
                transition: "opacity 0.3s ease, background 0.3s ease, box-shadow 0.3s ease",
              }}
            />
          );
        })}
      </div>

      {/* Timeline items with dots between them */}
      {categories.map((cat, index) => (
        <div key={cat.id} className="relative flex flex-col items-center" style={{ width: "100%" }}>
          {/* Dot between items - only at intersections where side connectors meet spine */}
          {index > 0 && (
            <div className="flex justify-center" style={{ padding: isMobile ? "12px 0" : "18px 0", zIndex: 1 }}>
              {/* Show dot only if previous or current item has a side position */}
              {(categories[index - 1].position !== "center" || cat.position !== "center") ? (
                <div
                  className={
                    categories[index - 1].isCompleted || categories[index - 1].id === activeId || cat.id === activeId
                      ? "ha-dot ha-dot-active"
                      : "ha-dot"
                  }
                  style={{
                    opacity: 1,
                    transition: "opacity 0.3s ease, background 0.3s ease, box-shadow 0.3s ease",
                  }}
                />
              ) : (
                <div style={{ height: "var(--ha-dot-size)" }} />
              )}
            </div>
          )}

          {/* The timeline item */}
          <TimelineItem
            icon={cat.icon}
            label={cat.label}
            description={cat.description}
            position={cat.position}
            isActive={cat.id === activeId}
            isCompleted={cat.isCompleted}
            onSelect={() => onSelect(cat.id)}
            onNavigate={() => onNavigate(cat.id)}
            iconScale={iconScale}
            nodeScale={nodeScale}
            isMobile={isMobile}
            animateCapsule={animateCapsule && cat.id === "anthropometry"}
          />
        </div>
      ))}
    </div>
  );
};

export default Timeline;