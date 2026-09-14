---
version: 1
name: Countdown Gallery
description: A public library of precise countdowns, each presented through a selected visual instrument.
---

## Product structure

- **Public index (`/`):** A quiet, scannable list of active public countdowns. It is a library, not a dashboard.
- **Countdown detail (`/c/:slug`):** A full-viewport stage for one object, the timer. No library header, theme kicker, or competing headline. Title and deadline exist for assistive tech and the browser tab. Vote and Settings sit as corner utilities. A quiet Library control is the only hub navigation.
- **Settings (`/settings`):** Browser-local viewing preferences only, beginning with preferred display timezone.
- **Manage (`/manage`):** Owner-only library operations: create, edit, archive, choose a design, and configure an optional poll. Library chrome belongs here and on the public index, not on the timer.

## Theme library

1. **Midnight Chronograph:** Default. Dark, mechanical, split-flap timer.
2. **Studio Minimal:** Off-white editorial surface, static large numerals, precise black rules.
3. **Signal Board:** High-contrast digital information display for shared events and deadlines.

Themes are code-owned components selected by a validated theme ID. They are not arbitrary user CSS. Every theme must provide semantic remaining-time text, a stable expired state, responsive mobile layout, reduced-motion support, and accessible contrast.

## Information hierarchy

1. Remaining time, optically centered, as the only primary object
2. Time-unit labels
3. Recessive utilities: Library, Settings, and optional Vote
4. Title and deadline context, available but not competing for the viewport

## Safety and ownership

Public visitors can read only active public countdowns. They never receive authoring controls. Manage requires the approved owner account and preserves records by archiving rather than deleting them.

## Decisions and reasoning

- **Separate Settings from Manage:** Viewing preferences belong to a browser-local Settings page. Shared countdown content belongs in authenticated Manage.
- **Public list, private management:** Countdown links are intentionally shareable, but authoring must be protected from anonymous internet writes.
- **Theme library over a single visual treatment:** Different deadlines benefit from different levels of ceremony, while a typed theme catalog keeps their visual quality and accessibility predictable.
- **Vote as an optional utility:** Polls are scoped to one countdown and tucked behind a secondary control so they never displace the timer.
- **Timer pages match the legacy instrument:** After comparing the live CALL-E page with the hub, detail routes drop library chrome, use square split-flap cards with a 24px unit gap, and keep the clock as the sole visual object. Studio Minimal and Signal Board still change surface and numeral treatment, not the object-first composition.
