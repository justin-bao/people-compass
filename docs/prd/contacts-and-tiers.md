# PRD — Contacts & Tiers

## Problem

A flat address book treats every person identically. Users can't distinguish a sibling from a vendor, and so they treat them all the same — which is to say, they neglect them all equally.

## Goal

Let users group the people in their life into meaningful **tiers** (e.g. Inner Circle, Family, Close Friends, Professional, Acquaintances), each with its own check-in cadence, so the rest of the product can reason about who needs attention and when.

## Users & jobs-to-be-done

- *"Help me see, at a glance, who matters most."*
- *"Let me decide how often I want to be in touch with each kind of person."*
- *"Don't make me re-categorize every time I add someone — give me sensible defaults."*

## Scope

### In scope
- Create, rename, reorder, recolor, and delete tiers.
- Assign each contact to exactly one tier (nullable).
- Per-tier `cadence_days` (target days between meaningful check-ins).
- Default tier seeding on signup: Inner Circle (14d), Family (21d), Close Friends (30d), Professional (60d), Acquaintances (120d).
- Contact profile fields: name, avatar, role, company, location, email, phone, birthday, bio, social handles (Instagram, LinkedIn, X, TikTok).
- Contact list view grouped/sortable by tier and by relationship health.

### Out of scope
- Multi-tier membership (a person belongs to one tier).
- Shared/team tiers.
- Smart auto-tiering via AI.

## UX requirements

- Tier color renders as a small dot on the contact card and profile header.
- Adding a contact must be possible in under 10 seconds (name + tier, everything else optional).
- Reassigning a tier is a one-tap action from the profile.
- Deleting a tier prompts the user to reassign or null its contacts; never silently orphans data.

## Data model

```text
tiers          (id, user_id, name, color, cadence_days, sort_order)
contacts       (id, user_id, tier_id?, name, avatar_url, email, phone,
                birthday, location, role, company, bio,
                instagram, linkedin, x_handle, tiktok,
                last_contacted_at)
```

- RLS: every row scoped to `user_id = auth.uid()`.
- `tier_id` is `ON DELETE SET NULL`.
- `last_contacted_at` updated automatically by the interactions feature.

## Success metrics

- ≥80% of contacts have a non-null tier within 7 days of signup.
- Users edit at least one tier's cadence within 14 days (signal that defaults are being personalized).
- Median time to add a new contact < 15s.

## Open questions

- Should a "Hidden" tier exist for people the user wants to keep on file but excluded from nudges?
- Do we surface tier-level analytics (e.g. "you've drifted from 4 of 12 close friends")?
