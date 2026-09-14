---
version: 1
name: Countdown Gallery
description: A public library of precise countdowns, each presented through a selected visual instrument.
---

## Product structure

- **Public index (`/`):** A quiet, scannable list of active public countdowns. It is a library, not a dashboard.
- **Countdown detail (`/c/:slug`):** The selected timer is the primary object. Supporting deadline context and an optional Vote control remain secondary.
- **Settings (`/settings`):** Browser-local viewing preferences only, beginning with preferred display timezone.
- **Manage (`/manage`):** Owner-only library operations: create, edit, archive, choose a design, and configure an optional poll.

## Theme library

1. **Midnight Chronograph:** Default. Dark, mechanical, split-flap timer.
2. **Studio Minimal:** Off-white editorial surface, static large numerals, precise black rules.
3. **Signal Board:** High-contrast digital information display for shared events and deadlines.

Themes are code-owned components selected by a validated theme ID. They are not arbitrary user CSS. Every theme must provide semantic remaining-time text, a stable expired state, responsive mobile layout, reduced-motion support, and accessible contrast.

## Information hierarchy

1. Remaining time on a detail page
2. Countdown title and deadline context
3. Optional Vote control
4. Public-library navigation and owner utilities

## Safety and ownership

Public visitors can read only active public countdowns. They never receive authoring controls. Manage requires the approved owner account and preserves records by archiving rather than deleting them.

## Decisions and reasoning

- **Separate Settings from Manage:** Viewing preferences belong to a browser-local Settings page. Shared countdown content belongs in authenticated Manage.
- **Public list, private management:** Countdown links are intentionally shareable, but authoring must be protected from anonymous internet writes.
- **Theme library over a single visual treatment:** Different deadlines benefit from different levels of ceremony, while a typed theme catalog keeps their visual quality and accessibility predictable.
- **Vote as an optional utility:** Polls are scoped to one countdown and tucked behind a secondary control so they never displace the timer.
