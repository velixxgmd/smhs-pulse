# Pulse by SMHS — Complete System Specification
## The Official Student Election Platform
**School:** St. Martins High School (SMHS)  
**Use case:** Design system, UI specification, and full implementation handoff  
**Style:** Premium dark SaaS, glassmorphism, futuristic, polished, school-safe

---

## 1) Product Definition

**Pulse by SMHS** is a secure, modern student election platform for St. Martins High School.

It has two major experiences:

1. **Student voting portal** — simple, calm, anonymous, one-time code based.
2. **Admin command center** — password-protected, analytics-driven, code generation and management.

The design should feel like a real product a school could trust, not a classroom demo.

---

## 2) Design Goal

The site should make the principal think:

- this is polished
- this is secure
- this is organized
- this is professional
- this could actually be used

The interface must feel premium from the first second.

---

## 3) Brand Rules

### Brand name
**Pulse by SMHS**

### Subtitle
**The Official Student Election Platform**

### School name
**St. Martins High School (SMHS)**

### Voice
- clear
- confident
- modern
- concise
- official
- reassuring

### Avoid
- childish language
- noisy visuals
- template-looking layouts
- generic school website styling
- too much emoji
- cluttered copy

---

## 4) Core Product Principles

### Student side
- anonymous
- one vote per code
- easy to understand
- minimal friction
- strong trust cues

### Admin side
- password protected
- code generation by class and section
- printable and exportable
- code lookup
- turnout analytics
- secure password reset flow
- candidate management (add, edit, delete)
- official PDF report generation
- duplicate vote detection and blocking

### Election integrity
- do not show live candidate vote totals
- do not reveal rankings while voting is live
- code expires permanently after one successful vote
- keep vote recording separate from candidate display
- prevent multiple voting attempts via code lock, device fingerprint, and session protection
- log every blocked attempt for audit

---

## 5) Visual Identity

### Overall vibe
Dark, futuristic, glassmorphism dashboard with purple/violet accents and subtle glow.

### Reference feeling
- Apple-level spacing
- Linear-like clarity
- Stripe-like polish
- modern SaaS dashboard
- premium election software

### Mood words
- secure
- elegant
- premium
- calm
- controlled
- alive
- modern

---

## 6) Color System

Use dark mode only.

### Base colors
- Background: `#09090B`
- Surface: `#111827`
- Card: `#18181B`
- Elevated card: `#1F2330`
- Border: `rgba(255,255,255,0.08)`

### Primary accents
- Primary purple: `#7C3AED`
- Violet accent: `#A855F7`
- Cyan accent: `#22D3EE`
- Success green: `#22C55E`
- Gold highlight: `#FBBF24`
- Error red: `#EF4444`

### Text
- Main text: `#FAFAFA`
- Secondary: `#A1A1AA`
- Muted: `#71717A`

### Gradient direction
Use accents as highlights only:
- purple → violet
- blue → purple
- cyan → blue
- gold → amber

Do not use rainbow gradients or flat bright colors.

---

## 7) Typography System

Use a clean geometric sans serif.

### Suggested fonts
- Inter
- Plus Jakarta Sans
- Sora
- Manrope

### Type scale
- Hero title: 56–72 px, bold
- Page title: 32–40 px, semibold
- Section title: 24–28 px, semibold
- Card title: 18–22 px
- Body: 15–16 px
- Small label: 12–13 px
- Stat number: 32–56 px depending on card

### Text rules
- keep labels short
- keep headings strong
- use tabular numbers for stats
- use uppercase only for metadata, not body content

---

## 8) Layout System

### Grid
- 12-column desktop grid
- single-column mobile flow
- consistent spacing across all screens

### Spacing scale
- 4 px
- 8 px
- 12 px
- 16 px
- 24 px
- 32 px
- 48 px
- 64 px

### Common spacing tokens
- card padding: 24 px
- modal padding: 24–32 px
- section gap: 48–64 px
- hero padding: 48–80 px
- button height: 44–52 px

### Radius
- small controls: 14 px
- cards: 20–24 px
- hero panels: 28–32 px
- pill buttons: 999 px

### Shadow
Soft layered shadow with subtle glow. No harsh black shadows.

---

## 9) Motion System

Motion should feel smooth, premium, and calm.

### Motion timing
- hover: 150–200 ms
- button press: 100–150 ms
- modal open: 250–350 ms
- page transition: 300–450 ms
- loading overlay: 600–900 ms
- count-up animation: 800–1200 ms

### Motion rules
- use ease-in-out or cubic-bezier curves
- no bouncy cartoon motion
- no over-the-top spin effects except loading
- every movement should support clarity

### Expected motion patterns
- fade in
- slide up
- subtle scale
- glow on hover
- smooth count-up
- soft parallax
- animated charts
- smooth modal blur

---

## 10) Background System

The background is part of the identity.

### Must include
- animated gradient mesh
- floating particles (colored — purple, violet, cyan, gold with soft glow)
- constellation lines
- glow blobs that slowly move
- subtle parallax
- rotating geometric shapes (triangles, squares, circles)
- random premium abstract shapes
- soft ambient light beams
- optional scanline texture
- light noise layer
- drifting sparkles / dust

### Shape behavior (upgraded)
- Floating triangles, rotating squares, drifting circles
- Randomized speed per shape
- Rotation per frame
- Boundary wrap (no disappearing shapes)
- Soft opacity fade
- Parallax depth (foreground faster than background)
- Continuous seamless motion

### Rules
- keep all background motion subtle
- background should never reduce legibility
- foreground cards must remain readable at all times
- decorative layers should feel deep and ambient

### Mood
The background should feel alive, premium, and futuristic, not busy.

---

## 11) Global UI Rules

**THIS IS A WEBSITE, NOT AN APP.**  
Design for a desktop browser first. Do not make it look like an iPhone/Android app, a mobile-first shell, or a bottom-nav interface.

- no default browser buttons
- no plain Bootstrap look
- no flat school-template look
- no oversized clutter
- no bright white surfaces
- no loud neon overload
- no cartoon elements
- no unnecessary icons everywhere
- no ugly form spacing
- no phone-style navigation bars
- no app-like full-screen cards on desktop
- no mobile app patterns unless they are only used as secondary responsive behavior

