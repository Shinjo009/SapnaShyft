import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface PillButtonProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}

const PillButton = ({ icon, label, description, onClick }: PillButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-3 ha-node-glow"
      style={{
        width: "var(--ha-pill-width)",
        height: "var(--ha-pill-height)",
        borderRadius: "100px",
        border: "1px solid #A7E4BB",
        background: "rgba(0, 0, 0, 0.00)",
        padding: "0 16px",
      }}
      initial={{ width: 88, opacity: 0.8 }}
      animate={{ width: 264, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Icon area */}
      <div className="flex items-center justify-center shrink-0" style={{ width: 60, height: 60 }}>
        {icon}
      </div>

      {/* Description */}
      <span
        style={{
          fontFamily: '"Lato", sans-serif',
          fontSize: "11px",
          fontWeight: 400,
          color: "#BBB",
          letterSpacing: "0.055px",
          width: "70px",
          textAlign: "left",
        }}
      >
        {description}
      </span>

      {/* Chevron */}
      <ChevronRight className="text-foreground ml-auto" size={20} />
    </motion.button>
  );
};

export default PillButton;