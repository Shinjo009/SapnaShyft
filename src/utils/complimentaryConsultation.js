export const COMPLIMENTARY_CONSULTATION_TYPES = {
  NUTRITIONIST: 'nutritionist',
  DOCTOR: 'doctor',
  DOCTOR_AND_NUTRITIONIST: 'doctor_and_nutritionist',
};

const asTruthyFlag = (value) => (
  value === true
  || value === 'true'
  || value === 'True'
  || value === 1
  || value === '1'
);

/**
 * Resolves complimentary consultation UI from diagnostic package API booleans:
 * - complementary_nutritionist
 * - complementary_doctor
 *
 * Both true → Doctor + Nutritionist. One true → that scenario. Neither → hidden.
 */
export const resolveComplimentaryConsultationType = (pkg) => {
  if (!pkg || typeof pkg !== 'object') {
    return null;
  }

  const hasNutritionist = asTruthyFlag(pkg.complementary_nutritionist);
  const hasDoctor = asTruthyFlag(pkg.complementary_doctor);

  if (hasDoctor && hasNutritionist) {
    return COMPLIMENTARY_CONSULTATION_TYPES.DOCTOR_AND_NUTRITIONIST;
  }

  if (hasDoctor) {
    return COMPLIMENTARY_CONSULTATION_TYPES.DOCTOR;
  }

  if (hasNutritionist) {
    return COMPLIMENTARY_CONSULTATION_TYPES.NUTRITIONIST;
  }

  return null;
};

export const COMPLIMENTARY_CONSULTATION_CONTENT = {
  [COMPLIMENTARY_CONSULTATION_TYPES.NUTRITIONIST]: {
    topPillLabel: 'Complimentary Nutritionist Consultation',
    sectionTitle: 'Complimentary Nutritionist',
    sectionAriaLabel: 'Complimentary Nutritionist',
    worthLabel: 'WORTH ₹999 — INCLUDED FREE',
    items: [
      { icon: 'call', label: '1-on-1 Consultation call' },
      { icon: 'diet', label: 'Personalized diet plan' },
      { icon: 'report', label: 'Report explanation in simple terms' },
      { icon: 'lifestyle', label: 'Lifestyle & habit recommendations' },
    ],
  },
  [COMPLIMENTARY_CONSULTATION_TYPES.DOCTOR]: {
    topPillLabel: 'Complimentary Doctor Consultation',
    sectionTitle: 'Complimentary Doctor',
    sectionAriaLabel: 'Complimentary Doctor',
    worthLabel: 'WORTH ₹1999 — INCLUDED FREE',
    items: [
      { icon: 'call', label: '1-on-1 Consultation call' },
      { icon: 'medical_insights', label: 'Medical insights based on your results' },
      { icon: 'guidance', label: 'Guidance on next steps / treatment if needed' },
      { icon: 'report', label: 'Report explanation in simple terms' },
    ],
  },
  [COMPLIMENTARY_CONSULTATION_TYPES.DOCTOR_AND_NUTRITIONIST]: {
    topPillLabel: 'Complimentary Doctor + Nutritionist',
    sectionTitle: 'Complimentary Doctor + Nutritionist',
    sectionAriaLabel: 'Complimentary Doctor and Nutritionist',
    worthLabel: 'WORTH ₹1999 — INCLUDED FREE',
    items: [
      { icon: 'call_both', label: '1-on-1 Consultation call with both experts' },
      { icon: 'medical_insights', label: 'Medical insights based on your results' },
      { icon: 'guidance', label: 'Guidance on next steps / treatment if needed' },
      { icon: 'diet', label: 'Personalized diet plan' },
      { icon: 'report', label: 'Report explanation in simple terms' },
      { icon: 'lifestyle', label: 'Lifestyle & habit recommendations' },
    ],
  },
};

export const getComplimentaryConsultationContent = (pkg) => {
  const type = resolveComplimentaryConsultationType(pkg);
  if (!type) {
    return null;
  }

  return COMPLIMENTARY_CONSULTATION_CONTENT[type] || null;
};
