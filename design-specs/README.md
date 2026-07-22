# SFI Crossings — design system

**The design authority for SFI Crossings follows below, in full and verbatim. It
governs everything you make.** It is reproduced complete — not summarised — so
nothing in it can drift or go missing.

Three things about *this host* come first, because they are not in the authority
document and cannot be: they concern the design surface itself, not the product.

---

## 1. Where your base instructions are wrong for this product

Your base instructions are sensible general-purpose design advice. Two pieces of
it do not apply here.

**Use Inter. It is the brand — not a placeholder to improve on.**
Your instructions list Inter among "AI slop tropes… overused font families" to
avoid. That is a default for products with no design system. This product has one,
and your instructions also say to *"use the existing type design system if there is
one."* That clause governs. Inter is the mandated `--font-sans`, chosen
deliberately and recorded in `tokens.css`. The type system is Inter (sans) + Commit Mono (mono) + Instrument Serif (display, and display only).
There is no font decision to make.

**The register is energetic, not minimal.**
Your instructions say "less is more; bias towards minimalism." This product's
governing tenet is **confident energy on a disciplined canvas**. Space is
generous, motion is deliberate, and a confirmed-good transition earns one beat of
ceremony.

The discipline is spent on **colour**, not on space, motion, or typographic
personality. Colour is punctuation — never wallpaper. So when you want to add
visual interest: **spend space and motion; never spend colour.** Restrain the
palette, not the product.

Everything else in your base instructions stands — especially *no filler content*,
*ask before adding material*, and the ban on decorative gradients.

---

## 2. How to use the tokens here

`tokens.css` is the only stylesheet you link. It imports the three brand faces
and declares every value.

```html
<link rel="stylesheet" href="./tokens.css" />
```

**Style with the custom properties.**

```html
<div style="background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: calc(var(--spacing) * 6)">
  <p style="font-family: var(--font-mono); font-size: var(--onyx-font-size-micro); text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground)">SHIPMENT</p>
  <button style="background: var(--primary); color: var(--primary-foreground); border-radius: var(--onyx-radius-pill); height: 36px; padding: 0 16px">Book</button>
</div>
```

There is no utility-class vocabulary here. Do not write `class="bg-primary"` — it
resolves to nothing. Components, when they exist, ship their own compiled CSS
alongside their bundle and use class names internally; that is their business,
not something you hand-author.

**Never hard-code a value that has a token.** No hex colours, no ad-hoc pixel
radii, no invented durations. Every name below resolves — if a value seems to be
missing, it is missing from the master. Say so; do not improvise one.

**Dark is canonical.** Put `class="dark"` on `<html>`. The file is
shadcn-standard — `:root` holds the *light* values and `.dark` overrides them — so
dark is the *presence* of the class and light is its absence. There is no `.light`
class. Light is a first-class peer, so check both.

### The vocabulary

Every backticked name in the doctrine below resolves as `var(--name)`.

- **Surfaces** — `--background` `--foreground` `--card` `--card-foreground`
  `--popover` `--popover-foreground` `--muted` `--muted-foreground`
  `--secondary` `--accent` `--border` `--border-strong` `--input` `--overlay`.
  (A `--sidebar-*` set exists for component compatibility; it is unsanctioned —
  the shell has no sidebar.)
- **Action & identity** — `--primary` `--primary-foreground` `--ring`
  `--ring-width` `--ring-offset` `--selection-bg` `--selection-foreground`
  `--inverse` `--inverse-foreground`.
- **Status ladder** — `--success` `--info` `--warning` `--destructive`
  `--stale`, each with a `-foreground`. Charts: `--chart-1`…`--chart-5`.
- **Type** — `--font-sans` `--font-mono` `--font-serif`;
  `--font-weight-normal/medium/semibold` (nothing above 600 exists);
  the scale as `--onyx-font-size-micro/small/regular/large/display/hero`;
  `--onyx-display-tracking` `--onyx-hero-tracking`.
- **Shape & rhythm** — `--radius` and `--radius-sm/md/lg/xl`;
  `--onyx-radius-pill` for the action silhouette; `--spacing` is the rhythm unit,
  so steps are `calc(var(--spacing) * N)`.
- **Depth** — `--shadow-sm/md/lg`. Resting panels take none (§Elevation & Depth).
- **Motion** — `--motion-duration-fast/base/slow`;
  `--motion-ease-standard/exit/emphasis`.

