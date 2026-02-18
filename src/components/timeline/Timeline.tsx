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
}

const Timeline = ({ categories, activeId, onSelect, onNavigate }: TimelineProps) => {
  return (
    <div className="relative flex flex-col items-center" style={{ gap: "0px" }}>
      {/* Vertical spine - runs the full height, including through top and bottom circles */}
      <div
        className="absolute"
        style={{
          left: "50%",
          transform: "translateX(-50%)",
          /* Start and end cleanly outside center-positioned top/bottom nodes */
          top: "94px",
          bottom: "94px",
          width: "2px",
          zIndex: 0,
        }}
      >
        {/* Single continuous spine split into segments between each category */}
        {categories.map((cat, i) => {
          if (i === categories.length - 1) return null;
          const segmentCompleted = cat.isCompleted;
          const segmentHeight = `${100 / (categories.length - 1)}%`;
          // Hide spine segment if current or next item is active (capsule expanded)
          const isHidden = cat.id === activeId || categories[i + 1]?.id === activeId;
          return (
            <div
              key={`spine-${i}`}
              className={segmentCompleted ? "ha-spine-glow" : "ha-spine-default"}
              style={{
                height: segmentHeight,
                width: "2px",
                opacity: isHidden ? 0 : 1,
                transition: "opacity 0.3s ease",
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
            <div className="flex justify-center" style={{ padding: "18px 0", zIndex: 1 }}>
              {/* Show dot only if previous or current item has a side position */}
              {(categories[index - 1].position !== "center" || cat.position !== "center") ? (
                <div
                  className={
                    categories[index - 1].isCompleted ? "ha-dot ha-dot-active" : "ha-dot"
                  }
                  style={{
                    opacity: (categories[index - 1].id === activeId || cat.id === activeId) ? 0 : 1,
                    transition: "opacity 0.3s ease",
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
          />
        </div>
      ))}
    </div>
  );
};

export default Timeline;