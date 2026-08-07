# App Vulnerabilities & Risk Register

Scan date: 2026-08-07  
Scope: React frontend (`dev-frontend`) — flow, security, design, functionality.

Severity key: **High** / **Medium** / **Low**

---

## 1. Flow related

| Severity | Issue | Why it matters | Where |
|---|---|---|---|
| High | Unauthenticated + authenticated home preload race | Splash can start preload with no token; a later empty/failed snapshot can overwrite a successful post-login preload | `src/App.js` |
| High | `forceHomeApiRefresh` cleared as soon as home mounts | Post-questionnaire / profile-return cache bust often never sticks; users see stale Health Span / overview | `src/App.js` |
| High | Disease detail **Back** always goes to risk analysis | Opening disease from Home then Back skips the entry path and lands on the wrong screen | `src/App.js` |
| Medium | Double concurrent home preload on session restore | Restore already preloads; a second effect may race with no generation/cancel guard | `src/App.js` |
| Medium | Account switch stays on Profile while forcing home refresh | Home may not remount with a stable force-refresh window after switch | `src/App.js` |
| Medium | Post-login `?redirect=` almost unused | Only `blood-markers` is allowlisted; other targets silently drop to home | `src/App.js` |
| Medium | In-app history vs browser history diverge | Many `setCurrentPage` backs bypass `pageHistoryRef` / `history` consistently | `src/App.js` |
| Medium | Super Club lock hijacks navigation | Visiting locked Super Club routes auto-redirects to confirm; swipe-back feels stuck | `src/App.js` |
| Medium | Session-expired → login, failed restore → splash | Two different “no session” entry points confuse recovery | `src/App.js` |
| Low | Nav “Super Care” permanently locked (no-op click) | Dead primary tab in the main shell | `src/components/NavBar2/NavBar2.jsx` |
| Medium | Payment success flagged before lab booking confirm | Razorpay handler marks paid, then Healthians confirm; confirm failure is easy to misread as “booked” | `PatientSelectionOverlay.jsx` |
| Low | Demo payment short-circuit | `PAYMENT_DEMO_MODE && !BACKEND_ENABLED` skips real order/booking | `PatientSelectionOverlay.jsx` |

---

## 2. Security related

| Severity | Issue | Why it matters | Where |
|---|---|---|---|
| High | Access + refresh tokens in `localStorage` | Any XSS / malicious extension can steal session (esp. long-lived refresh) | `src/utils/authStorage.js` |
| High | `REACT_APP_SIGNUP_BEARER_TOKEN` shipped in client bundle | CRA public env — extractable and abusable if it gates signup | `src/config/appConfig.js`, `usersService.js` |
| High | Hardcoded lab PDF URLs + tumor-marker PHI for assessment `7451` | Possible media auth bypass; PHI baked into source forever | `src/utils/assessmentBloodMarkerSupplements.js` |
| High | Questionnaire PUT payloads logged to console | PHI (vitals, history, lifestyle) visible in production DevTools | `src/App.js` |
| Medium | Logout may leave legacy `refreshToken` key | Session restore can still pick up uncleared legacy refresh | `authStorage.js`, `App.js` |
| Medium | Auth error / refresh response bodies logged | Token-shaped payloads can leak via console | `sessionAuth.js`, `apiClient.js` |
| Medium | Health IDs / scores logged in report fetch | Assessment/engagement IDs and scores in console | `reportService.js` |
| Medium | Direct `fetch` with Bearer bypasses `authorizedRequest` | No unified 401→refresh; PDF/blood paths fail harder | `HomePage.jsx`, `BloodMarkersPage.jsx`, `healthReportDownload.js` |
| Medium | No central PrivateRoute / auth gate | Screens mount from `currentPage` state; APIs enforce auth but UI is not gated | `src/App.js` |
| Medium | Package payment verify treats missing `verified`/`success` as true | Ambiguous backend response can look “paid” | `paymentService.js` |
| Medium | Phone + email cached in `localStorage` | PII on shared devices; readable by same-origin XSS | `profilePrimaryContact.js` |
| Low | OTP login can save refresh without access token | Partial login response confuses auth state | `src/App.js` |
| Info | No classic XSS sinks found (`dangerouslySetInnerHTML` / `eval`) | Residual risk is still XSS + tokens in storage | — |