For tabular figures use `font-variant-numeric: tabular-nums`. For responsive
work, write ordinary media queries, `clamp()`, or
`grid-template-columns: repeat(auto-fit, minmax(…, 1fr))` — you are writing real
CSS, so nothing is off-limits.

---

## 3. What is in this project, and what is not yet

This is the design system's core: the authority document, the values, and the
foundations that render them.

- `README.md` — this file. The authority.
- `tokens.css` — every visual value; imports the faces.
- `fonts.css` + `fonts/` — the three brand faces, vendored as `.woff2`.
- `foundations/` — five reference cards (colour, typography, shape & space,
  motion, status glyphs). They are worked examples held to the doctrine below;
  copy their patterns, not just their values.

Not synced yet: the component library and page templates. Until they arrive,
compose from the tokens with the foundations as your worked examples and the
doctrine below as your check. Be correspondingly careful with the §Do's and
Don'ts list, and ask rather than invent when a rule and a layout pull against
each other.

---

*Everything below this line is the design authority document, verbatim. It
includes the ratified status glyph map (§Iconography).*

# SFI Crossings — Design System

## Overview

SFI Crossings is the customer-facing cross-border freight portal for SFI's shippers: request quotes, book shipments, track movement and customs-clearance status, and manage documents and invoices. It carries a light employee control surface (accounts, booking review, rates) and a developer area (API keys, webhooks, EDI/API integration). It is not the operations cockpit; it is the outward face of the same business.

Its users are occasional, not resident: customers who arrive with a job to do, plus staff dipping in for light control work. They work at desks in ordinary office and home lighting, 50–200 concurrent at peak. Page weight varies by purpose — forms-light flows through tables-heavy views — and every rule here must span both without over-fitting either. The stakes are money and reputation: a misread quote, a missed customs document, a stale tracking answer all cost real dollars and client trust.

The register is energetic, not clinical. Governing tenet: **confident energy on a disciplined canvas — colour is punctuation, spent on action, status, and moments of delight, never wallpaper.** Dark is the canonical and default mode; light is a first-class peer.

Voice and microcopy are plain, confident, and concrete — the product speaks like a competent freight agent, not a brochure and not a bureaucracy. Short sentences, concrete nouns, numbers with units. Every message says what happened and what to do next. Sentence case; no marketing superlatives; celebration is expressed visually on confirmed transitions, not with exclamation marks.

Touchstones: Resend-class craft and Mercury-class seriousness with money feel right; legacy carrier shipping managers and government-form aesthetics are the named opposite.

The UI must never let a customer commit money to something they could have misread — price, date, or scope — and must never show stale tracking as live. From anywhere, a user can always reach the status of their active shipments and a path to a human within seconds.

Audiences (five): customer, customer admin/billing, SFI staff (light control), developer, SFI admin. Design authority is a single person — the head of the client company; ties break there. Out of scope for v1: native mobile apps (responsive web **is** in scope, mobile included), offline use, shared wall displays, the marketing site, French localisation (v1 is English-only), and the operations cockpit itself.

The look is deliberate: a near-black canvas where panels lift by tone, not shadow, separated by hairlines rather than boxes. Amber is the only warm voice in the room — actions, focus, selection, and nothing else. Space is generous: content is staged like a product page, never crammed like a terminal. Type does the talking — a display serif that appears rarely and lands hard, mono eyebrows that give panels a machined precision, a quiet sans carrying everything else. When something good happens, the interface is allowed one beat of ceremony — then it returns to calm.

## Application Shell

One frame serves every audience — customer, staff, and developer areas share the same shell, never visibly different frames. Its parts are fixed vocabulary; screens never rearrange them. The vocabulary fixes **position, not presence**: a part whose feature is not yet built (the bell, before the notification centre exists) is omitted entirely — never moved, never substituted, never stubbed as dead chrome. What exists sits where this section says it sits.

- **Top bar** — the single persistent element. Logo at the leading edge (the identity moment), level-1 navigation — flat, always-visible links, one per area (Shipments, Invoices, …); never menus, never a second row — the notification bell, and the account menu (account, settings, help) at the trailing edge. It sits on `background` behind a hairline `border`; nothing else in the frame persists. There is no sidebar in this shell; the `sidebar-*` tokens exist for component compatibility only and are unsanctioned in v1.
- **View header** — every view opens with its title and the view's one `primary` action, right-aligned. It scrolls with the content; it is the only home for a view-level call-to-action. A record view whose content splits into facets (a shipment's info, documents, tracking) carries a tab row beneath the header — level-2 navigation: each tab is its own URL, the router owns which tab is active, and the shell and header do not re-mount on a switch.
- **Content area** — a staged column of panels on `background`; panels are `card` surfaces behind hairline borders. Navigation never exceeds these two levels — area links in the top bar, tabs within a view; there is no third level, and tabs never nest.

