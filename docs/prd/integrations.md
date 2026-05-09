# PRD — Integrations (Email, Social, Messaging)

## Problem

The signals that should drive outreach — a friend's promotion on LinkedIn, an unread email from a former colleague, a new post on Instagram — are scattered across apps the user doesn't have time to check. Important moments are missed.

## Goal

Pull *read-only*, per-contact signal from the user's connected accounts (Gmail, Instagram, LinkedIn, X, TikTok, etc.) and surface it on the contact profile, so users can walk into every interaction informed.

## Users & jobs-to-be-done

- *"Show me what I might have missed from this person."*
- *"Don't make me open five apps to prep for one coffee."*
- *"Never post or message on my behalf."*

## Scope

### In scope
- OAuth connection per provider via standard connector flow, managed in Settings.
- Per-provider matching: contact's saved handle/email is used to resolve their content.
- **Gmail**: list recent messages from the contact's email address.
- **Instagram / LinkedIn / X / TikTok**: list recent public posts authored by the matched handle.
- Per-contact "Content hub" card surfacing the latest item per connected provider.
- Unread/unseen indicator per provider on the contact card.
- Disconnect and revoke access from Settings.

### Out of scope
- Sending, replying, posting, liking, or any write action.
- DM ingestion (privacy/policy boundaries).
- Cross-user aggregation or analytics.

## UX requirements

- Each provider tile shows: provider icon, matched handle, latest item snippet, time ago.
- Disconnected providers show a *"Connect in Settings"* affordance, never a hard error.
- Settings page lists all connectors with status (Connected / Not connected / Reconnect needed).
- The Content Hub never blocks the rest of the profile from rendering.

## Data & sync model

- No raw provider content is persisted long-term; cached short-term per-fetch only.
- Connector tokens are stored via the platform's connector secret store, never in app tables.
- Per-contact handle fields (`email`, `instagram`, `linkedin`, `x_handle`, `tiktok`) drive matching.

## Privacy commitments

- Read-only scopes only.
- User can disconnect any provider at any time; cached data is purged on disconnect.
- No content is shared across users or used to train models.

## Success metrics

- ≥ 30% of monthly active users connect at least one provider.
- ≥ 50% of contacts in tiers 1–2 have at least one matched handle.
- Content Hub items influence ≥ 20% of subsequent logged interactions (signal of usefulness).

## Open questions

- Do we offer a unified "What I've missed" inbox across all contacts, or keep it strictly per-profile?
- How do we handle ambiguous matches (common names on social platforms)?
