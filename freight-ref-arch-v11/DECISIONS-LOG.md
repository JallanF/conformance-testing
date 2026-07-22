# DECISIONS-LOG — RA v11 (Base UI + Tailwind + shadcn adoption)

Running log of decisions agreed during the v11 revision. This file is the working
source for cc27 v11, which will be written as one coherent pass when the code
work is complete. Dates are session dates; all decisions were made explicitly by
Scott in discussion — nothing here is assumed.

---

## D1. Stack adoption (2026-07-19)

The RA adopts **Base UI** (`@base-ui/react` 1.6.x), **Tailwind CSS** (4.3.x) and
**shadcn/ui** (current CLI). This is the mainstream default stack as of July 2026:
shadcn made Base UI its default primitive library in July 2026, ships every
component for it, and documents Tailwind v4 + Vite as its standard installation.

## D2. Swappability stance (2026-07-19)

Recorded honestly, per library:

- **Base UI — swappable.** Only the vendor zone (see D3) imports `@base-ui/react`.
  shadcn's own Radix→Base UI rebuild (same component APIs, swapped internals)
  proves the abstraction holds.
- **shadcn — nothing to swap.** Not a runtime dependency; it generates code we own.
- **Tailwind — deliberately not swappable.** Utility classes live in every JSX
  file by design; that is a conscious, documented exception to One Vendor, One
  Layer. The semantic token layer (CSS variables) is the part that stays portable.

## D3. Vendor zone and file naming (2026-07-19)

- shadcn-generated code lives in **`src/components/ui/`** plus **`src/lib/utils.ts`**
  (`cn()` helper), and `src/hooks/` if a registry component requires it — shadcn's
  default aliases, kept deliberately so registry/diff tooling and ecosystem
  familiarity are preserved. Nothing outside this zone imports `@base-ui/react`.
- **Naming rule:** lowercase files + these folders = registry-owned vendor zone;
  PascalCase + `shared/`/`pages/`/`app/` = home-grown. The lowercase shadcn
  convention is a *documented exception* to the RA's PascalCase-for-`.tsx` rule —
  and a feature: provenance is visible in both the file name and the import path.
- Home-grown composed components stay in `shared/technical-components/`
  (PascalCase); home-grown utilities in `shared/utils/`.

## D4. Direct use of ui/ primitives (2026-07-19)

Pages and Business Components import ui/ primitives (`Button`, `Input`, …)
**directly** — idiomatic shadcn; wrapping every primitive would be ceremony.
The RA's own Technical Components remain only where a real pattern is carried
(e.g. ConfirmationModal composing alert-dialog, WizardChrome, PageTabs).

## D5. Theme (2026-07-19)

Stock shadcn default theme (**base-vega** style, Base UI primitives). Branding
later is a pure token override. The old hand-rolled navy stylesheet is retired
as part of the styling rationalisation (D6).

## D6. Styling rationalisation (2026-07-19)

The v10 BEM stylesheet (`index.css`) was always provisional (cc27 v10 said so).
v11 fully adopts Tailwind utility-first styling: shadcn's oklch token block +
`@theme` in `index.css`, utilities in JSX, React components (not CSS classes) as
the reuse mechanism — per official Tailwind guidance. The data-driven
class-selection rule (data chooses the class, never carries the style) survives.

## D7. Dark mode (2026-07-19)

**In scope.** shadcn-standard approach: `.dark` class on `<html>`, small
ThemeProvider in `app/` (Application State — a client-only UI preference,
persisted to localStorage), toggle housed in the new TopNav user dropdown menu.

## D8. DataGrid replacement (2026-07-19)

The hand-rolled `DataGrid` (and the line-items table) are replaced by shadcn's
DataTable pattern: `ui/table` + **TanStack Table** (new dependency). Hand-rolling
existed only because no third-party components had been adopted yet.

## D9. Component mapping for existing surfaces (2026-07-19)

Buttons→`ui/button`; inputs→`ui/input`(+`ui/field` family); selects→`ui/select`
via RHF `Controller`; textarea→`ui/textarea`; ConfirmationModal composes
`ui/alert-dialog` (natively refuses outside-click dismissal — matches the RA
rule); Type B modal composes `ui/dialog` (outside-click dismissal disabled;
mount/reset choreography to be decided when implemented — `keepMounted` vs
reset-on-open); PageMessageBanner composes `ui/alert`; badges→`ui/badge`;
toasts→shadcn `ui/sonner` (Notifications.tsx gateway keeps its role); login
card/sections→`ui/card`; loading/empty→`ui/spinner`/`ui/empty`.
**Kept home-grown, Tailwind-restyled:** TopNav, WizardChrome (no wizard
primitive exists), PageTabs (router owns tab state — NavLink-based; shadcn Tabs
manage their own state and are the wrong tool for routed tabs), PageErrorFallback.

