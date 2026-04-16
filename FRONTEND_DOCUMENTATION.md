# Supershyft Frontend — Technical Documentation

This document describes the **supershyft-frontend** React application: structure, screens, reusable UI, API usage, configuration, and runtime behavior. It is derived from the repository source as of the documentation generation date.

---

## 1. Project Overview

### What the application does

**Supershyft** is a consumer-facing **health and wellness web application** (PWA-oriented) that helps users:

- Authenticate with **phone OTP**
- Complete **onboarding / signup** with profile details
- View a **personalized home dashboard** (metabolic age, health parameters, positive wins, disease risk summaries)
- Explore **diagnostic packages**, build **custom packages**, and initiate **bookings** with **patient selection** and **Razorpay** checkout
- Complete a multi-step **health assessment questionnaire** tied to backend assessments
- Browse **blood markers**, **disease risk analysis**, **doctors / experts**, **Super Club** content, and **profile** settings (linked accounts, permissions, support, legal pages)

### Target users / purpose

- **End users** seeking preventive health insights, lab packages, and guided assessment flows (Indian market context: `+91` phone masking, INR / Razorpay).
- **Primary + linked family profiles** under one login (account switching and sub-profiles).

### Frontend technology stack

| Area | Choice |
|------|--------|
| **Framework** | React 19 (`react`, `react-dom`) |
| **Tooling** | Create React App (`react-scripts` 5) |
| **Language** | JavaScript (`.js` / `.jsx`) |
| **Styling** | Tailwind CSS utility classes + component-scoped **CSS** files |
| **Build / dev** | `react-scripts` (`npm start`, `npm run build`) |
| **State management** | **React component state** in `App.js` as the single navigation + session coordinator; **no** Redux / Zustand / React Router |
| **HTTP** | Native **`fetch`** wrappers in `src/services/*` |
| **Analytics** | Google Analytics 4 via `gtag.js` when `REACT_APP_GA_MEASUREMENT_ID` is set |
| **Payments** | Razorpay Checkout.js loaded at runtime; backend order/verify endpoints |

---

## 2. Project Structure

| Path | Purpose |
|------|---------|
| **`public/`** | `index.html`, `manifest.json`, `robots.txt`, legacy `serviceWorker.js` (note: `src/index.js` unregisters SWs on load) |
| **`src/index.js`** | React root, global CSS import, GA init, **legacy PWA cache / service worker teardown** |
| **`src/App.js`** | **Root shell**: virtual routing via `currentPage`, auth/session orchestration, questionnaire orchestration, install prompt, edge-swipe back, renders one full-page component at a time |
| **`src/App.css`** | App-level layout (root scroll, install popup, backgrounds) |
| **`src/index.css`** | Global styles + Tailwind directives |
| **`src/config/appConfig.js`** | Normalized env-driven config (`BACKEND_BASE_URL`, Razorpay key id, demo mode, GA id) |
| **`src/pages/**`** | Full-screen views (one per major user journey); each folder typically has `index.js` re-export + main `*Page.jsx` |
| **`src/components/**`** | Reusable UI (buttons, inputs, nav, overlays, home sections, onboarding tour) |
| **`src/services/**`** | API clients: `authService`, `usersService`, `profileService`, `questionnaireService`, `reportService`, `diagnosticPackagesService`, `paymentService` |
| **`src/utils/authStorage.js`** | `localStorage` access/refresh token helpers |
| **`src/analytics/googleAnalytics.js`** | GA4 page views mapped from `currentPage` |
| **`src/images/**`** | SVG/PNG assets |
| **`src/metabolic-age-orb/**`** | Metabolic age visualization (`MetabolicAgeOrb` used on home); `index.jsx` + `OrbEditor.jsx` are a **standalone orb editor demo**, not mounted by `App.js` |
| **`tailwind.config.js`**, **`postcss.config.js`** | Tailwind / PostCSS pipeline for CRA |

---

## 3. Tech Stack & Dependencies

### Runtime dependencies (`package.json`)

| Package | Version | Role in this codebase |
|---------|---------|------------------------|
| **react** | ^19.2.4 | UI library |
| **react-dom** | ^19.2.4 | DOM renderer, `createRoot` |
| **react-scripts** | 5.0.1 | CRA: webpack, babel, jest, dev server |

### Dev dependencies

| Package | Role |
|---------|------|
| **tailwindcss** | Utility-first styling used across auth and many pages |
| **autoprefixer**, **postcss** | CSS pipeline for Tailwind |
| **cross-env** | Cross-platform env for `NODE_OPTIONS` in `npm start` |

### Transitive / implicit tooling

- **PropTypes** — used in several components (`Button`, `Input`, `Typography`, etc.); supplied via the CRA dependency tree (`prop-types` in lockfile).
- **ESLint** — `eslintConfig.extends: react-app` in `package.json`.
- **Razorpay** — loaded from CDN inside `paymentService.loadRazorpayScript()` (not an npm dependency).

