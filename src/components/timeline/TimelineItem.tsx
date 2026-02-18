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
}: TimelineItemProps) => {
  const getAlignment = (): string => {
    if (isActive && position !== "center") return "center";
    switch (position) {
      case "left": return "flex-start";
      case "right": return "flex-end";
      case "center": return "center";
    }
  };

  return (
    <div
      className="relative flex items-center"
      style={{
        width: "100%",
        justifyContent: getAlignment(),
        minHeight: "88px",
      }}
    >
      {/* Horizontal connector: only from circle edge to center spine, NOT past it */}
      {position !== "center" && !isActive && (
        <div
          className="absolute"
          style={{
            top: "50%",
            // Line goes from the circle edge to the center
            ...(position === "left"
              ? {
                  // Circle is on the left; connector goes from right edge of circle to center
                  left: "88px", // after the 88px circle
                  width: "calc(50% - 88px)",
                }
              : {
                  // Circle is on the right; connector goes from center to left edge of circle
                  right: "88px",
                  width: "calc(50% - 88px)",
                }),
            height: "1px",
            background: isCompleted ? "hsl(136, 65%, 72%)" : "#C4C4C4",
            transform: "translateY(-50%)",
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
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimelineItem;