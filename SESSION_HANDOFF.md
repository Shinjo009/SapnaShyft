# SESSION HANDOFF - Dev Frontend

Date Created: 2026-01-27
Last Updated: 2026-03-17
Status: Questionnaire / Health Assessment flow added; all profile subpages complete; PWA install prompt wired

## Workspace
- Path: `c:\Supershyft\dev-frontend`
- Stack: React (CRA style), page-state navigation in `src/App.js` (no React Router)
- Styling: Mix of Tailwind utilities + page-level CSS files
- Theme direction: dark teal/green glassmorphism style, Lato/Inter typography

## Current Navigation Model
Navigation is controlled by `currentPage` in `src/App.js`.

Currently wired pages include:
- `splash`
- `login`
- `signup`
- `otp`
- `health-insights`
- `home`
- `health-assessment`
- `questionnaire-blank`
- `health-scan-index`
- `disease-risk-analysis`
- `disease-detail`
- `profile`
- `reports`
- `nutrition`
- `customer-support`
- `permissions`
- `add-account`
- `edit-profile`
- `faq`
- `terms`

## What Is Completed

### Auth + onboarding related
- Login redesign complete:
  - Removed "Welcome To"
  - Updated spacing/typography
  - Phone validation and limits
  - Bottom powered-by branding
- Signup redesign complete:
  - Two-column first/last name
  - Gender selection UI
  - Optional organization field
  - Powered-by block
- OTP redesign complete:
  - Updated OTP box style
  - Helper text with masked number logic
  - Powered-by block
- Health insights/get started screen updated with bottom branding and spacing tweaks

### Profile hub and subpages
- `My Profile` major redesign complete:
  - Top profile card rebuilt from provided assets
  - Static lower menu sections (no dropdown behavior)
  - Delete and logout modals restored and tuned
- Added and wired subpages:
  - Reports
  - Nutrition
  - Customer Support
  - Permissions
  - Add Account
  - Edit Profile
  - FAQ
  - Terms & Conditions

### Most recent changes in this session
- Terms & Conditions page created and wired from Profile > Policy > Terms & Conditions.
- Terms page updated to:
  - 20px side alignment for cards
  - Use icons from:
    - `src/images/info-terms.svg`
    - `src/images/Eligibility-terms.svg`
    - `src/images/Services-terms.svg`
  - Text under section headers aligned with header text start
- Bottom-most terms container visual box removed while keeping consent text + Accept button.

### Health Assessment / Questionnaire flow (added 2026-03-17)
- `HealthAssessmentPage` added and wired as `health-assessment`:
  - Displayed after tapping "Health Assessment" from HomePage.
  - Receives `steps`, `progress`, `expandedStep`, `questionsByRouteId`, and callbacks.
  - Scroll is locked on body/html while this page is active (via `useEffect` in `App.js`).
- `QuestionnaireBlankPage` added and wired as `questionnaire-blank`:
  - Backs out to `health-assessment` (resets `expandedQuestionnaireStep` to null).
- Questionnaire state managed in `App.js`:
  - `questionnaireSteps` — array of category objects from API.
  - `questionnaireQuestionsByCategoryId` — map of categoryId → questions array.
  - `questionnaireProgress` — integer 0–5 tracking completed categories.
  - `expandedQuestionnaireStep` — currently open step index (single expanded at a time).
- `initializeQuestionnaire()` in `App.js` calls `loadQuestionnaireContext()` from `src/services/questionnaireService.js` and seeds all questionnaire state.
- Route ID → progress integer map: `anthropometry=1`, `family-history=2`, `lifestyle-habits=3`, `nutrition-log=4`, `vitals=5`.
- `handleStepComplete(routeId)` advances progress and collapses expanded step.
- Questionnaire images available in `src/images/`: `ques-1.svg`–`ques-5.svg`, `ques-arrow.svg`, `ques-elon.svg`, `ques-glow1.svg`, `ques-glow2.svg`, `ques-norm.svg`, `ques-tick.svg`.

### PWA Install Prompt (added)
- `beforeinstallprompt` / `appinstalled` events wired in `App.js`.
- Banner renders at fixed top when `showInstallPrompt === true`.
- Install / Later buttons call `handleInstallClick` / `handleDismissInstall`.

## Key Files Added Recently
- `src/pages/ReportsPage/`
- `src/pages/NutritionPage/`
- `src/pages/CustomerSupportPage/`
- `src/pages/PermissionsPage/`
- `src/pages/AddAccountPage/`
- `src/pages/EditProfilePage/`
- `src/pages/FAQPage/`
- `src/pages/TermsConditionsPage/`
- `src/pages/HealthAssessmentPage/` ← new
- `src/pages/QuestionnaireBlankPage/` ← new
- `src/services/questionnaireService.js` ← new

## Key Files Updated Recently
- `src/App.js` — questionnaire state, PWA install prompt, scroll lock, new page routes
- `src/pages/ProfilePage/ProfilePage.jsx`
- Multiple page-level CSS files under `src/pages/**`

## Important UX/Implementation Notes
- User preference: do not run full build after every small UI change.
- Work style has been screenshot-driven pixel adjustments.
- Most new pages are UI-first (static/mock data), API integration is pending for later.

## Known Pending/Next Likely Tasks
- Pixel-level refinement passes after visual review (spacing/typography offsets).
- Wire functional save/update flows (Edit Profile / Add Account) if required by backend.
- Implement Privacy Policy page and wire from Profile if requested.
- Complete questionnaire step UIs inside `HealthAssessmentPage` (currently scaffolded; each route — anthropometry, family-history, lifestyle-habits, nutrition-log, vitals — may need its own question form UI).
- Wire `QuestionnaireBlankPage` to display actual blank/in-progress question state.
- Optional: centralize duplicated page-header styles into reusable component.

## Run / Test
From workspace root:

```bash
npm start
```

## Fast Resume Prompt
Use this prompt next session:

"Read `SESSION_HANDOFF.md` and continue from latest state. We are using page-state navigation in `src/App.js` (no React Router). The questionnaire/health-assessment flow was the last major feature added. Focus on pixel-perfect UI refinements or whatever new page/feature I specify."
