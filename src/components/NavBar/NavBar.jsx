/**
 * Bottom navigation entry point.
 *
 * Active implementation: **NavBar2** (`src/components/NavBar2/`) — floating pill dock + sliding
 * highlight per Figma “App — first phase” navbar treatment.
 *
 * Legacy notch / floating-orb navbar (previous production bar) is preserved in
 * `./NavBarLegacy.jsx` for reference or rollback — not imported here.
 *
 * ```tsx
 * // To temporarily restore the old bar:
 * // export { default } from './NavBarLegacy';
 * ```
 */
export { default } from '../NavBar2/NavBar2';
