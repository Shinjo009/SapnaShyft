import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";


interface PillButtonProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  iconSize?: number;
  nodeSize?: number;
}

const PillButton = ({ icon, label, description, onClick, iconSize = 60, nodeSize = 88 }: PillButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-3 ha-node-glow"
      style={{
        width: nodeSize * 3,
        height: nodeSize,
        borderRadius: "100px",
        border: "1px solid #A7E4BB",
        background: "rgba(0, 0, 0, 0.00)",
        padding: "0 16px",
      }}
      initial={{ width: nodeSize, opacity: 0.8 }}
      animate={{ width: nodeSize * 3, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Icon area */}
      <div className="flex items-center justify-center shrink-0" style={{ width: iconSize, height: iconSize }}>
        {icon}
      </div>

      {/* Description */}
      <span
        style={{
          fontFamily: '"Lato", sans-serif',
          fontSize: Math.max(11, iconSize / 5),
          fontWeight: 400,
          color: "#BBB",
          letterSpacing: "0.055px",
          width: iconSize * 1.2,
          textAlign: "left",
        }}
      >
        {description}
      </span>

      {/* Chevron */}
      <ChevronRight className="text-foreground ml-auto" size={Math.max(20, iconSize / 2.5)} />
    </motion.button>
  );
};

export default PillButton;