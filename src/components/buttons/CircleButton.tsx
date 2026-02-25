import { motion } from "framer-motion";


interface CircleButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
  iconSize?: number;
  nodeSize?: number;
  showLabel?: boolean;
}

const CircleButton = ({ icon, label, isActive, isCompleted, onClick, iconSize = 60, nodeSize = 88, showLabel = false }: CircleButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2"
      aria-label={label.replace(/\n/g, " ")}
    >
      <motion.div
        className={`flex items-center justify-center rounded-full ${isActive ? "ha-node-glow" : ""}`}
        style={{
          width: nodeSize,
          height: nodeSize,
          background: "rgba(255, 255, 255, 0.12)",
          border: isCompleted || isActive ? "1px solid #A7E4BB" : "1px solid rgba(255, 255, 255, 0.4)",
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="flex items-center justify-center [&>img]:max-w-full [&>img]:max-h-full [&>img]:object-contain" style={{ width: iconSize, height: iconSize }}>
          {icon}
        </div>
      </motion.div>
      {showLabel && (
        <span
          style={{
            fontFamily: '"Lato", sans-serif',
            fontSize: 11,
            fontWeight: 400,
            color: "#FFF",
            textAlign: "center",
            lineHeight: 1.3,
            whiteSpace: "pre-line",
          }}
        >
          {label}
        </span>
      )}
    </button>
  );
};

export default CircleButton;