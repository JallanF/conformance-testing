# SFI Crossings — build conventions

**The full design authority ships with this project as
`guidelines/docs/guides/design-authority.md`. Read it before designing anything — it
governs shell layout, colour, typography, components, and motion. The rules
below are the operating subset you need on every single screen.**

## Setup that must be true on every page

- **Dark is canonical.** Put `class="dark"` on `<html>` (or wrap your whole
  render in the exported `DsDarkRoot` component, which does the same thing at
  a subtree level). Without it everything renders in the light theme. There is
  no `.light` class — light is the absence of `dark`.
- React must be on the page before the bundle. Components live at
  `window.SFICrossings.*`. Compounds are **flat** exports: `Card`,
  `CardHeader`, `CardTitle`, `DialogTrigger`, `SelectItem`, `TabsList`, … —
  compose them exactly as each component's `.prompt.md` shows.
- Mount into your own dedicated node, never the host page's React root.

## Styling idiom — tokens, never utility classes

Style your own layout glue with **CSS custom properties**, via inline styles
or real CSS:

```html
<div style="background: var(--card); border: 1px solid var(--border);
            border-radius: var(--radius-lg); padding: calc(var(--spacing) * 6)">
```

- **Do not write Tailwind-style utility classes** (`bg-primary`, `flex`,
  `gap-4`, …) in your own markup. The shipped stylesheet contains only the
  classes the compiled components use internally — your utilities will
  silently not resolve. The components style themselves; you style layout with
  tokens.
- **Never hard-code a value that has a token.** No hex colours, no ad-hoc
  radii or durations. If a value seems missing, say so — don't invent one.
- The vocabulary (all resolve as `var(--name)`): surfaces `--background`
  `--card` `--popover` `--muted` `--secondary` `--accent` `--border`
  `--border-strong` `--input` `--overlay` (+ `-foreground` pairs); action
  `--primary` `--primary-foreground` `--ring` `--inverse`
  `--inverse-foreground` `--selection-bg`; status `--success` `--info`
  `--warning` `--destructive` `--stale` (each with `-foreground`); charts
  `--chart-1`…`--chart-5`; type `--font-sans` `--font-mono` `--font-serif`,
  sizes `--onyx-font-size-micro/small/regular/large/display/hero`, weights
  `--font-weight-normal/medium/semibold` (nothing above 600 exists); shape
  `--radius-sm/md/lg` `--onyx-radius-pill`, rhythm `--spacing` (steps are
  `calc(var(--spacing) * N)`); motion `--motion-duration-fast/base/slow`,
  `--motion-ease-standard/exit/emphasis`.

## The laws that bind every screen

1. **One `primary` (amber) action per view** — secondary emphasis is the
   `inverse` pill, never a second amber. Amber never tints surfaces, borders,
   or decoration.
2. **Never colour alone.** Every status carries its glyph and label. The
   ratified map (Lucide): success `circle-check`, info `info`, warning
   `triangle-alert` (filled), destructive `octagon-alert` (filled), stale
   `clock-alert`.
3. **Depth is tint, not shadow.** Panels are `--card` behind a hairline
   `--border`; resting panels never carry shadows — shadows belong to
   transient floating layers only.
4. Columned numbers, money, IDs, timestamps: `var(--font-mono)` with
   `font-variant-numeric: tabular-nums`, right-aligned. Money: two decimals,
   one currency, minus sign — never parentheses, never abbreviated.
5. The serif (`--font-serif`) is display-only: heroes, empty states,
   milestones. Never data, tables, or controls.
6. Motion is one-shot — nothing blinks, pulses, or loops. Skeletons for first
   paint, spinners for in-flight actions.
7. Shell: one top bar (flat area links, never menus), a view header with the
   view's one primary action, content as a staged column of panels. Two
   navigation levels maximum.

## Where the truth lives

- `guidelines/docs/guides/design-authority.md` — the complete doctrine. Binding.
- `styles.css` — the stylesheet closure (tokens, fonts, component CSS).
- `components/<group>/<Name>/<Name>.prompt.md` — per-component usage;
  `<Name>.d.ts` — the props contract.

## One idiomatic composition (verified rendering)

```jsx
const { DsDarkRoot, Card, CardHeader, CardTitle, CardDescription,
        CardContent, CardFooter, Button } = window.SFICrossings;

<DsDarkRoot>
  <Card style={{ maxWidth: 420 }}>
    <CardHeader>
      <CardTitle>SFI-2026-0041</CardTitle>
      <CardDescription>Toronto → Detroit · departed 2 h ago</CardDescription>
    </CardHeader>
    <CardContent>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Declared value</span>
        <span style={{ fontFamily: 'var(--font-mono)',
                       fontVariantNumeric: 'tabular-nums' }}>$4,120.00</span>
      </div>
    </CardContent>
    <CardFooter>
      <Button variant="outline" size="sm">View shipment</Button>
    </CardFooter>
  </Card>
</DsDarkRoot>
```

---