---

## 11.1) Premium Motion and Atmosphere Checklist

These effects are required so the site feels like a premium product:

- moving particles in the background
- slow drifting glow blobs
- colorful constellation connections with tinted lines and glowing particles
- rotating geometric shapes
- occasional sparkles / dust
- subtle gradient movement
- glass cards with blur
- soft hover glows
- animated counters
- smooth chart drawing
- elegant loading spinner

Use these effects sparingly and always behind the content. The page should feel alive, modern, and expensive, not chaotic.

---

## 12) Core Experiences

### Public experience
1. Landing page
2. Enter voting code
3. Candidate selection
4. Review ballot
5. Submit vote
6. Success confirmation

### Admin experience
1. Hidden gear access
2. Admin password screen
3. Dashboard
4. Generate codes
5. Lookup code
6. Manage candidates
7. Export center
8. Security settings
9. Election close / results

---

## 13) Screen A — Landing Page

### Purpose
Make the site instantly feel premium, official, and modern.

### Required content
- Pulse by SMHS branding
- school name
- short subtitle
- one main CTA: **Start Voting**
- small trust line
- hidden admin gear icon

### Hero copy options
- Your Vote. Your Voice. Your Future.
- Secure voting for every student.
- Official student elections for SMHS.

### Layout idea
Split hero or centered hero with strong spacing and glowing CTA.

### Visual treatment
- large title
- soft gradient accents
- animated background
- glass hero card or layered hero stack

---

## 14) Screen B — Voting Code Entry

### Purpose
Let a student enter a one-time code quickly and safely.

### UI requirements
- segmented code input boxes
- example code format shown below input
- clear one-time use note
- primary continue button
- back button
- clean trust language

### Suggested helper copy
- One vote per code.
- Your ballot is anonymous.
- This code expires after use.

### Interaction
- auto-advance between boxes
- auto-uppercase
- backspace returns to previous box
- paste should fill the entire code if possible

---

## 15) Screen C — Candidate Selection

### Purpose
Show one election position at a time in a polished ballot flow.

### Positions
- Head Boy
- Head Girl
- Discipline Secretary
- Sports Captain
- Cultural Secretary
- Deputy positions
- any additional school posts

### Layout
Use cards, not a plain list.

### Candidate card fields
- avatar/photo
- name
- class
- section
- post
- short manifesto line
- select button

### Admin candidate management
The admin should be able to add, edit, and remove candidates with these fields:
- name
- class
- section
- post
- photo
- manifesto
- order / position in the list
- eligibility notes if needed

This is important because the shortlist is not finalized yet, so placeholder candidates can be swapped later without redesigning the UI.

### Card behavior
- hover lift
- selected glow
- checkmark badge
- smooth transition
- fallback avatar if no image exists

### Important rule
Only show the current position. Do not overwhelm the student with every post at once.

---

## 16) Screen D — Review Ballot

### Purpose
Confirm the selections before submission.

### Layout
- summary panel
- selected candidate per position
- edit/back option
- final submit button

### Tone
Reassuring and clear. No clutter.

### Suggested copy
- Review your ballot
- One final check before submission
- After submission, your code will expire forever

---

## 17) Screen E — Success / Receipt

### Purpose
Provide clear proof that the vote was recorded.

### Required elements
- success checkmark
- confirmation message
- code expired note
- optional reference number
- soft celebratory animation

### Good sample message
- Vote submitted successfully.
- Your voting code has now expired.
- Thank you for participating.

### Important
Do not reveal who they voted for in the confirmation. Keep the ballot secret.

---

## 18) Screen F — Hidden Admin Access

### Access method
A small gear icon in the top-right corner.

### Behavior
Clicking opens a password modal.

### UI requirements
- blurred overlay
- centered modal
- password field
- sign in button
- optional "Forgot password?" link

### Important
Students should not notice this path easily.

---

## 19) Screen G — Admin Password Flow

### Admin login
Password only for the demo if needed, but the design should support proper recovery.

### Temporary Admin Password
- **Current:** `admin123`
- **Note:** This is temporary. Must be moved to secure config or environment variable later.

### Recommended flow
1. enter admin password
2. open dashboard
3. allow password change in settings
4. allow reset through recovery code if forgotten

### Password reset design
Use a recovery code shown only during setup or regeneration.

### Suggested screens
- create admin password
- confirm admin password
- show recovery code once
- forgot password
- recovery code verification
- new password creation
- success confirmation

### Security note
Store only hashed password/recovery values in the backend.

---

## 20) Screen H — Admin Dashboard

### Purpose
Show the election at a glance.

### Dashboard content
- election status
- votes cast
- turnout
- codes generated
- remaining voters
- last vote time
- class turnout overview
- live vote counter
- code usage tracker
- participation percentage meter
- attempt block logs viewer

### Design
Use large cards, strong spacing, and animated counters.

### Dashboard copy
- Good morning
- Election Committee
- Voting Status: LIVE
- Codes Generated
- Votes Cast
- Turnout
- Remaining

### Status states
- LIVE
- CLOSED
- RESULTS PUBLISHED

---

## 20.1) Admin Dashboard Data Display Rules

The dashboard should feel like a live command center.

### What to show
- codes generated
- votes cast
- remaining students
- turnout per section
- last vote time
- election status
- recent code usage
- live vote counter
- code usage tracker
- participation percentage meter
- attempt block logs viewer

### What not to show while voting is live
- candidate totals
- winners / leaderboards
- rankings by post
- any result that could influence voters

---

## 21) Dashboard Charts

### Main chart type
Turnout by class and section.

### Chart data example
- 6A: 24 / 30
- 6B: 19 / 30
- 6C: 27 / 30
- 6D: 18 / 30
- 7A: 25 / 31
- etc.

### Chart purpose
Show how many students voted compared to how many total students exist in each section.

### Important
This is a turnout chart, not a candidate vote chart while voting is live.

### Good visual options
- horizontal bars
- progress bars
- small ring widgets
- class cards with percentages

---

## 22) Screen I — Generate Codes Modal

