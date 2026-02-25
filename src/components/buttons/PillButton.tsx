import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";


interface PillButtonProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  iconSize?: number;
  nodeSize?: number;
  animateExpand?: boolean;
}

const PILL_WIDTH = 264;

const PillButton = ({ icon, label, description, onClick, iconSize = 60, nodeSize = 88, animateExpand = false }: PillButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-4 ha-node-glow shrink-0 overflow-hidden"
      style={{
        height: 72,
        minHeight: 72,
        borderRadius: "100px",
        border: "2px solid hsl(var(--ha-glow-color))",
        background: "rgba(0, 0, 0, 0.00)",
        padding: "0 14px 0 10px",
        maxWidth: "min(264px, calc(100vw - 2rem))",
      }}
      initial={animateExpand ? { width: nodeSize, opacity: 0.9 } : { width: PILL_WIDTH, opacity: 1 }}
      animate={{ width: PILL_WIDTH, opacity: 1 }}
      transition={animateExpand ? { duration: 2, ease: [0.25, 0.46, 0.45, 0.94] } : { duration: 0.25 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Icon only - larger size */}
      <div className="flex items-center justify-center shrink-0 w-14 h-14 [&>img]:w-12 [&>img]:h-12">
        {icon}
      </div>

      {/* Description (can wrap to two lines) - fades in after expand, clipped during transition */}
      <motion.span
        initial={animateExpand ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={animateExpand ? { duration: 0.5, delay: 1.4 } : undefined}
        style={{
          fontFamily: '"Lato", sans-serif',
          fontSize: 12,
          fontWeight: 400,
          color: "#FFF",
          letterSpacing: "0.055px",
          flex: 1,
          minWidth: 0,
          textAlign: "left",
          lineHeight: 1.35,
          overflow: "hidden",
          wordBreak: "break-word",
        }}
      >
        {description}
      </motion.span>

      {/* Chevron in small dark circle */}
      <div
        className="flex items-center justify-center shrink-0 rounded-full"
        style={{
          width: 28,
          height: 28,
          background: "rgba(0, 0, 0, 0.4)",
        }}
      >
        <ChevronRight className="text-white" size={16} strokeWidth={2.5} />
      </div>
    </motion.button>
  );
};

export default PillButton;