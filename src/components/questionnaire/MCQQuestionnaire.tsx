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

  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) < 30) return;
    // Scroll down (deltaY>0) = previous; scroll up (deltaY<0) = next
    if (e.deltaY > 0) {
      if (currentIndex > 0) {
        e.preventDefault();
        goPrev();
      }
    } else {
      if (currentIndex < questions.length - 1) {
        e.preventDefault();
        goNext();
      }
    }
  };

  const handleDone = useCallback(() => {
    navigate(`/?completed=${categoryId}`);
  }, [navigate, categoryId]);

  return (
    <MobileFrame>
      <div className="flex flex-col flex-1 min-h-0 px-4 pt-10 pb-6">
        {/* Header: back | title (centered) | icon */}
        <div className="flex items-center justify-between mb-1 flex-shrink-0">
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
            {title}
          </span>
          <div className="w-12 h-12 flex items-center justify-center [&>img]:w-12 [&>img]:h-12 shrink-0">
            {icon}
          </div>
        </div>

        {/* Subtitle */}
        <p
          className="flex-shrink-0"
          style={{
            maxWidth: "320px",
            color: "#C4C4C4",
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "11px",
            fontStyle: "normal",
            fontWeight: 400,
            lineHeight: "normal",
            marginBottom: "16px",
          }}
        >
          {subtitle}
        </p>

        {/* Question card - centered in the middle of the screen */}
        <div
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          className="flex-1 min-h-0 relative"
          style={{ touchAction: "pan-y" }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center py-4 pb-10 overflow-y-auto scrollbar-none"
          >
            <div
              className="relative rounded-2xl p-5 pb-6 w-full max-w-[332px] flex-shrink-0"
              style={{
                background: "rgba(6, 53, 51, 0.25)",
                border: "1px solid rgba(15, 185, 168, 0.35)",
                boxShadow:
                  "0 0 0 1px rgba(15, 185, 168, 0.1), 0 8px 32px rgba(0,0,0,0.2)",
                backdropFilter: "blur(12px)",
              }}
            >
            {/* Stacked card deck effect - visible only at the bottom */}
            <div
              className="absolute left-0 right-0 top-0 rounded-2xl"
              style={{
                height: "100%",
                transform: "translateY(8px)",
                zIndex: -2,
                background: "rgba(4, 35, 34, 0.5)",
                border: "1px solid rgba(15, 185, 168, 0.12)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              }}
            />
            <div
              className="absolute left-0 right-0 top-0 rounded-2xl"
              style={{
                height: "100%",
                transform: "translateY(16px)",
                zIndex: -3,
                background: "rgba(2, 22, 21, 0.6)",
                border: "1px solid rgba(15, 185, 168, 0.08)",
                boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
              }}
            />

            {/* Progress bars - top of card */}
            <div
              className="flex flex-wrap justify-center mb-5"
              style={{ gap: "6px" }}
            >
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  type="button"
                  style={{
                    width: "20px",
                    height: "6px",
                    borderRadius: "8px",
                    background: answers[i]?.length ? "#CC203B" : "#FFDCD4",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  aria-label={`Go to question ${i + 1}`}
                />
              ))}
            </div>

            {/* Question */}
            <p
              style={{
                color: "#FFF",
                fontFamily: '"Lato", sans-serif',
                fontSize: "15px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
                letterSpacing: "0.075px",
                marginBottom: currentQ.subtitle ? "4px" : "12px",
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
                  marginBottom: "12px",
                }}
              >
                {currentQ.subtitle}
              </p>
            )}

            {/* Options - distributed left and right in a grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 142px)",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              {currentQ.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => toggleOption(opt)}
                  className="flex items-center justify-center"
                  style={{
                    width: "142px",
                    padding: "4px 10px",
                    borderRadius: "24px",
                    border: "1px solid #0FB9A8",
                    background: isSelected(opt)
                      ? "radial-gradient(50.74% 50.76% at 50% 50%, #11795F 0%, #1C493D 100%)"
                      : "transparent",
                    color: "#FFF",
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: "12px",
                    fontWeight: 600,
                    lineHeight: "24px",
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          </div>
        </div>

        {/* Swipe hint or Done */}
        {isLast ? (
          <button
            onClick={handleDone}
            className="mt-6 flex justify-center items-center mx-auto flex-shrink-0 cursor-pointer"
            style={{
              width: "300px",
              height: "40px",
              padding: "10px 24px",
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
        ) : (
          <p
            className="text-center mt-4 flex-shrink-0"
            style={{
              color: "#BBB",
              fontFamily: '"Lato", sans-serif',
              fontSize: "12px",
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