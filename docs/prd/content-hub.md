# PRD — Content Hub (per Contact)

## Problem

Even with integrations connected, raw feeds are noisy. The user wants a single, calm surface per person: *"here's what's new in their world."*

## Goal

Aggregate the latest signal from all connected providers for a single contact into one bento card on the contact profile — scannable in under 10 seconds, refreshed on demand, never overwhelming.

## Users & jobs-to-be-done

- *"Before I call them, give me the 30-second briefing."*
- *"Highlight what's new since I last looked."*
- *"Let me click straight through to the original post or email."*

## Scope

### In scope
- Per-provider tile (Gmail, Instagram, LinkedIn, X, TikTok) with the latest matched item.
- "New since last visit" indicator per tile.
- Manual refresh per contact.
- Click-through opens the original item in the provider's app/site.
- Graceful empty/disconnected states per tile.

### Out of scope
- Inline reading of full content (the hub is a launchpad, not a reader).
- Cross-contact feeds.
- Comments, reactions, or any write interaction.

## UX requirements

- Card uses a 2-column (mobile) / 4-column (desktop) grid of provider tiles.
- Each tile: provider icon, handle/email, one-line snippet OR connection status.
- "New" indicator is a small dot, not a badge with a count.
- Loading state is shimmer per tile; one slow provider never blocks the others.
- Empty hub (no providers connected) surfaces a single, friendly CTA to Settings.

## Data flow

```text
contact profile load
   │
   ▼
for each connected provider in parallel:
   resolve(contact.handle) ──▶ provider API ──▶ latest item
                                     │
                                     ▼
                          render tile / empty / error
```

- All fetches are user-scoped and use the connector's stored token.
- Results cached briefly client-side per session; never persisted server-side.

## Success metrics

- ≥ 25% of contact-profile sessions include a Content Hub tile click-through.
- Hub renders within 1.5s p75 (excluding slow upstream providers).
- < 5% of sessions show a hub-wide error state.

## Open questions

- Do we let users hide specific providers per contact (e.g. don't show LinkedIn for family)?
- Should "new since last visit" be per-device or synced across devices?
