import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import MobileFrame from "@/components/layout/MobileFrame";
import AnthropometryFrame from "@/components/anthropometry/AnthropometryFrame";
import HeightPicker from "@/components/anthropometry/HeightPicker";
import WeightGauge from "@/components/anthropometry/WeightGauge";
import HorizontalScroller from "@/components/anthropometry/HorizontalScroller";
import BodyFatSlider from "@/components/anthropometry/BodyFatSlider";
import AnthropometryIcon from "@/images/Anthropometory.svg";

const Anthropometry = () => {
  const navigate = useNavigate();
  const [height, setHeight] = useState(172);
  const [heightUnit, setHeightUnit] = useState<"Cm" | "Ft">("Cm");
  const [weight, setWeight] = useState(55);
  const [weightUnit, setWeightUnit] = useState<"Kg" | "Lbs">("Kg");
  const [waist, setWaist] = useState(33);
  const [hip, setHip] = useState(33);
  const [bodyFat, setBodyFat] = useState(45);

  const handleDone = useCallback(() => {
    navigate("/?completed=anthropometry");
  }, [navigate]);

  const toggleHeightUnit = () => {
    if (heightUnit === "Cm") {
      setHeight(Math.round(height / 2.54));
      setHeightUnit("Ft");
    } else {
      setHeight(Math.round(height * 2.54));
      setHeightUnit("Cm");
    }
  };

  const toggleWeightUnit = () => {
    if (weightUnit === "Kg") {
      setWeight(Math.round(weight * 2.205));
      setWeightUnit("Lbs");
    } else {
      setWeight(Math.round(weight / 2.205));
      setWeightUnit("Kg");
    }
  };

  const heightRange = heightUnit === "Cm" ? { min: 100, max: 250 } : { min: 39, max: 98 };
  const weightRange = weightUnit === "Kg" ? { min: 20, max: 200 } : { min: 44, max: 440 };

  return (
    <MobileFrame>
      <div className="flex flex-col h-full px-4 pt-10 pb-6 overflow-y-auto scrollbar-none">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <button onClick={() => navigate("/")} className="text-white p-1 -ml-1">
            <ArrowLeft size={20} />
          </button>
          <span
            className="flex-1 text-center"
            style={{
              color: "#FFF",
              fontFamily: '"Lato", sans-serif',
              fontSize: "19px",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "normal",
              letterSpacing: "0.095px",
            }}
          >
            Anthropometry
          </span>
          <img src={AnthropometryIcon} alt="Anthropometry" className="w-12 h-12 shrink-0 object-contain" />
        </div>

        {/* Subtitle */}
        <p
          style={{
            maxWidth: "320px",
            color: "#C4C4C4",
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "11px",
            fontStyle: "normal",
            fontWeight: 400,
            lineHeight: "normal",
            marginBottom: "20px",
          }}
        >
          Your measurements power our AI to generate accurate metabolic and wellness scores.
        </p>

        {/* Height */}
        <SectionLabel>What is your height ? <span style={{ color: "#CC203B" }}>*</span></SectionLabel>
        <AnthropometryFrame height={145}>
          <div className="w-full h-full flex items-center justify-center">
            <HeightPicker value={height} onChange={setHeight} unit={heightUnit} onToggleUnit={toggleHeightUnit} min={heightRange.min} max={heightRange.max} />
          </div>
        </AnthropometryFrame>

        {/* Weight */}
        <SectionLabel>What is your body weight ? <span style={{ color: "#CC203B" }}>*</span></SectionLabel>
        <AnthropometryFrame height={145}>
          <div className="w-full h-full flex items-center justify-center">
            <WeightGauge value={weight} onChange={setWeight} unit={weightUnit} onToggleUnit={toggleWeightUnit} min={weightRange.min} max={weightRange.max} />
          </div>
        </AnthropometryFrame>

        {/* Waist */}
        <SectionLabel>What is your waist size ? <span style={{ color: "#CC203B" }}>*</span></SectionLabel>
        <AnthropometryFrame height={145}>
          <div className="w-full h-full flex items-center justify-center">
            <HorizontalScroller value={waist} onChange={setWaist} unit="In" />
          </div>
        </AnthropometryFrame>

        {/* Hip */}
        <SectionLabel>What is your hip size ?</SectionLabel>
        <AnthropometryFrame height={145}>
          <div className="w-full h-full flex items-center justify-center">
            <HorizontalScroller value={hip} onChange={setHip} unit="In" />
          </div>
        </AnthropometryFrame>

        {/* Body Fat - frame matches Body_fat_percentage_frame.svg (264×96) */}
        <SectionLabel>What is your body-fat percentage ?</SectionLabel>
        <AnthropometryFrame height={96}>
          <BodyFatSlider value={bodyFat} onChange={setBodyFat} />
        </AnthropometryFrame>

        {/* Done Button */}
        <button
          onClick={handleDone}
          className="mt-6 flex justify-center items-center"
          style={{
            display: "flex",
            width: "300px",
            height: "40px",
            padding: "10px 24px",
            margin: "24px auto 0",
            gap: "8px",
            borderRadius: "36px",
            border: "1px solid #969696",
            background: "linear-gradient(90deg, #296359 0%, #41AB99 100%)",
            boxShadow: "0 12px 20px 0 rgba(255, 255, 255, 0.15)",
            color: "#FFF",
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "15px",
            fontWeight: 500,
          }}
        >
          Done
        </button>
      </div>
    </MobileFrame>
  );
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p
    style={{
      alignSelf: "stretch",
      color: "#FFF",
      textAlign: "center",
      fontFamily: '"Lato", sans-serif',
      fontSize: "15px",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "normal",
      letterSpacing: "0.075px",
      marginBottom: "8px",
      marginTop: "16px",
    }}
  >
    {children}
  </p>
);

export default Anthropometry;