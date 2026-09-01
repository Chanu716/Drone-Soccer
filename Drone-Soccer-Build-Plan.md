# Drone Soccer @ SRM AP — Build Plan for Claude Code

Paste each phase below into Claude Code one at a time. Confirmed facts are filled in; anything still open is marked `[[LIKE THIS]]` — replace before launch, never invent a value for these.

---

## 0. Real-world checks before writing code

1. **Money.** Razorpay needs KYC against a legal entity — confirm with SRM AP's student affairs/accounts office whose account settlements land in, and who reconciles them, before going live with real payments.
2. **Permission.** Get written sanction to use the university name and to book C V Raman Block, SR Block, X Lab, and Admin Block weekly.
3. **Safety.** Spinning props near students. Required: signed waiver, safety briefing, eye protection, a caged/netted play area, first-aid presence. The waiver is a required, timestamped checkbox in the registration flow — not a PDF nobody reads.
4. **Data.** Restrict signup to `@srmap.edu.in`. Publish Terms, Refund Policy, Privacy Policy, Contact — Razorpay requires these live before activating your account.

---

## 1. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + CSS variables for tokens |
| 3D | React Three Fiber + drei (hero only — see §2) |
| Animation | GSAP + ScrollTrigger (scroll), Framer Motion (UI) |
| Database + Auth | Supabase (Postgres, Auth, Storage, RLS) |
| Payments | Razorpay (Orders API + webhook) — going live at launch, per your call |
| Email | Resend |
| Hosting | Vercel |
| Analytics | Vercel Analytics |

Non-negotiables: all secrets in env vars, Razorpay signature verified server-side, amounts computed server-side (never trust the client), admin routes gated by a database role check, not a hidden URL.

---

## 2. Design direction

This project uses the **Organic** design system — warm cream ground, terracotta and sage accents, Caprasimo display type over Figtree body text, generous rounding. A companion homepage mockup (`Homepage.dc.html`) shows it applied — hand Claude Code that file as the visual reference alongside these tokens.

```css
--color-bg:        #f5ead8;  /* page ground */
--color-text:      #201e1d;  /* body text */
--color-accent:    #c67139;  /* terracotta — primary actions, live states, Team A */
--color-accent-2:  #7a8a5e;  /* sage — second voice, Team B in versus views */
```
Each accent carries a 100–900 tonal ramp (light steps for tints/hovers, 500 as base, 700–900 for text-on-tint). Team A = terracotta, Team B = sage — no extra colors needed for opposing-side screens.

**Type:** Caprasimo (display headings) + Figtree (body), loaded as `--font-heading` / `--font-body`. For scoreboards, timers and standings figures, add one functional monospace (e.g. JetBrains Mono) with `font-variant-numeric: tabular-nums` in a `.data` utility class — the only departure from the two-typeface system, and only for numerals.

**Components:** build from Organic's primitives — `.btn` (primary/secondary/ghost), `.card`, `.tag`, `.table`, `.nav`, `.field`/`.input`, `.dialog` — 16px-radius panels, pill buttons, hairline borders. Reference the design system's own component pages rather than restyling raw HTML.

**Signature hero:** a "hoop-cam" 3D scene — camera inside the scoring ring looking down the arena, two caged drones (terracotta-lit, sage-lit) banking through the ring. Keep it warm and daylit to match Organic's palette, not the dark-arena/neon treatment — washed lighting, not stage-light contrast. Everything else stays disciplined DOM: flat panels, hairline borders, motion only on the hero and on scroll-reveal.

**3D performance budget** (audience is mid-range Android phones):
- 3D loads only in the hero and the arena diagram; everything else is DOM.
- `next/dynamic` with `ssr:false`, static poster image fallback.
- Skip WebGL on `prefers-reduced-motion`, `navigator.hardwareConcurrency <= 4`, or `saveData`.
- `dpr={[1,1.5]}`, one directional light + one env map, draco-compressed GLB, `frameloop="demand"` when idle.
- Target: hero interactive under 3s on 4G. If it can't hit that, ship the poster — nobody registers because of WebGL.

---

## 3. Site map

**Public:** `/` `/game` `/register` `/book` `/training` `/league` `/teams` `/teams/[slug]` `/organisers` `/gallery` `/faq` `/contact` `/rules` `/terms` `/refund-policy` `/privacy` `/code-of-conduct` `/live` (big-screen scoreboard for venue projection)

**Authenticated:** `/dashboard` — my team, bookings, payment status, check-in QR, upcoming match.