---

## 4. Screens & Pages

The app does **not** use URL path routing. Navigation is **`App` state**: `currentPage` (string). Below, **Route key** is that internal identifier (conceptually `/${currentPage}` for GA virtual paths).

| Route key | Component (path) | Purpose & user actions | Key child components / sections | State / data (high level) |
|-----------|-------------------|---------------------------|----------------------------------|---------------------------|
| `splash` | `SplashScreen` → `SplashScreen2.jsx` (`src/pages/SplashScreen/`) | Brand splash; **Log In** / **Sign Up** | `Logo`, `RotatingCube` | Local: cube scale from `ResizeObserver` |
| `login` | `LoginPage.jsx` | Enter 10-digit phone; send OTP; go to signup | `Logo`, `Typography`, `Input`, `Button` | `phoneNumber`, `loading`, `error` |
| `signup` | `SignupPage.jsx` | Registration fields; submit creates user + OTP | `Input`, `Button`, gender toggles | `formData`, `loading`, `error` |
| `otp` | `OTPPage.jsx` | Enter 6-digit OTP; resend | `OTPInput`, `Timer`, `Button` | `otp`, `loading`, `resendLoading`, `error` |
| `health-insights` | `HealthInsightsPage.jsx` | Post-auth onboarding / insights; **Get Started** → home | Typography, CTAs | Minimal local UI state |
| `account-selection` | `AccountSelectionPage.jsx` | Pick linked profile before home when multiple accounts | Cards / list UI | Selection from `linkedAccounts` props |
| `home` | `HomePage.jsx` | Dashboard: metabolic orb, health scan teaser, wins, risk, bottom nav | `Header`, `MetabolicAgeOrb`, `HealthParametersSection`, `PositiveWinsSection`, `RiskAnalysisSection`, `NavBar` | Fetches `/reports/{id}/overview`; `metabolicAgeValue`, `positiveWinsData`, `riskAnalysisData`, `isNoDataHome`, nav handlers via props |
| `health-scan-index` | `HealthScanIndexPage.jsx` | Tabbed “health scan index” UX | `HealthScanNavBar` | `initialTab` from App; local tab state |
| `health-assessment` | `HealthAssessmentPage.jsx` | Large questionnaire UI (anthropometry, lifestyle, etc.) | Many embedded step UIs / icons | Driven by `steps`, `questionsByRouteId`, `progress`, `expandedStep` from App; submissions via `submitQuestionnaireResponses` |
| `questionnaire-blank` | `QuestionnaireBlankPage.jsx` | Placeholder screen (“Blank questionnaire page”) | Back button | **Not navigated to anywhere in `App.js` today** — wired but unreachable |
| `blood-markers` | `BloodMarkersPage.jsx` | Blood parameters by organ; search/filter; stacks; per-marker detail | Rich SVG/CSS UI | Loads `/reports/{id}/blood-parameters`; marker drill-down may call **`GET /diagnostics/health-parameters/{diagnosticTestId}`**; extensive local UI state |
| `disease-risk-analysis` | `DiseaseRiskAnalysisPage.jsx` | List / explore disease risks from latest report | Cards, tour target | GET `/reports/{id}/risk-analysis` |
| `disease-detail` | `DiseaseDetailPage.jsx` | Disease-specific narrative from report | Back nav | GET `/reports/{id}/risk-analysis?disease=...` |
| `profile` | `ProfilePage.jsx` | Profile summary, switch account, unlink, deep links | Modals, lists | `getMyProfile`, `getMyProfiles`, `switchAccount`, `unlinkMyProfile`, logout flow |
| `reports` | `ReportsPage.jsx` | Reports hub (UI) | Static / placeholder style content | Local UI only (no dedicated reports API module) |
| `nutrition` | `NutritionPage.jsx` | Nutrition content screen | Layout sections | Local UI |
| `customer-support` | `CustomerSupportPage.jsx` | Submit support query | Textarea | `submitSupportTicket` |
| `permissions` | `PermissionsPage.jsx` | Notification / storage toggles | Custom toggles | `getMyPreferences` / `updateMyPreferences` |
| `all-appointments` | `AllAppointmentsPage.jsx` | Appointments listing UI | List/cards | Local / mock-style data |
| `add-account` | `AddAccountPage.jsx` | Add linked sub-profile | `Input`, gender/relation selectors | `createMySubProfile` |
| `edit-profile` | `EditProfilePage.jsx` | Edit primary or sub-profile fields | `Input` | `getMyProfile`, `getMyProfiles`, `updateMyProfile` or `updateMySubProfile` |
| `faq` | `FAQPage.jsx` | FAQ content | Accordion / text | Local content |
| `terms` | `TermsConditionsPage.jsx` | Terms | Scrollable legal copy | Static |
| `privacy-policy` | `PrivacyPolicyPage.jsx` | Privacy | Scrollable copy | Static |
| `packages` | `PackagesPage.jsx` | Browse diagnostic packages, filters, book | `NavBar`, `PatientSelectionOverlay` | Loads `listDiagnosticPackages`, filter chips; overlay booking |
| `package-details` | `PackageDetailsPage.jsx` | Package detail tabs; book | `PatientSelectionOverlay` | `getDiagnosticPackageDetail`; overlay |
| `create-custom-package` | `CreateCustomPackagePage.jsx` | Pick tests/groups for custom package | Chips, groups, tests | `listDiagnosticPackageFilterChips`, `listDiagnosticTestGroups`, `listDiagnosticTestGroupTests` |
| `review-package` | `PackageDetailsPage.jsx` (`variant="custom-review"`) | Review custom build; confirm | Overlay / CTA | Uses `onCustomBookingConfirmed` callback to App |
| `doctors` | `DoctorsPage.jsx` | Expert directory entry | Cards | Navigation only |
| `expert-details-doctor` | `ExpertDetailsPage.jsx` (`expertType="doctor"`) | Doctor detail | Static / marketing layout | Local |
| `expert-details-nutritionist` | `ExpertDetailsPage.jsx` (`expertType="nutritionist"`) | Nutritionist detail | Static layout | Local |
| `integrated-health-program` | `IntegratedHealthProgramPage.jsx` | Program detail | Static/marketing | Local |
| `super-club` | `SuperClubPage.jsx` | Super Club landing / onboarding flow | Marquee, CTAs | Local; navigates to `super-club-2` |
| `super-club-2` | `SuperClubPage2.jsx` | Post-onboarding club view | Liked sports from `superClubStorage` | Local |
| **(file only)** | `SuperClubSportPage.jsx` | Sport-specific view | — | **Not referenced in `App.js`** — standalone/unmounted |

