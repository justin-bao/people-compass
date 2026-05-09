# PRD — Reminders & Calendar Sync

## Problem

Nudges tell you *who* to reach out to. Reminders commit you to *when*. Without a binding moment in time — and ideally one that lands in the calendar the user already lives in — good intentions evaporate.

## Goal

Let users schedule per-contact reminders ("ping Sam in 7 days"), see them on the contact profile and dashboard, and optionally sync them to their connected calendar as events.

## Users & jobs-to-be-done

- *"Remind me to follow up after their interview next Thursday."*
- *"Put it in my real calendar so I'll actually see it."*
- *"Let me dismiss a reminder when I've handled it."*

## Scope

### In scope
- Create a reminder from contact profile: due date/time, optional message.
- Reminder list on contact profile and aggregated on dashboard.
- Status: `pending | done | snoozed`.
- Mark done from any surface; snoozing pushes `due_at` forward.
- Optional Google Calendar sync (when connected): create a calendar event mirroring the reminder, two-way status when user marks event done.

### Out of scope (v1)
- Apple Calendar / Outlook sync.
- Recurring reminders (use cadence engine instead).
- Shared reminders.

## UX requirements

- Reminder creation defaults to 7 days out, editable in one tap.
- Reminders within 24h are visually emphasized on the dashboard.
- Calendar sync is opt-in per user, never on by default.
- Sync failures show inline; never silent.

## Data model

```text
reminders   (id, user_id, contact_id, due_at, message, status,
             external_event_id, external_calendar_id, created_at)
```

- `external_event_id` links to the synced calendar event when present.
- RLS scoped per user.

## Integration: Google Calendar

- OAuth via the user-managed connector flow (not embedded).
- Scopes requested: `calendar.events` (write), nothing more.
- Event title: `Kinship: reach out to <name>`.
- Event description includes the reminder message and a deep link back to the contact profile.

## Success metrics

- ≥ 40% of reminders are completed (`status = done`) by their due date.
- ≥ 25% of monthly active users connect a calendar.
- Reminder creation is < 5 seconds median.

## Open questions

- Smart suggested due-dates based on the contact's tier cadence?
- Reminder templates ("birthday wishes", "post-interview check-in")?
