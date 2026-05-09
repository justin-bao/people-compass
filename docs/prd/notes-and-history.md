# PRD — Notes & Edit History

## Problem

The texture of a relationship lives in small details: their kid's name, the book they recommended, the surgery they're recovering from. Users need a place to capture these notes, edit them as life evolves, and trust that nothing important is ever lost.

## Goal

Provide per-contact, free-form notes with full version history — every edit and deletion preserved as a restorable revision.

## Users & jobs-to-be-done

- *"Let me jot down what I just learned without ceremony."*
- *"I want to update last year's note without losing what it used to say."*
- *"Show me what this note said before I edited it — and let me roll back."*

## Scope

### In scope
- Add note via single-line input (Enter to save).
- Inline edit and delete on hover.
- "Edited" indicator when `updated_at` differs from `created_at`.
- History modal listing every prior revision (and deletion snapshots).
- One-click restore of any prior revision.
- All revisions captured automatically by a database trigger.

### Out of scope
- Rich text / Markdown formatting (v1 is plain text).
- Tagging notes by topic.
- Sharing notes between contacts.

## UX requirements

- Notes card sits in the contact bento grid; never behind a tab.
- History modal shows current version pinned at top with primary border, then revisions newest-first.
- Deletion requires confirm and explicitly tells the user a snapshot will remain.
- Restoring a revision creates a *new* current version (never destroys timeline).

## Data model

```text
notes            (id, user_id, contact_id, body, created_at, updated_at)
note_revisions   (id, note_id, body, change_type, created_at)
```

- `change_type` ∈ `update | delete`.
- Trigger `record_note_revision()` fires `BEFORE UPDATE OR DELETE` on `notes` and inserts the prior `body` into `note_revisions`.
- RLS on `note_revisions` derives access from the parent note's `user_id`.

## Success metrics

- ≥ 30% of contacts in tiers 1–2 have at least one note within 30 days.
- < 1% of notes ever lost or unrecoverable (history coverage = 100%).
- History modal opened by ≥ 10% of monthly active users (signal of trust in revision system).

## Open questions

- Pin/star important notes to the top?
- Surface most-recent note on the contact list card?
