import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Timeline from "@/components/timeline/Timeline";
import { useIsMobile } from "@/hooks/use-mobile";
import type { CategoryData } from "@/components/timeline/Timeline";
import AnthropometryIcon from "@/images/Anthropometory.svg";
import FamilyHistoryIcon from "@/images/FamilyHistory.svg";
import LifestyleHabitsIcon from "@/images/LifestyleHabits.svg";
import NutritionLogIcon from "@/images/NutritionLogs.svg";
import VitalsIcon from "@/images/Vitals.svg";

const IconImg = ({ src, alt }: { src: string; alt: string }) => (
  <img src={src} alt={alt} className="w-14 h-14 object-contain" />
);

const CATEGORIES_DATA: Omit<CategoryData, "isCompleted">[] = [
  {
    id: "anthropometry",
    label: "Anthropometry",
    description: "Track your height, weight & BMI",
    icon: <IconImg src={AnthropometryIcon} alt="Anthropometry" />,
    position: "center",
  },
  {
    id: "family-history",
    label: "Family\nHistory",
    description: "Record hereditary health conditions",
    icon: <IconImg src={FamilyHistoryIcon} alt="Family History" />,
    position: "left",
  },
  {
    id: "lifestyle-habits",
    label: "Lifestyle &\nHabits",
    description: "Your daily routine & activities",
    icon: <IconImg src={LifestyleHabitsIcon} alt="Lifestyle & Habits" />,
    position: "right",
  },
  {
    id: "nutrition-log",
    label: "Nutrition\nLog",
    description: "Monitor your dietary intake",
    icon: <IconImg src={NutritionLogIcon} alt="Nutrition Log" />,
    position: "left",
  },
  {
    id: "vitals",
    label: "Vitals",
    description: "Blood pressure & more",
    icon: <IconImg src={VitalsIcon} alt="Vitals" />,
    position: "center",
  },
];

const ROUTE_MAP: Record<string, string> = {
  anthropometry: "/anthropometry",
  vitals: "/vitals",
  "nutrition-log": "/nutrition-log",
  "lifestyle-habits": "/lifestyle-habits",
  "family-history": "/family-history",
};

const HealthAssessment = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [animateCapsule, setAnimateCapsule] = useState(false);

  useEffect(() => {
    const completed = searchParams.get("completed");
    if (completed) {
      setCompletedIds((prev) => new Set(prev).add(completed));
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Auto-expand Anthropometry capsule after 2 sec (only on first load/reload)
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveId((prev) => {
        if (prev === null) {
          setAnimateCapsule(true);
          return "anthropometry";
        }
        return prev;
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Reset capsule animation flag after expand completes (2s)
  useEffect(() => {
    if (!animateCapsule) return;
    const t = setTimeout(() => setAnimateCapsule(false), 2000);
    return () => clearTimeout(t);
  }, [animateCapsule]);

  const categories: CategoryData[] = CATEGORIES_DATA.map((cat) => ({
    ...cat,
    isCompleted: completedIds.has(cat.id),
  }));

  const handleSelect = useCallback((id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
  }, []);

  const handleNavigate = useCallback((id: string) => {
    const route = ROUTE_MAP[id];
    if (route) {
      navigate(route);
    } else {
      setCompletedIds((prev) => new Set(prev).add(id));
      setActiveId(null);
    }
  }, [navigate]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      <div
        className="fixed inset-0 -z-10 ha-background-no-gradient"
        style={{ backgroundSize: "cover", backgroundPosition: "center" }}
      />
      <div
        className={`w-full flex flex-col ${isMobile ? 'min-h-screen px-4 pt-6 pb-8' : 'h-full min-h-[90vh] px-2 sm:px-4 pt-8 pb-8'}`}
        style={{
          maxWidth: isMobile ? '100%' : '95vw',
          margin: '0 auto',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <h1
          className="text-white text-center font-lato font-normal tracking-[0.12px] mb-4 sm:mb-6 select-none"
          style={{
            fontSize: isMobile ? '1.5rem' : 'clamp(1.5rem, 2vw + 1rem, 2.5rem)',
            lineHeight: 'normal',
          }}
        >
          Health Assessment
        </h1>
        <div
          className="flex-1 flex flex-col justify-center mt-2 w-full"
          style={{
            minHeight: isMobile ? 'auto' : '60vh',
            maxWidth: isMobile ? '360px' : '1200px',
            margin: '0 auto',
          }}
        >
          <Timeline
            categories={categories}
            activeId={activeId}
            onSelect={handleSelect}
            onNavigate={handleNavigate}
            iconScale={1}
            nodeScale={1}
            isMobile={isMobile}
            animateCapsule={animateCapsule}
          />
        </div>
      </div>
    </div>
  );
};

export default HealthAssessment;