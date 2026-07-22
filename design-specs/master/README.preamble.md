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

This is the design system at its core: the authority document and the values. That
is enough to design against — and it is deliberately all that exists right now.

- `README.md` — this file. The authority.
- `tokens.css` — every visual value; imports the faces.
- `fonts.css` + `fonts/` — the three brand faces, vendored as `.woff2`.

Not built yet: `foundations/` reference cards, the component library, page
templates. Until they exist, **there is no worked example to copy** — you are
composing from tokens directly, and the doctrine below is your only check. Be
correspondingly careful with the §Do's and Don'ts list, and ask rather than invent
when a rule and a layout pull against each other.

---

*Everything below this line is the design authority document, verbatim. It
includes the ratified status glyph map (§Iconography).*

