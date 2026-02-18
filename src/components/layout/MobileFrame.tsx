interface MobileFrameProps {
  children: React.ReactNode;
}

const MobileFrame = ({ children }: MobileFrameProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div
        className="relative overflow-hidden ha-background"
        style={{
          width: "360px",
          height: "780px",
          borderRadius: "18px",
          border: "4px solid rgba(116, 119, 117, 0.50)",
          backdropFilter: "blur(25px)",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default MobileFrame;