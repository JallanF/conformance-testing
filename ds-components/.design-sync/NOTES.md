# design-sync notes — sfi-crossings-ds

- Source-only package: no JS build. Converter runs with `--entry ./src/index.ts`
  (esbuild handles TS + the `@/*` alias via cfg.tsconfig). `.d.ts` discovery
  finds nothing (`[DTS] parsed 0`) — **`componentSrcMap` IS the component
  list**: 46 entries, one per vendor family. Subcomponent exports (~272 on the
  global) deliberately do not get their own cards; they remain composable via
  `window.SFICrossings.*`.
- `npm run build` (cfg.buildCmd) only compiles Tailwind: `src/index.css` →
  `dist/index.css` (cfg.cssEntry). Rebuild it whenever vendor classes change.
- Dark canonical: cfg.provider = `DsDarkRoot` (package-owned
  `src/ds-provider.tsx`, exported from the barrel). It applies `class="dark"`
  + canvas background the way the app's `<html class="dark">` does. Without it
  every card renders on light `:root` values.
- `src/` is a wholesale mirror of `sfi-crossings/src` via `npm run pull` —
  never hand-edit mirrored files. Package-owned: `index.ts` barrel,
  `ds-provider.tsx`, config/scripts.

## Known render warns (triaged legitimate)

- `[TOKENS_MISSING] --accordion-panel-height, --drawer-swipe-progress,
  --nested-drawers, --drawer-swipe-strength, --drawer-swipe-movement-y,
  --drawer-swipe-movement-x, --tw` — all runtime-set vars (Base UI
  accordion/drawer set them from JS; `--tw` is a Tailwind internal artifact).
- `[FONT_MISSING] "Inter", "Cascadia Mono", "Source Serif 4"` — these are the
  *fallback* names inside the three font stacks. The primary brand faces
  (Inter Variable, Commit Mono, Instrument Serif) all ship as @font-face with
  vendored woff2 in `fonts/`. Nothing to fix.

## Preview-authoring learnings (folded from waves 1–4, July 2026)

- Hover/focus-only states are skipped, never faked (Input/Textarea focus ring,
  Badge link hover, Switch/Checkbox rings, Tabs/Table row hover).
- `Field` group styling is attribute-driven: `data-disabled="true"` /
  `data-invalid="true"` on `Field` cascade to the label; pair with
  `aria-invalid` on the control for the ring. `FieldError` renders children
  directly. Plain `Label` dimming needs the `peer` control BEFORE it as a DOM
  sibling.
- Vendor `Progress` auto-renders Track/Indicator — pass only
  `ProgressLabel`/`ProgressValue` as children or the bar doubles.