## Colors

Dark canonical, light peer. Mode is a manual toggle, persisted per user; the shell defaults to dark.

The status ladder is five roles, mapped to this product's real states:

- `success` marks confirmed-good **transitions**: quote accepted, booking confirmed, customs released, delivered, payment settled. Resting-normal stays neutral — an in-transit shipment on schedule is not green.
- `info` marks noteworthy-but-normal notices: an ETA revision requiring no action, a document ready to download, a rate-change notice.
- `warning` marks needs-attention-soon: a quote nearing expiry, documents missing before pickup, payment coming due, customs requesting paperwork.
- `destructive` marks blocking or critical states — customs hold, payment failed, booking rejected — and destructive actions themselves (cancel, delete).
- `stale` marks broken data trust: a tracking feed lost or aged past its freshness threshold. Stale composes with the others — stale-and-was-warning shows stale — and stale data is never presented as current.

Never colour alone: every status carries its glyph and its label. No colour-vision data exists for this client; the non-colour channels are kept regardless.

The emphasis budget: one `primary` action per view, counting calls-to-action. Secondary emphasis uses the `inverse` pill, never a second amber. The focus ring (`ring`) is exempt from the budget.

Amber is punctuation, never wallpaper: it appears as the one `primary` action, the focus `ring`, text selection (`selection-bg`), and the quiet `accent` hover wash — never as a large surface tint, a border colour, or decoration.

Soft status washes are derived at point of use from the role colour and the surface the wash sits on — `card` on a panel, `background` on the canvas, `popover` in a floating layer. Never mix with `background` from atop another surface: in dark mode the wash lands darker than its panel and reads as a hole. Status tints are never minted as new values.

This UI is SFI-only: no white-label or multi-tenant brand will ever wear it, and no brand colour beyond the amber exists.

Charts exist in v1 (staff dashboards; customer volume and spend). Categorical series use `chart-1`–`chart-5`, which by construction exclude every status hue and the `primary` amber — in a chart, a warm colour can only mean status or action, never a series. Magnitude uses a neutral sequential treatment; its tokenisation is an open decision (Governance).

## Typography

Roles are usage vocabulary realised through the token faces; they are not tokens.

- *display* — `font-serif`, regular weight, tight tracking, at the scale's display and hero steps. Reserved for page heroes, empty states, and milestone moments. Never for data, tables, or controls.
- *heading* — `font-sans` semibold at the large step.
- *body* — `font-sans` at the regular step in forms and reading; the small step in dense views.
- *caption/label* — `font-sans` at the micro step. Nothing renders below the micro step.
- *label-caps* — `font-mono` at the micro step, ALL-CAPS, wide tracking: section eyebrows, panel headers, IDs.

Money, IDs, and timestamps set in `font-mono` with tabular figures wherever a column of them appears; numeric columns right-aligned. Money shows one currency at a time — the shipment's own, never dual CAD/USD; two decimals, locale thousands separators, minus sign for negatives (never accounting parentheses); no abbreviation on money values (chart axes may abbreviate).

Timestamps are relative by default ("2 h ago"). Absolute timestamps with explicit timezone appear in detail metadata and on legal surfaces — invoices, customs documents; a cross-border document never shows a bare time.

ALL-CAPS belongs to the label-caps role only. No italics in UI text; underline is reserved for links.

## Layout & Density

One stance, fixed, everywhere: **generous and staged**. Content presents like a product page — panels breathe, sections stack in a deliberate vertical rhythm on the `spacing` unit. Density is never user-switchable and never diverges per view. No rows-per-screen target exists for this product; layouts optimise at-a-glance comprehension over row count.

Forms and reading views hold a constrained measure; data views use the full content width. Two floors hold regardless of energy: interactive targets ≥ 24px (WCAG 2.5.8), and every view remains usable at 200 % zoom (1.4.4).

## Elevation & Depth

Flat by default: depth comes from tint layering — `background` beneath `card` beneath `popover` — and hairline `border` separation, never resting shadows. A hover may strengthen a hairline to `border-strong`; it never adds shadow. `shadow-sm`, `shadow-md`, `shadow-lg` are reserved for transient floating layers — menus, popovers, dialogs — over the `overlay` scrim where they block the page. Glow is not elevation — it is a rare celebration accent on a confirmed transition, never ambient.

## Shapes

