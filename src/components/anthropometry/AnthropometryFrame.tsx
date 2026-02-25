import { ReactNode } from "react";

/** Frame wrapper matching SVG frame design: 264×height, rounded corners, teal tint */
interface AnthropometryFrameProps {
  children: ReactNode;
  /** Height from SVG: 145 for height/weight/waist/hip, 96 for body fat */
  height?: number;
}

export const AnthropometryFrame = ({
  children,
  height = 145,
}: AnthropometryFrameProps) => (
  <div
    className="mx-auto flex-shrink-0 relative flex items-start justify-center"
    style={{
      width: "264px",
      height: `${height}px`,
      minHeight: `${height}px`,
      borderRadius: "16px",
      overflow: "hidden",
      background: "rgba(0, 0, 0, 0.25)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    }}
  >
    {children}
  </div>
);

export default AnthropometryFrame;
