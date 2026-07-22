# SFI Crossings — design system publishing playbook

The current working process. Nothing here is historical; if a rule is listed, it
was verified. Extend the Components section as that work lands.

**Staging area:** `DesignSpecs/` (local, authoritative)
**Live design system:** `afeb4eb1-4960-4b12-b7b5-3c2015864745`

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
cat README.preamble.md DESIGN.md > README.md
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

**Generated files — written by the Claude Design web app in the browser, not by
you:** `_ds_manifest.json` (`"source":"spa"`), `_ds_bundle.js`,
`_adherence.oxlintrc.json`. They share one etag; they appear on project open.

`register_assets` returns `registered: N` but writes outside the manifest. It
does not fix an unindexed project. Ignore it.

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

Five, live: `colors`, `typography`, `shape-space-elevation`, `motion`,
`status-glyphs`.

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

## 6. Components — not yet built

*Extend this section as the work lands.*

Two paths, verified:

- **`.dc.html` Design Components** — no build. `<x-dc>` template with
  `{{ dotted.holes }}`, `<sc-for>`/`<sc-if>`, and `class Component extends
  DCLogic`. Runtime comes from `create_support_js` (server-written, once per
  directory). Composed via `<dc-import name="Card">`. Editable in the Claude
  Design editor.
- **`_ds_bundle.js`** — an external npm build, uploaded whole. The `.jsx` files
  in the project are re-export shims. You own that toolchain.

Consumer sessions receive auto-generated binding boilerplate:

```html
<link rel="stylesheet" href="_ds/<folder>/fonts.css">
<link rel="stylesheet" href="_ds/<folder>/tokens.css">
<script src="_ds/<folder>/_ds_bundle.js"></script>
```
> `const { Button, Card } = window.SFICrossings_<hash>;`

**Sequence before writing any component:** build one real template first (the
shipments list). Consumer sessions are told design-system templates *outrank*
their own scaffolding, so a component encodes decisions rather than illustrating
them — extract from what a template proved, don't invent ahead of it.

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