## D10. Gap additions — new RA functionality for full stack coverage (2026-07-19)

The RA is the exemplar: nothing enters production that isn't in the RA first, so
the RA must demonstrate every core control family. Agreed additions:

1. **Checkbox / Switch / Radio group** — e.g. Saturday-delivery checkbox,
   notify-customer switch, priority radio group (exact placement decided when built).
2. **Combobox** (searchable select) — upgrade the customer selector.
3. **DropdownMenu** — TopNav user menu (sign out + dark-mode toggle, per D7).
4. **Tooltip** — e.g. explaining a disabled workflow action.
5. **Accordion/Collapsible with `keepMounted`** — makes cc27 v10's hypothetical
   container-TC case (editing Business Component inside a collapsible) concrete.

## D11. DatePicker — deliberate non-adoption (2026-07-19)

Base UI has no date-picker component. The RA keeps native `type="date"` inputs
and records this as the decision until Base UI ships one.

## D12. Toolchain (2026-07-19) — IMPLEMENTED as Step 1

Stable, mutually-compatible lines; nothing pre-release:

| Package | v10 | v11 |
|---|---|---|
| vite | ^5.4 | ^7.3.6 |
| @vitejs/plugin-react | ^4.3 | ^5.2.0 |
| typescript | ^5.5 | ~5.9.3 |
| react / react-dom | ^19.0 | ^19.2.7 |
| react-router-dom ^6.26 | — | **react-router ^7.18.1** (package + import rename; `useBlocker`, `errorElement`, `NavLink` unchanged) |
| @tanstack/react-query | ^5.56 | ^5.101.2 |
| react-hook-form | ^7.53 | ^7.82.0 |
| sonner | ^2.0.7 | ^2.0.7 (unchanged) |

**Deliberate deferrals** (too fresh at decision time, revisit before production):
Vite 8 (8.1.5), React Router 8 (8.2.0), TypeScript 7 (7.0.2 — the native port;
6.0 still beta). All were released-but-recent; the chosen lines are the mature,
fully-supported ones.

Verified 2026-07-19: clean `tsc` + `vite build`; manual click-through on the
v11 dev server (login, order search, order detail tabs, workflow approve —
Type A modal + cache invalidation, edit-order `useBlocker` guard both branches,
create-order wizard, warehouse details) — zero console errors.
*Session note:* the first click-through accidentally ran against a dev server
serving v10 (the session's browser-preview tool resolves its launch config from
the v10 primary working directory). Detected and redone: v11 now runs on its
own directly-launched server (port 5174), and all of the above was re-verified
genuinely against v11 after Step 2.

## D13. Step 2 — Tailwind + shadcn scaffolding (2026-07-19) — IMPLEMENTED

- `tailwindcss` 4.3.3 + `@tailwindcss/vite` installed; plugin added to
  `vite.config.ts`; `@import "tailwindcss"` at the top of `src/index.css`.
- `npx shadcn init -b base -p vega` → `components.json` with `style: base-vega`,
  standard aliases (`@/components/ui`, `@/lib/utils`, `@/hooks`); created
  `src/lib/utils.ts` (`cn()`); injected oklch tokens (`:root` + `.dark`),
  `@theme inline` bridge, `@custom-variant dark`, and base-layer rules into
  `index.css`; added deps `@base-ui/react` 1.6, `class-variance-authority`,
  `clsx`, `tailwind-merge`, `lucide-react`, `tw-animate-css`,
  `@fontsource-variable/inter`, `shadcn` (runtime preset package).
- Base UI portal setup added per quick-start: `#root { isolation: isolate }`
  (stacking context so portalled popups always render above app content) and
  `body { position: relative }` (iOS Safari 26+ backdrop fix).
