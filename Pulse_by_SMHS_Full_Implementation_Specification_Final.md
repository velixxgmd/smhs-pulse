# Pulse by SMHS — Full Implementation Specification
## Auto Refresh + Voting Layout Toggle + Collapsible Sidebar + Pulse Assistant

---

# IMPORTANT

Read this document completely before making any changes.

This is an **existing working codebase**.

Do **NOT** rewrite the app.

Do **NOT** replace the current architecture.

Do **NOT** redesign existing working systems.

Do **NOT** modify Demo/Live mode behavior unless a verified bug requires it.

Make the **minimum possible changes** needed to add the requested features safely.

If a feature already exists, extend it instead of creating a second implementation.

---

# PROJECT GOAL

Improve Pulse by SMHS with:

1. Automatic refresh of admin-driven data changes
2. Voting layout toggle between multi-page and single-page voting
3. Collapsible admin sidebar
4. Pulse Assistant AI support for students and admins

The current election system must continue to work exactly as it does now.

---

---

# IMPLEMENTATION CHECKLIST

> **Status:** Features 1–3 already implemented by Trae. Feature 4 (Pulse Assistant) is remaining.

## Already Done ✅
- [x] **Auto Refresh** — `RefreshContext`, `getRevision()` in Demo/Live services, KV-backed revision on backend
- [x] **Voting Layout Toggle** — `voting_layout` field on election, settings UI, `updateVotingLayout()` service methods
- [x] **Collapsible Admin Sidebar** — Animated collapse, icons-only state, `localStorage` persistence
- [x] **Cross-tab sync** — `storage` event listener for graphics quality + device mode
- [x] **Build verified** — 0 TypeScript errors, `npm run build` passes

## Remaining: Feature 4 — Pulse Assistant
- [ ] **Backend endpoints** — `POST /api/ai/student` and `POST /api/ai/admin`
- [ ] **AI Controller layer** — Input validation, prompt injection filter, rate limiting, timeout
- [ ] **Tool registry** — Student tools (`getElectionStatus`, `getCandidates`, `getPositions`, `getVotingGuide`) + Admin tools (student tools + `getTurnout`, `getRecentAttempts`, `lookupCode`)
- [ ] **Student AI UI** — Floating help button on public pages (CodeEntry, Ballot, Review, Landing)
- [ ] **Admin AI UI** — Help drawer/panel inside admin dashboard
- [ ] **Kill switch** — `AI_ENABLED` env var gates all AI endpoints
- [ ] **Audit logging** — Admin AI queries logged (user, time, tool, prompt, response, duration)
- [ ] **Fallback mode** — Searchable FAQ widget when AI is offline
- [ ] **Political neutrality enforcement** — Backend filter + system prompt
- [ ] **Error boundary** — AI widget crash isolation

## Files Expected to Change
| File | Why |
|------|-----|
| `supabase/functions/make-server-c9775fa5/index.ts` | Add `/api/ai/student`, `/api/ai/admin`, revision endpoint (already exists) |
| `src/app/services/electionService.ts` | Add AI service interface methods |
| `src/app/services/demoElectionService.ts` | Demo AI stubs + rate limit simulation |
| `src/app/services/liveElectionService.ts` | Live AI calls to backend |
| `src/app/context/RefreshContext.tsx` | Already exists (Feature 1) |
| `src/app/pages/public/BallotPage.tsx` | Add Student AI floating button |
| `src/app/pages/public/ReviewPage.tsx` | Add Student AI floating button |
| `src/app/pages/public/CodeEntryPage.tsx` | Add Student AI floating button |
| `src/app/pages/public/LandingPage.tsx` | Add Student AI floating button |
| `src/app/pages/admin/AdminDashboardPage.tsx` | Add Admin AI drawer/panel |
| `src/app/pages/admin/AdminSettingsPage.tsx` | Already modified (Feature 2) |
| `src/app/types/index.ts` | Already modified (Feature 2) |
| `src/app/data/demoData.ts` | Already modified (Feature 2) |
| **NEW:** `src/app/components/ai/StudentAIWidget.tsx` | Floating chat widget |
| **NEW:** `src/app/components/ai/AdminAIWidget.tsx` | Admin drawer panel |
| **NEW:** `src/app/components/ai/AIFallback.tsx` | FAQ fallback when AI offline |
| **NEW:** `src/app/hooks/useAI.ts` | Hook for AI queries with loading/error states |
| **NEW:** `src/app/hooks/useRateLimit.ts` | Client-side rate limit enforcement |

