# Kinship — Product Vision

> A personal CRM for the people who matter.

## The thesis

Modern life scatters our relationships across phones, inboxes, DMs, and calendars. The people we say we care about quietly drift because nothing in our tools is designed to help us *tend* to relationships — they're designed to help us *transact* through them.

**Kinship is a calm, intentional system for nurturing personal and professional relationships over time.** It treats every person you care about as a living relationship — with a cadence, a history, and a story — not a row in a contact list.

## Who it's for

- **Relationship-rich professionals** (founders, investors, recruiters, salespeople, journalists, organizers) who maintain hundreds of meaningful ties and feel guilty about the ones they've let slip.
- **Intentional individuals** who want to be a better friend, sibling, mentor, or partner and need a gentle external memory.
- **Networkers re-entering social life** after a big transition (new city, new job, post-parental-leave) who need to re-activate their circle deliberately.

It is **not** for sales pipelines, lead-gen, or contact-blasting. There are no deals, no quotas, no automation that pretends to be you.

## What we believe

1. **Relationships have rhythm.** Different people deserve different cadences — a sibling is not a quarterly check-in, a former colleague is not a daily text.
2. **Memory is the bottleneck.** People don't fail to reach out because they don't care; they fail because they forget the small details that make outreach feel personal.
3. **Nudges should feel like a friend tapping your shoulder**, not a productivity app yelling at you. Soft, specific, skippable.
4. **Context lives everywhere.** What someone posts on LinkedIn, the email they sent last week, the birthday on their calendar — Kinship pulls signal in, but never replaces the human act of reaching out.
5. **Privacy is non-negotiable.** Your relationships are not a dataset. Everything is per-user, RLS-protected, and never used for ranking or recommendation outside your own circle.

## The core loop

```text
   ┌─────────────┐      ┌──────────────┐      ┌──────────────┐
   │  Add people │ ───▶ │ Assign tier  │ ───▶ │ Set cadence  │
   └─────────────┘      └──────────────┘      └──────────────┘
                                                     │
                                                     ▼
   ┌─────────────┐      ┌──────────────┐      ┌──────────────┐
   │ Log moment  │ ◀─── │ Reach out    │ ◀─── │  Get nudged  │
   └─────────────┘      └──────────────┘      └──────────────┘
          │
          ▼
   ┌─────────────┐
   │ Capture note│
   └─────────────┘
```

## What the features solve

| Feature | Pain it removes |
|---|---|
| **Contacts & Tiers** | "Everyone is in the same flat address book — I can't tell who matters most." |
| **Interaction Timeline & Notes** | "I can't remember the last time I spoke to them, or what we talked about." |
| **Nudges & Cadence Engine** | "I meant to reach out months ago. Now it's awkward." |
| **Reminders & Calendar Sync** | "I keep promising to follow up and never do." |
| **Integrations (Email / Social)** | "I missed their big update because it was buried in another app." |
| **Content Hub per Contact** | "I want to walk into a coffee already knowing what's going on in their life." |

## Design principles

- **Editorial calm.** Sage & cream palette, Instrument Serif headings, generous whitespace. The product should feel like a journal, not a spreadsheet.
- **Bento composition.** Information is grouped into discrete, scannable cards — never a wall of fields.
- **Soft signals over hard alerts.** Color, dot indicators, and gentle copy ("Due soon", "Recently in touch") instead of badges and red counts.
- **Frictionless capture.** Logging a moment should take one tap. Adding a note should never require a modal.
- **Read-only by default for integrations.** Kinship surfaces what's happening; it never posts, replies, or messages on the user's behalf.

## What success looks like

- A user opens Kinship daily, sees 1–3 specific, named nudges, and acts on at least one.
- After 90 days, a user can answer *"when did I last talk to ___, and what about?"* for anyone in their inner two tiers in under 5 seconds.
- A user reports that a relationship they almost lost was rekindled because Kinship reminded them in time.

## Non-goals

- A team CRM, shared workspaces, or multi-user pipelines.
- Automated outreach, AI-generated messages, or "smart replies."
- A social network. Kinship has no feed, no public profiles, no follows.
- A complete system of record. Kinship complements your phone contacts and calendar; it does not replace them.

## Per-feature PRDs

Detailed product requirement documents live alongside this file:

- [`prd/contacts-and-tiers.md`](./prd/contacts-and-tiers.md)
- [`prd/interaction-timeline.md`](./prd/interaction-timeline.md)
- [`prd/notes-and-history.md`](./prd/notes-and-history.md)
- [`prd/nudges-and-cadence.md`](./prd/nudges-and-cadence.md)
- [`prd/reminders-and-calendar.md`](./prd/reminders-and-calendar.md)
- [`prd/integrations.md`](./prd/integrations.md)
- [`prd/content-hub.md`](./prd/content-hub.md)
