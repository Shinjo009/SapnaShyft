import {
  buildBmrInterpretation,
  buildBodyFatInterpretation,
  buildCarbsInterpretation,
  buildFatsInterpretation,
  buildProteinInterpretation,
  buildFibreInterpretation,
  getMacroIdealRangeDisplay,
  categoryToTone,
  classifyByTiers,
  extractGenderSegment,
  findBestFitTier,
  normalizeMacroGoal,
  normalizePatientGender,
  parseNumericBounds,
  splitInterpretationText,
  valueInBounds,
  buildTierDefinitions,
} from './macroClassificationInterpretation';

describe('macroClassificationInterpretation', () => {
  describe('normalizeMacroGoal', () => {
    it('maps common aliases to sheet goals', () => {
      expect(normalizeMacroGoal('For Weight Loss')).toBe('Weight Loss');
      expect(normalizeMacroGoal('building muscle')).toBe('Building Muscle Mass');
      expect(normalizeMacroGoal('Improving metabolic health')).toBe('Improving Metabolic Health');
    });

    it('defaults unknown goals to Weight Loss', () => {
      expect(normalizeMacroGoal('')).toBe('Weight Loss');
      expect(normalizeMacroGoal('random goal')).toBe('Weight Loss');
    });
  });

  describe('normalizePatientGender', () => {
    it('detects male and female variants', () => {
      expect(normalizePatientGender({ gender: 'male' })).toBe('M');
      expect(normalizePatientGender({ gender: 'Female' })).toBe('F');
      expect(normalizePatientGender({ sex: 'm' })).toBe('M');
    });

    it('defaults to female when unknown', () => {
      expect(normalizePatientGender({})).toBe('F');
    });
  });

  describe('parseNumericBounds', () => {
    it('parses between, gte, and lt patterns', () => {
      expect(parseNumericBounds('1400–1599')).toEqual({
        min: 1400,
        max: 1599,
        minInclusive: true,
        maxInclusive: true,
      });
      expect(parseNumericBounds('≥1600 kcal/day')).toEqual({
        min: 1600,
        max: null,
        minInclusive: true,
        maxInclusive: true,
      });
      expect(parseNumericBounds('<1200')).toEqual({
        min: null,
        max: 1200,
        minInclusive: true,
        maxInclusive: false,
      });
      expect(parseNumericBounds('>42 %')).toEqual({
        min: 42,
        max: null,
        minInclusive: false,
        maxInclusive: true,
      });
    });
  });

  describe('extractGenderSegment', () => {
    it('selects female and male BMR segments', () => {
      const raw = '≥1600 kcal/day (F) / ≥1800 kcal/day (M)';
      expect(extractGenderSegment(raw, 'F')).toContain('1600');
      expect(extractGenderSegment(raw, 'M')).toContain('1800');
    });

    it('selects female and male body fat segments', () => {
      const raw = 'F: 21–32% | M: 14–24%';
      expect(extractGenderSegment(raw, 'F')).toBe('21-32%');
      expect(extractGenderSegment(raw, 'M')).toBe('14-24%');
    });
  });

  describe('classifyByTiers — Weight Loss BMR (female)', () => {
    const tiers = buildTierDefinitions('Weight Loss', { gender: 'F', metric: 'bmr' });

    it('classifies optimal, stable, vulnerable, and critical BMR', () => {
      expect(classifyByTiers(1650, tiers)?.tone).toBe('optimal');
      expect(classifyByTiers(1500, tiers)?.tone).toBe('stable');
      expect(classifyByTiers(1300, tiers)?.tone).toBe('vulnerable');
      expect(classifyByTiers(1100, tiers)?.tone).toBe('critical');
    });

    it('respects boundary at 1600 kcal', () => {
      expect(classifyByTiers(1600, tiers)?.tone).toBe('optimal');
      expect(classifyByTiers(1599, tiers)?.tone).toBe('stable');
    });
  });

  describe('classifyByTiers — Weight Loss body fat (female)', () => {
    const tiers = buildTierDefinitions('Weight Loss', { gender: 'F', metric: 'bodyFat' });

    it('classifies body fat tiers', () => {
      expect(classifyByTiers(28, tiers)?.tone).toBe('optimal');
      expect(classifyByTiers(35, tiers)?.tone).toBe('stable');
      expect(classifyByTiers(40, tiers)?.tone).toBe('vulnerable');
      expect(classifyByTiers(43, tiers)?.tone).toBe('critical');
    });

    it('places 42% in vulnerable not critical', () => {
      expect(classifyByTiers(42, tiers)?.tone).toBe('vulnerable');
    });
  });

  describe('classifyByTiers — Weight Loss carbs', () => {
    const tiers = buildTierDefinitions('Weight Loss', { metric: 'carbs' });

    it('classifies carb percent tiers', () => {
      expect(classifyByTiers(42, tiers)?.tone).toBe('optimal');
      expect(classifyByTiers(50, tiers)?.tone).toBe('stable');
      expect(classifyByTiers(60, tiers)?.tone).toBe('vulnerable');
      expect(classifyByTiers(70, tiers)?.tone).toBe('critical');
    });
  });

  describe('buildBmrInterpretation', () => {
    it('returns sheet interpretation for patient value', () => {
      const result = buildBmrInterpretation({
        bmr: { value: 1500 },
        goal: 'Weight Loss',
        genderSources: { gender: 'female' },
      });

      expect(result.tone).toBe('stable');
      expect(result.headline).toBe('Mildly suppressed BMR.');
      expect(result.body).toContain('Monitor how your metabolism responds');
      expect(result.tiers).toHaveLength(4);
      expect(result.tiers[0].range).toContain('1600');
    });

    it('uses male BMR thresholds when gender is male', () => {
      const femaleResult = buildBmrInterpretation({
        bmr: { value: 1750 },
        goal: 'Weight Loss',
        genderSources: { gender: 'female' },
      });
      const maleResult = buildBmrInterpretation({
        bmr: { value: 1750 },
        goal: 'Weight Loss',
        genderSources: { gender: 'male' },
      });

      expect(femaleResult.tone).toBe('optimal');
      expect(maleResult.tone).toBe('stable');
    });
  });

  describe('buildBodyFatInterpretation', () => {
    it('returns sheet copy for classified body fat', () => {
      const result = buildBodyFatInterpretation({
        bodyFat: { value: 35 },
        goal: 'Weight Loss',
        genderSources: { gender: 'female' },
      });

      expect(result.tone).toBe('stable');
      expect(result.headline).toBe('Above Healthy Range.');
      expect(result.tiers.some((tier) => tier.range.includes('33'))).toBe(true);
    });

    it('does not mark 14% as critical when below female WL optimal band', () => {
      const result = buildBodyFatInterpretation({
        bodyFat: { value: 14, severity: 'red' },
        goal: 'Weight Loss',
        genderSources: { gender: 'female' },
        statusObj: { severity: 'red' },
      });

      expect(result.tone).toBe('optimal');
      expect(result.headline).toBe('Healthy Fat Range.');
    });

    it('classifies 14% as optimal for male weight loss', () => {
      const result = buildBodyFatInterpretation({
        bodyFat: { value: 14 },
        goal: 'Weight Loss',
        genderSources: { gender: 'male' },
      });

      expect(result.tone).toBe('optimal');
      expect(result.headline).toBe('Healthy Fat Range.');
    });
  });

  describe('findBestFitTier', () => {
    it('maps below-min body fat to optimal tier not critical', () => {
      const tiers = buildTierDefinitions('Weight Loss', { gender: 'F', metric: 'bodyFat' });
      expect(findBestFitTier(14, tiers)?.tone).toBe('optimal');
    });
  });

  describe('classifyByTiers — Weight Loss macros', () => {
    it('classifies fats percent tiers from sheet', () => {
      const tiers = buildTierDefinitions('Weight Loss', { metric: 'fats' });
      expect(classifyByTiers(27, tiers)?.tone).toBe('optimal');
      expect(classifyByTiers(22, tiers)?.tone).toBe('stable');
      // Increased Risk and High Risk both use 15–19% in the sheet; last tier wins.
      expect(classifyByTiers(17, tiers)?.tone).toBe('critical');
    });

    it('classifies protein percent tiers from sheet', () => {
      const tiers = buildTierDefinitions('Weight Loss', { metric: 'protein' });
      expect(classifyByTiers(28, tiers)?.tone).toBe('optimal');
      expect(classifyByTiers(23, tiers)?.tone).toBe('stable');
      expect(classifyByTiers(18, tiers)?.tone).toBe('vulnerable');
      expect(classifyByTiers(12, tiers)?.tone).toBe('critical');
    });

    it('classifies fibre grams tiers from sheet', () => {
      const tiers = buildTierDefinitions('Weight Loss', { metric: 'fibre' });
      expect(classifyByTiers(35, tiers)?.tone).toBe('optimal');
      expect(classifyByTiers(25, tiers)?.tone).toBe('stable');
      expect(classifyByTiers(17, tiers)?.tone).toBe('vulnerable');
      expect(classifyByTiers(10, tiers)?.tone).toBe('critical');
    });
  });

  describe('buildCarbsInterpretation', () => {
    it('classifies carbs from estimated macro band', () => {
      const result = buildCarbsInterpretation({
        carbs: { estimated_low: 48, estimated_high: 52 },
        goal: 'Weight Loss',
      });

      expect(result.tone).toBe('stable');
      expect(result.cardTitle).toBe('Carbs %');
      expect(result.zones).toHaveLength(4);
      expect(result.zones[0].range).toContain('40');
    });
  });

  describe('buildFatsInterpretation', () => {
    it('returns fats overlay zones from sheet', () => {
      const result = buildFatsInterpretation({
        fats: { estimated_low: 26, estimated_high: 28 },
        goal: 'Weight Loss',
      });

      expect(result.tone).toBe('optimal');
      expect(result.cardTitle).toBe('Fats %');
      expect(result.zones[0].range).toContain('25');
    });
  });

  describe('buildProteinInterpretation', () => {
    it('returns protein overlay zones from sheet', () => {
      const result = buildProteinInterpretation({
        protein: { estimated_low: 22, estimated_high: 24 },
        goal: 'Weight Loss',
      });

      expect(result.tone).toBe('stable');
      expect(result.cardTitle).toBe('Protein %');
      expect(result.zones[0].range).toContain('25');
    });
  });

  describe('buildFibreInterpretation', () => {
    it('returns fibre overlay zones in grams', () => {
      const result = buildFibreInterpretation({
        fibre: { estimated_low: 32, estimated_high: 36 },
        goal: 'Weight Loss',
      });

      expect(result.tone).toBe('optimal');
      expect(result.cardTitle).toBe('Fibre');
      expect(result.zones[0].unit).toBe('g');
      expect(getMacroIdealRangeDisplay(result)).toBe('30-40 g');
    });
  });

  describe('splitInterpretationText', () => {
    it('splits headline and body on first sentence', () => {
      expect(splitInterpretationText('Adequate BMR. Helps maintain deficit.')).toEqual({
        headline: 'Adequate BMR.',
        body: 'Helps maintain deficit.',
      });
    });
  });

  describe('categoryToTone', () => {
    it('maps sheet categories to UI tones', () => {
      expect(categoryToTone('Healthy')).toBe('optimal');
      expect(categoryToTone('Insufficient')).toBe('vulnerable');
      expect(categoryToTone('High Risk')).toBe('critical');
    });
  });

  describe('valueInBounds', () => {
    it('handles inclusive and exclusive edges', () => {
      const bounds = parseNumericBounds('1200–1399');
      expect(valueInBounds(1200, bounds)).toBe(true);
      expect(valueInBounds(1399, bounds)).toBe(true);
      expect(valueInBounds(1400, bounds)).toBe(false);
    });
  });
});