### Purpose
Let the admin generate one-time voting codes by class and section.

### Inputs
- class
- section
- maximum roll number

### Section options
- A
- B
- C
- D
- support any future section if needed

### Output
Random codes in a format like:
- XYZ-ABC
- KZR-WHL
- MNP-QAZ

### After generation
Show:
- number of codes created
- printable mapping
- download options
- code batch history

### Important
The printable sheet should map:
- class
- section
- roll no
- code
- status
- used timestamp if applicable
- batch ID

It should also support easy teacher distribution so a teacher can hand the correct code to the correct student fast.

---

## 23) Screen J — Code Lookup

### Purpose
Help teachers/admin find a student's code quickly.

### Search inputs
- class
- section
- roll number

### Result fields
- code
- status: unused / used
- used timestamp
- batch details

### Good empty state
- Enter class, section, and roll number to find a code.

---

## 24) Screen K — Export Center

### Purpose
Provide school-friendly export options.

### Export formats
- CSV
- TXT
- XLSX / spreadsheet
- PDF Official Report (NEW)

### Export UI Structure
```
Export Panel:
[ CSV ] [ EXCEL ] [ TXT ] [ PDF REPORT ]
```

### Export columns
The export table should include:
- class
- section
- roll number
- code
- status
- used at
- generated at
- batch ID
- generated by

### CSV Export Format
```
CODE, CLASS, SECTION, STATUS, TIMESTAMP
```

### TXT Export Format
Human-readable formatted list.

### Excel Export Format
Structured table format for admin usage.

### PDF Official Report System

#### A. Voting Codes PDF Report (Signed Style)

**Features:**
- Official SMHS header
- Watermark: "OFFICIAL USE ONLY"
- Auto-generated timestamp
- Signature block (Admin signature placeholder)
- Paginated code list

**Layout:**
```
-----------------------------------
ST. MARTINS HIGH SCHOOL (SMHS)
Pulse Voting System Report
-----------------------------------
Generated: [timestamp]
Admin: School Election System

-----------------------------------
CODE LIST
-----------------------------------
XYZ-ABC | Class 10A | Unused
LMN-123 | Class 10B | Used (12:45 PM)

-----------------------------------
Authorized Signature:
__________________________
(Admin)
-----------------------------------
```

#### B. Final Results PDF (Signed Style)

**Must include:**
- All positions (NOT only Head Boy/Girl)
- Winner per category
- Total votes per candidate
- Participation stats

**Layout:**
```
-----------------------------------
SMHS ELECTION RESULTS REPORT
-----------------------------------
Generated: [timestamp]

POSITION: HEAD BOY
Winner: Rahul (128 votes)

POSITION: HEAD GIRL
Winner: Ananya (142 votes)

POSITION: SPORTS CAPTAIN
Winner: ...

-----------------------------------
Total Votes Cast: XXX
Total Students: XXX
Turnout: XX%

-----------------------------------
Verified & Approved
Signature: _______________
```

### Teacher-friendly output
The print/export sheet should be easy for teachers to hand out. It should look clean, readable, and organized by class and section.

### Required behavior
- clean export previews
- batch download options
- teacher-friendly format
- no background decoration in print output

### Print behavior
When printing:
- hide animated background
- simplify shadows
- keep black text readable
- use clean tables
- show one code per line or a neat grid

---

## 25) Screen L — Election Close / Results View

### Purpose
Show final results only after voting has closed.

### States
- voting live
- voting closed
- results published

### Results design
- cleaner, more celebratory
- clear winner highlight
- no live pressure
- still polished and official

### Results Engine Fix (Critical)

**Problem:** Only showing Head Boy / Head Girl.

**Fix:** Render ALL roles dynamically:
```js
roles = unique(candidates.roles)

for each role:
    display winner(role)
```

**Required Output:**
- Head Boy
- Head Girl
- Sports Captain
- Discipline Captain
- Class Representatives
- ANY future roles automatically

### Important
This screen should never appear before the principal/admin closes the election.

---

## 26) Empty States

Empty states should feel intentional.

### Examples
- No candidates added yet.
- No codes generated yet.
- No turnout data yet.
- No results available while voting is live.
- No matching code found.

### Empty state style
- simple icon
- short explanatory text
- one action button
- minimal clutter

---

## 27) Loading States

Use a premium spinner or progress loader.

### Loading text ideas
- Preparing secure ballot...
- Loading candidates...
- Verifying code...
- Generating codes...
- Saving vote...
- Loading election dashboard...

### Visual style
This can reuse the DashIQ-style spinner language:
- concentric rings
- subtle rotation
- soft glow
- centered layout

---

## 28) Error States

### Examples
- invalid voting code
- code already used
- wrong admin password
- network error
- failed submission
- missing selection
- export failed

### Error style
- calm red accent
- concise language
- no panic
- one clear action to recover

---

## 29) Success States

### Use for
- code accepted
- vote submitted
- codes generated
- password updated
- export completed

### Style
- checkmark
- soft green accent
- gentle animation
- brief message
- no overload

---

## 30) Component Library

### Buttons
- primary
- secondary
- ghost
- icon button
- danger

### Inputs
- code entry boxes
- password input
- dropdown
- search field
- numeric input

### Cards
- hero card
- candidate card
- stat card
- turnout card
- code batch card

### Modals
- admin login
- recovery reset
- generate codes
- confirmation
- export dialog

### Feedback
- toast
- banner
- loading overlay
- skeleton state
- success state
- error state

### Data
- turnout bars
- progress rings
- mini charts
- class breakdown rows

---

## 31) Component States

Every core component should have these states designed:

### Buttons
- default
- hover
- pressed
- disabled
- loading
- focus

### Inputs
- default
- hover
- focus
- filled
- error
- disabled

### Cards
- default
- hover
- selected
- disabled
- loading

### Modals
- closed
- opening
- open
- closing

### Code fields
- empty
- active
- filled
- invalid
- expired

### Admin access
- locked
- entering password
- wrong password
- verified

---

## 32) Accessibility Checklist

This is important.

### Requirements
- strong contrast
- visible keyboard focus
- readable font sizes
- not color-only meaning
- large tap targets
- simple language
- reduced motion support
- logical tab order