- **Coexistence model during migration:** the legacy BEM stylesheet is
  *unlayered*, so it beats Tailwind's *layered* Preflight/base wherever they
  overlap — verified: legacy pages render pixel-identical while shadcn tokens
  and utilities are simultaneously live. Legacy CSS (marked "LEGACY — being
  migrated") dissolves as components are replaced (D6/D9).
- Note: shadcn init merged its oklch tokens into the existing legacy `:root`
  block; legacy tokens (`--color-*`, `--space-*`, …) and shadcn tokens coexist
  with no name collisions and will be separated/removed as migration proceeds.
  (One known artifact: legacy `--font-sans` — the system stack — is unlayered
  and therefore beats the shadcn/Inter font until the legacy tokens retire.)

## D14. Step 3 — Pilot conversion: Login page (2026-07-19) — IMPLEMENTED

First page converted end-to-end; establishes the conversion recipe for all
remaining pages:

1. `shadcn add` the needed primitives → vendor zone (`components/ui/`): this
   step added button, card, input, alert, field (+ label, separator as
   registry dependencies).
2. Page/components rewritten with ui/ primitives + Tailwind utilities; RA
   header comments preserved and updated.
3. The page's now-unused legacy CSS classes deleted from `index.css`
   (`.login-page`, `.login-card*`, `.login-error`, `.btn--full`), leaving a
   MIGRATED marker; classes still used by unmigrated pages stay.
4. Verify: build + browser (render, validation errors, API error, success).

**Form pattern established (⚠ pending Scott's confirmation):** shadcn's Field
family (`Field`/`FieldLabel`/`FieldError`) is the form markup; error styling is
driven by `data-invalid` on Field + `aria-invalid` on the control; and a
NATIVE input still connects to RHF via `register()` — preserving cc27's rule
(Controller for non-native controls only). shadcn's own RHF guide uses
`Controller` for everything, including plain inputs; the RA deviates
deliberately to keep the existing register/Controller dividing line. Confirm
or flip before more form pages are converted.

Also intentional: the legacy required-field asterisk (`form-label--required`)
is dropped on the pilot — stock shadcn has no required marker. Decide whether
to reinstate a marker as a small FieldLabel convention or accept the shadcn
default.

**Confirmed by Scott (2026-07-19):** (a) native inputs keep `register()` —
cc27's Controller dividing line stands; (b) no required-field marker — the
stock shadcn presentation is accepted.

*Session note (dev-only incident):* after `shadcn add`, Vite's dep-optimizer
re-optimized mid-session and briefly served mismatched chunks, producing
"Invalid hook call / two copies of React" errors from Base UI's FieldControl.
Diagnosis: transient optimizer artifact, NOT a real duplicate — `npm ls react`
shows a single deduped react@19.2.7, the production build is clean, and after
a cold-cache dev-server restart all flows run against fresh chunks correctly.
If seen again during development: restart the dev server (optionally delete
`node_modules/.vite`).

## D15. Step 4 — App shell: TopNav, user menu, dark mode (2026-07-19) — IMPLEMENTED

- `shadcn add dropdown-menu badge` → vendor zone.
- **`app/ThemeProvider.tsx`** (new): Application State for the theme preference
  — `light | dark | system`, persisted to localStorage (`freightos-theme`),
  applied as the `.dark` class on `<html>` (the shadcn-standard mechanism).
  Outermost provider in App.tsx (depends on nothing). Accessor hook
  `shared/utility-hooks/useTheme.ts` mirrors useAuth exactly.
- **`app/TopNav.tsx`** rewritten: Tailwind utilities (`border-b bg-background`
  theme-aware shell replaces the fixed navy); NavLink classes chosen via `cn()`
  from `isActive`; user block is now a ui/dropdown-menu — trigger composed with
  Base UI's **`render` prop** (`render={<Button variant="ghost" />}` — the
  Trigger renders AS the Button; this is the Base UI replacement for Radix's
  asChild and the RA's standard composition idiom). Menu holds a Theme radio
  group (bound to useTheme) and Sign out.
- Legacy `.top-nav*` CSS and `.ml-2` deleted.
- **Bug found and fixed during verification:** `DropdownMenuLabel` is Base UI's
  *GroupLabel* — a group part that must sit INSIDE `<DropdownMenuRadioGroup>`
  (or a Group). Placed directly in Content it throws "MenuGroupContext is
  missing" the moment the popup mounts — and because the route error boundary
  catches the crash and resets, the visible symptom is just "menu doesn't
  open", with no console error surviving. Rule for cc27 v11: menu labels live
  inside their group.
- Verified: build clean; menu popup renders with all items; theme radio
  reflects state; selecting Dark applies `.dark` to `<html>`, persists to
  localStorage, and updates the radio; migrated surfaces (login, TopNav) are
  dark-mode responsive. **Environment limitation:** the embedded automation
  browser throttles CSS animations, so Base UI's open/close transition cannot
  complete there (popup waits on `animationend`) — trigger-driven open/close
  needs a one-time human sanity click in a real browser. Base UI's own site
  demos exhibit identical behaviour in the pane, confirming the limitation is
  environmental, not app code. Unmigrated pages remain light-styled until
  their conversion (expected during migration).

## D16. Step 5 — Shared Technical Components (2026-07-19) — IMPLEMENTED

`shadcn add alert-dialog` → vendor zone. Four shared TCs converted; **all
component APIs unchanged, so no page was edited**:

- **ConfirmationModal (Type A)** now composes `ui/alert-dialog`. AlertDialog
  is the semantically-correct primitive for Type A and satisfies the RA's
  modal rules with zero configuration: Escape closes (Base UI raises
  `onOpenChange(false)` → mapped to `onCancel`; the hand-written keydown
  listener is deleted), and backdrop clicks NEVER dismiss (AlertDialog refuses
  outside-press by design — verified). The dialog is controlled: the hook's
  `is…ModalOpen` drives `open`; no Trigger part is used. `isDangerous` maps to
  the destructive Button variant.
- **PageMessageBanner** composes `ui/alert` (+ lucide icons, AlertAction
  dismiss). error → stock destructive variant; success/warning/info are
  utility-class palettes selected from `message.type` (data-driven class
  rule). The three-level message hierarchy is unchanged.
- **PageTabs** — Tailwind restyle; stays home-grown NavLink-based. cc27 v11
  note: shadcn/Base UI Tabs own their active-tab state and are the wrong tool
  for ROUTED tabs, where the router owns the active tab.
- **WizardChrome** — Tailwind restyle + ui/button + lucide Check; stays
  home-grown (no wizard primitive exists). `.wizard-step-panel--hidden` kept
  (pages still use it; stay-mounted rule).
- **PageErrorFallback** — Tailwind restyle; "Return to home" demonstrates
  Base UI render-prop link composition (`render={<a href/>}` on Button).
- Legacy CSS deleted: `.page-tabs*`, `.page-message*`, wizard chrome classes,
  `.error-detail`. Kept until their steps: `.modal*` (Type B modal),
  `.state-container*` (DataGrid + page loading states), `.btn*`, `.section*`.

Verified in browser: tabs render/navigate; Approve opens the alertdialog
(controlled open works in the pane — only *animation completion* is
pane-limited); backdrop click does not dismiss; Cancel and Confirm paths both
work (approve executed, availableActions refreshed); wizard chrome shows
complete/active/upcoming states with hidden panels still mounted; invalid
save shows the destructive banner + field error; PageErrorFallback verified
live (shell stayed alive, only the route replaced) — triggered by a
test-harness artifact (JS removal of animation-stalled dialog nodes upset
React reconciliation), not by app code. Toasts still fire and survive
navigation.

## D17. Consistency rulings (2026-07-19, Scott delegated to best judgment) — IMPLEMENTED

Three gaps found by the consistency audit, each requiring a **cc27 v11 update**:

1. **Import order (cc27 / Naming Convention § Import order):** extended to
   (1) React, (2) external libraries, (3) `@/components`, (4) `@/lib`,
   (5) `@/app`, (6) `@/shared`, (7) page-local relative.
2. **Semantic intent tokens (cc27 / Styling):** the stock shadcn token set has
   no success/warning/info. Added RA tokens `--success` / `--warning` /
   `--info` (oklch; green-600/amber-600/blue-600 values in light, the 400
   equivalents in dark) defined beside the shadcn tokens and exposed through
   `@theme inline` as colour utilities. Components use them with opacity
   modifiers (`bg-success/10`, `border-success/40`, `text-success`) — no
   `dark:` variants needed because the token itself flips. PageMessageBanner
   and WizardChrome converted off raw palette classes. Verified: tokens
   resolve to different values per theme.
3. **Icons (cc27 / new):** lucide-react is the RA's icon library (shadcn's
   default) — replaces text glyphs (✓ ↕ ×) as components are converted.

Also for cc27 v11: the vendor zone is exempt from RA internal conventions
(comment headers, naming) — registry-owned code is kept diff-able/updatable.

## D18. Step 6 — DataGrid on TanStack Table (2026-07-19) — IMPLEMENTED

- `@tanstack/react-table` (8.21.x) installed; `shadcn add table spinner empty`.
- **DataGrid keeps its name, file, and public API** (`GridColumn`, same
  props): Business Components (OrdersGrid, AllocationsGrid) were untouched by
  the engine swap — the RA's wrapper decision proving its worth. Internally
  the grid is now the shadcn DataTable pattern: TanStack Table row models
  (core/sorted/pagination) rendered with ui/table, Spinner/Empty states,
  lucide sort indicators.
- **One Vendor, One Layer: @tanstack/react-table is imported ONLY by
  DataGrid.tsx.** Callers never see a ColumnDef; the GridColumn→ColumnDef
  mapping is private (`sortValue` → `accessorFn`, `render` → `cell`,
  `sortable` → `enableSorting`).
- Hand-rolled sort/pagination logic deleted, including the manual
  reset-to-page-1 effect (TanStack's `autoResetPageIndex` covers it).
- Legacy `.data-grid*` and `.pagination-info` CSS deleted.
- cc27 v11 update: the DataGrid section's "hand-rolled because no third-party
  components" rationale is superseded by this decision.
- Verified in browser: both grids render (orders search; warehouse
  allocations incl. presence-driven cost columns and per-row action buttons);
  header-click sort cycles asc → desc → cleared with correct `aria-sort` and
  restored original order; row-click navigation works; pagination correctly
  hidden below one page.

## D19. Step 7 — Order Search page conversion (2026-07-19) — IMPLEMENTED

First full standard-page conversion. `shadcn add select`.

- **`PageContent`** (new shared TC): the standard page wrapper (centred column,
  max width, padding), replacing the legacy `.page-content` class as pages
  migrate. Created because the markup reached its second use
  (PageErrorFallback) — the graduation rule, and Tailwind's own guidance that
  under utility-first styling the reuse mechanism is a React component, not a
  shared CSS class. cc27 v11: add to the shared/technical-components list.
- **OrderSearchPage**: PageContent + utility header + ui/button. Hook
  untouched — the conversion is chrome only.
- **OrderSearchFilterBar**: card-style utilities + ui/label/input/button and
  **ui/select in plain controlled mode** (`value`/`onValueChange`) — NO RHF
  `Controller`, because filter state is `useState` in the hook per cc27's
  Filter and Search Forms rule. cc27 v11 records the two select wirings:
  Controller inside RHF forms; plain controlled in filter bars. Component
  header comment documents it in place.
- **Base UI Select lesson (cc27-worthy):** `SelectValue` shows the RAW value
  in the closed trigger unless the Root receives the `items` prop
  (value→label mapping). Caught in verification (trigger showed "pending"
  instead of "Pending"); fixed by passing `items={STATUS_OPTIONS}`.
- **OrdersGrid badges**: legacy `.badge--*` classes → `ui/badge` with
  semantic-token classes (`bg-warning/10 text-warning` etc.) selected from
  `OrderStatus` — data-driven class rule on D17 tokens.
- Legacy `.filter-bar*` / `.filter-actions` CSS deleted.
- Verified in browser: filter bar renders; Select opens on click, option
  select updates value, trigger shows the LABEL, Clear resets to
  "All statuses"; Search with status=pending returns exactly the two pending
  orders (filters → appliedFilters → query flow intact); grid + badges render;
  no console errors.

## D20. Step 8 — Order Details feature folder (2026-07-19) — IMPLEMENTED

Layout + all three tab pages converted. **Five graduations** — recurring
display markup extracted to shared components per the graduation rule and
Tailwind's components-not-classes reuse guidance (all for cc27 v11's
shared-component inventory):

- `SectionCard` (TC) — the titled card every page section sits in (composes
  ui/card; optional hint + titleAside). Replaces `.section`/`.section__title`.
- `DetailGrid` (TC) — responsive read-only field grid. Replaces `.detail-grid`.
- `DetailField` (TC) — label/value pair; `valueClassName` lets DATA choose
  emphasis (margin < 20% → `text-warning`, else `text-success` — data-driven
  class rule on D17 tokens). Replaces the `.detail-field` family.
- `StateContainer` (TC) — page/tab-level loading/error/not-found block with
  optional action children. Replaces `.state-container` usage as pages
  convert (grid-internal states remain DataGrid's own).
- `OrderStatusBadge` (shared **Business Component**, display-only) — status →
  label + intent classes. Started page-local in OrderSearchComponents,
  graduated when the Info tab needed identical rendering; OrdersGrid now uses
  it too (local STATUS_CLASS/STATUS_LABEL deleted).

Page conversions: OrderDetailsLayout (PageContent + StateContainer +
ui/button header), OrderInfoPage/OrderInfoComponents (SectionCard/DetailGrid/
DetailField/OrderStatusBadge; margin emphasis via tokens),
OrderLineItemsPage (StateContainer), OrderWorkflowPage (SectionCard with
hint, ui/button — cancel is the destructive variant). Hooks untouched.

Legacy CSS deleted: `.page-actions*`, `.page-header__actions`,
`.section__hint`, `.button-row`, `.value--bold`,
`.detail-field__value--warning/--positive`, `.text-muted`. Still legacy until
their steps: `.section`/`.detail-*`/`.form-*` (business components),
`.page-header`/`.page-title`/`.page-subtitle`/`.state-container`
(warehouse/edit/create/not-found pages), `.badge*` (warehouse), `.modal*`
(Type B), `.line-items-table`, `.textarea--notes`.

Verified in browser: all three tabs render on the new components (Info:
3 SectionCards + legacy AddressSection as expected; badge label correct;
margin 18% renders `text-warning` with the dark-theme token value — theme
persistence + token flip both confirmed); layout header/Back/Edit intact;
line items + workflow render; no console errors.

## D21. Step 9 — Pull-pattern core: shared Business Components + Edit Order (2026-07-19) — IMPLEMENTED

CustomerSection, AddressSection, OrderItemsSection, and EditOrderPage
converted. **The ref contracts (getData/reset/isDirty), all pull-pattern
choreography, and every orchestration hook are byte-for-byte untouched** —
the conversion is presentation-layer only, which is exactly the layering
claim cc27 makes.

- One more graduation: **`FormRow`** (TC) — the responsive form-field row,
  edit-mode counterpart of DetailGrid. Replaces `.form-row`.
- **CustomerSection**: the RHF-form select wiring — `Controller` +
  `ui/select`; `field.onChange` first, then the cross-component
  `onCustomerChange` side effect (rule unchanged). Base UI form wiring per
  its Forms handbook: RHF's `field.ref` → Select `inputRef`, `field.onBlur` →
  Trigger (focus-on-error); `items` for trigger labels. Read-only mode →
  DetailGrid/DetailField.
- **AddressSection**: Field/FieldLabel/FieldError + `register()` inputs
  (D14); the saved-address PICKER is deliberately a plain uncontrolled
  ui/select with NO Controller — it is outside the RHF form (its choice
  populates fields via setValue). cc27 v11: third select wiring noted
  (form-Controller / filter-controlled / picker-uncontrolled).
- **OrderItemsSection**: useFieldArray rows on `ui/table` — same vendor-zone
  table as DataGrid but deliberately NOT DataGrid (a FORM table, not a data
  grid); per-row Controller selects with aria-labels; destructive icon
  Button for row removal.
- **EditOrderPage**: PageContent/StateContainer/Button/utility chrome; page
  actions row as utilities.
- Legacy CSS deleted: `.line-items-table`, `.col-*`, `.table-empty-cell`.
  `.form-*` classes remain until warehouse/create convert.

Verified in browser: edit page renders fully converted (saved-address picker,
5 Field inputs, product select + quantity per row, add/remove buttons);
INVALID save → banner + "Street is required" FieldError with
aria-invalid/data-invalid set (pull → trigger → error presentation across
the new markup); VALID save → navigates to read-only detail with the data
and fires "Order saved successfully." toast that survives navigation
(save → read-only convention intact). No console errors.

## D22. Step 10 — Create Order wizard (2026-07-19) — IMPLEMENTED

- **CarrierStep** converted: two RHF-form selects (carrier — domain-entity
  selector; service level — genuine reference data) on the standard
  Controller + ui/select wiring, in Field wrappers inside SectionCard/FormRow.
  A `serviceLevelLabel()` helper feeds BOTH the `items` mapping and the
  option list, so trigger label and options cannot drift.
- **CreateOrderPage**: PageContent + utility chrome; the step panels'
  hidden-not-unmounted rule now uses Tailwind's `hidden` utility chosen by
  `currentStep` (`stepPanelClass` ternary — data-driven class rule). The last
  wizard-specific legacy CSS (`.wizard-step-panel--hidden`) deleted.
- Orchestration hook untouched, as throughout.

Verified in browser — the COMPLETE create flow on the new stack, ending in
**ORD-2024-006 created**: step-1 Next-empty refused ("Please select a
customer" FieldError + aria-invalid on the Select trigger); customer chosen →
step 2 shows the saved-address picker (dependent loading fired) and picking
"Head Office" populated all four fields via setValue; step-3 line item added
with product select — catalogue price $85.00 and live subtotal $425.00
(watch-driven recompute); step-4 carrier + service level selected; Submit →
multi-step Promise.all pull → POST → new id → navigated to the read-only
detail showing server-derived pricing ($425.00 / $42.50 GST / $467.50).
No console errors.
*Pane note:* closed Base UI popups accumulate in the embedded browser's DOM
(the known exit-animation stall), which briefly confused option targeting
during verification — an automation-environment artifact only.

## D23. Step 11 — Warehouse Details + Type B modal + FULL legacy CSS purge (2026-07-19) — IMPLEMENTED

**Type B modal design point (D9) RESOLVED — no `keepMounted` needed:**
the modal COMPONENT is always mounted (the page renders it unconditionally
with an isOpen prop), so its `useForm` state and its ref survive open/close;
only the dialog POPUP unmounts when closed (Base UI default) — precisely
mirroring the previous implementation's `return null` when closed. The
close-then-reset choreography carries over unchanged. `keepMounted` remains
the tool for whole Business Components inside collapsing CONTAINERS (D10.5).
Also documented: the modal's internal wizard renders steps conditionally —
safe because field VALUES live in the component-level useForm (RHF retains
values for unmounted inputs), unlike page wizards whose steps are separate
ref-holding components and must stay mounted.

- **AddAllocationModal** on `ui/dialog`: controlled open, Escape via
  `onOpenChange(false)` → onCancel (manual keydown listener deleted),
  **`disablePointerDismissal`** enforces the backdrop rule, shadcn corner
  Close routes through the same onOpenChange → cancel path. Fields on
  Field/Input/register; priority + zone selects on Controller + ui/select.
- **PremiumStorageSection** → SectionCard (titleAside Badge) + DetailGrid.
- **AllocationsGrid**: priority badges intent-mapped onto D17 tokens
  (normal→muted, high→warning, critical→destructive — replaces the legacy
  colour mapping, which was semantically arbitrary); Remove → destructive
  Button.
- **WarehouseStatusBadge** (page-local, in the Components bundle): status →
  class from a string-keyed map (the page-owned Warehouse type carries
  status as a plain string). Would graduate if a second page needed it.
- **WarehouseDetailsPage** + **NotFoundPage** (pulled forward from Step 12 —
  trivial): PageContent/StateContainer/SectionCard/Button.
- **ProtectedRoute**: `.app-layout` → `flex min-h-svh flex-col`.
- **FULL LEGACY CSS PURGE (completes D6):** index.css is now 166 lines —
  Tailwind/shadcn imports, dark variant, Base UI portal setup, the token
  blocks (:root + .dark + @theme inline), and the shadcn base layer. ALL
  legacy classes, the legacy reset, and the legacy tokens (`--color-*`,
  `--space-*`, `--text-*`, fonts, shadows) are deleted. Consequence: the
  Inter font and stock shadcn type scale are now active app-wide (the legacy
  `--font-sans` override is gone).

Verified in browser: Inter active; legacy tokens absent; warehouse page fully
converted (status/priority badges on tokens, premium section, grid);
Type B dialog end-to-end — opens; backdrop click does NOT dismiss
(disablePointerDismissal verified); step-1 Next-empty refused ("Category is
required"); filled step 1 → step 2; zone selected; Submit → pull → mutation →
dialog closed, "Allocation added successfully." toast, grid refetched with
the new row. No console errors.

## D24. Step 12 — D10 gap additions (2026-07-19) — IMPLEMENTED

All five gap additions built; the RA now demonstrates every core control
family of the stack. `shadcn add checkbox switch radio-group tooltip
collapsible combobox` (combobox pulled in input-group + textarea).

1. **Checkbox + Switch** (CarrierStep): saturdayDelivery + notifyCustomer —
   client-authored booleans added to `CreateOrderPayload` (the step's one
   contract change; the stub accepts them). Rule recorded: Base UI
   checkbox/switch are non-native controls (checked/onCheckedChange) → they
   connect through **Controller**, same rule as selects. Field horizontal
   orientation; switch shows FieldDescription.
2. **RadioGroup** (allocation modal): priority select → radio group via
   Controller — 3 mutually-exclusive always-visible options; labels WRAP the
   radios (implicit association — Base UI generates its own internal ids).
3. **Combobox** (CustomerSection): the customer selector is now searchable
   (D10.2's production argument: hundreds of customers). Base UI Combobox
   with `{ value, label }` items (label auto-displayed/filtered); the
   controlled value is the selected ITEM, so the Controller maps item ⇄ id —
   RHF still stores only customerId. Type-to-filter verified ("pac" →
   exactly Pacific Rim Trading); the cross-component onCustomerChange event
   still fires → dependent addresses loaded.
4. **CollapsibleSection** (new shared CONTAINER TC) + Edit Order: cc27's
   container case as working code. keepMounted on the panel; VERIFIED the
   money shot — with Line Items COLLAPSED (input hidden but in the DOM),
   Save still pulled the section and succeeded. TooltipProvider added to
   App.tsx (one provider for all tooltips; sits with ThemeProvider).
5. **Tooltip** (FinancialSummarySection margin): info-icon trigger via
   render prop; opens on hover/focus-visible — verified on hover.

Full create flow re-verified end-to-end with the new controls (combobox
customer, checkbox toggled on, switch default on): ORD-2024-006 created with
the typed address. No console errors; build clean.

## D25. cc27 clarifications — doc-only (2026-07-20) — IMPLEMENTED

Refinements surfaced by review questions; all cc27 v11 doc edits, **no code
changed**:

1. **Pages never graduate; sections are the reuse unit.** A page is a
   composition unit (route + data-wiring hook + section ordering). When a
   second feature needs the same content, the page's *sections* graduate to
   `shared/` (out of the bundle, one file each); the page and its hook stay,
   and a tab-page never leaves its multi-page feature folder for reuse.
   Trigger unchanged (second use) — so the three Order Details tab-pages stay
   nested (folder mirrors route tree); nothing moved.
2. **Routing corollary.** First-level nav highlights on the URL, so a
   cross-area link *into* a screen highlights that screen's area (correct).
   Presenting content *as another area's own screen* = a new thin host page
   under that area's URL composing the shared sections — not a reroute.
3. **Query vs mutation is about invocation, not business data.** Mutation =
   imperative, on-demand, side-effectful, uncached, no auto-retry — which is
   why login is a mutation though it edits no entity. Added to *Hook Standard
   Interfaces*.
4. **Wrap test.** Wrap a ui/ primitive in a home-grown component ONLY when a
   domain mapping travels with it (OrderStatusBadge: status→label+classes);
   otherwise import directly (no `OrderButton`). Resolves the D4-vs-graduation
   tension. Added near *Direct use of ui/ primitives*.
5. **`cn()` guidance.** Compose conditional/variant classes with `cn()`
   (dedupes conflicts, drops falsy); load-bearing in the vendor zone where a
   `className` prop must override internal defaults; template literal
   acceptable where neither applies, but `cn()` is the consistent default.
   Added near the data-driven class rule.

## D26. Error-reporting seam — `app/errorLog.ts` (2026-07-20) — IMPLEMENTED

One Vendor, One Layer applied to error reporting. New `app/errorLog.ts`
exports `logError(error, context?)` — the ONLY caller of the reporting
mechanism; `PageErrorFallback` now calls it instead of a bare `console.error`.
A plain **module, not a Context Provider** (logging is a fire-and-forget
service call, not Application State — contrast Auth/Theme). REFERENCE-STAGE:
the `console.error` impl is scaffolding a real reporter (Sentry, …) replaces
behind the same signature, no caller changes; tests mock the one module.
cc27 updated: added to the *One Vendor, One Layer* list, the *Reference-stage
seams* list, and the Frontend Structure tree. Build-verified (one-line,
behaviour-preserving swap); the route boundary itself was already verified
(D16/D23).

## D27. Tailwind hardening (2026-07-20) — IMPLEMENTED

- **`tabular-nums`** applied: `DataGrid` body cells (any numeric/id column
  aligns), Financial Summary values, line-item price/subtotal cells. Verified
  in browser (grid cell → `font-variant-numeric: tabular-nums`).
- **Container queries** demonstrated: `DetailGrid` is now `@container` with
  `@2xl`/`@4xl` column variants. VERIFIED — the SAME grid renders **3 columns
  at 1104px (full-width page)** and **1 column at 502px (Add Allocation
  dialog)**, driven by container width, no viewport breakpoint. The dialog
  gained a small read-only warehouse-context recap (name/type) as the
  deliberately-chosen narrow host (a mild, useful addition, not pure demo).
  Note: existing full-width detail grids now show up to 3 columns (was
  auto-fill's denser count) — an accepted incidental styling change.
- **prettier-plugin-tailwindcss**: RECORDED in cc27 as recommended tooling but
  **not applied** to the RA (avoids a large mechanical reformat; teams get
  sorted classes on first save). Deliberately doc-only.
- **Negative decisions** recorded in cc27 *Styling*: no `@apply`/`@layer
  components` (React components are the reuse mechanism), no safelisting (the
  data-driven class rule makes runtime class construction impossible), no
  `prefix`/`!`. Plus an **adopt-when** list (container queries on a 2nd
  component, `@utility`, typography `prose`, `@source`) with triggers.

Build clean; no console errors. cc27 v11 and this log updated together.

## D28. Responsive scope + PageStatus rename + PageTabs alignment (2026-07-20/21) — IMPLEMENTED

Three small follow-ups from review:

1. **Responsive scope decided: desktop + tablet (floor ~768px), not mobile.**
   Audited the running app at 768px across all layout archetypes (order
   detail, order search list+table, edit-order forms+form-table, warehouse
   +Type B dialog): **zero sideways scroll, zero overflow offenders** — the
   site is already tablet-clean. Reason it holds with no code change:
   FormRow/DetailGrid fill+wrap, filter bar `flex-wrap`s, content is
   max-width-centred, and shadcn's `Table` wraps in `overflow-x-auto` so wide
   grids scroll inside their card. So responsiveness is **intrinsic**, not a
   breakpoint system; `md:` breakpoints get added only where a layout is found
   to break. Recorded in cc27 *Styling* (Responsive scope). **cc26 requires a
   matching change** — its Target System lists "Mobile responsive"; per the
   corpus frozen-body rule (a content change to a cc## is a new version, not
   an in-place edit) that is a new **cc26 v3** — a byte-copy of v2 with the one
   characteristic changed to "Desktop and tablet responsive (mobile out of
   scope)" plus a version note. Scott archives v2; MANIFEST cc26 row updated
   (version-agnostic scope note; archive table untouched per the agreed
   don't-track-per-rev convention). cc27 stays **v11**, edited in place, so its
   number stays paired with the RA (freight-ref-arch-v11) — a cc27 v12 would
   desync from RAv11.
2. **`StateContainer` → `PageStatus`** (done earlier this session): the name
   read as "manages state"; it renders a page/tab loading-error-notfound
   status block. Renamed across code + README; cc27 thinned to describe the
   layout helpers by role, not enumerate them by name (so future helper
   renames touch only code + README, not the discussion doc).
3. **PageTabs alignment fix**: the full-bleed tab bar's labels sat flush-left
   (x=0) while content was centred (x=57) — a regression from the Step-5
   Tailwind conversion (legacy `.page-tabs` had content padding). Fixed:
   full-width border on the outer element, inner tablist matches PageContent's
   max-width+padding. Verified: border spans 0→1265px, first tab box now at
   57px = title left. Deliberate sibling placement (tabs outside PageContent,
   for the full-bleed rule + nav-outside-`<main>` semantics) is unchanged.

All browser-verified; builds clean.
