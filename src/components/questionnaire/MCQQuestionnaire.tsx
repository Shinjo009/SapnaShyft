import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import MobileFrame from "@/components/layout/MobileFrame";

export interface MCQQuestion {
  question: string;
  subtitle?: string;
  options: string[];
  multiSelect?: boolean;
}

interface MCQQuestionnaireProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  questions: MCQQuestion[];
  categoryId: string;
}

const MCQQuestionnaire = ({
  title,
  subtitle,
  icon,
  questions,
  categoryId,
}: MCQQuestionnaireProps) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentQ = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const toggleOption = useCallback(
    (option: string) => {
      setAnswers((prev) => {
        const current = prev[currentIndex] || [];
        if (currentQ.multiSelect) {
          if (option === "None") return { ...prev, [currentIndex]: ["None"] };
          const filtered = current.filter((o) => o !== "None");
          return {
            ...prev,
            [currentIndex]: filtered.includes(option)
              ? filtered.filter((o) => o !== option)
              : [...filtered, option],
          };
        }
        return { ...prev, [currentIndex]: [option] };
      });
    },
    [currentIndex, currentQ]
  );

  const isSelected = (option: string) =>
    (answers[currentIndex] || []).includes(option);

  const goNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, questions.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    touchStartY.current = null;
  };

  const handleDone = useCallback(() => {
    navigate(`/?completed=${categoryId}`);
  }, [navigate, categoryId]);

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
              {title}
            </span>
          </div>
          <div className="w-8 h-8 flex items-center justify-center">{icon}</div>
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
            marginBottom: "20px",
            paddingLeft: "32px",
          }}
        >
          {subtitle}
        </p>

        {/* Question area with swipe */}
        <div
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="flex-1 flex flex-col justify-center"
        >
          {/* Progress bars: active #CC203B, inactive #FFDCD4 - clickable to navigate */}
          <div
            className="flex flex-col items-start mb-6"
            style={{ flexDirection: "row", gap: "10px", justifyContent: "center" }}
          >
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                type="button"
                style={{
                  display: "flex",
                  width: "20px",
                  height: "6px",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "10px",
                  borderRadius: "8px",
                  background:
                    i < currentIndex || (i === currentIndex && answers[i]?.length)
                      ? "#CC203B"
                      : "#FFDCD4",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
                aria-label={`Go to question ${i + 1}`}
              />
            ))}
          </div>

          {/* Question stats */}
          <p
            style={{
              alignSelf: "stretch",
              color: "#FFF",
              fontFamily: '"Lato", sans-serif',
              fontSize: "15px",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "normal",
              letterSpacing: "0.075px",
              marginBottom: currentQ.subtitle ? "4px" : "16px",
            }}
          >
            {currentQ.question}
          </p>

          {currentQ.subtitle && (
            <p
              style={{
                color: "#BBB",
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "11px",
                fontWeight: 400,
                marginBottom: "16px",
              }}
            >
              {currentQ.subtitle}
            </p>
          )}

          {/* Options: selected gradient, unselected transparent, Option stats */}
          <div className="flex flex-wrap" style={{ gap: "10px" }}>
            {currentQ.options.map((opt) => (
              <button
                key={opt}
                onClick={() => toggleOption(opt)}
                className="flex items-center justify-center"
                style={{
                  display: "flex",
                  width: "142px",
                  padding: "4px 10px",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10px",
                  borderRadius: "24px",
                  border: "1px solid #0FB9A8",
                  background: isSelected(opt)
                    ? "radial-gradient(50.74% 50.76% at 50% 50%, #11795F 0%, #1C493D 100%)"
                    : "transparent",
                  color: "#FFF",
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: "12px",
                  fontStyle: "normal",
                  fontWeight: 600,
                  lineHeight: "24px",
                }}
              >
                {isSelected(opt) && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="#0FB9A8" strokeWidth="1.5" />
                    <path d="M4 7l2 2 4-4" stroke="#0FB9A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Swipe hint or Done */}
        {isLast ? (
          <button
            onClick={handleDone}
            className="mt-4 flex justify-center items-center py-2.5 rounded-full text-white font-medium"
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
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "15px",
              fontWeight: 500,
            }}
          >
            Done
          </button>
        ) : (
          <p
            className="text-center mt-4"
            style={{
              color: "#BBB",
              fontFamily: '"Lato", sans-serif',
              fontSize: "12px",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "normal",
              letterSpacing: "0.06px",
            }}
          >
            Swipe to go back and forth
          </p>
        )}
      </div>
    </MobileFrame>
  );
};

export default MCQQuestionnaire;