### Note
No visual effect should make the interface harder to read.

---

## 33) Responsive Behavior

### Desktop
Primary target. Full dashboard layout.

### Tablet
Reduce columns and stack secondary panels.

### Mobile
Single-column layout with:
- larger buttons
- simplified charts
- stacked cards
- minimal decoration
- no crowded admin panels

### Breakpoints
- mobile: up to 767 px
- tablet: 768–1023 px
- desktop: 1024 px and above
- large desktop: 1440 px and above

---

## 34) Print Behavior

The printed output is important for teachers.

### Print rules
- hide animated background
- remove moving particles
- use a plain white or very light print canvas
- use black text
- keep tables clean
- show code sheets clearly
- avoid decorative clutter

### Print layout priority
1. class/section
2. roll number
3. code
4. status
5. batch date/time if needed

---

## 35) Password Management Behavior

### First-time setup
When the portal is created for the first time:
- set admin password
- confirm password
- generate recovery code
- show recovery code once

### Normal change flow
Inside settings:
- current password
- new password
- confirm new password
- save

### Forgot password flow
- enter recovery code
- verify
- reset password
- show success

### Notes
- keep this flow simple for the demo
- still design it like a real product
- do not hardcode obvious passwords
- temporary password: `admin123` (must be changed)

---

## 36) Data Model Cues for Design

The UI should support these core entities:

### Codes
- code
- class
- section
- roll number
- status
- used timestamp

### Candidates
- id
- position
- name
- class
- section
- avatar/photo
- manifesto snippet
- votes
- order / position in list
- eligibility notes

### Votes
- code id
- candidate selections
- timestamp
- status

### Admin
- password hash
- recovery hash
- last changed
- session state

### Blocked Attempts
- code
- time
- reason (USED_CODE / DUPLICATE_DEVICE / INVALID)
- device hash

---

## 37) Duplicate Vote Detection System

### Goal
Prevent:
- Multiple voting attempts
- Code reuse
- Refresh-based abuse

### Detection Layers

#### 1. Code Lock System
```
if (code.status === "USED") → BLOCK
```

#### 2. Device Fingerprint Lock
- Store hashed device ID
- One vote per device
```
if (deviceHash already voted) → BLOCK
```

#### 3. Session Recheck Protection
- Prevent re-submission via refresh/back button

#### 4. Attempt Logging
Log every blocked attempt:
```json
{
  "code": "XYZ-ABC",
  "time": "",
  "reason": "USED_CODE / DUPLICATE_DEVICE / INVALID"
}
```

---

## 38) Candidate Management System

### Admin Panel Features

#### Add Candidate
- Name
- Class
- Section
- Position (Head Boy, Head Girl, etc.)
- Photo
- Manifesto
- Order / position in list

#### Edit Candidate
- Update any field

#### Delete Candidate
- Remove from election

### Data Structure
```js
candidate = {
  id: 1,
  name: "Student Name",
  class: "10",
  section: "A",
  role: "Head Boy",
  photo: "url",
  manifesto: "...",
  votes: 0,
  order: 1
}
```

---

## 39) Candidate Eligibility Logic

The UI must support eligibility by post.

### Example rules:
- Head Boy: Class 10 candidates only
- Head Girl: Class 10 candidates only
- Deputy Head Boy: Class 9 candidates only
- Deputy Head Girl: Class 9 candidates only
- Sports Captain: Class 10
- Deputy Sports Captain: Class 9
- Cultural Secretary: Class 10
- Deputy Cultural Secretary: Class 9
- Discipline Secretary: Class 10
- Deputy Discipline Secretary: Class 9

This should be visible in admin candidate management so the principal can verify that each candidate belongs to the correct post.

---

## 40) Suggested Copy Blocks

### Landing hero
**Pulse by SMHS**  
The Official Student Election Platform

### Landing subtitle
Secure • Anonymous • One Vote Per Student

### Code entry helper
Enter the code provided to you by your teacher.

### Admin dashboard title
SMHS Election Command Center

### Code generator title
Generate Voting Codes

### Code lookup title
Lookup Code

### Export title
Export Election Data

### Results title
Election Results

---

## 41) Suggested UI Hierarchy

### Very important
The eye should go in this order:

1. Brand
2. Main headline
3. Primary CTA
4. Trust cues
5. Secondary actions
6. Decorative background

This hierarchy should repeat across pages.

---

## 42) Recommended Screen Order for Build

Build in this order:

1. Landing page
2. Voting code entry
3. Candidate selection
4. Review ballot
5. Success screen
6. Admin password screen
7. Admin dashboard
8. Generate codes modal
9. Code lookup screen
10. Export center
11. Password reset flow
12. Results closed screen
13. Candidate management screen
14. Blocked attempts log screen

---

## 43) Future Upgrade Path (Optional)

If expanding later:

- QR code voting system
- Live election mode (real-time results screen)
- Student login portal
- Audit-proof blockchain-style log (optional advanced)

---

## 44) Final Product Statement

**Pulse by SMHS** should feel like:

- a real election platform
- built for a real school
- secure and fair
- elegant and premium
- modern and memorable

### Final design instruction
Create a dark, futuristic, glassmorphism election system for SMHS that looks like polished software, not a student template.

### Final reminder
Do not sacrifice clarity for effects.

The design should always feel:
- premium
- readable
- trustworthy
- organized
- official

That is what will make it stand out.

---

# 45) System Architecture: Dual Mode (Demo & Live)

## 45.1 Core Goal

Pulse by SMHS must support **two globally switchable system modes**:

- **DEMO MODE** — local, fake data, safe testing environment with no external dependencies.
- **LIVE MODE** — Supabase-powered real election system with persistent data, atomic transactions, and real validation rules.

These modes must be globally switchable from the Admin Dashboard and must persist across sessions.

## 45.2 Supabase Integration (Mandatory for Live Mode)

### Client Setup
Create a proper Supabase client module:

- **File:** `/lib/supabaseClient.js` or `/services/supabase.ts`
- **Package:** `@supabase/supabase-js`
- **Environment Variables:**
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`

### Required Database Tables (Live Mode)

#### Table: `codes`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, auto |
| code | text | unique, not null |
| class | text | not null |
| section | text | not null |
| roll_number | int | not null |
| status | enum | `unused` / `used` |
| used_at | timestamptz | nullable |
| generated_at | timestamptz | default now() |
| batch_id | text | not null |
| generated_by | text | nullable |

#### Table: `votes`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, auto |
| code_id | uuid | FK → codes.id, unique |
| candidate_selections | jsonb | not null (stores role→candidate mapping) |
| voted_at | timestamptz | default now() |
| device_hash | text | nullable |
| session_id | text | nullable |

#### Table: `candidates`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, auto |
| name | text | not null |
| class | text | not null |
| section | text | not null |
| role | text | not null |
| photo_url | text | nullable |
| manifesto | text | nullable |
| votes | int | default 0 |
| order_index | int | default 0 |
| eligibility_notes | text | nullable |

#### Table: `attempt_logs`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, auto |
| code | text | nullable |
| time | timestamptz | default now() |
| reason | enum | `USED_CODE` / `DUPLICATE_DEVICE` / `INVALID` / `SESSION_REPLAY` |
| device_hash | text | nullable |
| ip_address | text | nullable (optional) |
| details | jsonb | nullable |

#### Table: `admin_config`
| Column | Type | Constraints |
|--------|------|-------------|
| id | int | PK, singleton row |
| password_hash | text | not null |
| recovery_hash | text | not null |
| last_changed | timestamptz | nullable |
| election_status | enum | `LIVE` / `CLOSED` / `RESULTS_PUBLISHED` |
| system_mode | enum | `demo` / `live` |

### Required Live Operations

#### Codes Table Operations
- `validateCode(code)` — check existence and status
- `markCodeUsed(code, timestamp)` — atomic update to `used` with timestamp
- `getCodeByRoll(class, section, roll)` — lookup for teacher distribution
- `getCodesByBatch(batchId)` — retrieve generated batch

#### Votes Table Operations
- `insertVote(data)` — insert vote record with code_id FK
- `checkVoteByCode(code_id)` — enforce one vote per code via unique constraint
- `checkVoteByDevice(device_hash)` — prevent duplicate device voting

#### Candidates Table Operations
- `getCandidates()` — fetch all active candidates ordered by role and order_index
- `incrementVotes(candidateId, count)` — atomic increment using RPC or `.update()` with proper locking
- `addCandidate(data)` / `updateCandidate(id, data)` / `deleteCandidate(id)` — CRUD for admin

#### Attempt Logs Operations
- `logAttempt(data)` — store every blocked attempt for audit
- `getRecentAttempts(limit)` — dashboard viewer

## 45.3 Demo Mode System

### Global State
```
APP_MODE = "demo" | "live"
```

Storage options (implement at least one, prefer both):
- React Context for runtime state
- localStorage key: `smhs_mode` for persistence

### Demo Mode Behavior
- **NO Supabase calls whatsoever.** All network calls must be bypassed.
- Use mock JSON data for candidates, codes, and votes.
- Votes stored in React state or localStorage (`smhs_demo_votes`).
- Codes simulated locally with matching validation logic.
- Results computed from local vote aggregation.
- Attempt logs stored in localStorage (`smhs_demo_attempts`).
- Admin config stored in localStorage (`smhs_demo_admin`).

### Demo Data Seed
Provide a default seed dataset:
- 6–8 mock candidates across multiple roles (Head Boy, Head Girl, Sports Captain, etc.)
- 20–30 mock codes across classes 6–10, sections A–D
- Pre-configured admin password hash (demo-only, not secure)
- Simulated turnout data for dashboard charts

## 45.4 Admin Dashboard Mode Toggle (Required)

### UI Location
Prominent toggle in the Admin Dashboard header or settings panel.

### Toggle Design
```
🔘 System Mode:
[  DEMO MODE  ]  [  LIVE MODE  ]
```

### Toggle Behavior
- **Switching to DEMO:** Immediate state change. Show confirmation: "Switched to Demo Mode. No real data will be affected."
- **Switching to LIVE:** Show a blocking warning modal:
  ```
  ⚠️ Warning: Live Mode Active

  You are about to switch to LIVE election mode.
  All operations will affect real election data in Supabase.

  [ Cancel ]  [ Confirm & Switch to Live ]
  ```
- On confirmation, update global state and persist to localStorage.
- Reload or reinitialize data layer to reflect mode change.

### Status Badge (Global UI)
Visible at the top of every admin screen:
- 🟡 **DEMO MODE ACTIVE** — amber badge when in demo
- 🟢 **LIVE ELECTION SYSTEM** — green badge when in live

## 45.5 Central Data Layer (`/services/electionService.ts`)

Create a unified API wrapper that abstracts mode switching.

### Exposed Methods
```typescript
interface ElectionService {
  validateCode(code: string): Promise<CodeValidationResult>;
  submitVote(data: VotePayload): Promise<VoteResult>;
  getCandidates(role?: string): Promise<Candidate[]>;
  getResults(): Promise<ElectionResults>;
  logAttempt(data: AttemptLog): Promise<void>;
  generateCodes(batch: BatchConfig): Promise<Code[]>;
  lookupCode(class: string, section: string, roll: number): Promise<Code | null>;
  getTurnout(): Promise<TurnoutData>;
  getRecentAttempts(limit: number): Promise<AttemptLog[]>;
  exportCodes(format: ExportFormat): Promise<Blob | string>;
}
```

### Internal Logic
```typescript
function getService() {
  const mode = getGlobalMode(); // reads from Context + localStorage
  if (mode === "demo") return DemoElectionService;
  if (mode === "live") return LiveElectionService;
  throw new Error("Invalid system mode");
}
```

### Implementation Rules
- **Demo Service:** Pure functions, localStorage/JSON-based, zero network.
- **Live Service:** Supabase client calls, real-time subscriptions where appropriate, error handling for network failures.
- Both services must implement the **exact same interface** so UI components are mode-agnostic.

## 45.6 Security Rules (Enforced in Both Modes)

### 1. Code Lock System
```
if (code.status === "USED") → BLOCK_VOTE
```
- Check before any vote submission.
- Atomic check-and-set in live mode; synchronous check in demo.

### 2. Device Fingerprint Lock
- Generate a stable device hash from user agent + screen resolution + timezone (or use `fingerprintjs` if available).
- One vote per device hash per election.
- In live mode: enforce via `votes.device_hash` unique constraint or query check.
- In demo mode: enforce via `smhs_demo_device_votes` localStorage key.

### 3. Session Recheck Protection
- After successful vote, set `sessionStorage.setItem("vote_submitted", "true")`.
- On page load/reload, check this flag and redirect to success screen if set.
- Prevent back-button re-submission by checking session state before ballot render.

### 4. Attempt Logging
Every blocked attempt must be logged with:
- Code used (if any)
- Timestamp
- Reason (`USED_CODE`, `DUPLICATE_DEVICE`, `INVALID`, `SESSION_REPLAY`)
- Device hash
- Readable in admin dashboard "Attempt Block Logs Viewer"

### 5. Vote Immutability
- Votes must never be overwritten or updated.
- In live mode: use insert-only, no update permissions on `votes` table for admin role.
- In demo mode: append-only to local vote array.

## 45.7 Export System (Multi-Format)

When admin clicks **Download Codes**, present format options:

```
[ CSV Export ] [ Excel Export (.xlsx) ] [ TXT Export ] [ PDF Official Report ]
```

### Export Requirements
- **Source:** Pull from current mode (demo or live). Demo exports mock data; live exports Supabase data.
- **Columns:** class, section, roll number, code, status, used_at, generated_at, batch_id, generated_by
- **CSV:** RFC 4180 compliant, UTF-8 BOM for Excel compatibility.
- **Excel (.xlsx):** Use `xlsx` or `sheetjs` library. Styled header row, auto-width columns, frozen header.
- **TXT:** Human-readable formatted list with clear separation lines.
- **PDF:** Official SMHS report format (see Section 24). Use `jspdf` + `html2canvas` or server-side generation. Must include:
  - Official SMHS header
  - Watermark: "OFFICIAL USE ONLY"
  - Auto-generated timestamp
  - Signature block placeholder
  - Paginated table
  - Clean print CSS (no background animations, black text, readable tables)

### Export UI Behavior
- Show loading state while generating.
- Trigger browser download instantly on completion.
- Show success toast: "Export downloaded successfully."

## 45.8 Visual System: Particle & Constellation Background

### Requirements (Upgraded from Section 10)
The background particle system must meet these standards:

#### Particle Behavior
- **Fully random initialization:** No static or repeating seed patterns. Each page load generates unique particle positions.
- **Smooth continuous movement:** Particles drift using `requestAnimationFrame` with delta-time correction.
- **Floating + drifting:** Combine sine-wave vertical float with linear directional drift.
- **Dynamic speed variation:** Each particle has independent `vx`, `vy` within a randomized range (e.g., 0.1–0.8 px/frame).
- **Subtle rotation and direction changes:** Particles should slowly alter trajectory over time using perlin noise or simple sine modulation.
- **Boundary wrap:** Particles exiting one edge re-enter from the opposite edge seamlessly.
- **Parallax depth:** At least 2 depth layers — foreground particles (faster, larger, higher opacity) and background particles (slower, smaller, lower opacity).

#### Constellation Lines
- Draw lines between particles within a proximity threshold (e.g., 150px).
- **Line thickness:** Use `lineWidth` of **1.5–2.5 px** (thicker than before for better visibility).
- Line opacity inversely proportional to distance (closer = more visible), ranging from **brand-tinted colors at 0.15 alpha** (near) to **brand-tinted colors at 0.03 alpha** (far). Lines should be tinted toward the blended color of the two connected particles.
- Maximum 3 connections per particle to prevent visual clutter.
- **Colorful particles:** Each particle should be assigned a color from the brand palette: primary purple `#7C3AED`, violet accent `#A855F7`, cyan accent `#22D3EE`, or gold highlight `#FBBF24`. Particles should softly glow with their assigned color using `shadowBlur` (8–16 px) and `shadowColor` matching the particle color.
- Constellation lines should subtly inherit the blended color of the two connected particles (e.g., mix their colors at 30–50% opacity).
- Lines must never use pure white; always use tinted colors from the brand palette for cohesion.

