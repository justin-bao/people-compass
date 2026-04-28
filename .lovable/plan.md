## Personal CRM — Build Plan

A warm, editorial-feeling CRM for personal relationships. Sage & Cream palette, Instrument Serif headlines + Work Sans body, bento-grid dashboard.

### Phase 1 — Core CRM (this iteration)

**Design system**
- Update `src/styles.css`: sage/cream tokens in oklch, Google Fonts (Instrument Serif + Work Sans), bento card variants, soft shadows, generous radii.
- Custom Button & Card variants for "warm" / "tier" looks.

**Backend (Lovable Cloud / Supabase)**
- Enable Cloud, set up auth (email + Google).
- Tables (all RLS-scoped to `auth.uid()`):
  - `profiles` (display name, avatar)
  - `tiers` — user-defined categories (name, color, target_cadence_days). Seeded defaults: Inner Circle (14d), Close Friends (30d), Family (21d), Professional (60d), Acquaintances (120d).
  - `contacts` — name, avatar, tier_id, birthday, location, role, company, social handles (instagram/linkedin/x/tiktok), email, phone, notes, last_contacted_at.
  - `interactions` — contact_id, type (call/lunch/text/email/meeting/event/dm), occurred_at, notes.
  - `notes` — contact_id, body, created_at (separate from interactions for free-form thoughts).
  - `reminders` — contact_id, due_at, message, status.

**Pages & routes**
- `/` — Marketing landing (hero + features + CTA).
- `/auth` — Sign in / sign up.
- `/app` — Bento dashboard (Nudges, Upcoming reminders, Recent interactions, Tier overview, Quick add).
- `/app/contacts` — Contact list with tier filters, search.
- `/app/contacts/$id` — Contact profile: header, tier, cadence health bar, interactions timeline, notes, content hub, reminders, integration panels.
- `/app/tiers` — Manage tiers and cadences.
- `/app/settings` — Integrations (Gmail, Calendar, social) + profile.

**Nudge engine**
- Server function computes `daysOverdue = today - last_contacted - tier.target_cadence_days`. Surfaces top 5 overdue contacts as nudges with one-click "Log interaction" / "Schedule reminder" / "Send email" actions.

### Phase 2 — Integrations (next iteration, after core ships)

User chose **Full stack now**, but integrations are large and each requires its own connector setup + UI. To keep this turn shippable, I'll:
- Wire **Gmail** + **Google Calendar** connectors live (most-requested for a CRM): show recent emails per contact (matched by email address), and "Schedule meetup" → creates Calendar event + reminder row.
- Build the UI panels for Instagram / LinkedIn / X / TikTok / Outlook with "Connect" CTAs and a content-hub layout. **Note:** LinkedIn, Instagram, TikTok, and X don't have first-party Lovable connectors — they each require per-user OAuth apps the user must register themselves. I'll build the data model and UI so they slot in once OAuth is set up; will guide the user through that in the next turn if they want it.

### Technical notes
- TanStack Start with file-based routes under `src/routes/`.
- Server functions in `src/server/*.functions.ts` for all DB access via `requireSupabaseAuth`.
- Gmail via gateway: `connector-gateway.lovable.dev/google_mail/gmail/v1` — list messages filtered by `from:` contact email.
- Google Calendar via gateway: `connector-gateway.lovable.dev/google_calendar/calendar/v3` — create events on `primary` calendar.
- Zod validation on every server function input.
- Each route gets its own `head()` metadata.

### What ships this turn
1. Design system + landing page
2. Auth + Cloud schema + RLS
3. Dashboard, contacts list, contact profile, tiers, settings
4. Nudge engine
5. Gmail + Google Calendar connector wiring (live)
6. Social integration UI shells with Connect CTAs

Ready to build?