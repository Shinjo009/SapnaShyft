import MCQQuestionnaire, { type MCQQuestion } from "@/components/questionnaire/MCQQuestionnaire";
import FamilyHistoryIcon from "@/images/FamilyHistory.svg";

const QUESTIONS: MCQQuestion[] = [
  {
    question: "Where have you lived most of your life?",
    options: ["Inland", "Coastal"],
  },
  {
    question: "Do any of your close blood relatives (i.e., parents or siblings) have the following health conditions?",
    subtitle: "(Select multiple or None that apply)",
    multiSelect: true,
    options: [
      "Type 2 Diabetes",
      "Hypertension",
      "Fatty Liver",
      "Lipid Disorders",
      "Heart Ailments",
      "Thyroid Disorders",
      "PCOS",
      "Stroke",
      "Mental Health",
      "None",
      "Other",
    ],
  },
  {
    question: "Are you diagnosed with the following diseases?",
    subtitle: "(Select multiple or None that apply)",
    multiSelect: true,
    options: [
      "Type 2 Diabetes",
      "Hypertension",
      "Fatty Liver",
      "Lipid Disorders",
      "Heart Ailments",
      "Thyroid Disorders",
      "PCOS",
      "Stroke",
      "Mental Health",
      "None",
      "Other",
    ],
  },
  {
    question: "Are you taking medications for the following diseases?",
    options: ["Yes", "No"],
  },
];

const FamilyHistory = () => (
  <MCQQuestionnaire
    title="Family History"
    subtitle="Knowing your family's health patterns helps us predict risks more accurately."
    icon={<img src={FamilyHistoryIcon} alt="Family History" className="w-12 h-12 object-contain" />}
    questions={QUESTIONS}
    categoryId="family-history"
  />
);

export default FamilyHistory;