#### Geometric Shapes
- Floating triangles, rotating squares, drifting circles as specified in Section 10.
- Randomized speed and rotation per shape.
- Soft opacity fade at edges.
- Continuous seamless motion with boundary wrap.

#### Performance Rules
- Use Canvas 2D API (not DOM elements) for >100 particles.
- Cap particle count based on device performance (e.g., 80 desktop / 40 mobile).
- Pause animation when tab is hidden (`document.visibilitychange`).
- Never reduce foreground text legibility.

## 45.9 Architecture Rules

### Strictly Prohibited
- Faking completion with empty functions or `// TODO` comments.
- Skipping Supabase logic in live mode or replacing it with localStorage.
- Replacing the entire system with a localStorage-only app.
- Leaving any placeholder like "to be implemented later."

### Strictly Required
- Build real production structure from day one.
- Separate demo and live layers cleanly via the service interface.
- Ensure maintainability: adding a new data operation should only require updating the interface + both service implementations.
- All UI components must be mode-agnostic and consume only `electionService.ts`.

## 45.10 File Structure

```
/src
  /components
    /ui            # Reusable UI components (Button, Card, Modal, Input, Badge)
    /layout        # Layout shells (AdminLayout, PublicLayout)
    /background    # ParticleCanvas, ConstellationLayer, GlowBlob
    /charts        # TurnoutBar, ProgressRing, LiveCounter
    /export        # ExportPanel, ExportButton, PdfReport
  /context
    ModeContext.tsx           # Global mode provider (demo/live)
    AuthContext.tsx           # Admin auth state
  /hooks
    useMode.ts                # Hook to read/write system mode
    useElectionData.ts        # Hook for candidate/turnout data
    useCodeValidation.ts      # Hook for code entry flow
    useVoteSubmission.ts      # Hook for ballot submission
    useExport.ts              # Hook for export generation
  /lib
    supabaseClient.ts         # Supabase client singleton
    constants.ts              # App constants, role enums, color tokens
  /services
    electionService.ts        # Unified service interface + factory
    demoElectionService.ts    # Demo implementation (localStorage/JSON)
    liveElectionService.ts    # Live implementation (Supabase)
    exportService.ts          # Export generation logic (CSV, XLSX, TXT, PDF)
    securityService.ts        # Device fingerprint, attempt logging, session check
  /data
    demoData.ts             # Mock candidates, codes, votes, admin config
  /pages
    /public
      LandingPage.tsx
      CodeEntryPage.tsx
      BallotPage.tsx
      ReviewPage.tsx
      SuccessPage.tsx
    /admin
      LoginPage.tsx
      DashboardPage.tsx
      CandidatesPage.tsx
      CodesPage.tsx
      ExportPage.tsx
      SettingsPage.tsx
      ResultsPage.tsx
      AttemptLogsPage.tsx
  /styles
    globals.css
    print.css                 # Print-specific overrides (hide bg, black text, clean tables)
  /types
    index.ts                  # Shared TypeScript interfaces
  App.tsx
  main.tsx
/public
  /fonts
  /images
  /assets
```