---

## 5. Component Library

Paths are relative to `src/`. **Props** summarize the public API; optional props show defaults where defined.

### `components/AppTooltipTour/AppTooltipTour.jsx`

| Item | Detail |
|------|--------|
| **Renders** | Spotlight-style onboarding bubbles for specific `data-tour` targets |
| **Props** | `currentPage` (**string**, required) — must match `App`’s `currentPage`; `enabled` (**boolean**); `scopeKey` (**string**, default `'global'`) — resets completed steps when account changes |
| **Internal state** | Active step index, measurements, dismiss/finish flags (local) |
| **Used in** | `App.js` (global) |

### `components/Button/Button.jsx`

| Item | Detail |
|------|--------|
| **Renders** | Full-width primary CTA with gradient |
| **Props** | `children` (node, required); `onClick` (func); `disabled` (bool, default false); `loading` (bool); `icon` (node); `className`; spreads native `<button>` props |
| **Internal state** | None |
| **Used in** | Login, OTP, signup, profile modals, many pages |

### `components/Input/Input.jsx`

| Item | Detail |
|------|--------|
| **Renders** | Labeled text field with optional leading icon (auto from placeholder) |
| **Props** | `label`, `type` (default `text`), `placeholder`, `leadingIcon`, `value`, `onChange`, `error`, `className`, native input props |
| **Internal state** | None |
| **Used in** | Auth, add/edit account, profile-related forms |

### `components/Typography/Typography.jsx`

| Item | Detail |
|------|--------|
| **Renders** | Consistent text styles (`font-lato` + variant classes) |
| **Props** | `variant` (`heading` \| `bodyLarge` \| `button` \| `label` \| `link`, default `label`); `children`; `className`; `as` (element type); `color` (default `white`); `align` (`left` \| `center` \| `right`); other props passed to element |
| **Internal state** | None |
| **Used in** | Auth, buttons, labels |

### `components/Logo/Logo.jsx`

| Item | Detail |
|------|--------|
| **Renders** | Supershyft brand image |
| **Props** | `size` (`sm` \| `md` \| `lg` \| `xl`, default `md`); `className`; `alt` (default `Supershyft`) |
| **Used in** | Splash, login, signup, OTP |

### `components/OTPInput/OTPInput.jsx`

| Item | Detail |
|------|--------|
| **Renders** | Split digit boxes for OTP |
| **Props** | `value` (string); `onChange` (func, receives full string); `length` (number, default 6); `className` |
| **Internal state** | `otp` digit array; `inputRefs` |
| **Used in** | `OTPPage` |

### `components/Timer/Timer.jsx`

| Item | Detail |
|------|--------|
| **Renders** | Countdown; **Resend OTP** when elapsed |
| **Props** | `initialSeconds` (number, default 30); `onResend` (func); `className` |
| **Internal state** | `seconds`, `isActive` |
| **Used in** | `OTPPage` |

### `components/NavBar/NavBar.jsx` + `NavItem.jsx`

