# SFI Crossings — design system publishing playbook

The current working process. Nothing here is historical; if a rule is listed, it
was verified. Extend the Components section as that work lands.

**Staging area:** `design-specs/` (this repo, authoritative)
**Live design system:** none — the temporary test projects were removed
(July 2026); the next publish creates a fresh project and records its id here.
**Evidence archives (read-only, not the live system):**
`29637929-59b0-4b75-a1bb-3793cf6fc5ea` ("…Design System v2") — full component
sync (21 components), `.dc.html` templates, foundations cards, and a
`Session Findings.md` engineering note; `82d57e5a-f97e-4bac-9cf7-047392230499`
("…component sync probe") — a minimal 5-component sync.

---

## 1. What ships

```
README.md                    the design authority (delivered verbatim to consumer sessions)
tokens.css                   every visual value; @import './fonts.css'
fonts.css + fonts/files/     3 brand faces, vendored .woff2
foundations/card.css         shared chrome for the cards
foundations/*.html           reference cards
```

`README.md` is built, never hand-edited:

```bash
cat master/README.preamble.md master/DESIGN.md > README.md
```

`tokens.css` is generated from `theme-onyx-amber.css` (the master). A wrong value
is wrong in the master — fix it there and regenerate.

**Not shipped:** `utilities.css`, `theme-onyx-amber.css`, `probe.html`.

---

## 2. The authoring model

Designers link one stylesheet and style with custom properties.

```html
<link rel="stylesheet" href="./tokens.css" />
<div style="background: var(--card); border-radius: var(--radius-lg); padding: calc(var(--spacing) * 6)">
```

There is **no utility-class vocabulary**. `class="bg-primary"` resolves to
nothing. Components ship their own compiled CSS and use classes internally; that
is not hand-authored.

Dark is canonical: `:root` holds light, `.dark` overrides. Put `class="dark"` on
`<html>`. There is no `.light` class.

---

## 3. Publishing — four calls, no build

Nothing compiles. The bytes on disk are the bytes in the project.

| # | Call | Notes |
|---|---|---|
| 1 | `DesignSync.create_project` | `PROJECT_TYPE_DESIGN_SYSTEM` is fixed at creation |
| 2 | `DesignSync.finalize_plan` | needs `localDir`, `writes`, **and `deletes: []`** or it errors. Globs OK (`fonts/**/*`) |
| 3 | `DesignSync.write_files` | use `{path, localPath}` — bytes never enter context. Max 256/call, one `planId` covers repeats |
| 4 | `DesignSync.list_files` / `get_file` | read back and verify |

**Generated files come from two different writers — do not conflate them:**

- **SPA-written (the Claude Design web app, on project open):**
  `_ds_manifest.json` (`"source":"spa"`) and `_adherence.oxlintrc.json`.
- **Pipeline-written (the `/design-sync` component sync, §6):** `_ds_bundle.js`,
  `_ds_bundle.css`, `_ds_sync.json`, `_preview/*.js`, `_vendor/react*.js`, and
  the per-component `.jsx`/`.d.ts`/`.prompt.md` files. These are synced files;
  never hand-edit them — fix the source repo and re-sync.

`register_assets` is legacy: the pane builds its card index from each preview
HTML's first-line `@dsCard` comment (compiled into `_ds_manifest.json` by the
app's self-check). Only hand-authored projects without `@dsCard` markers need it.

---

## 4. The workflow

1. **Author locally** in `DesignSpecs/`.
2. **Verify by rendering.** `render_preview` → open `serve_url` in a browser →
   screenshot + console. This works without a manifest, so an existing project
   can serve as a preview host for files that will never be indexed in it.
3. **Publish the complete set to a fresh project.**
4. **Open it once.** Then verify the manifest.

### Why a fresh project

The self-check runs **once, at first open**. Files written afterwards are served
and render correctly but are never re-indexed — verified by changing card names
and reloading: the manifest stayed older than the files it indexed.

So: batch changes, publish complete, don't iterate in place.

> **After changing `tokens.css`, confirm the manifest etag moved before trusting
> it.** A stale manifest serves old values to consumer sessions while the shipped
> stylesheet says something else — silent, with no error anywhere.

*Open question:* whether a re-scan control exists in the Design System pane. If
it does, most of this constraint disappears.

### Verify checklist

- `cards` — one entry per card, names correct
- `tokens` — **150** (87 light + 59 dark + 4 radius), all `definedIn: tokens.css`
- `themes` — 1 (`.dark`). Light is `:root`, not a theme
- `brandFonts` — 3 × `status: "ok"`
- no `--tw-*` anywhere

---

## 5. Foundations cards

Five, staged in `foundations/`: `colors`, `typography`, `shape-space-elevation`,
`motion`, `status-glyphs` (plus the shared `card.css` chrome). Recovered from
the v2 archive July 2026 with two doctrine corrections: the colors card's wash
law now mixes with the surface it sits on, and the status-glyphs card defers to
DESIGN.md §Iconography as the map's home (the card renders it, no longer owns
it).

