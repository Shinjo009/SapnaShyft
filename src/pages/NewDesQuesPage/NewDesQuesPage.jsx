import React from 'react';
import { NewDesQuesFlow } from '../../newDesQues/NewDesQuesFlow.tsx';

/**
 * Profile → Settings → NewDesQues
 * Design preview of the redesigned Family / Lifestyle / Nutrition questionnaire
 * from dev-forms. Does not replace the production Health Assessment.
 */
const NewDesQuesPage = ({ onBack }) => {
  return <NewDesQuesFlow onBack={onBack} />;
};

export default NewDesQuesPage;