| Item | Detail |
|------|--------|
| **Renders** | Fixed bottom nav (Home, Super Care, Super Club, Packages) with animated notch |
| **Props (`NavBar`)** | `defaultActive` (string id, default `home`); `onNavigate` (func(id)) |
| **Internal state** | `activeItem`, measured width, debounced navigation timer |
| **Used in** | `HomePage`, `PackagesPage`, `SuperClubPage`, `SuperClubPage2` |

### `components/NavBar/NavItem.jsx`

| Item | Detail |
|------|--------|
| **Renders** | Single nav button with icon |
| **Props** | `id`, `label`, `icon`, `isActive`, `onClick(id)`, `iconSize` (default 23) |
| **Used in** | `NavBar` only |

### `components/HealthScanNavBar/HealthScanNavBar.jsx`

| Item | Detail |
|------|--------|
| **Renders** | Three-tab segmented control |
| **Props** | `defaultActive` (0–2, default 0); `onTabChange(index)` |
| **Internal state** | `activeTab` |
| **Used in** | `HealthScanIndexPage` |

### `components/GetStartedArrow/GetStartedArrow.jsx`

| Item | Detail |
|------|--------|
| **Renders** | Decorative arrow for CTA rows |
| **Props** | `opacity` (`100` \| `80` \| `60`, default `100`) |
| **Used in** | Health insights / CTA patterns |

### `components/WordList/WordList.jsx`

| Item | Detail |
|------|--------|
| **Renders** | Vertical list of words with one “active” highlight |
| **Props** | `words` (array); `activeIndex` (number); `fontSize`, `lineHeight`, `gap`, `letterSpacing` |
| **Used in** | Commented legacy `SplashScreen` implementation only |

### `components/SpinningTriangle/SpinningTriangle.jsx`

| Item | Detail |
|------|--------|
| **Renders** | Animated triangle driving splash word carousel |
| **Props** | `onWordIndex`, `totalWords`, `onAnimationComplete`, `wordStep`, `width`, `height`, `leftOffset` |
| **Internal state** | `requestAnimationFrame` loop state |
| **Used in** | Legacy splash (commented) |

### `components/RotatingCube/RotatingCube.jsx`

| Item | Detail |
|------|--------|
| **Renders** | CSS 3D rotating cube hero |
| **Props** | None |
| **Used in** | `SplashScreen2` |

### `components/HomePage/Header/Header.jsx`

| Item | Detail |
|------|--------|
| **Renders** | Greeting + menu + search |
| **Props** | `name` (string, default `User`); `onMenuClick`; `onSearchClick` |
| **Used in** | `HomePage` |

### `components/HomePage/MetabolicAgeCard/MetabolicAgeCard.jsx`

| Item | Detail |
|------|--------|
| **Renders** | Simple metabolic age card (legacy / alternate design) |
| **Props** | `age`, `label`, `detail` |
| **Used in** | Not imported by `HomePage` today (available for reuse) |

### `components/HomePage/CircularProgressCard/CircularProgressCard.jsx`

| Item | Detail |
|------|--------|
| **Renders** | SVG ring “score” card |
| **Props** | `percentage` (default 75); `label` (default `Score`); optional `onClick` (makes card keyboard-focusable button) |
| **Used in** | `HealthParametersSection` |

### `components/HomePage/HealthParametersSection/HealthParametersSection.jsx`

| Item | Detail |
|------|--------|
| **Renders** | “Health Parameters To Focus” + three score cards |
| **Props** | `data` (array of `{ percentage, label }`, has defaults); `onSeeMore`; `onCardClick(item, index)` |
| **Used in** | `HomePage` |

### `components/HomePage/PositiveWinsSection/PositiveWinsSection.jsx`

| Item | Detail |
|------|--------|
| **Renders** | Positive wins carousel / cards |
| **Props** | `cards` (optional override); `apiPositiveWins` (object from overview API) |
| **Internal state** | Carousel / expand state |
| **Used in** | `HomePage` |

### `components/HomePage/RiskAnalysisSection/RiskAnalysisSection.jsx`

| Item | Detail |
|------|--------|
| **Renders** | Disease risk cards; optional data from API; link to blood markers |
| **Props** | `cards` (fallback defaults); `apiRiskAnalysis` (array); `onDiseaseSelect`; `onSeeMore`; `onBloodMarkersSeeMore` |
| **Internal state** | Fetches `/reports/{id}/blood-parameters` for marker preview when needed |
| **Used in** | `HomePage` |

### `components/PatientSelectionOverlay/PatientSelectionOverlay.jsx`

| Item | Detail |
|------|--------|
| **Renders** | Full-screen booking: patient picker, add sub-profile, package confirmation, **Razorpay** payment |
| **Props** | `open` (bool); `onClose` (func); `customFlow` (bool, default false); `initialPackage` (object \| null); `onBookingConfirmed` (func, optional — used for custom review completion) |
| **Internal state** | Patients list, search, payment steps, errors, loading |
| **APIs** | `getMyProfiles`, `createMySubProfile`, `getMyProfile`, `listDiagnosticPackages`, Razorpay order/verify/fail/status (see §6) |
| **Used in** | `PackagesPage`, `PackageDetailsPage` |