**Rules:**

- **Plain `.html` only.** A `.dc.html` file is indexed as a *template*, never a
  card.
- First line, literal `&` — never `&amp;` (comments aren't parsed for entities,
  so it stores verbatim and renders as `&amp;`):

```html
<!-- @dsCard group="Colors" name="Colour & the status ladder" subtitle="…" width="1200" height="2200" -->
```

- Link `../tokens.css` and `card.css`. **Never import `card.css` from
  `tokens.css`** — only files reachable from `tokens.css` enter `globalCssPaths`
  and get scanned as tokens. Linking keeps the cards out of the index.
- Cards are worked examples; hold them to the doctrine they document.

---

## 6. Components — synced by Anthropic's pipeline, not an ad-hoc build

**React components enter a design system through the `/design-sync` skill plus
the `DesignSync` tool — a matched pair. The skill is user-invocation-only:
Claude cannot launch it; the user types `/design-sync`.** Do not hand-roll a
bundler; the pipeline owns the whole artifact set. (Verified against the v2 and
probe archives, and the v2 `Session Findings.md` note, July 2026.)

What the pipeline does, per sync:

- Takes a **local npm package** (the probe used `design-system-test@1.0.0`) and
  pre-compiles it into `_ds_bundle.js` + `_ds_bundle.css`, assigning finished
  component functions onto a `window.SFICrossings` global.
- Generates, per component, `components/<group>/<Name>/`: a `.jsx` re-export
  shim (`Object.assign(window, { Button: window.SFICrossings.Button })`), a
  `.d.ts`, an `.html` preview card, and a `.prompt.md` consumer doc — plus
  `_preview/<Name>.js` scripts and vendored React in `_vendor/`.
- Tracks per-component source and render hashes in `_ds_sync.json` — sync is
  **incremental, one component at a time, never a wholesale replace**.
- Runs a render-check loop (`.render-check.json`) whose aggregate counts are
  reported through `DesignSync.report_validate`
  (total/bad/thin/variantsIdentical/iterations).

How components run in Claude Design: **there is no build step in the host.**
Pages are plain HTML; React 18 + Babel Standalone run at runtime; the
pre-compiled bundle is loaded as a script and its components called directly.

**`.dc.html` Design Components** remain the second path — no build, `<x-dc>`
template with `{{ dotted.holes }}`, `<sc-for>`/`<sc-if>`, `class Component
extends DCLogic`, runtime from a per-directory `support.js`, composed via
`<dc-import name="Card">`, editable in the Claude Design editor. Reusable
prop-driven chunks (cards, tiles, rows) belong here; full screens leaning on
sealed pickers do not (see below).

### Verified failure modes (v2 session findings, 20 Jul 2026)

- **React 18 preview vs React 19 components.** Components written ref-as-prop
  (no `forwardRef`) silently drop refs under the preview's React 18. Inside a
  DC — where each `x-import` mounts in its own React root — floating overlays
  then measure a 0×0 anchor and snap to the origin. Plain HTML pages are fine.
  - *Sealed* overlays (DatePicker, Combobox, Select — trigger owned internally):
    unrescuable inside a DC. Keep them in plain pages.
  - *Composable* overlays (Popover, Dropdown, Tooltip): rescuable — hand
    `asChild` a native `<button className={buttonVariants({…})}>` trigger.
  - Fix at source: `forwardRef` wrappers in the component repo before syncing.
- **Compiled Tailwind internals** (`--tw-*`, `--ease-in-out`, …) in
  `_ds_bundle.css` / `styles.css` trip the token-check warnings. Synced files
  are read-only — resolve in the source repo, and keep compiled CSS unreachable
  from `tokens.css` so it stays out of the token index.
- **DCs embedded in plain pages via `<iframe>`** render fully, but the iframe
  is a hard boundary: overlays cannot spill out, and embedded docs need `dark`
  promoted onto their root on load.

**Sequence before syncing any component:** build one real template first (the
shipments list — v2 did exactly this in `templates/shipments/`). Consumer
sessions are told design-system templates *outrank* their own scaffolding, so a
component encodes decisions rather than illustrating them — extract from what a
template proved, don't invent ahead of it.

---

## 7. Rules that keep biting

- **Never write `*/` inside a CSS comment.** It terminates the block early, the
  parser reads prose as CSS, and the entire file is silently discarded.
- **Never `@import` a remote URL** in shipped CSS. It stops the scanner parsing
  the file. Vendor the binaries.
- **Never animate `opacity` on an entrance.** Content renders invisible wherever
  the animation clock doesn't run — background tab, card thumbnail, screenshot.
  Animate transform; motion enhances content, never gates it.
- **A status wash mixes with the surface it sits on**, not the canvas.
  `color-mix(… var(--warning) 16%, var(--card))` — mixing with `--background`
  makes it darker than its panel and reads as a hole.
- **Validate; never rationalise a failed check.** A failing integrity check with
  a plausible explanation is still a failing check.