**Priority fixes:** remove signup bearer from client; prefer httpOnly sessions (or stop storing refresh in `localStorage`); strip PHI console logs; delete/gate hardcoded PDFs & lab values; route all authed fetches through `authorizedRequest`.

---

## 3. Design related

| Severity | Issue | Why it matters | Where |
|---|---|---|---|
| Medium | Multiple incompatible “glass” recipes | Stack cards look dirty/green-tinted vs opaque Positive Wins; inconsistent product language | Risk / BloodMarkers / PositiveWins / Home CSS |
| Medium | Translucent cards pick up page gradient | Right-side blood cards look greener than left (same styles, different backdrop) | `RiskAnalysisSection.css` blood cards / stack cards |
| Medium | Blood-marker glow under/over text | Names can sit on glow; inset glow `z-index` can tint labels | `RiskAnalysisSection.css` |
| Medium | Bottom padding vs navbar height mismatch | Blood Markers (`32px`) / Disease Detail can sit under fixed nav; Home hardcodes `100px` | page CSS + `NavBar.css` / `App.css` |
| Medium | Breakpoint soup (`360` / `480` / `481` / `768` / `1025`) | Home tablet/desktop max-widths largely dead inside 480px app frame | `HomePage.css`, `App.css`, detail pages |
| Medium | No shared color tokens | Same semantics use different hexes (e.g. “low” `#F7DE30` vs green/yellow elsewhere) | CSS + JS risk maps |
| Medium | Interactive swipe arrows inside `aria-hidden` | Assistive tech ignores controls | Risk / PositiveWins / BloodMarkers |
| Medium | `role="button"` cards without clear `aria-label` | Poor screen-reader naming | Risk cards, CircularProgressCard |
| Low | Double truncation (JS `...` + CSS ellipsis) on stack names | Looks like `......` / harsh cut | `BloodMarkersPage` |
| Low | Optimal card still uses red-tinted shadow on green theme | Visual inconsistency | `BloodMarkersPage.css` |
| Low | Global `user-select: none` on `.app-root *` | Hard to copy health values | `App.css` |

---

## 4. Functionality related

| Severity | Issue | Why it matters | Where |
|---|---|---|---|
| High | Blood marker detail falls back to **Albumin** content/ranges | Missing diagnostic data shows wrong description & gauge (7–12) | `BloodMarkersPage.jsx` |
| High | All Appointments never loads real data | `USE_DESIGN_SAMPLE… = false` and no API → permanently empty tabs | `AllAppointmentsPage.jsx` |
| Medium | Disease orbit icons can stay invisible if geometry never “ready” | Cold-open failure mode is blank orbit, no error UI | `DiseaseRiskAnalysisPage.jsx` |
| Medium | Hardcoded disease id `=== 3` for multi-line CSS | Wrong wrapping when API ids differ | `DiseaseRiskAnalysisPage.jsx` |
| Medium | Home riskKey → detail filter / gauge mapping skew | `low` opens Marginal but maps severity oddly; inconsistent labels | `BloodMarkersPage.jsx` / Home |
| Medium | Disease detail with null `selectedDisease` still mounts | Default title/content (e.g. Oxidative Stress) can mislead | `App.js`, `DiseaseDetailPage.jsx` |
| Medium | Questionnaire step marked complete even if persist fails | User progresses; answers may not be saved | `src/App.js` |
| Medium | Overview / blood / disease / FitPrint failures often silent | Empty UI or stale preload with no retry/error | Home, DiseaseDetail, FitPrint utils |
| Medium | Home blood markers dropped if overview parse fails | Markers succeed but are ignored without `committedB2c` | `HomePage.jsx` |
| Medium | FitPrint assign failure is soft-continued | Locked/questionnaire flows continue without surfacing assign error | `fitprintHealthSpanFlow.js` |
| Low | Empty complete preload snapshot treated as resolved no-data | Dual-preload races can lock Home into empty state | `App.js` preload helpers |
| Low | Disease / risk API catch clears data with little/no UX | Empty orbit / defaults only | Risk + Detail pages |

---

## Suggested triage order

1. **Security High** — tokens storage, signup bearer, PHI in source/logs, hardcoded PDFs  
2. **Flow High** — preload race, force-refresh flag, disease-detail back  
3. **Functionality High** — Albumin fallback, empty Appointments  
4. **Design Medium** — glass consistency, nav spacing, a11y on swipe controls  

---

*This is a code-review risk register, not a penetration-test report. Backend authorization and infrastructure were not fully audited.*