### `metabolic-age-orb/MetabolicAgeOrb.jsx`

| Item | Detail |
|------|--------|
| **Renders** | Large metabolic age visual (`MetabolicAgeOrb2` + labels) |
| **Props** | `value` (string, default `32.4`); `currentAge` (number \| undefined); `label`; `detail`; `absoluteMetabolicAge` (number \| undefined) |
| **Used in** | `HomePage` |

### Other files under `metabolic-age-orb/`

| File | Note |
|------|------|
| `MetabolicAgeOrb2.jsx`, `Orb.jsx`, `metabolic-age-orb.css` | Implementation layers for the orb |
| `OrbEditor.jsx`, `index.jsx` | **Dev / playground** editor — not part of main app navigation |

---

## 6. API Integration

Base URL: **`BACKEND_BASE_URL`** from `REACT_APP_BACKEND_BASE_URL` or `BACKEND_BASE_URL` (see §12). All service paths below are **appended** to that origin unless noted.

### Auth (`src/services/authService.js`)

| Endpoint | Method | Triggered from | Request | Response usage | Errors |
|----------|--------|------------------|-----------|------------------|--------|
| `/auth/send-otp` | POST | `App.handleSendOtp` → `LoginPage` / resend in `OTPPage` | `{ phone }` | Success body not strictly typed; failures throw | `post()` throws `Error` with server `detail` / `message` |
| `/auth/verify-otp` | POST | `App.handleVerifyOtp` ← `OTPPage` | `{ phone, otp }` | Tokens via `extractTokensFromResponse` | Throws on non-OK |
| `/auth/refresh-token` | POST | `App` `useEffect` on mount if refresh token exists | `{ refresh_token }` | New tokens saved | On failure: tokens cleared, logged |
| `/auth/logout` | POST | `App.handleLogout` | `{ refresh_token }` | Session end | Throws if no refresh token |
| `/auth/switch/{userId}` | POST | `App.handleAccountSelectionStart`, `ProfilePage` account switch | `{}` + `Authorization: Bearer <access>` | New tokens | Throws if invalid id / not logged in |

### Users & support (`src/services/usersService.js`)

| Endpoint | Method | Triggered from | Request | Response usage | Errors |
|----------|--------|------------------|-----------|------------------|--------|
| `/users` | POST | `App.handleSignup` ← `SignupPage` | User payload from `buildCreateUserPayload` | OTP flow continues | Optional `SIGNUP_BEARER_TOKEN` header |
| `/users/me` | GET | (via `profileService` mainly) | — | — | — |
| `/users/me` | PUT | `EditProfilePage` (primary), `usersService.updateMySubProfile` | Profile fields + `user_id` for sub-profile | Updated profile | `authorizedUsersRequest` errors |
| `/users/me/profiles` | GET | `App.handleVerifyOtp`, `ProfilePage`, `EditProfilePage`, `PatientSelectionOverlay` | — | Linked accounts arrays | Cached 30s per token |
| `/users/me/profiles` | POST | `AddAccountPage`, overlay “add patient” | Sub-profile payload | New linked profile | Validation errors from API |
| `/users/me/unlink` | POST | `ProfilePage` unlink modal | `{ child_user_id }` optional | Refreshed profiles | Error surfaced in modal |
| `/users/me/preferences` | GET | `PermissionsPage` | — | Toggle defaults merged | Load error string |
| `/users/me/preferences` | PUT | `PermissionsPage` each toggle | Partial preference object | Merged server prefs | Reverts toggle on failure |
| `/support/tickets` | POST | `CustomerSupportPage` | `{ contact_input, query_text }` | Success → modal | `window.alert` on failure |

### Profile (`src/services/profileService.js`)

| Endpoint | Method | Triggered from | Request | Response usage | Errors |
|----------|--------|------------------|-----------|------------------|--------|
| `/users/me` | GET | `App` post-login, `ProfilePage`, `EditProfilePage`, `PatientSelectionOverlay` | — | `data` or root object for names, ids, gender, etc. | Cached 30s; `forceRefresh` bypasses |
| `/users/me` | PUT | `EditProfilePage` save | Various profile fields | Updated user | Standard fetch error mapping |

### Questionnaire & assessments (`src/services/questionnaireService.js`)

| Endpoint | Method | Triggered from | Request / query | Response usage | Errors |
|----------|--------|------------------|-----------------|------------------|--------|
| `/assessments/me` | GET | `loadQuestionnaireContext`, `reportService` | `?page=&limit=` | Pick latest **active incomplete** assessment | Throws if none |
| `/assessment-packages/me/{packageId}/categories` | GET | `loadQuestionnaireContext` | — | Categories → local route ids | Throws |
| `/questionnaire/categories/{categoryId}/questions` | GET | `loadQuestionnaireContext` | — | Question list per category | Throws |
| `/questionnaire/{categoryId}/responses` | PUT | `App.handleStepComplete` when `vitals` step completes | `{ responses: [...] }` | Silent per-category submit loop | `console.error` per step |