Actions are pill-shaped — the signature control silhouette — and chips and badges share it. Inputs, panels, and dialogs sit near-square on the `radius` scale. One silhouette per control class; never mixed within a view.

## Iconography

One icon family (Lucide), one stroke weight, sizes from the type scale. Icons carry meaning or are omitted — no decorative icons; the product's expressive moments belong to empty states and heroes (Components), not to glyphs.

Status glyphs are a fixed one-to-one mapping: each of the five roles has exactly one canonical glyph, used everywhere. Outline is the default style; filled variants are reserved for `warning` and `destructive` as the colour-independent weight channel. Status icons are always paired with a text label — this is what makes "never colour alone" hold.

The map — ratified 2026-07-14, canonical, and not open for reinterpretation:

| Role | Lucide glyph | Filled variant |
|---|---|---|
| `success` | `circle-check` | — |
| `info` | `info` | — |
| `warning` | `triangle-alert` | filled |
| `destructive` | `octagon-alert` | filled |
| `stale` | `clock-alert` | — |

The shapes are deliberately distinct — circle, circle, triangle, octagon, clock — so shape alone separates the rungs even in greyscale.

Icon-only controls are allowed where space demands (compact and mobile bars); every one carries an accessible name, and targets hold the 24px floor.

## Motion

This product moves — deliberately. Views and panels may animate in with short, staggered entrances; transitions preserve context (expansions unfold, views slide rather than cut); a confirmed-good transition earns its one beat of ceremony (Overview), then rests.

Every cue is one-shot: never blinking, pulsing, or looping attention animation, and nothing animates continuously inside a table or at rest. There is no real-time push in v1: data arrives by fetch — page load, refetch after an action, or refresh. When a refetch visibly changes a value on screen, it may take a brief one-shot highlight that settles back to resting state.

Loading is confident and calm: skeletons for the first paint of panels and lists, steady spinners for in-flight actions, determinate progress for uploads. Nothing bounces.

All durations and eases come from the motion scale — `motion-duration-fast`, `motion-duration-base`, `motion-duration-slow`; `motion-ease-standard`, `motion-ease-exit`, `motion-ease-emphasis` for large moves. The reduced-motion preference is honoured with a static equivalent for every cue, including the ceremony.

## Components

View archetypes in v1: record lists and tables, detail views, the booking wizard, KPI/status tiles, an activity timeline, a tracking map, a pickup scheduler/calendar, a document manager, and the developer console (keys, webhooks, delivery logs). Rules here span all of them; never over-fit one.