---

# NON-NEGOTIABLE RULES

## DO NOT
- rewrite BallotPage **unless a controlled refactor is strictly necessary to support Single Page voting**
- rewrite AdminDashboardPage
- rewrite ElectionService architecture
- rewrite mode polling
- replace Demo/Live selection logic
- replace backend routing
- introduce a new database design
- break existing voting flow
- break current candidate management
- break results/export/maintenance
- add admin permissions to student AI
- expose admin-only features to student AI
- expose passwords, recovery codes, API keys, or raw database access to AI
- add unnecessary dependencies
- add new features outside the scope of this document

---

# FEATURE 1 — AUTOMATIC REFRESH FOR ADMIN CHANGES

## Goal

When the admin changes election data, open pages should automatically reflect the change without requiring a manual browser refresh.

This must work for:

- election status
- candidates
- generated codes
- voting layout
- admin settings
- graphics quality
- any election metadata changes
- maintenance actions
- published results

---

## Requirements

### 1.1 Polling / Sync
Implement a lightweight data-sync mechanism.

It must:
- avoid full browser reloads
- avoid destroying React state
- only refresh application data
- preserve current page location where possible

### 1.1a Sync Endpoint Contract

**Endpoint:** `GET /api/election/revision`

**Response:**
```json
{
  "revision": "abc123def456",
  "timestamp": "2026-06-29T12:00:00Z"
}
```

**Semantics:**
- `revision` is an opaque string (SHA-256 hash or UUID) representing the current election state.
- It changes whenever any of these mutate: election status, candidates, generated codes, voting layout, admin settings, graphics quality, maintenance actions, published results.
- The backend computes this hash from a deterministic serialization of the above state.

**Polling Interval:**
- Public pages (Landing, CodeEntry, Ballot, Review): **30 seconds**
- Admin pages (Dashboard, Candidates, Codes, Settings, Maintenance, Export, Results, Attempt Logs): **10 seconds**
- When `document.hidden === true`: pause polling entirely (resume on `visibilitychange`)
- When a mutation is detected: trigger data reload, then reset polling timer

**Race Condition Handling:**
- If a voter is mid-ballot (`BallotPage` or `ReviewPage`) and the revision changes:
  - **Do NOT** unmount the ballot or discard selections.
  - Show a **non-blocking banner**: *"Election data has been updated. Your current selections are safe."*
  - Refresh candidate data only if the voter navigates backward or restarts the ballot.
  - If the election status changes to `ENDED` or `PAUSED` mid-ballot: show a **blocking modal** with *"Voting has been paused/ended by the Election Committee."* and disable the submit button.

**Demo Mode:**
- `demoElectionService.getRevision()` reads from `localStorage` key `pulse:demo:revision`.
- Any localStorage write to `pulse:demo:election`, `pulse:demo:candidates`, `pulse:demo:codes`, or `pulse:demo:adminPassword` must also call `touchDemoRevision()` to bump the revision.

---

### 1.2 Detection
The app should detect changes by checking a lightweight version/timestamp/state object.

Use whichever existing mechanism is easiest to integrate:
- a single sync endpoint
- updated timestamps in existing election/settings objects
- another minimal change-detection field

Do not create a complicated sync system.

### 1.3 When changes are detected
Reload only the necessary data.

Examples:
- admin changes candidate list → candidate list updates
- admin changes graphics quality → UI updates
- admin changes voting layout → ballot updates
- admin starts/pauses/ends election → status updates
- admin publishes results → results page updates

### 1.4 Pages that should update automatically
- Landing page
- Voting page
- Review page
- Admin dashboard
- Admin candidates
- Admin codes
- Admin settings
- Admin maintenance
- Export page
- Results page
- Any page that displays election data

---

# FEATURE 2 — VOTING LAYOUT TOGGLE

## Goal

Add a setting that lets the admin choose between:

- Multi Page voting
- Single Page voting