### Reports (`src/services/reportService.js` + callers)

| Endpoint | Method | Triggered from | Response usage | Errors |
|----------|--------|------------------|----------------|--------|
| `/assessments/me` | GET | `authorizedGetCached`, `getLatestAssessmentIdsCached` | Discover latest `assessmentId` (cached); persists `latestAssessmentId` in `localStorage` | Throws → try next id |
| `/reports/{assessmentId}/overview` | GET | `App.preloadHomeScreenData`, `HomePage` | `metabolic_age`, `positive_wins`, `risk_analysis` | Falls back to “no data” UI |
| `/reports/{assessmentId}/blood-parameters` | GET | `RiskAnalysisSection`, `BloodMarkersPage` | Marker sections / cards | User-facing empty/error states in page |
| `/reports/{assessmentId}/risk-analysis` | GET | `DiseaseRiskAnalysisPage` | Disease list / scores | Empty/error handling in page |
| `/reports/{assessmentId}/risk-analysis?disease=` | GET | `DiseaseDetailPage` | Disease-specific copy/metrics | Empty/error handling |

### Diagnostic catalog (`src/services/diagnosticPackagesService.js`)

| Endpoint | Method | Triggered from | Notes |
|----------|--------|------------------|-------|
| `/diagnostic-packages` | GET | `PackagesPage`, `PatientSelectionOverlay` | Bearer token from storage / payload |
| `/diagnostic-packages/filters-chips?for=...` | GET | `CreateCustomPackagePage` | Filter chips for custom builder |
| `/diagnostic-packages/filters-chips` | GET | `PackagesPage` via `listPublicDiagnosticPackageFilterChips` | Still uses bearer resolution in client |
| `/diagnostic-packages/{id}` | GET | `PackageDetailsPage` | Package detail for tabs |
| `/diagnostic-test-groups` (+ optional `?filter_chip=`) | GET | `CreateCustomPackagePage` | Test groups |
| `/diagnostic-test-groups/{id}/tests` | GET | `CreateCustomPackagePage` | Tests in group |

### Payments (`src/services/paymentService.js`)

| Endpoint | Method | Default path (override via env) | Triggered from |
|----------|--------|--------------------------------|------------------|
| Create order | POST | `/payments/create-order` (`REACT_APP_RAZORPAY_ORDER_PATH`) | `PatientSelectionOverlay` before Razorpay |
| Verify payment | POST | `/payments/verify` (`REACT_APP_RAZORPAY_VERIFY_PATH`) | After Razorpay success (or demo) |
| Mark failed | POST | `/payments/failed` (`REACT_APP_RAZORPAY_FAILED_PATH`) | Razorpay failure / dismiss handlers |
| Booking status | GET | `/payments/booking/{id}/status` (`REACT_APP_RAZORPAY_BOOKING_STATUS_PATH_PREFIX`) | Post-verify polling |

**Razorpay script**: `https://checkout.razorpay.com/v1/checkout.js` (dynamic inject).

**Demo mode**: `REACT_APP_PAYMENT_DEMO=true` → `verifyPackageRazorpayPayment` can short-circuit without backend when disabled.

### Diagnostics — marker detail (`BloodMarkersPage.jsx`)

| Endpoint | Method | Triggered from | Request | Response usage | Errors |
|----------|--------|------------------|-----------|------------------|--------|
| `/diagnostics/health-parameters/{diagnosticTestId}` | GET | `BloodMarkerDetailView` when user opens a marker that has `diagnosticTestId` | Path param | Extracts text fields (`meaning`, `description`, causes/effects lists, side-specific keys) for the detail panel | Silent failure → fallback copy |

The same file uses **`fetchLatestAssessmentReport`** for **`GET /reports/{assessmentId}/blood-parameters`** (shared pattern with `reportService`). A local **`authorizedGet`** helper implements the diagnostics call above (same bearer + JSON parsing conventions).

---

## 7. State Management

### Approach

- **Single top-level React state** in `App.js` drives which page is visible and shares cross-screen data (phone, questionnaire, linked accounts, package selection, install prompt, swipe history).
- **No global store library**.
- **Service-layer memoization**: in-memory caches for profile (`profileService`), linked profiles (`usersService`), and report GETs (`reportService` `Map` + in-flight dedupe).
- **Persistence**: `localStorage` for auth tokens (`authStorage`) and latest assessment id (`reportService`).

### Principal `App.js` state fields

