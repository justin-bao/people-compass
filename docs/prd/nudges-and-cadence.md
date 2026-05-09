# PRD — Nudges & Cadence Engine

## Problem

People don't drift apart on purpose. They drift because nothing reminds them that it's been three months. A relationship CRM is only as valuable as its ability to *gently surface the right person at the right time*.

## Goal

Compute a relationship "health" score for every contact based on tier cadence and `last_contacted_at`, and surface the most overdue people on the dashboard as specific, named, skippable nudges.

## Users & jobs-to-be-done

- *"Tell me who I should reach out to today."*
- *"Don't yell at me — suggest, don't demand."*
- *"Let me dismiss a nudge without logging an interaction (sometimes I'm just not ready)."*

## Scope

### In scope
- Health states: `new` (never logged), `fresh`, `due-soon`, `overdue`.
- Computation: `ratio = daysSinceLastContact / tier.cadence_days`.
  - `< 0.7` → fresh
  - `0.7 ≤ ratio < 1` → due-soon
  - `≥ 1` → overdue (with `overdueDays` count)
- Dashboard "Nudge Engine" card lists top N overdue contacts, ordered by overdue magnitude weighted by tier importance.
- Per-contact cadence bar in profile header showing current health visually.
- One-tap actions from a nudge: log moment, set reminder, snooze, open profile.

### Out of scope
- Push notifications (v1 is in-app surface only).
- AI-generated message suggestions.
- Predictive "best time to reach out" logic.

## UX requirements

- Nudge copy is human, e.g. *"You haven't caught up with Sam in 47 days — usually every 30."*
- Color cues only; never red-badge alarmism. Use sage/amber/clay tones from the design system.
- Snoozing a nudge hides it for a user-chosen interval without altering `last_contacted_at`.
- Empty state ("you're all caught up") is celebratory, not blank.

## Logic (reference)

```text
function cadenceHealth(lastAt, cadenceDays):
  if lastAt is null: return { status: "new", ratio: 0 }
  days = (now - lastAt) / 1 day
  ratio = days / cadenceDays
  if ratio < 0.7: status = "fresh"
  else if ratio < 1: status = "due-soon"
  else: status = "overdue", overdueDays = floor(days - cadenceDays)
  return { status, ratio, overdueDays }
```

Lives in `src/lib/cadence.ts`; pure, no I/O, fully testable.

## Success metrics

- ≥ 50% of surfaced nudges are acted on (logged or reminder set) within 7 days.
- Average days-overdue across a user's tier-1 contacts trends down over time.
- Snooze-to-act ratio < 0.5 (nudges are wanted, not noise).

## Open questions

- Per-contact cadence override (some friends genuinely are quarterly)?
- "Vacation mode" that freezes cadence calculations?
