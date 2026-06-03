import {
  computeQuestionsWithVisibility,
  normalizeAnswerForVisibilityRules,
} from './questionnaireVisibility';

const dietQuestion = {
  question_key: 'diet_preference',
  question_type: 'single_choice',
  options: [
    { option_value: '0', display_name: 'Vegetarian' },
    { option_value: '1', display_name: 'Non-Vegetarian' },
    { option_value: '3', display_name: 'Pescatarian' },
    { option_value: '5', display_name: 'Jain' },
  ],
};

const redMeatQuestion = {
  question_key: 'red_meat_frequency',
  question_text: 'How frequently do you consume red meat?',
  question_type: 'single_choice',
  options: [{ option_value: '1', display_name: '4 or more times a week' }],
};

const caffeineFrequencyQuestion = {
  question_key: 'caffeine_frequency',
  question_type: 'single_choice',
  options: [
    { option_value: '0', display_name: 'I do not drink coffee or tea' },
    { option_value: '3', display_name: '2-3 times a week' },
    { option_value: '1', display_name: '1-2 cups per day' },
  ],
};

const caffeineTypeQuestion = {
  question_key: 'caffeine_type',
  question_type: 'single_choice',
  options: [{ option_value: '1', display_name: 'Green Tea' }],
};

describe('questionnaireVisibility', () => {
  describe('normalizeAnswerForVisibilityRules', () => {
    it('maps display labels to option_value for rule operators', () => {
      expect(normalizeAnswerForVisibilityRules(dietQuestion, 'Vegetarian')).toBe('0');
      expect(normalizeAnswerForVisibilityRules(caffeineFrequencyQuestion, '2-3 times a week')).toBe('3');
    });
  });

  describe('computeQuestionsWithVisibility', () => {
    it('hides red_meat_frequency when vegetarian diet is selected (display label)', () => {
      const questions = [dietQuestion, redMeatQuestion];
      const withSelections = computeQuestionsWithVisibility(questions, {
        selections: { diet_preference: ['Vegetarian'] },
      });
      expect(withSelections[0].is_visible).toBe(true);
      expect(withSelections[1].is_visible).toBe(false);
    });

    it('shows red_meat_frequency for non-vegetarian diets', () => {
      const questions = [dietQuestion, redMeatQuestion];
      const withSelections = computeQuestionsWithVisibility(questions, {
        selections: { diet_preference: ['Non-Vegetarian'] },
      });
      expect(withSelections[1].is_visible).toBe(true);
    });

    it('hides caffeine_type when frequency is no coffee or 2-3 times a week', () => {
      const questions = [caffeineFrequencyQuestion, caffeineTypeQuestion];
      const hidden = computeQuestionsWithVisibility(questions, {
        selections: { caffeine_frequency: ['I do not drink coffee or tea'] },
      });
      expect(hidden[1].is_visible).toBe(false);

      const hiddenWeekly = computeQuestionsWithVisibility(questions, {
        selections: { caffeine_frequency: ['2-3 times a week'] },
      });
      expect(hiddenWeekly[1].is_visible).toBe(false);

      const visible = computeQuestionsWithVisibility(questions, {
        selections: { caffeine_frequency: ['1-2 cups per day'] },
      });
      expect(visible[1].is_visible).toBe(true);
    });
  });
});
