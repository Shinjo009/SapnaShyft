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
  isMobile?: boolean;
  animateCapsule?: boolean;
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
  isMobile = false,
  animateCapsule = false,
}: TimelineItemProps) => {
  const getAlignment = (): string => {
    if (isActive) return "center";
    if (isMobile) {
      switch (position) {
        case "left": return "flex-start";
        case "right": return "flex-end";
        case "center": return "center";
      }
    }
    switch (position) {
      case "left": return "flex-start";
      case "right": return "flex-end";
      case "center": return "center";
    }
  };

  const iconSize = 60 * iconScale;
  const nodeSize = isMobile ? 80 : 88 * nodeScale;
  const handleClick = () => (isActive ? onNavigate() : onSelect());

  return (
    <div
      className="relative flex items-center"
      style={{
        width: "100%",
        justifyContent: getAlignment(),
        minHeight: nodeSize + (isMobile ? 28 : 0),
      }}
    >
      {/* Horizontal connector: from circle to spine (hide when pill is shown) */}
      {position !== "center" && !isActive && (
        <div
          className="absolute"
          style={{
            top: `${nodeSize / 2}px`,
            transform: "translateY(-50%)",
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
            zIndex: 0,
          }}
        />
      )}

      <AnimatePresence mode="wait">
        {isActive ? (
          <motion.div
            key="pill"
            className="relative z-10 flex items-center justify-center ha-capsule-gradient rounded-[100px] p-[2px]"
            initial={{ scale: 0.95, opacity: 1 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <PillButton
              icon={icon}
              label={label}
              description={description}
              onClick={onNavigate}
              iconSize={isMobile ? 44 : iconSize}
              nodeSize={nodeSize}
              animateExpand={animateCapsule}
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
              onClick={handleClick}
              iconSize={isMobile ? 44 : iconSize}
              nodeSize={nodeSize}
              showLabel={isMobile}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimelineItem;