import {
  getLifestyleValueTone,
  getLifestyleValueToneClass,
  normalizeLifestyleAnswer,
} from './lifestyleValueTone';

describe('lifestyleValueTone', () => {
  describe('normalizeLifestyleAnswer', () => {
    it('normalizes dashes and spacing', () => {
      expect(normalizeLifestyleAnswer('Between 5 to 7 hours')).toBe('between 5-7 hours');
      expect(normalizeLifestyleAnswer('1 to 3 times a week')).toBe('1-3 times a week');
      expect(normalizeLifestyleAnswer('Between 5–7 hours')).toBe('between 5-7 hours');
    });
  });

  describe('sleep', () => {
    it('maps questionnaire sleep bands', () => {
      expect(getLifestyleValueTone('sleep', 'Between 7-9 hours')).toBe('optimal');
      expect(getLifestyleValueTone('sleep', 'Between 5 to 7 hours')).toBe('stable');
      expect(getLifestyleValueTone('sleep', 'More than 9 hours')).toBe('stable');
      expect(getLifestyleValueTone('sleep', 'Less than 5 hours')).toBe('critical');
    });
  });

  describe('alcohol', () => {
    it('maps questionnaire alcohol answers', () => {
      expect(getLifestyleValueTone('alcohol', 'I do not drink alcohol')).toBe('optimal');
      expect(getLifestyleValueTone('alcohol', 'I quit alcohol')).toBe('optimal');
      expect(getLifestyleValueTone('alcohol', '1-2 times in 3 months')).toBe('stable');
      expect(getLifestyleValueTone('alcohol', '1-2 times in 6 months')).toBe('stable');
      expect(getLifestyleValueTone('alcohol', '3 servings per week or less')).toBe('vulnerable');
      expect(getLifestyleValueTone('alcohol', 'More than 3 servings per week')).toBe('critical');
    });
  });

  describe('smoke', () => {
    it('maps questionnaire smoke answers', () => {
      expect(getLifestyleValueTone('smoke', 'I do not smoke')).toBe('optimal');
      expect(getLifestyleValueTone('smoke', 'I quit smoking')).toBe('optimal');
      expect(getLifestyleValueTone('smoke', '1-2 times a month')).toBe('stable');
      expect(getLifestyleValueTone('smoke', '4-5 times a month')).toBe('stable');
      expect(getLifestyleValueTone('smoke', '1-3 times a week')).toBe('vulnerable');
      expect(getLifestyleValueTone('smoke', '1 to 3 times a week')).toBe('vulnerable');
      expect(getLifestyleValueTone('smoke', '5-7 times a week')).toBe('critical');
      expect(getLifestyleValueTone('smoke', 'More than 7 times a week')).toBe('critical');
    });
  });

  describe('physical activity', () => {
    it('maps questionnaire physical activity answers', () => {
      expect(getLifestyleValueTone('physical_activity', 'More than 60 minutes a day')).toBe('optimal');
      expect(getLifestyleValueTone('physical_activity', '30-60 minutes a day')).toBe('stable');
      expect(getLifestyleValueTone('physical_activity', 'Less than 30 minutes a day')).toBe('vulnerable');
      expect(getLifestyleValueTone('physical_activity', 'Rarely or never')).toBe('critical');
    });
  });

  describe('getLifestyleValueToneClass', () => {
    it('returns css class for tone', () => {
      expect(getLifestyleValueToneClass('alcohol', 'I quit alcohol')).toBe(
        'health-scan-page__metric-value-tone--optimal',
      );
      expect(getLifestyleValueToneClass('smoke', '1-3 times a week')).toBe(
        'health-scan-page__metric-value-tone--vulnerable',
      );
    });
  });
});
