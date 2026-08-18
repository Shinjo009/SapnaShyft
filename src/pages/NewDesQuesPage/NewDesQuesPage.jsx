import React from 'react';
import { NewDesQuesFlow } from '../../newDesQues/NewDesQuesFlow.tsx';

/**
 * Profile → Settings → Scenario 1 / 2 / 3
 * Design preview of the redesigned questionnaire. Does not replace production HA.
 */
const NewDesQuesPage = ({ onBack, scenario = 2 }) => {
  return <NewDesQuesFlow key={scenario} onBack={onBack} scenario={scenario} />;
};

export default NewDesQuesPage;