Multi Page must remain the current default experience.

---

## 2.1 Admin Settings
Add a setting in Admin Settings called:

**Voting Layout**

Options:
- Multi Page
- Single Page

Default:
- Multi Page

---

### 2.1a Data Model

The `voting_layout` setting is stored **on the election object**, not as a separate settings table.

**TypeScript:**
```typescript
export type VotingLayout = "multi" | "single";

export interface Election {
  // ... existing fields ...
  voting_layout?: VotingLayout; // default: "multi"
}
```

**Backend (Supabase / KV):**
- Live mode: stored as `voting_layout` column on the `elections` table (string, `"multi"` | `"single"`, default `"multi"`).
- Demo mode: stored in `localStorage` as part of the serialized election object.
- The revision hash must include `voting_layout` in its computation so layout changes propagate immediately.

**Admin Settings Page UI:**
- Add a `<select>` or radio group labeled **"Voting Layout"** in the existing settings form.
- Options: `Multi Page` (value: `"multi"`), `Single Page` (value: `"single"`).
- Default selected: `"multi"`.
- On change: call `electionService.updateVotingLayout(value)` → bumps revision → all open tabs refresh.

**Other New Settings (Feature 3 + Feature 4):**
| Setting | Storage | Default | Scope |
|---------|---------|---------|-------|
| `sidebar_collapsed` | `localStorage` key `pulse:admin:sidebar:collapsed` | `false` | Admin UI only |
| `ai_enabled` | Environment variable `AI_ENABLED` | `true` | Backend only |

---

## 2.2 Multi Page
This must preserve the current ballot flow exactly as it exists today.

No redesign.
No behavior change.
No logic rewrite.

---

## 2.3 Single Page
Single Page should present all election positions on one ballot screen.

The voter should be able to:
- select one candidate per role
- review selections using the existing review/submit flow or an equivalent minimal continuation of current logic
- submit normally

Single Page should reuse existing vote state and submission logic.

Do not create a second voting engine.

### Controlled Refactor Allowed
If the existing `BallotPage` architecture is tightly coupled to the multi-page wizard flow, a **controlled refactor** is permitted to abstract shared logic (vote state, validation, submission) so both Multi Page and Single Page can use it. The existing Multi Page flow must remain functionally identical. Do not force Single Page into the old wizard flow if it creates unmaintainable conditional branching.

> **Controlled Refactor Allowed:** If the existing BallotPage architecture requires abstraction to support both Multi-Page and Single-Page modes, a controlled refactor is permitted. The existing Multi-Page behavior must remain unchanged and fully functional.

---

## 2.4 Data flow
The layout setting should be stored with other admin election settings and should sync automatically to open voter pages.

If the admin changes layout:
- new voters should see the updated layout immediately
- existing voting pages should update on the next sync interval

---

# FEATURE 3 — COLLAPSIBLE ADMIN SIDEBAR

## Goal

Make the admin sidebar collapsible to save space.

---

## 3.1 Behavior
Add a collapse/expand button.

Collapsed state:
- show icons only
- hide text labels
- keep functionality intact
- maintain hover tooltips if already supported or easy to add

Expanded state:
- current sidebar appearance

---

## 3.2 Requirements
- Smooth animation
- No layout breakage
- Persist the state if possible
- Use existing styling patterns
- Do not redesign the admin interface

---

# FEATURE 4 — PULSE ASSISTANT (AI)

## Goal

Add an AI helper called **Pulse Assistant**.

Pulse Assistant must be safe, permission-aware, and split into user contexts.

It must be able to help:
- students during voting
- admins using the dashboard

It must **NOT** expose admin-only information to students.

---

## 4.1 Core principle

Pulse Assistant must be **two experiences** inside one product:

### A. Student Assistant
Visible to students on public voting pages.

### B. Admin Assistant
Visible only to authenticated admins inside the admin area.

The two must use separate prompts, separate knowledge scope, and separate permissions.

---

## 4.2 Student Assistant (PUBLIC)

### Purpose
Help students understand and complete the voting process.

### Allowed topics
- how to vote
- what the voting code is
- what each step means
- what happens after submission
- how to fix common voting errors
- explanation of school election roles
- general election guidance
- how the ballot layout works