- The map and the calendar obey the colour doctrine: a pin, route, or calendar chip wears a status hue only to mean status; categorical distinctions prefer position, shape, and label.
- Staff record grids are modest — hundreds of rows with sorting and filtering, not virtualised thousands. They are built on the stack's headless table engine, styled entirely by the tokens. Customer lists are card-native on narrow screens (Responsive).
- Detail and edit: full-page detail views with nested tabs for records; full page for heavyweight flows (the booking wizard); modals come in two types — Type A confirmations for decision gates, destructive actions and commit points (in service of the never-misread rule, Overview), and Type B for small self-contained data-entry forms. On narrow screens a Type B modal presents as a bottom-sheet drawer — the viewport decides, never the author; same interaction, same rules, same content. Desktop side drawers and nested drawers do not exist in v1.
- Toasts carry transient confirmations only. Anything important or actionable is persistent inline — a page-level message (PageMessage) or in-panel. A critical alert never toasts.
- Every interactive component defines default, hover, focus (always visible), active, disabled, and selected states. Read-only values render as plain content; disabled controls appear only when an action is temporarily unavailable.
- Every data-bearing component defines loading, empty, and error states plus the operational ladder: request failure → `destructive`; degraded feed → `warning`; no or aged data → `stale`. Freshness (last-updated) is visible wherever data can go stale; staleness is evaluated against data age at render — there is no live feed in v1. Empty splits three ways: first-use (guidance plus, optionally, the product's one sanctioned expressive visual — monochrome, no status hues, no amber wash), filtered-to-nothing (clear-filters affordance), and error (what happened, then retry).
- Boundary screens — login/logged-out, 404/500, maintenance, first-run — are in scope and follow these rules; the expressive visual is welcome there.
- Print and export surfaces (waybills, labels, customs documents, invoices) are generated documents, explicitly outside this document's styling scope in v1. The UI affordances around them — download and print actions, pending/ready states — follow these rules. (Template ownership → Governance, open.)
- One way per interaction: the same interaction always uses the same component, everywhere.

## Forms & Validation

Booking is a multi-step wizard. Each step is a single-column form with top-aligned labels and inputs sized to their expected content — postal codes short, address lines long.

Validation fires on step submit; corrected fields re-validate inline. Errors are `destructive`-styled at the field with icon and label, plus a step-level summary on long steps; error text states what happened and what to do next (Overview voice). The minority case is marked: optional fields say "optional"; required is unmarked.

Formatted inputs — dates, money, weights and dimensions, postal codes, HS codes — use masks or pickers, never free text where a format exists (formats per Typography).

## Notifications & Alerts

Severities map to the status ladder (Colors); `destructive` is the blocking rung.

The bell in the top bar opens the notification centre — the persistent history of everything worth keeping: booking confirmations, customs events, payment notices. Ambient noise stays out of it. Unread state is a quiet persistent badge on the bell — never animation.

Nothing demands ceremony except blocking `destructive` events — a customs hold on the user's own shipment, a failed payment blocking a booking. These persist as a page-level message (PageMessage) on the affected views until resolved or explicitly acknowledged; transient confirmations use the flash mechanism.

Escalation beyond the UI is email — confirmations, holds, payment issues — but the interface never assumes the email was read: the same state is always visible in-app. The UI is silent; no sound, ever.

## Responsive & Accessibility

Responsive web from large desktop down to the current small-phone class; mobile is in scope for v1. Layout degrades by staging: the panel column narrows, panels stack, generosity compresses before content disappears.

Customer lists and tiles are designed card-first on narrow screens. Staff record tables never card-reflow: they respond by horizontal scroll and column priority — hide lower-priority columns, pin key ones.

Keyboard: full operability, logical tab order, always-visible focus on `ring`. No shortcut layer in v1 — this is an occasional-use product; a staff shortcut layer is a future decision.

Baseline WCAG 2.2 AA: contrast minimums, never colour alone, semantic structure, screen-reader labels on controls and status, targets ≥ 24px (2.5.8), 200 % zoom (1.4.4), and the sticky top bar never obscures the focused element (2.4.11). Deployment is US + Canada commercial; 2.2 AA currently exceeds the bound instruments in both jurisdictions — verify at each engagement.

## Governance

`tokens.css` owns every visual value; this document owns usage and meaning. If they disagree, that is a defect to fix in the tokens, never a licence to improvise. Backticked names are the sanctioned token vocabulary and must resolve in `tokens.css`; a name that does not resolve is a defect. When prose needs a meaning the tokens lack, the tokens are extended first, as a versioned change; prose then references it. Values never enter this document (WCAG-cited floors excepted, as verification criteria).

Changes to the tokens are versioned and owned by the development team. Changes to this document's doctrine are signed off by the design authority. No competing style guide exists.

Open decisions: sequential chart ramp for magnitude encodings (no token backing yet); home and ownership of printable document templates (excluded from this document in v1).

## Do's and Don'ts

Hard don'ts:

1. Never convey status by colour alone — glyph and label, always (§Colors, §Iconography).
2. Never exceed the emphasis budget: one `primary` action per view; amber never tints surfaces, borders, or decoration (§Colors).
3. Never rearrange the shell: top bar, view header, content — same places, every screen (§Application Shell).
4. Never present stale data as current — `stale` or visible freshness, always (§Colors, §Components).
5. Never let a critical alert live in a disappearing toast (§Notifications & Alerts).
6. Never blink, pulse, or loop an attention animation — all motion is one-shot (§Motion).
7. Never set data, tables, or controls in the serif (§Typography).
8. Never mix control silhouettes within a class — pills for actions and chips, near-square for the rest (§Shapes).
9. Never card-reflow a staff record table (§Responsive & Accessibility).
10. Never give a resting panel a shadow — tint and hairline only; shadow belongs to transient layers (§Elevation & Depth).
11. Never trade below AA contrast or shrink targets for density or energy (§Layout & Density, §Responsive & Accessibility).

Do's:

1. Stage generously — space is the product's confidence; content breathes (§Layout & Density).
2. Spend energy on transitions: staggered entrances, context-preserving moves, one beat of ceremony on confirmed-good (§Motion, §Colors).
3. Set every columned number in mono with tabular figures, right-aligned (§Typography).
4. Same interaction, same component, everywhere (§Components).
5. Ship every component with its full state set — loading, the three empties, error, and the operational ladder (§Components).

When in doubt: spend space before colour, and colour only on meaning — the energy lives in staging and motion, never in decoration.