## 45.11 Implementation Checklist

- [ ] Supabase client initialized with env vars
- [ ] Database schema created (codes, votes, candidates, attempt_logs, admin_config)
- [ ] RLS policies configured for secure access
- [ ] Demo data seed created (`demoData.ts`)
- [ ] `ModeContext` implemented with localStorage persistence
- [ ] Admin dashboard toggle UI built with warning modal
- [ ] Global status badge (🟡 Demo / 🟢 Live) visible in admin UI
- [ ] `electionService.ts` unified interface defined
- [ ] `demoElectionService.ts` fully implemented (no placeholders)
- [ ] `liveElectionService.ts` fully implemented with Supabase calls
- [ ] Device fingerprinting implemented in `securityService.ts`
- [ ] Attempt logging works in both modes
- [ ] Vote submission protected against double voting in both modes
- [ ] Session replay protection implemented
- [ ] Export service generates CSV, XLSX, TXT, PDF
- [ ] PDF export uses official SMHS report format with watermark and signature block
- [ ] Print CSS hides animations and uses clean black text
- [ ] Particle background meets upgraded requirements (random, drifting, parallax, canvas-based)
- [ ] All UI components are mode-agnostic
- [ ] No `// TODO` or placeholder functions remain
- [ ] Application builds and runs in both modes without errors

---

# 46) Final Notes

This specification defines Pulse by SMHS as a production-grade student election platform. Every feature described must be fully implemented. The dual-mode architecture ensures the system can be tested safely while remaining ready for live deployment.

**Build it like real software. Ship it like a real product.**

---

# 47) Final Polish & Enhancement Specification

The following enhancements must be applied to the existing Pulse by SMHS platform. These are additive improvements that preserve all existing design language, branding, layout, typography, spacing, animations, and functionality.

**Critical Rules:**
- Do NOT redesign the website.
- Do NOT simplify anything.
- Only implement the following improvements.
- All enhancements must feel native to the existing premium SaaS aesthetic.

## FINAL POLISH UPDATE

Preserve the existing design language, branding, layout, typography, spacing, animations, and functionality.

Do NOT redesign the website.

Do NOT simplify anything.

Only implement the following improvements.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1. Add "Maintenance & Database" section to Admin

Create a new admin panel section called:

Maintenance & Database

This section should have the same premium glassmorphism styling as the rest of the dashboard.

Each action must have:
- Icon
- Title
- Short description
- Confirmation dialog before execution
- Success toast after completion

Actions:

🔄 Reset Votes Only
Description:
Delete all recorded votes while keeping candidates and voting codes intact.

━━━━━━━━━━━━━━━━━━━

🔄 Reset Codes (Mark All Unused)
Description:
Reset every voting code back to an unused state so they can be reused for testing.

━━━━━━━━━━━━━━━━━━━

🗑️ Clear Attempt Logs
Description:
Delete all failed login attempts, invalid code entries, and audit logs without affecting votes.

━━━━━━━━━━━━━━━━━━━

♻️ Full Election Reset
Description:
Remove all votes, reset every code, clear logs, and prepare the platform for a completely new election.

This action must require an additional confirmation modal with warning styling.

━━━━━━━━━━━━━━━━━━━

📦 Reset Demo Data

ONLY show this option when:

Demo Mode = Enabled

This button restores all sample candidates, voting codes, graphs, and statistics exactly as they were when the project was first opened.

Hide this button entirely outside Demo Mode.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 2. Improve Background Effects

Keep the existing background.

Do NOT redesign it.

Improve it by:

• Make particles drift slowly and naturally.

• Particles should have random speeds.

• Slight parallax movement.

• Smooth easing.

• No chaotic movement.

• Maintain approximately 60 FPS.

━━━━━━━━━━━━━━━━━━━

Constellations

Improve constellation lines.

• **Thicker lines:** Increase `lineWidth` to **1.5–2.5 px** for stronger visual presence.

• Lines should softly fade in and out.

• Opacity should change based on particle distance (closer = more visible).

• Connections should slowly change over time.

• Avoid excessive flashing.

• **Colorful particles:** Assign each particle a color from the brand palette (purple `#7C3AED`, violet `#A855F7`, cyan `#22D3EE`, gold `#FBBF24`). Apply a soft glow (`shadowBlur: 8–16 px`, `shadowColor` matching particle color).

• **Tinted constellation lines:** Lines should blend the colors of the two connected particles rather than using plain white. Use mixed color at 30–50% opacity.

━━━━━━━━━━━━━━━━━━━

Animated Glow

Increase ambient glow slightly.

Add slow movement to glow blobs.

Movement should take 20–40 seconds.

Very subtle.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 3. Improve Floating Geometry

Replace the current outlined geometric shapes.

Instead:

• Filled solid shapes

• Very subtle transparency (10–20%)

• Random polygon generation

Examples:

• Triangle
• Square
• Pentagon
• Hexagon
• Heptagon
• Octagon

Randomly choose between 3–8 sides.