- Spinner-in-button is composition: `<Button disabled><Spinner />Label</Button>`
  (Button's `[&_svg]` rules size it; no loading prop).
- `TableRow` selection is `data-state="selected"` (no prop API).
- Base UI open-state stories: `defaultOpen` on the root suffices.
- Dark-scope portal trap: `DsDarkRoot` scopes `.dark` on a div but Base UI
  portals default to `document.body` (light `:root`). Fix: render the family's
  own Portal part with `container={in-story div ref}`. Tooltip/Popover export
  no Portal part — wrap in a non-modal
  `<Dialog defaultOpen modal={false}><DialogPortal container={scope}>`; all
  Base UI portals share one floating-ui PortalContext. Future option (config
  change — invalidates grades, do only on a deliberate audit): provider sets
  `.dark` on `document.documentElement`, or exposes a package-owned portal
  container.
- `.ds-single`/`.ds-cell` carry `translateZ(0)` making them the containing
  block for `position: fixed` — this traps portaled overlays inside the card
  on purpose; do not "fix".
- `DropdownMenuContent`/`SelectContent` width is `w-(--anchor-width)`; widen
  via inline `style={{ width: N }}` on Content. Select placeholder: include
  `{ value: null, label: '…' }` in `items` + `defaultValue={null}`.
- cmdk static empty state: controlled `value` on `CommandInput` with a query
  using characters absent from every item (digits work). `Command` sits on
  `bg-popover` with no border — give it inline `border: '1px solid
  var(--border)'` + radius on a dark canvas.
- Badge variant sweep shows two amber items (default bg + link text) —
  sanctioned by the Button.tsx exemplar precedent for specimen sheets.
- Spinner/Skeleton animations are vendor-intrinsic; static frames are fine.
- **The capture harness (and the CC browser preview tab) never delivers
  requestAnimationFrame or ResizeObserver callbacks.** Anything that renders
  only after measurement stays invisible. Recharts: wrap the vendor
  `ChartContainer` in an outer `<ResponsiveContainer width={N} height={N}>`
  (numeric dims take recharts' static, observer-free path; the vendor's inner
  RC detects the context and passes through). `ChartLegend` does not render
  on that path — omit it from previews.
- Vendor `DropdownMenuLabel` wraps Base UI `Menu.GroupLabel` — it throws
  unless inside `DropdownMenuGroup` (or `DropdownMenuRadioGroup`, which also
  provides group context).
- Sheet does NOT export its Portal part (`SheetContent` portals internally) —
  use the Dialog-wrapper trap. DropdownMenu/Select content also portal
  internally: same trap, or the open panel renders on light `:root` tokens.
- Base UI Select's open popup aligns the selected item over the trigger and
  extends upward — give the story ~150px top padding in a single-mode card.
- **The preview bundler externalizes only react/react-dom and the DS package**
  — every other node_modules import bundles privately into the preview IIFE.
  Any library needing a shared module singleton (sonner's toast store) must be
  re-exported through the package barrel; that's why `src/index.ts` exports
  `toast` from 'sonner'. Recharts doesn't need this (renders self-contained).
- The capture harness pins `page.clock.setFixedTime` — timers never fire; use
  `duration: Infinity` for toasts and never rely on setTimeout-driven UI.
- Fixed-position bottom/side panels overhang the visible card by ~16–24px
  (the transformed story root's bottom edge sits below the captured viewport)
  — pad the panel's footer (e.g. `paddingBottom: 32` on DrawerFooter).
- embla Carousel lays out synchronously (initial getBoundingClientRect) —
  static frames are trustworthy despite dead rAF/RO; give the root an explicit
  width and each CarouselItem an explicit flexBasis. Nav buttons sit at
  -left-12/-right-12 → pad the outer wrapper ~56px or they clip.
- react-resizable-panels is v4 here: `orientation` (not `direction`), sizes as
  percentage STRINGS ("36%"); bare numbers mean pixels.
- Base UI ToggleGroup: multi-select = `multiple` boolean; `defaultValue` is
  always an array; vendor `spacing={0}` gives the fused segmented look.
- CollapsibleTrigger (like Tooltip/Dialog triggers): compose a DS Button via
  `render={<Button/>}` to avoid button-in-button nesting.
- Badge has NO success variant — "cleared/ok" is outline + circle-check glyph.
- Vendor Input does NOT carry the `peer` class — peer-dimming Label demos need
  Checkbox/RadioGroupItem. Vertical Separator needs explicit height in a
  centered flex row.
- Live-debug recipe: serve `ds-bundle/` statically and open
  `components/general/<Name>/<Name>.html?story=<Export>` — the exact page the
  harness captures (browser-pane viewport differs; use it for DOM truth, the
  capture PNG for geometry truth).

## Re-sync risks

- The mirror can drift from the app: always `npm run pull` + `npm run build`
  + `npm run typecheck` before a re-sync if the app's vendor zone changed.
- `dist/index.css` is generated; a re-sync that skips `npm run build` ships
  stale utilities for any class added to vendor files since.
- Components are React 19 ref-as-prop style; the design host preview runs
  React 18 — sealed floating overlays (DatePicker-style) are a known risk
  inside Design Components (v2 session findings). Not yet observed in this
  package's cards; watch when templates/DCs arrive.
- Adding/changing a `cfg.overrides` entry (esp. `viewport`) after the last
  full `package-build.mjs` makes every scoped `preview-rebuild.mjs` for that
  component exit 1 with `[CONFIG_STALE]` — only a full build re-stamps.
  Apply override batches BEFORE dispatching wave subagents.
- The remote project carries a hand-published base set (foundations/*,
  tokens.css, fonts.css, fonts/LICENSE-*) that this build does NOT produce —
  reconciliation deletes must never touch it; README.md at root IS
  overwritten by the generated one (by design: the authority doc ships via
  guidelines/ from docs/guides/).