### Student Assistant must NOT show or mention:
- admin panel actions
- candidate management
- export tools
- maintenance tools
- code lookup
- turnout stats
- logs
- passwords
- recovery codes
- database details
- hidden admin features
- internal tools
- vote totals before they are public
- any privileged operations

### Student Assistant behavior
If asked an admin-related question, it should politely refuse and say it can only help with voting and general election guidance.

It must not say:
- “I can do that in admin”
- “This is available to admins”
- “Ask an admin”
- any hidden admin feature details

Instead it should say a simple refusal and keep focus on voting help.

---

## 4.3 Admin Assistant (ADMIN ONLY)

### Purpose
Help authenticated administrators operate Pulse.

### Allowed topics
- dashboard navigation
- how to start/pause/end elections
- how to publish results
- how to generate/export codes
- how to manage candidates
- how to use settings
- how to troubleshoot dashboard issues
- how to interpret turnout, logs, and election status
- how to find a code for a student if the school approves that workflow

### Important restriction
Admin Assistant must still be safe:
- no raw database access
- no SQL execution
- no passwords
- no recovery codes
- no service keys
- no direct destructive actions without explicit manual admin UI actions

It may explain how to do something, but it should not directly perform sensitive actions unless explicitly designed through approved backend functions.

---

## 4.4 Tool-based design

Pulse Assistant must **not** connect directly to the database.

Use a tool/function-based approach instead.

The assistant may only use approved backend functions such as:
- getElection()
- getTurnout()
- getResults()
- getCandidates()
- getTotalStats()
- lookupCode()
- getRecentAttempts()
- getAllCodes() if explicitly allowed for admin-only use
- other safe read-only helpers already present

### 4.4a Tool Calling Priority

Tool calling is mandatory. If a suitable backend tool exists, the assistant MUST call the tool before generating a response. Gemini must never answer election-related questions from its own knowledge when a backend tool exists. Gemini should only reason over returned tool results. If the tool returns no data, reply: "I couldn't find that information." Do not fabricate missing information.

### 4.4b Tool Limits

Maximum tool calls per request: 5. If more information is required, respond normally instead of repeatedly calling tools.

### 4.4c Backend Context Limits

Never send the entire database. Only provide the minimum information required. Example: if asked "Who are the House Captains?", the backend sends current House Captain candidates only. Never send unused tables.

### 4.4d Tool Failure Handling

If a tool fails: retry once. If retry fails, answer: "I couldn't retrieve that information right now." Do not guess. Do not fabricate. Do not call another unrelated tool.

### 4.4e Tool Registry

---

## 4.5 Security and privacy rules

Pulse Assistant must never:
- reveal raw database contents
- reveal all voting codes to students
- reveal individual student votes
- reveal passwords
- reveal recovery codes
- reveal API keys
- reveal private admin-only data
- modify database records
- delete data
- start/pause/end elections by itself
- generate codes by itself
- change settings by itself

If a user asks for something outside its permissions, the assistant must refuse cleanly.

---

## 4.6 Student AI content scope

The student assistant must only know about:
- voting steps
- ballot usage
- election roles
- code entry
- common errors
- what to do if something is unclear
- general school election explanation

It must not contain or reveal:
- admin workflows
- internal controls
- code lookup ability
- export tools
- logs
- turnout analytics
- maintenance actions

---

## 4.7 Admin AI content scope

The admin assistant may know about:
- dashboard pages
- settings pages
- candidate management
- election controls
- exports
- maintenance
- turnout
- logs
- troubleshooting

But it must still be bounded by safety rules and backend permissions.

---

## 4.8 UI placement

### Student Assistant
- floating help button on public pages
- accessible from voting pages
- minimal, non-intrusive design

### Admin Assistant
- available inside admin dashboard
- can appear as a help drawer or assistant panel

---

## 4.9 Fallback behavior
If the AI API is unavailable:
- show a graceful fallback message
- do not break the app
- do not block voting
- do not block admin use
- do not expose internal errors

### 4.9a Abuse Protection
If a user exceeds the rate limit, return HTTP 429. The frontend waits until the reset timer. Do not continue forwarding requests to Gemini.

