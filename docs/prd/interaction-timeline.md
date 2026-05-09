# PRD — Interaction Timeline

## Problem

Without a record of when and how you last connected with someone, every reach-out starts from zero. Users either over-message ("did I already text them about this?") or under-message ("has it really been six months?").

## Goal

Give every contact a complete, filterable, chronologically-grouped timeline of logged interactions, so the user can recall the shape of the relationship at a glance and reach out with context.

## Users & jobs-to-be-done

- *"Show me the last time we actually spoke — not just emailed."*
- *"Let me log a coffee in two taps without leaving the page."*
- *"Filter to just calls, or just in-person meetings, when I'm reflecting."*

## Scope

### In scope
- Interaction types: Call, In-person (lunch/coffee), Text, Email, Video, Note.
- One-tap quick-log chips on the contact header ("Just chatted?").
- Detailed log form with type, datetime, and free-text notes — the form preselects type from the active filter chip.
- Filter chips above the timeline with live counts; "All" resets.
- Monthly grouping with vertical timeline rail.
- Each interaction updates the contact's `last_contacted_at`, which feeds the cadence engine.

### Out of scope (v1)
- Editing or deleting individual interactions (interactions are append-only ledger).
- Importing call/SMS history from the OS.
- Multi-contact interactions (group dinners attributed to several people at once).

## UX requirements

- Timeline empty state nudges the user toward the quick-log chips.
- Filter chip and "Log interaction" button live in the timeline header.
- Form datetime defaults to *now*; user can backdate.
- Active filter chip and active type pill in the form share the same visual treatment.
- Each timeline entry shows: icon, type label, weekday + date + time, optional note.

## Data model

```text
interactions   (id, user_id, contact_id, type, occurred_at, notes,
                created_at)
```

- RLS scoped per user.
- `type` is a constrained string: `call | lunch | text | email | video | note`.
- Insert trigger updates `contacts.last_contacted_at = GREATEST(existing, occurred_at)`.

## Success metrics

- Median user logs ≥ 3 interactions per active week.
- ≥ 60% of logged interactions include a non-empty `notes` field.
- < 2 taps from contact page to logged interaction (target = 1 tap for quick-log, 3 for detailed form).

## Open questions

- Do we let users define custom interaction types?
- Should a "missed/declined" type exist (rejected calls, ignored texts) for accuracy?
