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

  // Handle returning from a form page with completion
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
      // For categories without a form yet, just mark complete
      setCompletedIds((prev) => new Set(prev).add(id));
      setActiveId(null);
    }
  }, [navigate]);

  return (
    <MobileFrame>
      <div className="flex flex-col h-full px-4 pt-12 pb-8">
        <Header />
        <div className="flex-1 flex flex-col justify-center mt-4">
          <Timeline
            categories={categories}
            activeId={activeId}
            onSelect={handleSelect}
            onNavigate={handleNavigate}
          />
        </div>
      </div>
    </MobileFrame>
  );
};

export default HealthAssessment;