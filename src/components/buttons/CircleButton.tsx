import { motion } from "framer-motion";


interface CircleButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
  iconSize?: number;
  nodeSize?: number;
}

const CircleButton = ({ icon, label, isActive, isCompleted, onClick, iconSize = 60, nodeSize = 88 }: CircleButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center justify-center rounded-full"
      style={{
        width: nodeSize,
        height: nodeSize,
        background: "rgba(255, 255, 255, 0.15)",
        border: isCompleted || isActive ? "1px solid #A7E4BB" : "1px solid transparent",
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      aria-label={label}
    >
      <div className="flex items-center justify-center" style={{ width: iconSize, height: iconSize }}>
        {icon}
      </div>
    </motion.button>
  );
};

export default CircleButton;