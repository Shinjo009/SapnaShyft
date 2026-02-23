import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MobileFrame from "@/components/layout/MobileFrame";
import Header from "@/components/layout/Header";
import Timeline from "@/components/timeline/Timeline";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const completed = searchParams.get("completed");
    if (completed) {
      setCompletedIds((prev) => new Set(prev).add(completed));
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* Responsive, blurred, Figma-style background with better scaling for PC */}
      <div className="fixed inset-0 -z-10">
        <img
          src="/Background.png"
          alt="Background"
          className="w-full h-full object-cover object-center"
          style={{
            filter: 'blur(10px) brightness(0.92)',
            position: 'absolute',
            inset: 0,
            zIndex: -1,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(106deg, rgba(204, 32, 59, 0.15) 0%, rgba(6, 53, 51, 0.30) 22.49%, rgba(0, 0, 0, 0.00) 41.83%),' +
              'linear-gradient(283deg, rgba(204, 32, 59, 0.23) 0.91%, rgba(6, 53, 51, 0.30) 26.33%, rgba(7, 29, 28, 0.00) 40.59%)',
            zIndex: 0,
          }}
        />
      </div>
      <div
        className="w-full flex flex-col h-full min-h-[90vh] px-2 sm:px-4 pt-8 pb-8 relative z-10"
        style={{
          maxWidth: '95vw',
          margin: '0 auto',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <h1
          className="text-white text-center font-lato font-normal tracking-[0.12px] mb-6 select-none"
          style={{
            fontSize: 'clamp(1.5rem, 2vw + 1rem, 2.5rem)',
            lineHeight: 'normal',
          }}
        >
          Health Assessment
        </h1>
        <div
          className="flex-1 flex flex-col justify-center mt-2"
          style={{
            minHeight: '60vh',
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          {/* Responsive scaling: large icons for PC, default for mobile */}
          <Timeline
            categories={categories}
            activeId={activeId}
            onSelect={handleSelect}
            onNavigate={handleNavigate}
            iconScale={typeof window !== 'undefined' && window.innerWidth >= 900 ? 2.2 : 1}
            nodeScale={typeof window !== 'undefined' && window.innerWidth >= 900 ? 2.0 : 1}
          />
        </div>
      </div>
    </div>
  );
};

export default HealthAssessment;