### 4.9b Quota Protection
If Gemini daily quota is exhausted, disable AI automatically and enable Pulse Help fallback. Do not continue retrying Gemini.

---

## 4.10 API usage
Use a free-tier AI provider if available.

Preferred:
- Gemini via Google AI Studio / Gemini API

Important:
- do not hardcode keys
- use environment variables
- keep the AI integration modular
- keep the backend as the enforcement layer

# 🔒 Security Architecture (NEW)

### Backend Only

Pulse Assistant **must never communicate directly** with Gemini or any AI provider.

All requests must follow:

```
Client
↓

Backend API

↓

Pulse Assistant Controller

↓

Gemini

↓

Backend Validation

↓

Client
```

API keys must **never** exist inside frontend code.

---

# Separate Endpoints

Student

```
/api/ai/student
```

Admin

```
/api/ai/admin
```

Never

```
/api/ai
```

The backend determines permissions.

The frontend must never decide permissions.

---

# Tool Registry

Student tools

✅ Election Status

✅ Candidates

✅ Positions

✅ FAQ

✅ Voting Guide

❌ Codes

❌ Logs

❌ Database

❌ Settings

❌ Votes

❌ Results before publishing

---

Admin tools

✅ Election Status

✅ Candidate Search

✅ Statistics

✅ Turnout

✅ Attempt Logs

✅ Code Lookup

✅ Settings Explanation

❌ Database Writes

❌ SQL

❌ Candidate Editing

❌ Vote Editing

❌ Election Control

❌ Code Generation

Every tool is READ ONLY.

---

# AI Permissions

Pulse Assistant can

* Read
* Explain
* Search
* Summarize

Pulse Assistant can NEVER

* Create
* Modify
* Delete
* Approve
* Publish
* Generate election data

The AI is **not** an administrator.

---

# Input Validation

Every AI request must

* Trim whitespace
* Limit message length
* Escape dangerous characters
* Reject malformed requests

Before reaching Gemini.

---

# Output Validation

Every AI response must

* Be treated as plain text

OR

* Safe Markdown

Never HTML.

Never JavaScript.

Never execute AI output.

---

# Rate Limiting

Student

```
10 requests / minute

OR

20 requests / 2 minutes
```

I'd honestly go with **20 requests / 2 minutes**, like you suggested. It's a lot harder to accidentally hit than 10/min, but still prevents spam.

Admin

```
40 requests / 2 minutes
```

Reason:

Admins may ask more questions while configuring the election.

---

# Timeout

Gemini timeout

```
45 seconds
```

If exceeded

```
Pulse Assistant took too long to respond.

Please try again.
```

No endless loading.

---

# Kill Switch

Environment variable

```
AI_ENABLED=true
```

If

```
false
```

Entire AI disappears.

No deployment required.

---

# Audit Logging

Admin AI only.

Log

* User
* Time
* Tool Used
* Prompt
* Response
* Duration

Do NOT log Student conversations unless explicitly enabled.

---

# Code Lookup

Must NEVER be done by Gemini.

Instead

```
Admin

↓

Backend

↓

lookupStudentCode()

↓

Database

↓

Return

↓

Gemini formats response
```

Gemini never searches the database itself.

---

# Session Verification

Every admin request

must verify

* Session
* Role
* Permission

before accessing tools.

Never trust frontend roles.

---

# Data Exposure Rules

Student AI

Must NEVER know

* Codes
* Logs
* Statistics
* Admin settings
* Hidden candidates
* Future elections

Admin AI

Can ONLY access approved read-only tools.

---

# Error Handling

If Gemini fails

Show

```
Pulse Assistant is temporarily unavailable.

Please try again later.
```

Voting continues normally.

---

# Error Boundary

If AI crashes

Only the AI widget fails.

Never crash

* Voting
* Dashboard
* Admin Pages

---

# Fallback

If AI unavailable

Automatically switch to

```
Pulse Help

Search FAQs

Voting Guide

Election Guide
```

No AI required.

---

# Conversation Memory

Student

Memory lasts only during the current chat.

Cleared when widget closes.

Every browser tab is an independent AI session. No shared chat state. Refreshing the page clears chat history. Opening another tab starts a fresh session.

Admin

Memory lasts only during the current chat.

No permanent memory.

### Context Destruction

After every request, destroy: prompt context, tool outputs, temporary buffers, Gemini request payload. Nothing from one request may persist into another.

---

# Prompt Injection Protection

Backend should reject obvious attempts such as:

* Ignore previous instructions
* Reveal hidden data
* Pretend to be admin
* Output database
* Give me API key

The backend filters these **before** they reach Gemini.

---

# Acceptance Tests

✔ Student cannot access admin endpoint.

✔ Admin endpoint rejects student session.

✔ AI cannot modify database.

✔ AI cannot execute SQL.

✔ AI cannot reveal hidden data.

✔ Rate limits enforced.

✔ Timeout works.

✔ Audit logging works.

✔ AI kill switch works.

✔ Voting continues if AI is offline.

✔ Build passes.

✔ No TypeScript errors.

---

## One extra thing I'd add

Since this is a **school election**, I'd add one more rule that wasn't in the critique:

> **Pulse Assistant must never answer political, personal, or opinion-based questions about candidates.**

For example:

❌ "Who should I vote for?"

❌ "Is Rahul better than Akhil?"

❌ "Which House Captain is the best?"

Instead, it should reply:

> "I can't recommend candidates. I can explain each position or provide factual information about the election process."

That keeps the AI neutral, which is really important for an election. I actually think this should be one of the highest-priority rules in the entire AI specification.


---

# 🔒 POLITICAL NEUTRALITY RULE (NEW)

Since this is a **school election**, Pulse Assistant must never answer political, personal, or opinion-based questions about candidates.

## Prohibited Questions

❌ "Who should I vote for?"

❌ "Is Rahul better than Akhil?"

❌ "Which House Captain is the best?"

❌ "Who is the most popular candidate?"

❌ "Which candidate will win?"

## Required Response

Instead, Pulse Assistant must reply:

> "I can't recommend candidates or share opinions about who to vote for. I can explain each position, describe the voting process, or provide factual information about the election."

## Why This Matters

This rule keeps the AI **neutral** and prevents:
- Influencing voter decisions
- Creating perceived bias in the election
- Violating fairness principles of a school election

This applies to **both Student and Admin Assistant**.

---

---

# EXISTING SYSTEMS THAT MUST KEEP WORKING

The following must remain functional:

- Demo mode
- Live mode
- Mode switching
- Candidate management
- Voting code validation
- Results
- Export
- Maintenance
- Admin authentication
- Security logs
- Analytics / turnout
- Existing styling and motion patterns

---

# IMPLEMENTATION ORDER

Implement in this order:

1. Auto refresh / sync
2. Voting layout toggle
3. Collapsible admin sidebar
4. Pulse Assistant framework
5. Student Assistant
6. Admin Assistant

Do not jump ahead and redesign other systems.

---

# DATA / PERMISSION REQUIREMENTS

## Student context
Student AI must:
- only answer voting and election help
- never reveal admin features
- never expose data that should be restricted

## Admin context
Admin AI may:
- explain admin workflows
- answer dashboard questions
- answer read-only operational questions

## Permission boundary
If a feature is admin-only:
- do not expose it in student AI
- do not mention it to students
- do not give hidden hints
- do not reveal that it exists

---

# UI/UX REQUIREMENTS

- preserve Pulse branding
- preserve current visual style
- use existing glass / motion / rounded styling
- avoid clutter
- keep helper UI compact
- do not interfere with voting flow

---

# VALIDATION

Before finishing, verify:

- Auto refresh works without full reload
- Admin changes propagate to open tabs
- Graphics quality updates automatically
- Voting layout toggle works
- Multi Page remains unchanged
- Single Page works
- Sidebar collapses and expands cleanly
- Pulse Assistant loads safely
- Student Assistant cannot access admin information
- Admin Assistant remains admin-only
- No sensitive data leakage
- No TypeScript errors
- No lint errors
- Build succeeds

---

# FINAL RULE

If an existing feature already works, do not rewrite it.

Only make the smallest changes necessary to add these features safely and preserve the system.

**Exception:** Single Page voting may require a controlled refactor of ballot components if the existing wizard flow cannot cleanly support both modes. The Multi Page experience must remain unchanged.