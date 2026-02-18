import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import MobileFrame from "@/components/layout/MobileFrame";
import VitalsIcon from "@/images/Vitals.svg";

const Vitals = () => {
  const navigate = useNavigate();
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("80");

  const handleDone = useCallback(() => {
    navigate("/?completed=vitals");
  }, [navigate]);

  return (
    <MobileFrame>
      <div className="flex flex-col h-full px-4 pt-10 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="text-white">
              <ArrowLeft size={20} />
            </button>
            <span
              style={{
                color: "#FFF",
                textAlign: "center",
                fontFamily: '"Lato", sans-serif',
                fontSize: "19px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
                letterSpacing: "0.095px",
              }}
            >
              Vitals
            </span>
          </div>
          <img src={VitalsIcon} alt="Vitals" className="w-8 h-8" />
        </div>

        {/* Subtitle */}
        <p
          style={{
            width: "320px",
            color: "#C4C4C4",
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "11px",
            fontStyle: "normal",
            fontWeight: 400,
            lineHeight: "normal",
            marginBottom: "30px",
            paddingLeft: "32px",
          }}
        >
          A healthy blood pressure range is typically around 120 mmHg systolic and 80 mmHg diastolic.
        </p>

        <div className="flex-1 flex flex-col justify-center gap-6">
          {/* Systolic */}
          <div className="flex flex-col items-center gap-3">
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
              }}
            >
              Systolic Blood Pressure
            </p>
            <div
              className="relative mx-auto rounded-xl flex items-center justify-center"
              style={{
                width: "264px",
                height: "80px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <input
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                placeholder="00"
                className="bg-transparent outline-none text-center"
                style={{
                  color: systolic ? "#FFF" : "#BBB",
                  textAlign: "center",
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: "24px",
                  fontStyle: "normal",
                  fontWeight: systolic ? 700 : 400,
                  lineHeight: "25.38px",
                  width: "80px",
                  border: "none",
                }}
              />
              <span
                style={{
                  color: "#FFF",
                  textAlign: "center",
                  fontFamily: '"Lato", sans-serif',
                  fontSize: "14px",
                  fontStyle: "normal",
                  fontWeight: 400,
                  lineHeight: "normal",
                  letterSpacing: "0.07px",
                  marginLeft: "4px",
                }}
              >
                mmHg
              </span>
            </div>
          </div>

          {/* Diastolic */}
          <div className="flex flex-col items-center gap-3">
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
              }}
            >
              Diastolic Blood Pressure
            </p>
            <div
              className="relative mx-auto rounded-xl flex items-center justify-center"
              style={{
                width: "264px",
                height: "80px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <input
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                placeholder="00"
                className="bg-transparent outline-none text-center"
                style={{
                  color: "#FFF",
                  textAlign: "center",
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: "24px",
                  fontStyle: "normal",
                  fontWeight: 700,
                  lineHeight: "25.38px",
                  width: "80px",
                  border: "none",
                }}
              />
              <span
                style={{
                  color: "#FFF",
                  textAlign: "center",
                  fontFamily: '"Lato", sans-serif',
                  fontSize: "14px",
                  fontStyle: "normal",
                  fontWeight: 400,
                  lineHeight: "normal",
                  letterSpacing: "0.07px",
                  marginLeft: "4px",
                }}
              >
                mmHg
              </span>
            </div>
          </div>

          {/* Skip */}
          <button
            onClick={handleDone}
            className="mx-auto"
            style={{
              color: "#BBB",
              fontFamily: '"Lato", sans-serif',
              fontSize: "14px",
              textDecoration: "underline",
              background: "none",
              border: "none",
            }}
          >
            Skip
          </button>
        </div>

        {/* Done */}
        <button
          onClick={handleDone}
          className="mt-4 flex justify-center items-center"
          style={{
            display: "flex",
            width: "300px",
            height: "40px",
            padding: "10px 24px",
            margin: "16px auto 0",
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

export default Vitals;