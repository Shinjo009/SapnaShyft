/**
 * Frontend-only / no-send mode for the NewDesQues redesign preview.
 *
 * Kept true so Profile → Settings → NewDesQues never hits the live questionnaire
 * APIs and never replaces the production Health Assessment flow.
 */
export const FRONTEND_ONLY = true

export function isFrontendOnly(): boolean {
  return FRONTEND_ONLY
}
