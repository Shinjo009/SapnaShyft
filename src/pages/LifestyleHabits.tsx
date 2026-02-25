import MCQQuestionnaire, { type MCQQuestion } from "@/components/questionnaire/MCQQuestionnaire";
import LifestyleHabitsIcon from "@/images/LifestyleHabits.svg";

const QUESTIONS: MCQQuestion[] = [
  {
    question: "How long do you sit continuously every day due to work or lifestyle?",
    options: ["Less than 1 hour", "1–4 hours", "More than 4 hours"],
  },
  {
    question: "How much time do you spend engaging in physical activity or exercise daily?",
    subtitle: "(Brisk Walking or Bicycling or Heavy Lifting or Games or Yoga or Meditation or Cleaning)",
    options: [
      "30–60 minutes a day",
      "Rarely or never",
      "Less than 30 minutes a day",
      "More than 60 minutes a day",
    ],
  },
  {
    question: "What is your average duration of good-quality sleep?",
    options: [
      "Less than 5 hours",
      "Between 5–7 hours",
      "Between 7–9 hours",
      "More than 9 hours",
    ],
  },
  {
    question: "What is your weekly alcohol consumption?",
    subtitle: "(1 serving = 125 ml wine or 330 ml of beer or 40 ml of hard liquor)",
    options: [
      "3 servings per week or less",
      "I quit alcohol",
      "I do not drink alcohol",
      "More than 3 servings per week",
    ],
  },
  {
    question: "How much time do you spend actively walking each day?",
    options: [
      "Less than 15 mins",
      "Between 15–30 mins",
      "Between 30–60 mins",
      "Between 1–2 hours",
      "More than 2 hours",
    ],
  },
  {
    question: "On a typical week, how much time do you dedicate to leisure activities, workouts or sports?",
    options: [
      "1–3 hours",
      "4–8 hours",
      "Rarely or never",
      "Less than 1 hour",
      "More than 8 hours",
    ],
  },
  {
    question: "On an average week, how would you rate the intensity of your activities or workouts?",
    options: ["Low-intensity", "Moderate-intensity", "High-intensity"],
  },
  {
    question: "How often do you fall sick in a year?",
    subtitle: "(Required at least a day of bed rest)",
    options: [
      "Rarely or Never",
      "1 to 2 times",
      "2 to 3 times",
      "4 to 5 times",
      "More than 6 times",
    ],
  },
  {
    question: "What are your primary health and wellness priorities?",
    subtitle: "(Choose your top two priority)",
    multiSelect: true,
    options: [
      "Weight Loss",
      "Building Muscle Mass",
      "Improving Metabolic Health",
      "Increase Energy Levels",
      "Increasing Strength",
      "Improving Physical Endurance",
    ],
  },
  {
    question: "What aspect of your lifestyle changes would you like to prioritize?",
    options: [
      "Reducing daily diet intake",
      "Forming healthy habits",
      "Increasing physical activity",
    ],
  },
];

const LifestyleHabits = () => (
  <MCQQuestionnaire
    title="Lifestyle & Habits"
    subtitle="Your routines help our system decode how your habits influence your health."
    icon={<img src={LifestyleHabitsIcon} alt="Lifestyle & Habits" className="w-12 h-12 object-contain" />}
    questions={QUESTIONS}
    categoryId="lifestyle-habits"
  />
);

export default LifestyleHabits;