**Admin** (`/admin`, role-gated): slot management, registration approvals, payment reconciliation, score entry (auto-updates standings), announcements, training batches, CSV export, check-in scanner.

---

## 4. Confirmed content

- **Fee:** ₹100 per team for league registration. Training slot access is an extra ₹100 per team, structured as a weekly recharge — active only for that calendar week. Any additional paid items will be announced on the site when decided.
- **Venues (block rotation):** C V Raman Block, SR Block, X Lab, Admin Block.
- **Schedule:** matches run Wednesday or Thursday each week, Sep 1 – Dec 31 (~17 weeks).
- **Team size:** 3–5 active players per side; both teams field the same count in a given match; the organiser sets the required count when announcing each week's slots (not fixed site-wide). Every active player flies a drone; exactly one is the designated Striker, the only player who may score.
- **Organising team:** Manikanta, Ajit Kumar, Sai Sankar, Aswith, Ch Manikanta, Deekshith, Manoj, Ramprasad, Sanjay, Agastya Pandey. Faculty advisor: Dr. Pradyut Kumar Sanki, PhD (IIT KGP), FIETE, SMIEEE, MIET — Associate Professor, Dept. of Electronics & Communication Engineering, School of Engineering & Sciences, SRM University AP.

**Still needed — mark as `[[PLACEHOLDER]]` in the build, do not invent:**
- `[[ROUND_LENGTH]]`, `[[NUMBER_OF_ROUNDS]]`, `[[SCORING_VALUE]]`, `[[FOUL_RULES]]`, `[[SUBSTITUTION_RULES]]`
- `[[DRONE_SPEC]]` — cage diameter, weight limit, battery; who supplies drones
- `[[PRIZE_STRUCTURE]]`
- `[[ORGANISER_ROLES_AND_PHOTOS]]` — the 10 names above, each with a role and photo
- `[[EXACT_TIME_SLOTS]]` per block
- 15–20 real event photos (no stock imagery)

> The original plan referenced FAI international rules as a baseline. Verify the current FAI ruleset before citing it, or state plainly that this is a modified campus format if it diverges — SRM AP's 3–5-player, organiser-set format already differs from a fixed 5-a-side FAI match, so default to "campus format" framing unless you confirm otherwise.

---

## 5. Data model

```sql
profiles(id uuid pk → auth.users, full_name, reg_no, email, phone,
         year, branch, block_residence, role text default 'player', -- player|captain|organiser|admin
         waiver_signed_at timestamptz, created_at)

teams(id, name, slug unique, tagline, logo_url, captain_id → profiles,
      status text default 'pending', created_at) -- pending|approved|rejected

team_members(id, team_id → teams, profile_id → profiles,
             role text, jersey_no int, joined_at,
             unique(team_id, profile_id)) -- striker|attacker|defender|sub

slots(id, week_no int, match_date date, day_of_week text, -- Wednesday|Thursday
      block text, venue text, start_time time, end_time time,
      capacity int default 8, required_active_players int, -- 3-5, set per week
      status text default 'open', unique(match_date, block, start_time))

bookings(id, slot_id → slots, team_id → teams,
         status text default 'reserved', -- reserved|confirmed|waitlisted|cancelled
         checked_in_at timestamptz, qr_token uuid default gen_random_uuid(),
         created_at, unique(slot_id, team_id))

payments(id, booking_id → bookings, team_id → teams,
         purpose text default 'registration', -- registration|training_recharge
         valid_week int, -- for training_recharge: which week this payment activates
         amount_paise int default 10000, currency text default 'INR', -- ₹100
         method text, -- razorpay|venue_upi|cash
         razorpay_order_id, razorpay_payment_id, razorpay_signature,
         status text default 'created', -- created|paid|failed|refunded
         paid_at, recorded_by → profiles, created_at)

matches(id, slot_id → slots, round_no int,
        team_a → teams, team_b → teams,
        score_a int default 0, score_b int default 0,
        status text default 'scheduled', -- scheduled|live|completed|forfeited
        winner_id → teams, notes, played_at)

training_batches(id, title, description, batch_date, start_time, end_time,
                 venue, capacity int, status)
training_signups(id, batch_id, profile_id, status, created_at,
                 unique(batch_id, profile_id))

announcements(id, title, body, pinned bool, published_at)
```

Standings is a **VIEW** computed from `matches`, never a stored table: `points = 3*wins + 1*draws`, tiebreak order points → goal difference → goals for → head-to-head → fewest fouls. Forfeits (no-shows) are recorded as a match `status = 'forfeited'` with a 3–0 score, never a manually typed score.