| State | Holds | Consumed by |
|------|--------|----------------|
| `currentPage` | Active screen key | All conditional renders |
| `phoneNumber`, `userName`, `userAge` | Auth / greeting | OTP, home, club, packages copy |
| `questionnaireProgress`, `expandedQuestionnaireStep`, `questionnaireSteps`, `questionnaireQuestionsByCategoryId`, `questionnaireDraftResponsesByRoute` | Assessment flow | `HealthAssessmentPage`, submit on vitals |
| `linkedAccounts`, `selectedAccountId`, `currentUserId` | Multi-account | Account selection, profile, edit profile |
| `selectedPackageCard`, `customPackageCard`, `pendingCustomPackagePayload` | Packages UX | Packages / details / review |
| `selectedDisease` | Disease detail | `DiseaseDetailPage` |
| `selectedHealthScanTab` | Health scan default tab | `HealthScanIndexPage` |
| `preloadedHomeData`, `forceHomeApiRefresh` | Avoid home flicker / refresh after profile switch | `HomePage` |
| `deferredPrompt`, `showInstallPrompt`, `isIosInstallFlow`, `installHelpMessage` | PWA install banner | `App` root overlay |
| `canSwipeBack`, `pageHistoryRef` | Edge-swipe back | Touch handlers on `.app-root` |

---

## 8. Routing

### Library

**None.** There is no `react-router` (or similar). **`App.js`** chooses a page with:

```jsx
{currentPage === 'home' && <HomePage ... />}
```

### Route catalog (`currentPage` → component)

| `currentPage` | Component | Typical access |
|---------------|-----------|----------------|
| `splash` | `SplashScreen` | Public |
| `login` | `LoginPage` | Public |
| `signup` | `SignupPage` | Public |
| `otp` | `OTPPage` | Public (mid-login) |
| `health-insights` | `HealthInsightsPage` | Post-auth (no hard guard) |
| `account-selection` | `AccountSelectionPage` | Post-auth when multiple accounts |
| `home` | `HomePage` | Authenticated flow |
| `health-scan-index` | `HealthScanIndexPage` | Authenticated |
| `health-assessment` | `HealthAssessmentPage` | Authenticated |
| `questionnaire-blank` | `QuestionnaireBlankPage` | **Wired but unused** |
| `blood-markers` | `BloodMarkersPage` | Authenticated |
| `disease-risk-analysis` | `DiseaseRiskAnalysisPage` | Authenticated |
| `disease-detail` | `DiseaseDetailPage` | Authenticated |
| `profile` | `ProfilePage` | Authenticated |
| `reports` | `ReportsPage` | Authenticated |
| `nutrition` | `NutritionPage` | Authenticated |
| `customer-support` | `CustomerSupportPage` | Authenticated |
| `permissions` | `PermissionsPage` | Authenticated |
| `all-appointments` | `AllAppointmentsPage` | Authenticated |
| `add-account` | `AddAccountPage` | Authenticated |
| `edit-profile` | `EditProfilePage` | Authenticated |
| `faq` / `terms` / `privacy-policy` | FAQ / Terms / Privacy | Authenticated (navigated from profile) |
| `packages` / `package-details` / `create-custom-package` / `review-package` | Packages stack | Authenticated |
| `doctors` / `expert-details-doctor` / `expert-details-nutritionist` / `integrated-health-program` | Doctors stack | Authenticated |
| `super-club` / `super-club-2` | Super Club | Authenticated |

**Note:** Access is **implicit** (user reaches these after OTP). There is no route guard component; API calls fail if tokens are missing/invalid.

---

## 9. Authentication & Authorization

### Flow

1. **Send OTP** → `POST /auth/send-otp`
2. **Verify OTP** → `POST /auth/verify-otp` → `extractTokensFromResponse` → `saveAuthTokens`
3. **Profile bootstrap** → `getMyProfile`, `getMyProfiles`; optional **`POST /auth/switch/{id}`** when choosing another account
4. **Session restore** on reload: if `refresh_token` in `localStorage`, **`POST /auth/refresh-token`** then `saveAuthTokens`; failure clears tokens

### Token storage

| Key | Description |
|-----|-------------|
| `access_token` | Bearer access token |
| `refresh_token` | Refresh token (also checks legacy `refreshToken` key on read) |

Helpers: `saveAuthTokens`, `getAccessToken`, `getRefreshToken`, `clearAuthTokens`, `extractTokensFromResponse` (`src/utils/authStorage.js`).

### Protected route logic

**Not implemented as a pattern.** Any screen could be shown if `setCurrentPage` were called without auth; in practice, **APIs** require `Authorization: Bearer` and throw, and payment flows check `BACKEND_ENABLED` / login.

### Signup API authorization

Optional bearer **`SIGNUP_BEARER_TOKEN`** (`REACT_APP_SIGNUP_BEARER_TOKEN` or `SIGNUP_BEARER_TOKEN`) sent with `POST /users` for controlled signup environments.

---

## 10. Forms & Validation

### Libraries

- **No** `react-hook-form`, **no** `yup` / `zod` in `package.json`. Validation is **manual** (`if` checks, trimmed strings, numeric ranges) and **server-driven** (API `detail` arrays).

