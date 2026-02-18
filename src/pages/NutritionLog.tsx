import MCQQuestionnaire, { type MCQQuestion } from "@/components/questionnaire/MCQQuestionnaire";
import NutritionLogIcon from "@/images/NutritionLogs.svg";

const QUESTIONS: MCQQuestion[] = [
  {
    question: "What type of diet do you primarily consume?",
    options: ["Veg", "Jain", "Non-Veg", "Eggetarian", "Pescatarian"],
  },
  {
    question: "Which of the following food groups do you consume every day?",
    subtitle: "(Select all that apply)",
    multiSelect: true,
    options: [
      "Pulses / Legumes",
      "Fresh Fruits",
      "Whole Grains",
      "Eggs",
      "Fresh Vegetables",
      "Nuts / Seeds",
      "Whole Milk / Curd",
      "Chicken / Fish",
      "Cruciferous (Cauliflower, Cabbage)",
      "None",
    ],
  },
  {
    question: "How frequently do you have a healthy homemade breakfast in a week?",
    options: ["More than 5 times", "Less than 5 times", "Do not have breakfast"],
  },
  {
    question: "How frequently do you consume fresh fruits?",
    options: [
      "Once a week or less",
      "2-3 times a week",
      "1-2 times per day",
      "Rarely or never",
      "1-2 times per month",
    ],
  },
  {
    question: "How frequently do you consume cookies, biscuits, bread, or cakes?",
    options: [
      "Once a week or less",
      "2-3 times a week",
      "Rarely or never",
      "1-2 times per month",
      "4 or more times a week",
    ],
  },
  {
    question: "What type of coffee or tea do you drink?",
    options: [
      "Tea with sugar & milk",
      "Green tea",
      "Coffee with sugar & milk",
      "Black tea",
      "Milk tea without sugar",
      "Black Coffee",
      "Milk coffee without sugar",
    ],
  },
  {
    question: "How frequently do you consume sugary drinks and desserts?",
    subtitle: "(Soft Drinks, Ice Cream, Chocolate, Cakes, Pastries, Candies or Sweets)",
    options: [
      "Once a week or less",
      "2-3 times a week",
      "1-2 times per day",
      "Rarely or never",
      "1-2 times per month",
      "4 or more times a week",
    ],
  },
  {
    question: "Do you use iodized salt in your diet?",
    options: ["Yes", "No"],
  },
  {
    question: "How often do you add extra salt to your food?",
    options: ["Never", "Rarely", "Usually"],
  },
  {
    question: "How frequently do you consume fresh vegetables?",
    options: [
      "Once a week or less",
      "2-3 times a week",
      "1-2 times per day",
      "Rarely or never",
      "1-2 times per month",
    ],
  },
  {
    question: "How frequently do you consume red meat (i.e., mutton, lamb, beef, pork)?",
    options: [
      "Once a week or less",
      "2-3 times a week",
      "4 or more times a week",
      "Rarely or never",
      "1-2 times per month",
    ],
  },
  {
    question: "How frequently do you indulge in dishes that are rich in market butter?",
    options: [
      "Once a week or less",
      "2-3 times a week",
      "4 or more times a week",
      "Rarely or never",
      "1-2 times per month",
    ],
  },
  {
    question: "What's your daily coffee or tea intake?",
    options: [
      "I do not drink coffee or tea",
      "1-2 cups per day",
      "More than 2 cups per day",
    ],
  },
  {
    question: "How many glasses of water do you drink in a day?",
    subtitle: "(1 glass of water is ~250 ml)",
    options: [
      "Less than 2 glasses",
      "2 glasses",
      "4 glasses",
      "6 glasses",
      "8 glasses",
      "More than 8 glasses",
    ],
  },
];

const NutritionLog = () => (
  <MCQQuestionnaire
    title="Nutrition Log"
    subtitle="Your dietary data helps our system decode patterns that impact your metabolic health."
    icon={<img src={NutritionLogIcon} alt="Nutrition Log" className="w-8 h-8" />}
    questions={QUESTIONS}
    categoryId="nutrition-log"
  />
);

export default NutritionLog;