**RLS:** players read their own profile and their team's rows; anyone reads `teams`/`slots`/`matches`/standings/`announcements`; only `admin`/`organiser` writes `matches`, `slots`, `payments.status`. Add an `is_admin()` security-definer helper reading `profiles.role`.

---

## 6. Tricky logic to decide now

- **Slot booking race condition:** a Postgres function `book_slot(slot_id, team_id)` takes `SELECT ... FOR UPDATE` on the slot row, counts confirmed+reserved bookings inside the transaction, inserts as `reserved` or `waitlisted`. Never count capacity in client JS.
- **Reservation expiry:** `reserved`-but-unpaid bookings hold a spot for 30 minutes, then auto-release and promote the first waitlisted team. A pg_cron job every 5 minutes does this.
- **Payment truth:** the client redirect back from Razorpay is not proof of payment — only the verified webhook is. Verify the `X-Razorpay-Signature` HMAC, then mark `payments.status='paid'` and `bookings.status='confirmed'` in one idempotent transaction (webhooks retry).
- **Training recharge:** a `training_recharge` payment activates access for exactly the `valid_week` it was paid for — check `valid_week = current week` when gating training sign-up, not just "has ever paid."
- **Weekly rotation:** store the block rotation `[C V Raman Block, SR Block, X Lab, Admin Block]` as data; admin's "generate next N weeks" action stamps slots from it. Never hardcode a schedule in the UI.

---

## 7. Build phases

Run each prompt in Claude Code, check the result, commit, then move to the next.

### PHASE 1 — Scaffold and design system
```
Create a Next.js 15 project (App Router, TypeScript, Tailwind CSS v4, ESLint,
src/ directory, @/* alias) called "drone-soccer-srmap".

Design system — Organic (warm, rounded, left-aligned):
1. In globals.css define CSS variables and expose as Tailwind theme colors:
   --color-bg #f5ead8, --color-text #201e1d, --color-accent #c67139 (terracotta),
   --color-accent-2 #7a8a5e (sage). Generate 100-900 tonal ramps for accent and
   accent-2 in OKLCH (light steps for tints/hovers, 500 base, 700-900 for text-on-tint).
   Usage rule: accent is for primary actions and live states, and is Team A's color
   in versus views; accent-2 is the second voice and Team B's color. Never combine
   them as decoration outside opposing-team contexts.
2. Load fonts via next/font/google: Caprasimo as --font-heading (display only —
   never body text), Figtree as --font-body. Add JetBrains Mono as --font-data with
   font-variant-numeric: tabular-nums in a .data utility class; every score, time
   slot and standings figure uses .data.
3. Border radius scale: 16px for containers, 999px (pill) for buttons/inputs/tags.
   Hairline borders at rgba(0,0,0,0.08) on the cream ground.
4. Build primitives in src/components/ui/: Button (primary/secondary/ghost), Card,
   Tag, Input, Select, Table, Tabs, Dialog, Toast, EmptyState, Skeleton. Visible
   keyboard focus rings using --color-accent on every interactive element.
5. Build a responsive Header (logo, nav, "Register your team" CTA, mobile drawer)
   and Footer (nav columns, contact, socials, links to /terms /privacy
   /refund-policy). Proper aria attributes on nav.
6. Add src/lib/site.ts: site name "Drone Soccer — SRM AP", tagline, contact email,
   Instagram handle, registration fee (₹100/team), training recharge fee
   (₹100/team/week), and the block rotation array
   ["C V Raman Block", "SR Block", "X Lab", "Admin Block"].

Respect prefers-reduced-motion globally. Mobile-first at 390px, then scale up.
Do not build pages beyond a placeholder home route yet.
```

### PHASE 2 — The 3D hero
```
Build the homepage hero: a React Three Fiber scene, "hoop cam".

Camera sits just inside the scoring ring looking down the arena. Two caged drones
(one lit --color-accent terracotta, one lit --color-accent-2 sage) bank toward the
camera and pass through the ring on a loop. Warm, daylit rim lighting on the ring —
this is Organic's warm palette, not a dark neon arena. Slow, weighty motion.

Build the drone as procedural geometry: an icosphere wireframe cage (~40cm scale)
containing a small quad-rotor body, with an emissive LED core in the team color.
Keep the scene under 15k triangles.

Mandatory performance requirements:
- next/dynamic with ssr:false and a Suspense fallback.
- Static poster image instead of WebGL when prefers-reduced-motion is set, or
  navigator.hardwareConcurrency <= 4, or connection.saveData is true.
- <Canvas dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: 'high-performance' }}>
- Pause the render loop when the canvas is out of viewport (IntersectionObserver).
- Dispose geometries and materials on unmount.

Overlay: Caprasimo headline, one-line subhead, two buttons ("Register your team"
primary, "How it works" secondary), and a small live strip showing the next
fixture (day, block, time) in the .data font. Text must stay readable on the
poster fallback too.

Target: interactive under 3 seconds on throttled 4G.
```

