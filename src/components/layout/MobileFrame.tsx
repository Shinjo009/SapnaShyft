interface MobileFrameProps {
  children: React.ReactNode;
}

const GAP = 16;

const MobileFrame = ({ children }: MobileFrameProps) => {
  return (
    <div className="relative flex flex-col min-h-screen w-full min-w-0 overflow-hidden">
      <div
        className="fixed inset-0 -z-10 ha-background"
        style={{ backgroundSize: "cover", backgroundPosition: "center" }}
        aria-hidden
      />
      <div
        className="relative overflow-auto ha-background flex flex-col flex-1 rounded-[18px] border-[4px] border-[rgba(116,119,117,0.5)] backdrop-blur-[25px] min-h-0 box-border"
        style={{
          margin: GAP / 2,
          width: `calc(100vw - ${GAP}px)`,
          height: `calc(100dvh - ${GAP}px)`,
          maxHeight: `calc(100vh - ${GAP}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default MobileFrame;