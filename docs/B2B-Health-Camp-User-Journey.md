# Supershyft Mobile Application
## B2B Health Camp — End-to-End User Journey

**Document type:** Product & UX specification  
**Audience:** Product, engineering, QA, operations  
**Scope:** Home screen and health assessment flows for B2B camp participants  
**Status:** As-implemented (current frontend behavior)  
**Last updated:** May 2026  

---

## Document control

| Field | Value |
|-------|--------|
| Application | Supershyft (dev-frontend) |
| User segment | B2B employee with assigned health camp slot |
| Primary surfaces | Home, Health Assessment, Health Insights |
| Out of scope | Backend lab processing SLAs, camp operations on-site |

---

## Executive summary

This document describes the complete in-app experience for a B2B client who has been assigned a health camp slot (e.g., the following morning). The journey spans authentication, pre-camp scheduling and questionnaire completion, camp day, post-sample processing states, and the full results dashboard when blood data becomes available.

The application uses two distinct home modes—**no-data home** (no overview report) and **data home** (overview report available)—and a separate **Health Span Index** unlock path that is not identical to camp questionnaire completion.

---

## Table of contents

1. [Phase 0 — Application entry](#phase-0--application-entry-pre-home)      
2. [Phase 1 — Pre-camp: scheduled slot](#phase-1--pre-camp-scheduled-slot)  
3. [Phase 2 — Health assessment completion](#phase-2--health-assessment-completion)  
4. [Phase 3 — Camp day](#phase-3--camp-day-slot-active-pre-results)  
5. [Phase 4 — Post-camp: processing](#phase-4--post-camp-processing-no-dashboard)  
6. [Phase 5 — Results available: data dashboard](#phase-5--results-available-data-dashboard)  
7. [Journey summary matrix](#journey-summary-matrix)  
8. [Glossary](#glossary)  
9. [Technical references](#technical-references)  

---

## Phase 0 — Application entry (pre-home)

### Purpose

Authenticate the user and route them to the home experience after session bootstrap and optional account selection.

### Screen sequence

| Step | Screen name | Description |
|:----:|-------------|-------------|
| 1 | Splash | Displayed when the user is not authenticated. |
| 2 | Login / OTP | Phone-based identity verification. |
| 3 | Account selection | Conditional: shown when multiple linked family accounts exist. |
| 4 | Health Insights | Welcome screen with personalized greeting and introductory message. Default post-login landing for most users. |
| 5 | Get started | Preloads home data; navigates to Home. |

### Supplementary UI

- **PWA install prompt** may appear. This is application-wide and not specific to the B2B camp flow.

### System state at exit

- User is authenticated.  
- Overview (blood) report is typically **not** yet available on Home, which routes the user into **no-data home** (Phase 1).

---

## Phase 1 — Pre-camp: scheduled slot

### Purpose

Inform the participant of camp date, time, organizer, and preparation requirements while the testing window is still upcoming.

### Entry conditions

- No renderable overview report (no metabolic age, positive wins, or risk analysis on Home).  
- Upcoming-slot API returns a scheduled **B2B** engagement.  
- Upcoming-slot resolution and questionnaire-status checks have completed.

### Screen identifier

**B2B Camp — Scheduled** (`camp_scheduled`, styling: `home-page--b2b-camp`)

### Screen composition

| Section | Content |
|---------|---------|
| Header | Greeting: “Hello {first name}!” |
| Hero | Clock visual; headline: **Your Health Camp is Scheduled**; optional pill: **Organized for {employer name}** |
| Assigned slot | **Testing window:** slot start–end; **Camp day:** formatted engagement date; B2B guidance: **Arrive 10 mins early** |
| Preparation checklist | Scrollable fasting, dietary, hydration, and pre-test activity guidance |
| Primary call to action | See decision table below |
| Bottom navigation | Home, Packages, Super Club (active); **Super Care** (locked, non-navigable) |

### Primary call to action — decision table

| Condition | User interface |
|-----------|----------------|
| No saved nutrition-log **and** no saved family-history responses on the latest assessment | Button: **Complete your Health Assessment** |
| At least one saved nutrition-log **or** family-history response | No primary CTA on this screen (user may still access the full assessment via Profile) |

### Excluded from this screen

Metabolic age orb, positive wins, risk analysis, report download control, reassessment bottom sheet, and Health Span Index score circles.

### API / data dependencies

- Upcoming slot endpoint (`/users/me/upcoming-slot`).  
- Questionnaire draft checks (nutrition log, family history).

---

## Phase 2 — Health assessment completion

### Purpose

Collect pre-camp health questionnaire data through a structured, multi-section assessment.

### Entry points

1. **Recommended (B2B camp):** “Complete your Health Assessment” on the B2B Camp — Scheduled screen.  
2. **Alternate:** Profile → Health Assessment (same UI; camp session flag behavior may differ—see Phase 4).

### System actions (camp CTA path)

- Session flag: `ss_b2b_opened_questionnaire = 1`.  
- Route: **Health Assessment** (`health-assessment`).  
- Load questionnaire context for the latest assessment instance.

### Screen identifier

**Health Assessment — Hub** (five-step timeline)

### Assessment sections

| Order | Section | Description |
|:-----:|---------|-------------|
| 1 | Anthropometry | Height, weight, BMI; follow-up inputs where applicable |
| 2 | Family history | Hereditary and family-related health inputs |
| 3 | Lifestyle & habits | Activity, alcohol, sleep, wellness priorities |
| 4 | Nutrition log | Dietary intake questions |
| 5 | Vitals | Blood pressure and related vitals |

### Behavioral requirements

- Per-section autosave (server-side draft persistence).  
- Progress indicators update as sections are completed.  
- User may navigate back to Home before final submission; drafts are retained.

### Camp “questionnaire complete” (home gating definition)

For **camp home** logic only, the questionnaire is treated as complete when **either**:

- At least one nutrition-log response is saved, **or**  
- At least one family-history response is saved.

**Note:** All five sections are **not** required for camp CTA removal on the scheduled screen.

### Submission and return flow

1. User submits from the Health Assessment flow.  
2. Full-screen success overlay: “Submitted successfully!” or “Questionnaire completed!”  
3. On acknowledgment: session flag cleared, home APIs refreshed, navigation to Home.  
4. While the slot remains upcoming: expected state remains **B2B Camp — Scheduled**; CTA hidden if camp questionnaire criteria above are met.

---

## Phase 3 — Camp day (slot active; pre-results)

### Purpose

Support the participant on the day of testing while the slot is active and before laboratory results are published to the overview report.

### While the slot remains upcoming

| Condition | Home screen |
|-----------|-------------|
| Upcoming slot returned; window not ended (+ grace period) | **B2B Camp — Scheduled** (Phase 1) |
| Camp questionnaire incomplete (Phase 2 definition) | **Complete your Health Assessment** visible |
| Camp questionnaire complete (Phase 2 definition) | No CTA; slot and checklist only |

### Operational note

The application does **not** verify physical attendance at the camp. The participant uses date, time, and organizer information displayed in the application.

### After sample collection (backend)

Laboratory processing and Metsights assessment assignment occur server-side. The overview report is typically **not** yet available; the user remains on **no-data home** (Phase 4).

---

## Phase 4 — Post-camp: processing (no dashboard)

### Purpose

Communicate post-sample status and any outstanding questionnaire requirements while results are being generated.

### Entry conditions

- Testing window ended and/or upcoming slot no longer returned; and/or  
- Metsights Basic/Pro present on assessments list without a renderable overview report.

### Mutually exclusive home states

| Camp questionnaire status | Screen | Primary messaging | Call to action |
|---------------------------|--------|-------------------|----------------|
| Complete (nutrition or family saved) | **Analyzing** | Bio-marker analysis in progress; 48–72 hour guidance | None |
| Incomplete | **Sample collected** | Sample received; questionnaire pending in timeline | **Complete your Health Assessment** |
| Camp CTA opened (`ss_b2b_opened_questionnaire`) but incomplete per camp rules | **Analyzing — questionnaire pending** | Timeline shows questionnaire step as current | **Complete your Health Assessment** |

### Navigation

Bottom navigation only. Full results dashboard is **not** displayed.

### Implementation note

The “Sample collected” screen component is shared between B2B and B2C code paths.

---

## Phase 5 — Results available: data dashboard

### Purpose

Present blood-derived insights and supplementary health indices once the overview report is available.

### Entry conditions

Overview report returns renderable data: metabolic age and/or positive wins and/or risk analysis. User transitions from **no-data home** to **data home**.

### Screen identifier

**Home — Data dashboard**

### Screen composition

| Section | Description |
|---------|-------------|
| Header | Greeting; menu access to Profile |
| Metabolic age | Orb visualization sourced from overview report |
| Health Span Index | See state table below |
| Positive wins | Healthy habits, profiles, low-risk content (API-driven) |
| Risk analysis | Disease risk and blood marker summaries |
| Report download | Bio-AI Health Report PDF; Blood Report PDF |
| Reassessment reminder | Conditional bottom sheet for new assessment cycle |
| Bottom navigation | Standard tabs; Super Care remains locked |

### Health Span Index states

| State | User-visible behavior |
|-------|------------------------|
| Scores available | Fitness, Nutrition, Lifestyle circles; “See more” to detail views |
| Locked — gap assessment incomplete | Padlock; **Complete the Assessment** (FitPrint gap / catch-up flow) |
| Locked — submitted, reports processing | Success messaging; reports in preparation |

### Critical product distinction

A user may reach Phase 5 (full blood dashboard) while Health Span Index remains locked until FitPrint linkage and gap-questionnaire rules are satisfied. Camp questionnaire completion (Phase 2 definition) does **not** alone unlock Health Span Index.

---

## Journey summary matrix

| Phase | Typical timing | Primary screen | Blood results on Home | Questionnaire emphasis |
|:-----:|----------------|----------------|------------------------|-------------------------|
| 0 | Login | Health Insights → Home | No | N/A |
| 1 | Before camp | B2B Camp — Scheduled | No | CTA if no nutrition/family save |
| 2 | Before camp | Health Assessment (5 sections) | No | In progress / submitted |
| 3 | Camp day | B2B Camp — Scheduled (until slot ends) | No | Per Phase 2 rules |
| 4 | After sample | Analyzing / Sample collected / Questionnaire pending | No | Complete or outstanding |
| 5 | Report ready | Data dashboard | Yes | Independent of HSI unlock |

---

## Glossary

| Term | Definition (in application) |
|------|-----------------------------|
| **Blood test done (Home)** | Overview report returns renderable metabolic age, positive wins, or risk analysis → **data home**. |
| **Camp questionnaire complete** | Any saved nutrition-log **or** family-history response on the latest assessment. |
| **Full questionnaire submission** | User completes submit flow in Health Assessment; may include all five sections. |
| **No-data home** | Home branch when overview report has no renderable fields. |
| **Data home** | Home branch when overview report has renderable fields. |
| **Health Span Index unlock** | Driven by FitPrint assessment linkage and health-span-index report API, not camp questionnaire alone. |
| **B2B camp flow** | Upcoming B2B slot, optional environment camp flag, or B2C lapsed-session flag (B2B uses states described in Phases 1–4). |

---

## Technical references

| Area | Primary implementation |
|------|-------------------------|
| Home routing & stages | `src/pages/HomePage/HomePage.jsx` |
| Health Assessment | `src/pages/HealthAssessmentPage/HealthAssessmentPage.jsx` |
| App navigation & questionnaire bootstrap | `src/App.js` |
| Overview eligibility | `src/utils/homeOverviewPreload.js` |
| Health Span Index lock | `src/utils/fitprintGapLock.js` |
| Reassessment banner | `src/utils/reassessmentBanner.js` |

---

## Revision history

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | May 2026 | — | Initial as-implemented B2B camp journey (Phases 0–5) |

---

*This document describes current frontend behavior. Stakeholder intent may differ; confirm requirements before treating this as a binding specification.*