### PHASE 3 — Content pages
```
Build static content pages using the design system. Content comes from typed data
files in src/content/, not hardcoded in JSX.

/ (home): hero (done), "What is drone soccer" three-panel explainer, "How a match
works" step sequence, this week's fixture card, top-5 standings snapshot linking
to /league, training teaser, final CTA.

/game: full rules, arena diagram (SVG — the 3D budget is spent on the hero), drone
spec table, scoring, fouls, substitutions, safety rules, glossary. Sticky in-page
nav on desktop.

/training: what the bootcamp covers, curriculum, who it's for (zero flying
experience assumed), upcoming batches from data, sign-up CTA, and the ₹100/week
training recharge explained clearly.

/organisers: grid of member cards for Manikanta, Ajit Kumar, Sai Sankar, Aswith,
Ch Manikanta, Deekshith, Manoj, Ramprasad, Sanjay, Agastya Pandey — photo, name,
role [[ROLE]], one line, socials. A separate faculty-advisor block for
Dr. Pradyut Kumar Sanki, PhD (IIT KGP), FIETE, SMIEEE, MIET — Associate Professor,
Dept. of Electronics & Communication Engineering, School of Engineering &
Sciences, SRM University AP.

/faq: accordion, keyboard accessible.
/contact: details plus a form (wire the submit handler later).
/terms, /privacy, /refund-policy, /code-of-conduct: real structured pages —
refund policy must cover the ₹100 registration and ₹100 weekly training recharge
separately.

Use [[FEE_COVERS]], [[ROUND_LENGTH]], [[DRONE_SPEC]], [[PRIZE_STRUCTURE]],
[[EXACT_TIME_SLOTS]] placeholders for facts not yet supplied — never invent
specific rules, dates or statistics. Add metadata exports and OG images per route.
```

### PHASE 4 — Supabase, auth, database
```
Wire up Supabase.

1. Write the full SQL migration for: profiles, teams, team_members, slots,
   bookings, payments, matches, training_batches, training_signups,
   announcements. [paste schema from §5 above, including the payments.purpose
   and payments.valid_week columns for the training recharge model, and
   slots.required_active_players]

2. Create a `standings` VIEW from matches: played, won, drawn, lost, goals_for,
   goals_against, goal_difference, points (3/1/0), ordered by points →
   goal_difference → goals_for. Forfeits count as 3-0.

3. RLS on every table:
   - profiles: user reads/updates own row; admins read all
   - teams, slots, matches, standings, announcements: public read
   - bookings: captain and team members read theirs; only organiser/admin writes status
   - payments: team members read their own; only service role writes
   Add is_admin() security-definer helper reading profiles.role.

4. Auth: email OTP restricted to @srmap.edu.in, enforced in the UI and a database
   trigger on profile creation. Onboarding captures name, reg number, phone, year,
   branch.

5. Typed Supabase client, server client for route handlers, middleware protecting
   /dashboard and /admin.

6. /dashboard: profile, team, bookings with status, payment status (registration +
   current training-week recharge), check-in QR code.
```

### PHASE 5 — Registration and slot booking
```
Build registration and booking.

/register — multi-step form (React Hook Form + Zod):
  Step 1: solo player or full team
  Step 2: team details (name, tagline, logo upload to Supabase Storage)
  Step 3: roster — add members by reg number, assign roles (striker/attacker/
          defender/sub) and jersey numbers; enforce 3-5 active players
  Step 4: safety waiver + code of conduct — required checkbox, store
          waiver_signed_at with timestamp
  Step 5: fee summary (₹100 registration; optional ₹100 training recharge for the
          current week) and confirm
Save progress to localStorage between steps. Clear success state with next steps.

/book — slot picker: week → day (Wed/Thu) → block (C V Raman Block, SR Block,
X Lab, Admin Block) → time. Each slot shows spots remaining live from the
database and the active-player count required for that week. Full slots offer a
waitlist, never a disabled dead-end.

Booking goes through book_slot(slot_id, team_id): SELECT...FOR UPDATE on the slot,
counts confirmed+reserved inside the transaction, inserts reserved or waitlisted,
returns a typed result. Never count capacity in client JS.

pg_cron every 5 minutes expires reserved bookings older than 30 minutes, promotes
the first waitlisted team, and emails them via Resend. Send confirmation emails on
booking and on promotion.
```