### Forms (by screen)

| Location | Fields / actions | Rules & submission |
|----------|-------------------|---------------------|
| **LoginPage** | Phone | 10 digits required; digits only; `onSuccess(phone)` |
| **SignupPage** | Names, email, phone, city, age, gender | All required before submit; `onSuccess(formData)` |
| **OTPPage** | 6-digit OTP | `otp.length === 6`; resend after timer |
| **CustomerSupportPage** | Query textarea | Non-empty trim; `submitSupportTicket` |
| **AddAccountPage** | Names, age, phone, email, city, org, gender, relation | Client checks (name, age 1–120); `createMySubProfile` |
| **EditProfilePage** | Profile fields | Loads then saves via `updateMyProfile` or `updateMySubProfile`; phone edit gated by relationship |
| **PermissionsPage** | Toggles | Optimistic UI with revert on `updateMyPreferences` error |
| **HealthAssessmentPage** | Many step-specific inputs | Maps answers to `responses` arrays for API |
| **CreateCustomPackagePage** | Chip / group / test selection | Builds custom package payload for App navigation |
| **PatientSelectionOverlay** | Patient selection, add profile, payment | Extensive client validation before Razorpay |

---

## 11. Error Handling & Loading States

### API errors

- **Services** normalize JSON or string bodies into **`Error(message)`** (prefers FastAPI-style `detail`, then `message`).
- **UI patterns**:
  - **Inline text** (soft red) on auth pages (`LoginPage`, `OTPPage`, `SignupPage`).
  - **`window.alert`** on some flows (`CustomerSupportPage` failure, `AddAccountPage` failure).
  - **Profile / permissions**: inline error or revert toggles.
  - **Home / reports**: fallback to **“no data”** states when overview fetch fails or payload lacks expected keys.
  - **Questionnaire**: `initializeQuestionnaire` logs and resets steps on failure.

### Loading

- **`Button`** `loading` prop shows “Loading...” and disables clicks.
- **Pages** use local `loading` / `saving` / `isSubmitting` flags (profile, packages, permissions, OTP).
- **PatientSelectionOverlay**: multi-step loading for profiles/packages/payment.

### Empty states

- **HomePage**: `isNoDataHome` / `noDataStage` when overview missing.
- **Lists**: packages/diagnostics map to empty arrays gracefully in several services (`return []`).

---

## 12. Environment & Configuration

### Environment variables (names only — **do not commit secrets**)

| Variable | Purpose |
|----------|---------|
| **`REACT_APP_BACKEND_BASE_URL`** (or **`BACKEND_BASE_URL`**) | API origin; trailing slashes stripped. If unset, `BACKEND_ENABLED` is false and most services throw a configuration error. |
| **`REACT_APP_SIGNUP_BEARER_TOKEN`** (or **`SIGNUP_BEARER_TOKEN`**) | Optional bearer for `POST /users` during signup. |
| **`REACT_APP_RAZORPAY_KEY_ID`** | Publishable Razorpay key for Checkout when backend omits `keyId`. |
| **`REACT_APP_PAYMENT_DEMO`** | When set to the string `true`, enables payment demo shortcuts in `paymentService`. |
| **`REACT_APP_GA_MEASUREMENT_ID`** | GA4 measurement ID (e.g. `G-XXXXXXXXXX`). |
| **`REACT_APP_RAZORPAY_ORDER_PATH`** | Override default `POST` path for create-order. |
| **`REACT_APP_RAZORPAY_VERIFY_PATH`** | Override verify path. |
| **`REACT_APP_RAZORPAY_FAILED_PATH`** | Override failed-payment path. |
| **`REACT_APP_RAZORPAY_BOOKING_STATUS_PATH_PREFIX`** | Override booking status URL prefix. |

### Code-level config exports (`appConfig.js`)

- `BACKEND_BASE_URL`, `BACKEND_ENABLED`, `SIGNUP_BEARER_TOKEN`, `RAZORPAY_KEY_ID`, `PAYMENT_DEMO_MODE`, `GA_MEASUREMENT_ID`

### Other persisted keys

- **`latestAssessmentId`** in `localStorage` (via `reportService`) — last successfully used assessment id for report fetches.

### Feature flags / modes

- **`PAYMENT_DEMO_MODE`** — UI/backend-skipping payment verification path for local testing.
- **`BACKEND_ENABLED`** — gates network calls with explicit errors when false.

---

## Appendix: Analytics

- **`trackAppScreen(currentPage)`** (`src/analytics/googleAnalytics.js`) sends a virtual **`/${currentPage}`** page_view to GA4 when `REACT_APP_GA_MEASUREMENT_ID` is configured.
- **`gaEvent`** exported for optional custom events (unused in core flows at time of writing).

---

## Appendix: Testing

- **`src/services/usersService.test.js`** — Jest unit test alongside `usersService` (run via `npm test`).

---

*End of document.*