Random sizes.

Random rotations.

Random positions.

Very slow floating movement.

Very slow rotation.

Shapes should fade slightly while moving.

Do NOT distract from the UI.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 4. Premium Motion Polish

Improve existing animations.

• Cards lift slightly on hover.

• Increase glow subtly on hover.

• Buttons animate smoothly.

• Dashboard counters animate from 0.

• Charts animate into view.

• Progress bars animate smoothly.

• Page transitions should fade and slide.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 5. Maintain Website Layout

IMPORTANT

This is a DESKTOP WEBSITE.

NOT a mobile app.

Do NOT generate mobile-first layouts.

Do NOT use bottom navigation.

Do NOT create phone-sized frames.

Primary target:

1920×1080 Desktop Browser

Secondary:

Tablet

Third:

Responsive Mobile

Keep the current desktop SaaS layout.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 6. Preserve Existing Quality

Do NOT remove features.

Do NOT simplify components.

Do NOT change branding.

Do NOT change typography.

Do NOT change spacing.

Do NOT remove animations.

Only enhance and polish the existing implementation.

The final result should feel like a premium SaaS platform comparable to Linear, Stripe Dashboard, Vercel, Framer, and Apple while remaining suitable for St. Martins High School's election platform.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 7. Device Mode

Maintain the premium desktop experience as the default.

Add a Device Mode toggle inside Settings.

Modes:

🖥 Desktop Mode (Default)

📱 Mobile Performance Mode

The website should automatically detect mobile devices on first load and recommend Mobile Performance Mode.

Users may manually switch between modes at any time.

Remember the selected mode using local storage.

Desktop Mode

Enable the complete premium experience:

• Full particle system
• Animated constellation effects
• Filled floating geometric polygons
• Animated glow blobs
• Premium glass blur
• Dynamic gradients
• Full motion effects
• Highest quality animations

Mobile Performance Mode

Designed for smoother performance on lower-powered devices.

Automatically:

• Reduce particle count by approximately 60%
• Reduce constellation connections
• Reduce floating polygon count
• Lower blur intensity
• Reduce glow intensity
• Simplify expensive animations
• Maintain the same layout and design language

The website should still look premium while maintaining smooth performance.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 8. Election Management

Inside the Admin Panel, create a dedicated **Election Management** section.

Administrators should be able to create, manage, archive and start new elections.

Fields:

Election Name

Example:

Student Council Election

Election Year

The administrator manually enters the year.

Examples:

2026

2027

2028

Do NOT hardcode any year anywhere in the application.

Every displayed year throughout the website must automatically use the currently active election's year.

Election Status:

⚪ Upcoming

🟢 Live

🟡 Paused

🔴 Closed

⚫ Archived

Administrative Actions:

▶ Start Election

⏸ Pause Election

▶ Resume Election

🏁 End Election

📦 Archive Election

➕ Create New Election

━━━━━━━━━━━━━━━━━━━

### Ending an Election

When an administrator ends an election, the system MUST NOT permanently delete any election data.

Instead it should automatically:

• Lock all voting immediately.
• Permanently invalidate every voting code from that election.
• Reveal final election results.
• Preserve all votes.
• Preserve turnout statistics.
• Preserve candidate information.
• Preserve exported reports.
• Preserve analytics.
• Move the election into the Archived Elections section.

Archived elections must remain viewable at any time.

━━━━━━━━━━━━━━━━━━━

### Creating a New Election

When creating a new election, the system should automatically prepare a fresh election without affecting archived elections.

Automatically:

• Create a brand new election dataset.
• Reset or generate a fresh batch of voting codes.
• Clear active votes.
• Clear temporary attempt logs.
• Reset turnout statistics.
• Allow importing or creating a brand-new candidate list.
• Mark the new election as Upcoming until started.

Archived elections should never be modified.

━━━━━━━━━━━━━━━━━━━

### Archived Elections

Create a dedicated page showing previous elections.

Each archived election should display:

• Election Name
• Election Year
• Status
• Total Votes
• Turnout Percentage
• Winning Candidates
• Export Results
• View Statistics
• View Candidate List

Archived elections should be read-only.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 9. Performance Mode (Automatic)

Optimize the website for lower-end devices.

Automatically detect:

• Mobile devices
• Low-performance devices
• Reduced-motion preference (if available)

When detected, automatically enable Performance Mode.

Performance Mode should:

• Reduce particle count by approximately 50–70%.
• Reduce constellation connections.
• Reduce floating polygon count.
• Reduce glow intensity.
• Reduce blur radius.
• Lower animation frequency where possible.
• Disable expensive visual effects while preserving the overall design.

The website should still feel premium but prioritize smooth performance.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Additional automatic optimizations:

Automatically optimize visual performance when necessary.

When running on lower-powered devices:

• Reduce animation frequency.
• Reduce expensive rendering effects.
• Respect the operating system's "prefers-reduced-motion" setting.
• Maintain a smooth frame rate.
• Prioritize responsiveness over visual complexity.
• Never significantly change the visual identity of the platform.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 10. Graphics Quality Toggle

Inside Admin Settings (or Settings), add:

Graphics Quality

Options:

🟢 Ultra
Maximum particles, constellations, glows, and visual effects.

🔵 High
Slightly reduced effects while maintaining premium visuals.

🟡 Balanced (Default)
Balanced quality and performance.

🟠 Performance
Reduced particles and simplified animations.

⚫ Minimal
Essential UI only with very lightweight animations.

The system should remember the selected graphics quality.

If Automatic Performance Mode is enabled, allow users to manually override it.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 11. Accessibility

Support:

• Keyboard navigation.
• Visible keyboard focus indicators.
• Screen-reader friendly labels.
• High contrast text.
• Proper semantic HTML.
• Accessible forms.
• Accessible dialogs and modals.
• Clearly labeled buttons and controls.

Ensure every interactive component remains fully usable without a mouse.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Additional requirements:

Add support for:

• Reduce Motion
• High Contrast Mode
• Keyboard navigation
• Visible keyboard focus indicators
• Screen reader friendly labels

Respect the operating system's "prefers-reduced-motion" setting by automatically minimizing animations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