### PHASE 6 — Payments (Razorpay live)
```
Add Razorpay for both the ₹100 registration fee and the ₹100/week training
recharge, gated by PAYMENTS_ENABLED — if ever flipped false, fall back to
"pay at venue," confirmed manually by an organiser.

Server-side only:
- POST /api/payments/create-order: authenticates the user, verifies they own the
  booking/training-signup, computes the amount SERVER-SIDE from site.ts config for
  the given purpose ('registration' | 'training_recharge', never from the request
  body), creates a Razorpay order, inserts a payments row as 'created' with the
  correct purpose and valid_week.
- POST /api/payments/webhook: verifies X-Razorpay-Signature HMAC, then in one
  transaction marks the payment 'paid' and the booking/training-signup 'confirmed'.
  Idempotent — Razorpay retries webhooks. Log and ignore unrecognised events.
- The client redirect callback only shows a status screen; it never writes payment
  status.

Client: Razorpay Checkout with pending/success/failed states and a "payment taken
but not confirmed yet" state that polls booking status.

Receipts by email on confirmation. Never store card details. All keys in env vars.
```

### PHASE 7 — League, scores, live scoreboard
```
/league: standings table from the view (sticky header, tabular-nums via .data,
team logos, last-5 form pills, top-4 highlighted); Fixtures tab by week with
terracotta-vs-sage versus cards; Results tab with round-by-round breakdown;
prize structure section [[PRIZE_STRUCTURE]]. Revalidate on demand when an admin
saves a score.

/teams and /teams/[slug]: roster, record, match history, form.

/live: full-screen scoreboard for venue projection — two team panels in their
colors, huge tabular score, round indicator, timer. Subscribe to Supabase realtime
on matches so it updates the instant a score is entered. Readable from 15 metres.
```

### PHASE 8 — Admin panel
```
/admin gated by profiles.role in ('admin','organiser'), checked server-side in
middleware AND enforced by RLS.

- Dashboard: registrations this week, fees collected (registration + training
  recharges), upcoming slots, no-shows.
- Slots: "generate next N weeks" from the block rotation config; set
  required_active_players per week; edit capacity; cancel/reschedule with
  automatic email.
- Registrations: approve/reject teams, edit rosters, view waivers.
- Payments: reconciliation table filterable by purpose (registration/training)
  and status, mark "paid at venue," issue refund notes, export CSV.
- Scores: match entry — select slot, two teams, round scores, mark
  completed/forfeited. Saving recomputes standings and revalidates /league. Every
  edit writes an audit log (user, timestamp).
- Check-in: QR scanner reading a booking's qr_token, stamps checked_in_at.
- Announcements and training batch management.

Every destructive action needs a confirm dialog. Every mutation is server-side.
```

### PHASE 9 — Polish and launch
```
- Gallery: optimised next/image, lazy loading, lightbox.
- Announcements strip on homepage.
- Loading/empty/error states for every data view.
- Accessibility audit: keyboard traversal, dialog focus management, alt text,
  contrast ≥4.5:1 for body text, reduced-motion honoured.
- Lighthouse mobile: performance ≥85, accessibility ≥95 — report and fix failures.
- SEO: sitemap.xml, robots.txt, per-route metadata, JSON-LD SportsEvent schema on
  fixtures, OG images.
- Vercel Analytics, Sentry for errors.
- Seed script: realistic sample teams, slots, matches for demoing pre-launch.
- README: env vars, local setup, migration steps, deploy instructions.
```

---

## 8. Launch checklist
- [ ] University approval for venue, name, fee collection — in writing
- [ ] Waiver text reviewed by someone with authority to approve it
- [ ] Razorpay account activated, webhook registered, tested with a ₹1 live transaction
- [ ] Refund policy published and agreed with whoever holds the money
- [ ] Real photos in place, zero stock imagery
- [ ] Every `[[PLACEHOLDER]]` replaced
- [ ] Tested end-to-end on a mid-range Android phone on campus wifi
- [ ] At least two organisers have admin access
- [ ] Database backups enabled in Supabase
- [ ] A rehearsal match day run with the `/live` screen before opening to students

---

## 9. Sequencing advice

Phases 1–5 give you a site that can take registrations — that's the launchable product. Ship it, open registrations, build 6–9 while people sign up. If Sep 1 is close, the ruthless cut is Phase 1 → 3 → 4 → 5 with the hero as a well-shot poster image; the hoop-cam 3D scene can land in week two.
