import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HealthAssessment from "./pages/HealthAssessment";
import Anthropometry from "./pages/Anthropometry";
import Vitals from "./pages/Vitals";
import NutritionLog from "./pages/NutritionLog";
import LifestyleHabits from "./pages/LifestyleHabits";
import FamilyHistory from "./pages/FamilyHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HealthAssessment />} />
          <Route path="/anthropometry" element={<Anthropometry />} />
          <Route path="/vitals" element={<Vitals />} />
          <Route path="/nutrition-log" element={<NutritionLog />} />
          <Route path="/lifestyle-habits" element={<LifestyleHabits />} />
          <Route path="/family-history" element={<FamilyHistory />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;