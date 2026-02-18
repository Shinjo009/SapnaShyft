import { motion } from "framer-motion";

interface CircleButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

const CircleButton = ({ icon, label, isActive, isCompleted, onClick }: CircleButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center justify-center rounded-full"
      style={{
        width: "var(--ha-node-size)",
        height: "var(--ha-node-size)",
        background: "rgba(255, 255, 255, 0.15)",
        border: isCompleted || isActive ? "1px solid #A7E4BB" : "1px solid transparent",
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      aria-label={label}
    >
      <div className="flex items-center justify-center" style={{ width: 60, height: 60 }}>
        {icon}
      </div>
    </motion.button>
  );
};

export default CircleButton;