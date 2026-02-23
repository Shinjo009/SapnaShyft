import { motion, AnimatePresence } from "framer-motion";
import CircleButton from "@/components/buttons/CircleButton";
import PillButton from "@/components/buttons/PillButton";

export type TimelinePosition = "left" | "center" | "right";


interface TimelineItemProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  position: TimelinePosition;
  isActive: boolean;
  isCompleted: boolean;
  onSelect: () => void;
  onNavigate: () => void;
  iconScale?: number;
  nodeScale?: number;
}

const TimelineItem = ({
  icon,
  label,
  description,
  position,
  isActive,
  isCompleted,
  onSelect,
  onNavigate,
  iconScale = 1,
  nodeScale = 1,
}: TimelineItemProps) => {
  const getAlignment = (): string => {
    if (isActive && position !== "center") return "center";
    switch (position) {
      case "left": return "flex-start";
      case "right": return "flex-end";
      case "center": return "center";
    }
  };

  const iconSize = 60 * iconScale;
  const nodeSize = 88 * nodeScale;
  return (
    <div
      className="relative flex items-center"
      style={{
        width: "100%",
        justifyContent: getAlignment(),
        minHeight: nodeSize,
      }}
    >
      {/* Horizontal connector: only from circle edge to center spine, NOT past it */}
      {position !== "center" && !isActive && (
        <div
          className="absolute"
          style={{
            top: "50%",
            // Dynamically calculate offset so line never overlaps the circle
            ...(position === "left"
              ? {
                  left: `${nodeSize}px`,
                  width: `calc(50% - ${nodeSize}px)`,
                }
              : {
                  right: `${nodeSize}px`,
                  width: `calc(50% - ${nodeSize}px)`,
                }),
            height: "2px",
            background: isCompleted ? "hsl(136, 65%, 72%)" : "#C4C4C4",
            transform: "translateY(-50%)",
            zIndex: 0,
          }}
        />
      )}

      <AnimatePresence mode="wait">
        {isActive ? (
          <motion.div
            key="pill"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <PillButton
              icon={icon}
              label={label}
              description={description}
              onClick={onNavigate}
              iconSize={iconSize}
              nodeSize={nodeSize}
            />
          </motion.div>
        ) : (
          <motion.div
            key="circle"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <CircleButton
              icon={icon}
              label={label}
              isActive={isActive}
              isCompleted={isCompleted}
              onClick={onSelect}
              iconSize={iconSize}
              nodeSize={nodeSize}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimelineItem;