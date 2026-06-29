# Pulse by SMHS — Update Specification v2.1

## Focus: Auto Refresh + Voting Layout Toggle + Collapsible Admin Sidebar

---

# IMPORTANT

Read this document completely before making any modifications.

This update is intended to improve usability only.

It is **NOT** a rewrite.

Do **NOT** redesign existing systems.

Do **NOT** replace working logic.

Do **NOT** modify the election lifecycle.

Do **NOT** modify Demo/Live architecture.

Do **NOT** modify candidate generation.

Do **NOT** modify voting logic unless required for the new layout option.

---

# GOALS

Implement ONLY these three features:

1. Automatic UI refresh when administrator changes data.
2. Voting Layout Toggle (Single Page / Multi Step).
3. Collapsible Admin Sidebar.

Nothing else.

---

# FEATURE 1

# Automatic Refresh

## Goal

Whenever an administrator changes important election data, every open Pulse page should automatically refresh its data.

The user should NOT need to manually reload the browser.

---

## DO NOT

Do not refresh the entire browser.

Do not use window.location.reload().

Do not destroy React state.

Only refresh application data.

---

## Polling

Implement lightweight polling.

Recommended interval:

5 seconds

Do NOT poll every second.

---

## What should be checked

Create one lightweight endpoint or use existing metadata that changes whenever admin modifies data.

Examples include:

Election status

Election metadata

Candidates

Settings

Voting layout

Graphics quality

Generated codes

Maintenance actions

Published results

Any admin configuration

---

## Detection

If nothing changed

Do nothing.

If something changed

Reload application data.

---

## Reload Scope

The reload should update ONLY data.

NOT restart the application.

NOT recreate React.

NOT reload browser.

---

## Pages that should automatically refresh

Landing page

Voting page

Review page

Results page

Admin dashboard

Admin candidates

Admin settings

Admin codes

Maintenance

Export

Any page that depends on election data.

---

## Graphics Quality

Changing Graphics Quality inside Admin Settings should update automatically.

No browser refresh required.

---

## Voting Layout

Changing Voting Layout should automatically update open voting pages.

---

## Election Status

Start

Pause

Resume

End

Publish Results

All should update automatically.

---

## Demo / Live

Works identically in Demo.

Works identically in Live.

---

# FEATURE 2

# Voting Layout Toggle

Location:

Admin Settings

---

Create new setting:

Voting Layout

Options

○ Multi Step

○ Single Page

---

Default

Multi Step

This preserves existing behaviour.

---

Multi Step

Uses the existing ballot.

No redesign.

No behaviour changes.

No logic changes.

Exactly the current experience.

---

Single Page

Display every election position on one page.

Example

Head Boy

Candidate A

Candidate B

---

Head Girl

Candidate A

Candidate B

---

Sports Captain

...

---

House Captain

...

---

Deputy House Captain

...

---

Literary Captain

...

---

Deputy Literary Captain

...

---

Submit Vote

---

Requirements

One selection per role.

Current validation still applies.

Current review still applies.

Current vote submission still applies.

Only UI changes.

Do NOT duplicate business logic.

Reuse existing vote state.

---

The admin should be able to switch layouts at any time.

Existing voting logic must continue working.

---

# FEATURE 3

# Collapsible Sidebar

Current issue

Sidebar is permanently open.

Consumes screen space.

Principal requested cleaner interface.

---

Add

Collapse button

Top of sidebar.

Example

☰

or

◀

---

Collapsed

Show icons only.

Hide labels.

Preserve hover tooltips.

---

Expanded

Current appearance.

---

Requirements

Smooth animation.

No layout jumps.

Responsive.

Works on all admin pages.

---

Remember state

If possible

Persist collapse state.

Example

localStorage

---

# PERFORMANCE

No unnecessary rerenders.

No polling storms.

Reuse existing API calls.

Avoid duplicate fetches.

---

# DO NOT MODIFY

Election lifecycle

Authentication

Mode Context

Demo/Live switching

Candidate generation

Results calculation

Export format

Maintenance

Vote validation

Database schema

Backend architecture

---

# ACCEPTANCE TESTS

## Auto Refresh

Open two browser tabs.

Tab A

Admin.

Tab B

Voting.

Generate candidate.

Within polling interval

Tab B updates automatically.

---

Change Graphics Quality.

Other tab updates.

---

Change Voting Layout.

Voting page updates.

---

Pause election.

Voting page updates.

---

Resume election.

Voting page updates.

---

End election.

Voting page updates.

---

Publish results.

Results page updates.

---

## Voting Layout

Switch to Multi Step.

Existing ballot unchanged.

---

Switch to Single Page.

All positions displayed.

Vote submission succeeds.

Review succeeds.

Results unchanged.

---

## Sidebar

Collapse.

Icons only.

Expand.

Original layout restored.

State remembered.

---

# CODE QUALITY

Minimal modifications.

No duplicated logic.

No rewrites.

Preserve architecture.

Reuse existing services.

Maintain TypeScript compatibility.

Maintain existing styling.

Maintain Motion animations.

No console debugging.

No temporary code.

Project must compile successfully.

npm run build must pass.

No TypeScript errors.

No lint errors.

No regressions.
