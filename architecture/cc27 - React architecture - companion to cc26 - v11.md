# Frontend Architecture

## Purpose

This document describes the agreed React frontend architecture for the application described in cc26.

It is a companion document to cc26 and focuses on implementation decisions rather than architectural principles.

**Version note.** This is **v11**. It supersedes v10: it resolves the two questions v10 explicitly left open — the styling approach and the component-library question — by adopting **Base UI** (`@base-ui/react` 1.6) + **Tailwind CSS 4** + **shadcn/ui** (style `base-vega`); see *Styling* and *The UI Stack — Base UI, Tailwind, shadcn*. Alongside the stack adoption: the toolchain moves to Vite 7 / React Router 7 / TypeScript 5.9, dark mode is added, and `DataGrid` is re-engined on TanStack Table behind its unchanged public API. Where v9/v10 and v11 differ, **v11 is authoritative**.

---

## Relationship to cc26

This document assumes the reader has already reviewed cc26.

cc26 defines:

- Architectural principles
- Design preferences
- Constraints
- Ownership philosophy
- Backend/frontend responsibilities

Those principles are not repeated here.

This document describes how those principles are implemented in React.

When architectural principles, constraints or preferences are discussed, cc26 is the authoritative source.

When React implementation decisions are discussed, this document is the authoritative source.

---

## AI Context

This document is intended to be used as context for future AI-assisted design and development sessions.

The decisions contained in this document should be treated as established architectural direction unless a compelling reason exists to revisit them.

Future discussions should focus on implementing, refining and applying these decisions rather than rediscovering them.

---

## React Version

The application targets React 19. The key React 19 change relevant to this architecture is that `forwardRef` is deprecated and no longer needed. In React 19, a `ref` is passed to a component as a plain prop, just like any other prop. `useImperativeHandle` is unchanged and is still the correct way to expose custom methods via a ref — only the wrapper changes.

```tsx
// React 18 — forwardRef wrapper required
const CustomerSection = forwardRef<CustomerSectionHandle, Props>((props, ref) => {
  useImperativeHandle(ref, () => ({ getData, reset, isDirty }))
  return <div>...</div>
})

// React 19 — ref is a plain prop, no wrapper needed
function CustomerSection({ ref, ...props }: Props & { ref?: Ref<CustomerSectionHandle> }) {
  useImperativeHandle(ref, () => ({ getData, reset, isDirty }))
  return <div>...</div>
}
```

---

## Frontend Structure

The frontend is organised by screen (page) and by shared concern, not by technical artefact type. Each page folder co-locates everything that screen owns — its Page, orchestration hook, page-specific components, data hooks and types — instead of scattering them across top-level `components/`, `hooks/` and `types/` folders.

```text
src/
├── main.tsx                     // App entry point — mounts <App/> into the DOM
├── index.css                    // Tailwind import + Base UI portal setup + design tokens (~160 lines) (cc27 / Styling)
├── vite-env.d.ts                // Vite type shims
│
├── components/ui/               // VENDOR ZONE — shadcn-generated components, lowercase, registry-owned;
│                                //   the ONLY importers of @base-ui/react (cc27 / The UI Stack)
├── lib/
│   └── utils.ts                 // cn() — clsx + tailwind-merge class helper (vendor zone)
│
├── app/                         // Application-wide infrastructure (cross-cutting, single instance)
│   ├── App.tsx                  // Root component — composes providers + Router + <NotificationsPortal/>
│   ├── Router.tsx               // The one place all routes are defined; errorElement per route (cc27 / Error Handling)
│   ├── ProtectedRoute.tsx       // Auth gate — renders TopNav + <Outlet/> for authenticated routes
│   ├── AuthProvider.tsx         // AuthContext (Application State) — current user / session; clears the query cache on login/logout
│   ├── ThemeProvider.tsx        // ThemeContext (Application State) — light/dark preference; .dark on <html> (cc27 / Styling)
│   ├── QueryProvider.tsx        // TanStack Query client configuration
│   ├── apiFetch.ts              // The ONLY place that calls fetch(); throws ApiError (cc27 / Backend Interaction)
│   ├── tokenStore.ts            // Holds the auth token so apiFetch() can read it (cc27 / Backend Interaction)
│   ├── sessionExpiry.ts         // Bridge: apiFetch signals a 401 → AuthProvider ends the session (cc27 / Backend Interaction)
│   ├── Notifications.tsx        // Toast gateway — the ONLY importer of the toast library (cc27 / State Management)
│   └── TopNav.tsx               // Level-1 navigation between feature areas + user menu (theme toggle, sign out)
│
├── pages/                       // One folder per screen; each co-locates everything that screen owns
│   │
│   ├── order-search/            // —— a flat page, fully expanded as the reference example ——
│   │   ├── OrderSearchPage.tsx        // Page: JSX + layout only, no logic (cc27 / Screen Composition)
│   │   ├── useOrderSearchPage.ts      // Orchestration hook: ALL logic lives here (cc27 / Screen Composition)
│   │   ├── OrderSearchComponents.tsx  // ALL page-local components (filter bar + orders grid) — bundled
│   │   ├── orderSearchDataHooks.ts    // Single-page data hooks (multi-page → shared/data/) (cc27 / Backend Interaction)
│   │   └── orderSearchTypes.ts        // Page-owned types/contracts (cc27 / DTO and Type Guidance)
│   │
│   ├── order-details/           // —— a nested-route page: a layout + one folder per tab ——
│   │   ├── OrderDetailsLayout.tsx    // Layout shell rendered around the tabs
│   │   ├── useOrderDetailsLayout.ts  // Layout orchestration hook
│   │   ├── orderDetailTabPaths.ts    // Tab route slugs — single source of truth (cc27 / Backend Interaction)
│   │   ├── info/                     // each tab = a nested route: its own Page + use…Page hook
│   │   ├── line-items/               //   (+ page-specific components / data hooks / types as needed)
│   │   └── workflow/
│   │
│   ├── create-order/            // full-page create flow (wizard; CreateOrderComponents.tsx) (cc27 / Screen Composition)
│   ├── edit-order/              // full-page edit flow (unsaved-changes guard, cc27 / Save and Workflow Architecture)
│   ├── warehouse-details/       // detail page (Type A / Type B modals, WarehouseDetailsComponents.tsx)
│   ├── login/                   // login page (standalone form — no ref contract, cc27 / Screen Composition)
│   └── not-found/               // the '*' catch-all page (unmatched URLs, inside the shell)
│
├── shared/                      // Only what is used by MORE THAN ONE page (the "graduation" rule)
│   ├── business-components/     // Business Components reused across pages (e.g. AddressSection, OrderStatusBadge)
│   │                            //   page-specific ones stay in their page folder
│   ├── technical-components/    // pure presentational: props in, events out
│   │                            //   (ConfirmationModal, DataGrid — TanStack Table engine, PageMessageBanner, PageTabs,
│   │                            //    WizardChrome, PageErrorFallback, PageContent, SectionCard, DetailGrid, DetailField,
│   │                            //    StateContainer, FormRow, CollapsibleSection)
│   ├── contracts/               // server-mirrored DTOs — the FE half of the FE/BE contract (cc27 / DTO and Type Guidance)
│   ├── types/                   // client-only types that never cross the wire (cc27 / DTO and Type Guidance)
│   ├── data/                    // transactional data hooks used by >1 page (cc27 / Backend Interaction)
│   ├── reference-data/          // hooks/types for domain-neutral lookups (…ReferenceDataQuery) (cc27 / DTO and Type Guidance)
│   ├── utility-hooks/           // genuinely reusable hooks only (e.g. useAuth, useTheme)
│   └── utils/                   // pure, framework-free helpers with no page ownership
│
└── stubs/                       // REFERENCE-STAGE stub backend (cc27 / Backend Interaction) — replaced by the real API
    ├── stubsApi.ts              // the stub endpoints (1:1 with the real API)
    └── apiFetchStubs.ts         // stub transport apiFetch() routes to behind USE_STUBS
```

`shared/` holds only what more than one page needs. A component, hook or type starts in its page folder and **graduates** to `shared/` when a second page requires it. Shared components are separated by kind: **Technical Components** (pure, presentational) in `shared/technical-components/`, and **Business Components** (which own form state and validation) in `shared/business-components/` — a Business Component belongs there only when genuinely reused across more than one page, e.g. `AddressSection`, used by both order and warehouse pages.

### Page folder anatomy

Every page folder has a **fixed anatomy**, so a developer opening any page folder finds the same files playing the same roles:

- `[Name]Page.tsx` — the Page: JSX and layout only.
- `use[Name]Page.ts` — the orchestration hook: all logic.
- `[Name]Components.tsx` — *(where needed)* **all** of the page's page-local components, bundled in this one file.
- `[name]DataHooks.ts` — *(where needed)* the page's single-page data hooks.
- `[name]Types.ts` — *(where needed)* the page's page-owned types.

**The bundling rule: all of a page's page-local components live in one `[Name]Components.tsx` file** — whether the page has one such component or several. The bundle is by *ownership*, not by kind: a page-local Technical Component (a filter bar) sits beside a page-local Business Component (a grid) in the same file. Each component in the bundle keeps its own header comment. When a component graduates to `shared/` it moves out of the bundle into its **own** file — shared components get one file each, because there will be many of them.

Component hierarchy:

```text
Page                          (JSX and layout only — no logic)
    use[PageName]Page()       (Page orchestration hook — all logic lives here)
        Business Component    (owns its own form state and validation)
            Technical Component  (pure — props in, events out)
```

(A *container* Technical Component — an accordion, a tab set, a modal shell — may sit *above* Business Components rather than below them. This arises in the current code: `CollapsibleSection` wraps an editing Business Component on the edit-order page — see *The UI Stack — Base UI, Tailwind, shadcn*.)

Prefer a single authoritative shared definition whenever a concept is clearly shared across the application.

Use local ownership when reuse or ownership is uncertain.

### Naming Convention

Names carry a suffix that signals their kind, so a name alone tells you what something is:

| Suffix | Meaning | Example |
|---|---|---|
| `use…Page` | Page orchestration hook | `useEditOrderPage` |
| `…Query` | Data read hook | `useOrderQuery` |
| `…Mutation` | Data write hook | `useApproveOrderMutation` |
| `…ReferenceDataQuery` | Genuine reference-data read (domain-neutral lookup) | `useServiceLevelsReferenceDataQuery` |
| `…Handle` | A component's ref contract | `AddressSectionHandle` |
| `…Props` | A component's props type | `CustomerSectionProps` |
| `…FormValues` | A React Hook Form value shape | `AddressFormValues` |
| `…Payload` | An API request body | `SaveOrderPayload` |
| `…Components.tsx` | A page's bundle of page-local components | `OrderSearchComponents.tsx` |
| `…Section` / `…Grid` / `…Modal` / `…Step` | Component roles | `ApprovalSection` |

`…ReferenceDataQuery` is reserved for genuine reference data (domain-neutral lookups like service levels). Reads that fetch a domain entity to fill a selector — customers, carriers, products — are ordinary `…Query` hooks.

**File casing.** A `.tsx` file is named in **PascalCase** (its primary export is a component: `AddressSection.tsx`, `OrderSearchComponents.tsx`); a `.ts` file is named in **camelCase** (hooks, types, plain modules: `useEditOrderPage.ts`, `apiFetch.ts`, `orderContracts.ts`). There are no `index.ts` files — every file is named descriptively. Two exceptions: `main.tsx`, whose name is fixed by convention, and the **vendor zone** — files in `components/ui/` are lowercase (`alert-dialog.tsx`). The vendor-zone exception is deliberate: those files are registry-owned, and keeping shadcn's own conventions means the `shadcn` CLI's diff/update tooling keeps working against them. The casing itself signals provenance — lowercase = registry-owned, PascalCase = home-grown. Vendor-zone files are likewise exempt from the RA's comment-header conventions.

**Import order.** All imports sit at the **top** of the file — never mid-file — in a fixed group order: (1) React, (2) external libraries, (3) `@/components`, (4) `@/lib`, (5) `@/app`, (6) `@/shared`, (7) page-local relative imports. `import type` lines sit within their group, not in a separate block.

### Naming and Readability

Code is written for a reader who is new to it. Two habits follow from cc26's simplicity and consistency principles.

**Boolean names** carry a prefix that reads as a question: `is…`, `has…`, `can…`, `does…`, plus two the architecture uses idiomatically — `show…` (whether a section renders, e.g. `showApprovalSection`) and server-supplied `requires…` (e.g. `requiresApproval`). So the sanctioned set is **is / has / can / does / show / requires**.

**No abbreviations in identifiers.** `formatCurrency`, not `fmt`; `quantity`, not `qty`; `comparison`, not `cmp`. Long descriptive names win whenever there is a choice (`isTheFinancialPanelVisible` over `isFinVisible`).

**Callback and lambda parameters are full words**, even in one-liners — use the singular of the collection: `customers.map(customer => …)`, `event` not `e`, `previousStep` not `prev`. Where the result is assigned to a same-named `const` (`const order = orders.find(order => …)`), the shadowing is accepted — inventing a second name would read worse.

**Generic type parameters are descriptive**, not single letters: `DataGrid<TRow>`, not `DataGrid<T>`.

**Two documented exceptions:**

- **Unit suffixes** are permitted (`timeoutMs`, `spacingPx`) — a unit symbol carries information that prevents unit bugs, like writing "10 km".
- **The `_` discard** is permitted for a deliberately-unused binding (`const { password: _, ...user } = record`).

Other standing conventions: `handle…` for functions inside hooks/pages, `on…` for event props; `SCREAMING_SNAKE_CASE` for module-level constants.

---

## Screen Composition

Pages are the orchestration layer.

Pages own:

- Data retrieval
- Save operations
- Workflow actions
- Cross-component coordination
- Cross-component validation
- Screen composition

Business Components own:

- Editing state
- Validation
- User interaction
- Rendering

### The Page Orchestration Hook

Pages in React can quickly become cluttered — mixing data fetching, event handlers, derived flags, and JSX all in one place. To avoid this, every page has a dedicated orchestration hook named `use[PageName]Page.ts` that owns all the logic. The Page component itself contains only JSX and layout — nothing else.

This rule applies to every page without exception. A simple page will have a thin hook; a complex page will have a rich hook. Consistency matters more than avoiding a thin hook on a simple page.

```tsx
// ❌ Without the pattern — logic and JSX are mixed together in the Page.
//    As the page grows, this becomes hard to read and hard to test.
export function OrderDetailsPage() {
  const { orderId } = useParams()
  const { data: order } = useOrderQuery(orderId)
  const { approveOrder } = useApproveOrderMutation()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const canApprove = order?.availableActions.includes('approve') ?? false
  const handleApprove = () => approveOrder(orderId)
  return <div>...</div>
}

// ✅ With the pattern — the hook owns everything that "does" something.
//    The Page owns everything that "renders" something.

// useOrderDetailsPage.ts — all logic here, none in the Page
export function useOrderDetailsPage() {
  const { orderId } = useParams()
  const { data: order } = useOrderQuery(orderId)
  const { approveOrder } = useApproveOrderMutation()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  // Derived flags are calculated here, not in the Page or in components.
  // Action availability comes from the server (availableActions), never a role.
  const canApprove = order?.availableActions.includes('approve') ?? false
  const handleApprove = () => approveOrder(orderId)

  return { order, canApprove, isConfirmOpen, handleApprove }
}

// OrderDetailsPage.tsx — JSX only. No logic, no state, no conditions.
export function OrderDetailsPage() {
  const { order, canApprove, handleApprove } = useOrderDetailsPage()
  return (
    <div>
      <h1>{order?.orderId}</h1>
      {/* Financials render on PRESENCE — the server sent them or it did not */}
      {order?.financials && <FinancialSection financials={order.financials} />}
      {canApprove && <button onClick={handleApprove}>Approve</button>}
    </div>
  )
}
```

Orchestration hooks return their values in a fixed order, with a comment per group, so every hook reads the same way:

```tsx
return {
  // identity
  orderId,
  // data
  order, customerAddresses, products,
  // status flags
  isLoading, isError, isSaving,
  // derived booleans
  canEdit,
  // handlers
  handleSave, handleCancel,
  // sub-object state (section refs, page message, modal state)
  customerSectionRef, pageMessage, setPageMessage, ...
}
```

**A note on `isPending` vs `isLoading`.** Data hooks return TanStack Query's `isPending` (see *Hook Standard Interfaces*). Page orchestration hooks expose **`isLoading`** to their Page for a read. Keep the two names in their two layers: `isPending` is the library-layer name; `isLoading` (and the descriptive write flags `isSaving`, `isSubmitting`, …) is what the Page sees.

Peer-to-peer component communication is forbidden.

Business Components do not communicate directly with each other. When a change in one component needs to affect another, the component raises an event to the page orchestration hook. The hook makes any necessary decisions and passes updated props to the affected component. Components never know about their siblings.

Preferred:

```text
CustomerSection
    ↓ event

Page
    ↓ decision

ApprovalSection
```

### Modal Types

Two types of modal are used in this architecture, distinguished by whether they contain a form.

**Modal control convention (both types).** Every modal is opened and closed through intent-named primitives on the orchestration hook — `open<Which>Modal(...)` and `close<Which>Modal()` — plus a derived `is<Which>ModalOpen` flag. Modal state is never toggled inline; these primitives are the only writers. Where the open carries data (which action to confirm, which row to remove), that pending value is the single source of truth: it both holds the payload and, via `!== null`, derives `is<Which>ModalOpen`. Where there is no payload, a boolean is the source of truth. The page's JSX interacts only with `handle…` functions — `handleRequest…` (open), `handleConfirm…` (Type A), `handleSubmit…` (Type B), and `handleCancel…` (including trivial cancels that only close) — and those handlers call the `open/close<Which>Modal` primitives, performing the open/close as their final step. The `open/close<Which>Modal` primitives are internal and never wired directly to JSX. No modal abstraction or `useModal`-style hook is used: the control flow stays explicit and readable (cc26).

**Closing a modal.** Both modal types close via their Cancel control **and** via the **Escape key** — with no hand-written keyboard listener: Base UI raises `onOpenChange(false)` on Escape, and each modal maps that to the same `onCancel`. Clicking the dark overlay deliberately does *not* close a modal — an accidental click must never dismiss a confirmation or discard entered data. Type A gets this for free (`AlertDialog` refuses outside-press dismissal by design); Type B enforces it with `disablePointerDismissal`.

**Type A — Confirmation modal.** A simple yes/no prompt before a significant or destructive action. Contains no form and follows no pull pattern. The orchestration hook owns the open/closed state and executes the action on confirmation. `ConfirmationModal` composes **`ui/alert-dialog`** — the semantically correct primitive for Type A, and it satisfies the RA's modal rules with zero configuration: it natively refuses outside-press dismissal, and Escape closes via `onOpenChange(false)` → `onCancel`. The dialog is controlled — the hook's `is…ModalOpen` flag drives `open`; no Trigger part is used — and `isDangerous` maps to the destructive button variant.

```tsx
// Type A: no form, no ref, no getData(). The orchestration hook owns everything.
// pendingAction is the single source of truth: it carries WHICH action is
// pending AND, via `!== null`, derives whether the modal is open.

// In the page orchestration hook:
const [pendingAction, setPendingAction] =
  useState<'approve' | 'cancel' | 'dispatch' | null>(null)

// open/close primitives — the ONLY writers of pendingAction, and internal:
// the Page's JSX calls the handle… functions, never these directly.
const openActionConfirmationModal = (action: 'approve' | 'cancel' | 'dispatch') => setPendingAction(action)
const closeActionConfirmationModal = () => setPendingAction(null)

// Request: open the modal — does NOT execute the action yet.
const handleRequestWorkflowAction = (action: 'approve' | 'cancel' | 'dispatch') =>
  openActionConfirmationModal(action)

// Confirm: execute the pending action, then close.
const handleConfirmWorkflowAction = () => {
  if (!pendingAction) return
  if (pendingAction === 'cancel') cancelOrder(orderId)
  // …approve / dispatch handled the same way (outcome shown via a toast — see Notifications)
  closeActionConfirmationModal()
}

// Cancel: just close.
const handleCancelWorkflowAction = () => closeActionConfirmationModal()

// Derived open flag, returned to the Page:
const isActionConfirmationModalOpen = pendingAction !== null

// In the Page JSX — only the derived flag and handle… functions appear:
<ConfirmationModal
  isOpen={isActionConfirmationModalOpen}
  title="Cancel Order"
  message="Are you sure you want to cancel this order? This action cannot be undone."
  confirmLabel="Cancel Order"
  isDangerous={true}
  onConfirm={handleConfirmWorkflowAction}
  onCancel={handleCancelWorkflowAction}
/>
```

**Type B — Data entry modal.** A modal that contains a form the user must fill in. The form is a Business Component and follows the full pull pattern — it has a ref and exposes getData/reset/isDirty. The orchestration hook calls getData() on the modal's ref when the user submits. The modal composes **`ui/dialog`** — controlled `open`, no Trigger part; **`disablePointerDismissal`** enforces the backdrop rule; Escape and the corner close button both route through `onOpenChange` → cancel, so every dismissal path runs the same cancel handler.

```tsx
// Type B: the modal contains a Business Component with the full pull pattern.
// The orchestration hook holds a ref to it and calls getData() on submit.
// A boolean is the single source of truth here (no payload to carry).

// In the page orchestration hook:
const addModalRef = useRef<AddAllocationModalHandle>(null)
const [isAddAllocationModalOpen, setIsAddAllocationModalOpen] = useState(false)

// open/close primitives — the ONLY writers, and internal (JSX calls handle… only).
const openAddAllocationModal = () => setIsAddAllocationModalOpen(true)
const closeAddAllocationModal = () => setIsAddAllocationModalOpen(false)

// Request: open the modal.
const handleRequestAddAllocation = () => openAddAllocationModal()

// Submit: pull from the modal form, close + reset, then call the mutation.
const handleSubmitNewAllocation = async () => {
  const result = await addModalRef.current?.getData()  // pull from the modal form
  if (!result?.isValid) return              // modal shows its own field errors
  // the isValid check narrows the SectionDataResult — result.data is now present
  closeAddAllocationModal()
  addModalRef.current?.reset()
  addAllocation(result.data)                // call the mutation with the collected data
}

// Cancel: close + reset.
const handleCancelAddAllocation = () => {
  closeAddAllocationModal()
  addModalRef.current?.reset()
}

// In the Page JSX — only isAddAllocationModalOpen and handle… functions appear:
<AddAllocationModal
  ref={addModalRef}
  isOpen={isAddAllocationModalOpen}
  onSubmit={handleSubmitNewAllocation}
  onCancel={handleCancelAddAllocation}
/>
```

**Mounting.** The modal **component** stays mounted — the page renders it unconditionally with the `isOpen` prop — so its `useForm` state and its ref survive open/close. Only the dialog **popup** DOM unmounts when closed (the Base UI default), which mirrors what the earlier hand-rolled implementation's `return null` did. No `keepMounted` is needed for a Type B modal; `keepMounted` is the tool for Business Components inside collapsing **containers** (see *The UI Stack — Base UI, Tailwind, shadcn*). One nuance: a modal's **internal wizard** may render its steps conditionally — unlike a page wizard — because the field values live in the modal's component-level `useForm`, and RHF retains values for unmounted inputs. Page-wizard steps are separate ref-holding components, so they must stay mounted (see *Wizard Pattern*).

### Wizard Pattern

A wizard breaks a complex form into sequential steps. The wizard pattern can appear at any level in the application — as an entire page, inside a Business Component, or inside a Type B modal. In all cases the mechanics are the same: the orchestrating layer owns the current step, each step is a Business Component with a ref, and navigation uses the pull pattern to validate before advancing.

A shared `WizardChrome` Technical Component renders the step indicator and the Back/Next/Submit buttons. It knows nothing about the content of each step.

**All steps stay mounted — inactive steps are hidden, not unmounted.** Each step's form state lives *inside* the step (Business Components own their editing state), and React clears a component's state and ref when it unmounts. If only the active step were mounted, pressing Back would silently discard what the user typed, and Submit could not collect the earlier steps (their refs would be null). So every step renders on every step; the inactive ones are hidden with Tailwind's `hidden` utility chosen from `currentStep` (the data-driven conditional class of *Styling*), never unmounted.

```tsx
// Wizard orchestration — works the same whether in a Page hook,
// a Business Component, or a modal.

const [currentStep, setCurrentStep] = useState(0)

// Each step is a Business Component with a ref.
const customerStepRef = useRef<CustomerSectionHandle>(null)
const addressStepRef  = useRef<AddressSectionHandle>(null)
const carrierStepRef  = useRef<CarrierStepHandle>(null)
const stepRefs = [customerStepRef, addressStepRef, carrierStepRef]

// Next: validate the current step before advancing.
// If invalid, the step shows its own field errors and we stay put.
const handleNext = async () => {
  const result = await stepRefs[currentStep].current?.getData()
  if (!result?.isValid) return
  setCurrentStep(previousStep => previousStep + 1)
}

// Submit: collect data from all steps (all still mounted) and call the mutation.
const handleSubmit = async () => {
  const [customerResult, addressResult, carrierResult] = await Promise.all([
    customerStepRef.current?.getData(),
    addressStepRef.current?.getData(),
    carrierStepRef.current?.getData(),
  ])
  if (!customerResult?.isValid || !addressResult?.isValid || !carrierResult?.isValid) return
  // each isValid check narrows its result — the .data reads below need no "!"
  createOrder({ ...customerResult.data, ...addressResult.data, ...carrierResult.data })
}
```

```tsx
// In the Page JSX: ALL steps render; the inactive ones get Tailwind's `hidden` utility.
// stepPanelClass is the data-driven class rule in miniature: currentStep (data) chooses the class.
const stepPanelClass = (step: number) => (currentStep === step ? '' : 'hidden')

<WizardChrome steps={WIZARD_STEPS} currentStep={currentStep} onBack={handleBack}
              onNext={handleNext} onSubmit={handleSubmit}>
  <div className={stepPanelClass(0)}>
    <CustomerSection ref={customerStepRef} … />
  </div>
  <div className={stepPanelClass(1)}>
    <AddressSection ref={addressStepRef} … />
  </div>
  {/* …one panel per step… */}
</WizardChrome>
```

### Filter and Search Forms

Filter and search forms at the top of a page use plain `useState` in the page orchestration hook — not React Hook Form. This is because filters are not business data being edited and saved; they are simply preferences that control what data is fetched. React Hook Form is used only inside Business Components where the full weight of validation, dirty tracking, and field management is genuinely needed.

The orchestration hook maintains two separate filter states — what the user is currently typing, and what was last submitted — and a `hasSearched` flag that **gates** the query so no request fires until the user actively clicks Search.

```tsx
// In the page orchestration hook:

// 'filters' = what the user is typing in the filter form right now
const [filters, setFilters] = useState(EMPTY_FILTERS)

// 'appliedFilters' = what was last submitted — this is what drives the API call.
const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS)

// 'hasSearched' gates the query: no fetch happens until the user clicks Search.
const [hasSearched, setHasSearched] = useState(false)

// The query re-runs when appliedFilters changes, and only when enabled.
const { data: orders, isPending, isError } = useOrdersQuery(appliedFilters, hasSearched)

// Typing in a filter field — updates only the editing state, no API call yet.
const handleFilterChange = (field, value) => {
  setFilters(previousFilters => ({ ...previousFilters, [field]: value }))
}

// Clicking Search — copies editing state to applied state and enables the query.
const handleSearch = () => {
  setAppliedFilters(filters)
  setHasSearched(true)
}
```

The data hook takes the `enabled` flag as a second argument so the gating is explicit at the call site (see *Hook Standard Interfaces*).

### Pull Pattern Scope

The pull pattern applies at and above the Business Component boundary only. Inside a Business Component, smaller input elements (text fields, dropdowns, date pickers) work the standard React way — their values flow down as props and their changes flow up via events. `useImperativeHandle` is never used inside a Technical Component.

```tsx
// AddressSection.tsx — a Business Component.
// The PAGE pulls data from this component via getData() on its ref.
// But INSIDE this component, each input is standard React (value down, event up).

export function AddressSection({ ref }) {
  const { register, getValues, trigger } = useForm()

  // PULL pattern at the Business Component boundary:
  // the Page calls getData() on this ref when the user saves.
  useImperativeHandle(ref, () => ({
    async getData() {
      const isValid = await trigger()
      return isValid ? { isValid: true, data: getValues() } : { isValid: false, data: null }
    }
  }))

  return (
    // Standard React inside — the field's value/onChange are managed by RHF's register.
    <input {...register('street', { required: 'Street is required' })} />
  )
}
```

**Terminology (standard React).** The two ways this architecture moves data between layers map onto React's own vocabulary:

- The **event model** — value in as a prop, changes out as events (used by every Technical Component and by every input *inside* a Business Component) — is React's **controlled** pattern.
- The **pull pattern** — a Business Component keeps its state and the page reads it on demand via `getData()` — is React's **uncontrolled** pattern (read-via-ref), scaled from a single input to a whole component.

Both are standard React; the pull pattern is simply the RA's *convention* (`getData`/`reset`/`isDirty`) built on the standard ref capability.

### Pull Pattern as Deliberate Escape Hatch

The standard React approach would be to lift all form state up to the Page via events — the Page would hold every field value and pass them back down as props (a fully **controlled** design). This keeps data flowing in one direction.

The pull pattern inverts this for Business Components. Components own their own state and only hand it to the Page when asked (an **uncontrolled**, read-via-ref design). This is a documented React capability, not the conventional default, and is used here deliberately because it aligns with cc26's encapsulation principle — components are fully self-contained, reusable, and testable without the Page needing to know anything about their internals.

Future developers should understand this is intentional. The pull pattern should not be replaced with lifted state.

**Known limitation:** Because Business Components hold their own state, real-time reactivity between components is not automatic. If a user's selection in one component needs to immediately affect another component, the orchestration hook must capture the change via an event and pass new props down to the affected component. This is the expected cost of encapsulation.

### Business Component Ref Contract

Business Components come in two kinds:

- **Editing Business Components** own form state and expose the **ref contract** (`getData`/`reset`/`isDirty`) so the page can read them on demand. (`CustomerSection`, `AddressSection`, `OrderItemsSection`, wizard steps, Type B modal forms.)
- **Display Business Components** carry domain knowledge but hold no editable form state, so they expose **no** ref contract — they take data as props and raise events. (`OrdersGrid`, `OrderInfoSection`, `FinancialSummarySection`, `ApprovalSection`.)

Only editing Business Components implement the ref contract, and only where the page reads them **on demand** — a page-orchestrated save (possibly spanning several sections), a wizard-step validation, an unsaved-changes/`isDirty` guard, or a reset. These methods are called by the page orchestration hook — never by other components.

A standalone form that owns its own submit does **not** expose the ref contract. It delivers its data by raising an `onSubmit` event with the validated values when the user submits — standard React. Login is the reference example: it is a single self-contained form with no multi-section save and no `isDirty` guard, so the page has nothing to read on demand; the form simply hands its values up on submit. The pull pattern (the ref contract) is the deliberate deviation, applied only where on-demand reads are genuinely needed; event delivery is the standard-React default everywhere else. This is a scoping rule, not an exception — login is an instance of the rule, not a break from it.

**`getData()` returns a `SectionDataResult`** — a discriminated union whose two shapes are linked by `isValid`, so once the caller checks `isValid`, TypeScript knows whether `data` is present. This removes the non-null assertions (`!`) that a `{ isValid: boolean; data: T | null }` shape would force at every call site.

```tsx
// shared/types/sectionDataResult.ts
export type SectionDataResult<TData> =
  | { isValid: true;  data: TData }   // validation passed — data is present
  | { isValid: false; data: null }    // validation failed — data is null
```

```tsx
// The three methods every editing Business Component ref must expose:

useImperativeHandle(ref, () => ({

  // getData() validates the form and returns the result.
  // It is async because React Hook Form's trigger() function — which
  // runs all the field validators — is itself async. The orchestration
  // hook awaits this before deciding whether to proceed with the save.
  async getData(): Promise<SectionDataResult<AddressFields>> {
    const isValid = await trigger()   // run validation, wait for result
    if (!isValid) return { isValid: false, data: null }
    return { isValid: true, data: getValues() }
  },

  // reset() restores the form to its original values.
  // Called by the orchestration hook after a successful save,
  // so the component no longer reports unsaved changes.
  reset() {
    resetForm(initialValues)
  },

  // isDirty() returns true if the user has changed any field
  // since the component was last reset.
  // Used by the unsaved changes guard before the user navigates away.
  isDirty() {
    return formState.isDirty
  }

}))
```

When saving a page with multiple sections, the orchestration hook calls `getData()` on all of them at once and waits for all results before proceeding. Because each `isValid` check narrows the `SectionDataResult`, the payload reads need no `!`:

```tsx
// Run validation on all sections at the same time, then check results.
const [customerResult, addressResult, itemsResult] = await Promise.all([
  customerRef.current?.getData(),
  addressRef.current?.getData(),
  orderItemsRef.current?.getData(),
])

// If any section failed validation, it has already shown its own field errors.
// The orchestration hook adds a page-level summary via PageMessageBanner.
if (!customerResult?.isValid || !addressResult?.isValid || !itemsResult?.isValid) {
  setPageMessage({ type: 'error', text: 'Please correct the highlighted errors.' })
  return
}

// All sections valid — the guard above has narrowed each result, so .data is present.
saveOrder({ customer: customerResult.data, address: addressResult.data, ... })
```

The most common use case is page-level Save operations.

See Save and Workflow Architecture.

### Non-Native Controls (Controller)

A native `<input>` (including `type="date"`) connects to React Hook Form with `register`. **Any control that is not a native browser form field connects instead through RHF's `Controller`** — with Base UI that means `Select`, `Combobox`, `Checkbox`, `Switch` and `RadioGroup`, all of which report their value through their own event (`onValueChange` / `onCheckedChange`) rather than a native change event. The register/Controller dividing line is deliberate: shadcn's own RHF guide wraps everything in `Controller`, plain inputs included; the RA deviates and keeps `register()` for native inputs.

`Controller` is controlled, so its value re-renders correctly even when the option list arrives *after* the control first mounts (a real case: an edit form whose product list loads asynchronously). And when a change needs a side effect, the handler calls `field.onChange(value)` **first** — so RHF always hears the change — and then does the side effect.

**A select has three wirings, chosen by where its state lives:**

- **(a) Inside an RHF form** → `Controller` + `ui/select`, `value`/`onValueChange` — `render={({ field }) => <Select value={field.value} onValueChange={value => { field.onChange(value); onCustomerChange?.(value) }} …/>}` (RHF first, side effect second — the rule above).
- **(b) Outside any form** (a filter bar; state held in `useState`, per *Filter and Search Forms*) → plain **controlled** `value`/`onValueChange`, no `Controller` — `<Select value={filters.status} onValueChange={value => onFilterChange('status', value)} …/>`.
- **(c) A picker whose choice populates a form via `setValue`** (the saved-address picker) → plain **uncontrolled** (`defaultValue`), no `Controller` — `<Select defaultValue="" onValueChange={handlePickSavedAddress} …/>`. The picker sits outside the RHF form; its selection writes into the form's fields.

```tsx
// Wiring (a) in full: a select inside a Business Component, through Controller.
<Controller
  name="customerId"
  control={control}
  rules={{ required: 'Please select a customer' }}
  render={({ field }) => (
    <Select
      items={customerItems}          // value → label mapping for the CLOSED trigger
      value={field.value}
      inputRef={field.ref}           // RHF's ref → Base UI's focus-on-error target
      onValueChange={value => {
        field.onChange(value)        // RHF first — always
        onCustomerChange?.(value)    // then the side effect
      }}
    >
      <SelectTrigger onBlur={field.onBlur}>…</SelectTrigger>
      …
    </Select>
  )}
/>
```

Base UI specifics worth knowing:

- **The `items` prop** gives the Root its value→label mapping for the closed trigger. Without it the trigger renders the **raw value** ("pending" instead of "Pending") — a real bug caught in review.
- **Focus-on-error wiring** (per the Base UI Forms handbook): RHF's `field.ref` goes to `inputRef` on the Root, and `field.onBlur` to the Trigger — so a failed `trigger()` focuses the offending control.
- **Combobox** (the searchable customer selector): items are `{ value, label }` objects and the controlled value is the selected **item**, not the id string — the `Controller` maps item ⇄ id, so RHF still stores only `customerId`.

### Form Markup — the Field Family

Form markup is standardised on shadcn's **Field family** — `Field` / `FieldLabel` / `FieldError` (from `ui/field`). Every labelled control sits in a `Field`; error presentation is driven by **`data-invalid` on the `Field`** plus **`aria-invalid` on the control itself**; `FieldError` renders the RHF error message. Native inputs connect with `register()`, non-native controls through `Controller` (see *Non-Native Controls*). There is **no required-field marker** — the stock shadcn presentation is accepted. `Checkbox` and `Switch` use the `Field` family's **horizontal orientation** (control beside label rather than above it).

```tsx
// The standard Field markup around a native input (register; Controller for non-native).
<Field data-invalid={!!errors.street}>
  <FieldLabel htmlFor="street">Street</FieldLabel>
  <Input id="street" aria-invalid={!!errors.street}
         {...register('street', { required: 'Street is required' })} />
  <FieldError errors={[errors.street]} />   {/* renders nothing when no error */}
</Field>
```

### Read-only Rendering Mode

A Business Component that displays a domain concept in both editable and read-only contexts supports both via a `canEdit` prop rather than having a separate display component. When `canEdit` is false, the component renders a read-only view of its initial values.

Two consequences:

- **Selector-list props are optional.** Props that exist only to populate edit-mode controls (`customers`, `products`, `addresses`) are optional. Read-only callers omit them — and do not fetch lists they never show.
- **Read-only usage may omit the ref.** The ref contract exists for on-demand reads (save / dirty-guard / reset). A purely read-only usage has nothing to read, so no ref is passed — e.g. the order Line Items tab reuses `OrderItemsSection` with `canEdit={false}` and no ref.

Where a read-only section sits on a page that pulls all sections uniformly on save (see Edit Order), it may still be pulled via its ref; it simply returns its unchanged initial values.

---

## Backend Interaction

Ownership hierarchy:

```text
Page
    Hook
        TanStack Query
            apiFetch() -> Backend
```

Hooks form the frontend/backend boundary.

Examples:

```text
OrderDetailsPage -> useOrderQuery()

OrderDetailsPage -> useSaveOrderMutation()

OrderDetailsPage -> useApproveOrderMutation()
```

TanStack Query is considered an implementation detail of the Hook layer.

Pages know Hooks.

Hooks know TanStack Query.

Pages do not know TanStack Query.

`apiFetch.ts` lives in `app/` and is the only place in the frontend that calls `fetch()`. All hooks go through it. It converts every transport failure into the application's own `ApiError` (see *The `ApiError` contract*).

`tokenStore.ts` also lives in `app/`. It holds the authentication token in a module-level variable and exposes three functions: `setToken()`, `clearToken()`, and the async `getAccessToken()`. `AuthProvider` writes the token on login/logout; `apiFetch()` reads it through `getAccessToken()` on every request. This bridge is needed because `apiFetch()` is a plain function — it cannot access React context the way a hook can.

apiFetch() handles:

- Authentication
- Authorisation headers
- Common request headers (Content-Type is sent only when there is a body)
- Common HTTP configuration
- Converting HTTP/transport failures into `ApiError`

No dedicated API layer is used initially.

Responsibilities commonly assigned to an API layer are handled elsewhere:

```text
Authentication:
    handled by apiFetch()

Caching:
    handled by TanStack Query

DTO transformation:
    handled by Hooks

Error handling:
    handled by Hooks and Pages
```

Execution flow:

```text
OrderDetailsPage -> useOrderQuery() -> TanStack Query -> apiFetch() -> Backend
```

### Passing Data Between Pages

When navigating from one page to another (e.g. from an order list to an order detail), the entity ID is passed in the URL. The destination page reads the ID from the URL and fetches the full entity from the server on arrival. Data is never passed through React Router state.

This keeps the frontend server-authoritative — the detail page always shows the latest server data regardless of how the user arrived, including via a bookmark or a browser refresh.

### Centralised Routing

All routes are defined in a single file: `app/Router.tsx`. No feature defines its own routes. If you want to know what pages exist in the application and how to navigate to them, this is the only file you need to read.

A `ProtectedRoute` component in `app/` wraps all authenticated routes. It checks whether the user is logged in and redirects to the login page if not. A `*` catch-all route renders a Not Found page inside the authenticated shell. Every page route declares an `errorElement` (see *Error Handling*).

**Tab route slugs — single source of truth.** Nested-route tabs (e.g. Order Details: Info / Line Items / Workflow) have their URL slug defined exactly once, in a small constants module beside the layout (e.g. `pages/order-details/orderDetailTabPaths.ts` exporting `ORDER_DETAIL_TAB_PATHS`). Both `Router.tsx` (which builds the nested routes) and the tab list consumed by `PageTabs` reference these constants rather than repeating the string literals. This keeps the router as the one place you read to see the routes, while removing the duplication that would otherwise let a tab's route and its link drift apart on a rename. Use one slug per tab across the folder name, the route path, and the tab — e.g. the "Line Items" tab is `line-items` everywhere.

**Tabs fetch independently.** Each nested-route tab is a self-contained page with its own orchestration hook, fetching only what it needs — and tabs need not fetch the *same* thing. A tab may have its own endpoint (e.g. Line Items → `/orders/:id/line-items`) rather than reading off a shared query. Where tabs happen to request the same data (the Info tab and the layout header both read the order), TanStack Query deduplicates the fetch — but deduplication is a bonus when tabs overlap, not a coupling.

### Hook Standard Interfaces

All query hooks and mutation hooks use a consistent interface so that any developer can read any page orchestration hook and immediately understand how data loading and saving works.

```tsx
// Query hook — always returns this shape.
// The page orchestration hook destructures what it needs.
export function useOrderQuery(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => apiFetch(`/orders/${orderId}`),
    enabled: Boolean(orderId),
  })
  // Returns: { data, isPending, isError, error }
}

// A query hook may take an `enabled` flag when the caller controls when it runs
// (e.g. a search page fetches only after the user clicks Search):
export function useOrdersQuery(filters: OrderFilters, enabled: boolean) {
  return useQuery({ queryKey: ['orders', filters], queryFn: () => …, enabled })
}

// Mutation hook — always returns this shape.
// The function is named descriptively so the orchestration hook reads naturally.
export function useApproveOrderMutation() {
  const mutation = useMutation({
    mutationFn: (orderId: string) => apiFetch(`/orders/${orderId}/approve`, { method: 'POST' }),
  })
  return {
    approveOrder: mutation.mutate,   // named, not just 'mutate'
    isPending:    mutation.isPending,
    isError:      mutation.isError,
    error:        mutation.error,
    isSuccess:    mutation.isSuccess,
  }
}

// In the page orchestration hook — consistent interface makes every hook readable.
// The hook re-exposes isPending under the read name isLoading (see The Page Orchestration Hook):
const { data: order, isPending: isLoading, isError } = useOrderQuery(orderId)
const { approveOrder, isPending: isApproving } = useApproveOrderMutation()
```

### Cache Invalidation After Mutations

After a successful mutation (save, approve, cancel, etc.), the relevant TanStack Query cache entries are invalidated. This forces the next read of that data to go back to the server for a fresh copy. This is the practical expression of the server-authoritative principle — after an action, the frontend does not update its own cached state; it discards it and reloads from the backend.

```tsx
// After approving an order, the cached order data is now stale.
// We invalidate it so the next read fetches fresh data from the server.

export function useApproveOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: string) =>
      apiFetch(`/orders/${orderId}/approve`, { method: 'POST' }),

    onSuccess: (_, orderId) => {
      // Discard the cached data for this order — next read goes to the server
      queryClient.invalidateQueries({ queryKey: ['order', orderId] })
      // Also discard the order list — the status shown there is now stale too
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
```

### Write Responses and Refresh

The client refreshes after every write by invalidating the relevant cache and letting the next read refetch (see above) — the standard TanStack Query approach, and non-optimistic. Because the client always refetches, write responses are kept minimal; a returned body would otherwise just be discarded. This fixes the contract per verb:

- **Resource-creating POST** returns only the new id (e.g. `{ orderId }`, `{ allocationId }`) — HTTP `201`. The client needs the id (e.g. to navigate to the new resource) but refetches everything else on arrival. This applies by-kind: every create returns its id, even where a caller does not read it yet.
- **Action POST** (approve / cancel / dispatch) returns nothing — HTTP `204 No Content`.
- **PUT / PATCH** update returns nothing — HTTP `204` — and the client refetches.
- **DELETE** returns nothing — HTTP `204`.
- **Auth login** is the deliberate exception: it returns the session/principal, which the client needs directly.

The alternative — returning the full representation and writing it into the cache without refetching — is a coherent optimisation, but it is not used here: it adds per-mutation cache-writing and depends on the server always returning the complete current representation. Refetch keeps one simple rule with the server as the single source of truth.

*(What the client **sends** in a write body is governed by the write-payload rule — see DTO and Type Guidance: the client sends only data it legitimately authors.)*

### The `ApiError` contract

`apiFetch` never lets a raw HTTP status or a `fetch()` failure escape upward. It throws an **`ApiError`** whose `kind` is a small, application-owned vocabulary mapped from the HTTP status **inside `apiFetch` and nowhere else**. Hooks and pages branch on `kind` and stay transport-agnostic; `status` is carried only for logging.

```ts
export type ApiErrorKind =
  | 'unauthenticated'   // 401 — session missing or expired
  | 'forbidden'         // 403 — authenticated, but not permitted
  | 'notFound'          // 404
  | 'validation'        // 400 / 409 / 422 — request rejected as invalid
  | 'server'            // 5xx and anything unexpected
  | 'network'           // fetch() itself failed — server unreachable

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number   // 0 when there was no HTTP response
  // …
}
```

The one place that interprets an HTTP status code is a small `statusToKind` function inside `apiFetch.ts`. (In stub mode, stub failures are plain `Error`s representing business failures like "Order not found"; nothing above the transport branches on `ApiError` until the real backend is in use, so the difference is invisible during reference stage.)

### Auth Boundary and Reference-stage Seams

**Auth boundary.** `apiFetch` is the only place that attaches credentials to a request, and `AuthProvider` is the only owner of the session; no other code reads the token. `apiFetch` reads the credential through the async `getAccessToken()` in `tokenStore.ts` rather than a synchronous global. This is the seam where token refresh will live under real auth, and because `apiFetch` already awaits it, adopting refresh changes no callers. The accessor is scheme-agnostic: it suits a native user store, an external IdP, OIDC, or httpOnly cookies (where it returns null and the browser attaches the cookie).

**Session-state clearing (security).** `QueryProvider` wraps `AuthProvider`, so `AuthProvider` can call `queryClient.clear()`. It clears the TanStack Query cache on **both** logout and login — cached server responses can include role-restricted fields, so one user's cached data must never survive into another user's session on the same browser tab. Clearing on login is belt-and-braces: every authenticated session starts with an empty cache, however it began.

**Session expiry.** `sessionExpiry.ts` is a one-way bridge in the opposite direction to `tokenStore`: `AuthProvider` registers a handler at mount, and when `apiFetch` sees a `401` (`kind: 'unauthenticated'`) it calls `notifySessionExpired()`. The handler ends the session exactly like a logout and shows a toast. No redirect code is needed — ending the session sets the AuthContext user to null, and `ProtectedRoute` already redirects to `/login` when the user is null. This seam is dormant under stubs (they never return 401), and under a real IdP it may instead refresh-and-retry before giving up — with no caller changing either way.

**Deliberately not built** (decided when the real IdP is chosen): token refresh internals, a 401 refresh-and-retry interceptor, session persistence/rehydration across refreshes, the redirect-based login flow (e.g. OIDC Authorization Code + PKCE), and post-login **return-to-URL** (resuming the originally requested page after signing in). The login flow is the part most likely to change; the credential POST to `/auth/login` is reference-stage.

**Reference-stage seams — replace for production.** Because this reference app is fed to code generation, the following are marked in code with `REFERENCE-STAGE` as scaffolding a production build replaces — they are NOT patterns to copy verbatim:

1. **In-memory token** (`tokenStore.ts`) — the token is a module variable, lost on refresh/new tab. Production rehydrates the session.
2. **Static stub import** (`apiFetch.ts` imports `apiFetchStubs`) — kept so the app runs out of the box behind the `USE_STUBS` flag. Set `VITE_USE_STUBS=false` for production; the dead branch is then tree-shaken.
3. **Credential-POST login** (`loginDataHooks.ts` -> `/auth/login`) — replaced by the real IdP flow.

### Stub Centralisation

The stub backend lives entirely in `stubs/`: `stubsApi.ts` holds the stub endpoint implementations (1:1 with the real API) and `apiFetchStubs.ts` is the stub transport that dispatches a REST path to them. No stub logic appears in hooks or components — the word "stub" appears nowhere above the transport layer.

`apiFetch.ts` contains the single switch, a `USE_STUBS` flag read from the environment. To move to the real backend, set `VITE_USE_STUBS=false` — no other file changes. The stub files stay in the codebase, dormant when the flag is off.

Because the stub stands in for the backend, it also performs **server-side responsibilities**: it derives server-owned fields on writes (customer name, product names/prices) and suppresses fields the caller may not see (see *Visibility Levels*). This keeps the stub behaving as a real backend would, so the frontend patterns above it are production-identical.

---

## Save and Workflow Architecture

Pages own Save operations and workflow actions.

Components own editing state, validation and user interaction.

Save flow:

```text
EditOrderPage
    -> CustomerSection.getData()
    -> AddressSection.getData()
    -> OrderItemsSection.getData()
    -> Cross-component validation
    -> useSaveOrderMutation()
    -> apiFetch()
    -> Backend
```

Component validation belongs within the Component.

Cross-component validation belongs within the Page.

Workflow flow:

```text
Workflow tab button -> handleRequestWorkflowAction (opens confirmation)

OrderWorkflowPage hook -> useApproveOrderMutation()

useApproveOrderMutation() -> apiFetch() -> Backend
```

The backend remains responsible for workflow rules and workflow execution.

Permissions and available actions are supplied by the backend (see *Visibility Levels*).

### Optimistic Updates

Optimistic updates — where the frontend updates its displayed state before the server has confirmed the action — are explicitly prohibited. The frontend always waits for server confirmation before showing a changed state. The backend is the authoritative source of truth.

### Null Ref Check

Some **editing** Business Components are conditionally rendered — a section that only appears when the server data calls for it. When such a component is not rendered, its ref is `null`. Before calling `getData()` (or `isDirty()`), the orchestration hook checks whether the ref is populated and skips that section if it is not. This is standard React — checking `ref.current` before using it — and needs no special handling.

```tsx
// A conditionally-rendered editing section: when not rendered, its ref is null.
const sectionResult = someSectionRef.current
  ? await someSectionRef.current.getData()   // rendered — pull its data
  : null                                     // not rendered — skip it
```

(The `?.` on every `getData()`/`isDirty()` call is this check in its compact form: a null ref reads as "skip". Where sections are always rendered, the null branch simply never occurs.)

### Unsaved Changes

When a user has edited a Business Component and tries to navigate away without saving, the application intercepts the navigation and asks them to confirm. This uses React Router's `useBlocker` hook in the page orchestration hook, combined with the `isDirty()` method on Business Component refs.

```tsx
// In the page orchestration hook:

// useBlocker intercepts navigation away from this page.
// Return true to block; false to allow.
const blocker = useBlocker(({ currentLocation, nextLocation }) => {
  if (currentLocation.pathname === nextLocation.pathname) return false

  // Check isDirty() on each section.
  // ref.current may be null if a section is not currently rendered — skip those.
  const isAnySectionDirty =
    (customerRef.current?.isDirty() ?? false) ||
    (addressRef.current?.isDirty() ?? false)

  return isAnySectionDirty  // true = intercept navigation; false = allow it
})

// When blocked, show a Type A confirmation modal.
const handleConfirmLeave = () => blocker.proceed?.()
const handleCancelLeave  = () => blocker.reset?.()
```

After a successful save there are no unsaved changes, so the navigation the save triggers must not be intercepted — a small `hasJustSaved` ref set before navigating short-circuits the blocker.

### Immutable Fields on Edit

Some fields are fixed once an entity is created — reassigning an order to a different customer would make it a different order. On an edit page, such a field's section renders read-only (`canEdit={false}`) while the rest of the page stays editable. There is no change event for a field that cannot change; any data that depends on it (e.g. the customer's saved addresses) is loaded directly from the entity's own value:

```tsx
// The customer is fixed after creation. Passing order.customerId straight to
// the query (not snapshotting it into state) means the fetch enables
// reactively once the order loads — no customer-change event to handle.
const { data: customerAddresses = [] } = useCustomerAddressesQuery(order?.customerId ?? null)
```

### Dependent Data Loading

When one selection determines what data another component needs (choosing a customer determines which saved addresses to offer), the orchestrating hook owns the dependency: it captures the selection — via a cross-component event, or at wizard step-advance — into state, and a query keyed on that state fetches the dependent data, which is passed down as a prop. The dependent component never fetches for itself.

```tsx
const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
const { data: customerAddresses = [] } = useCustomerAddressesQuery(selectedCustomerId)
// CustomerSection raises onCustomerChange -> setSelectedCustomerId
// AddressSection receives customerAddresses as a prop
```

---

## State Management

Three categories of state are recognised.

### Server State

Examples:

- Order Details
- Customer Details
- Search Results
- Available Actions

Owned by the backend.

Retrieved through Hooks.

Managed using TanStack Query.

### Component Editing State

Examples:

- Address fields
- Line items
- Allocation details

Owned by the UI element responsible for editing the data.

Components typically use React Hook Form.

### Application State

Examples:

- Current User
- Theme preference
- Application Configuration

Managed using React Context where required.

Redux is not part of the initial architecture.

Zustand is not part of the initial architecture.

**Provider order.** Providers are composed outermost-first as **Theme → Tooltip → Query → Auth → Router**, with the toast portal mounted alongside the Router (see *Notifications*). Theme is outermost because it depends on nothing and everything renders under it; `TooltipProvider` is the one app-wide provider for all tooltips and sits beside it; Query precedes Auth because `AuthProvider` needs the query client to clear the cache on login/logout (see *Auth Boundary*).

### AuthContext (Application State) Scope

`AuthContext` provides the authenticated **user's identity** (name, role, id). It is read only by application infrastructure — `ProtectedRoute` (is there a user?), `TopNav` (name and role badge), and the login hook (store the user) — and never by Business Components.

Crucially, **page orchestration hooks do not read the role to gate visibility.** Permission decisions live on the server; the frontend renders on the **presence** of data and on **`availableActions`** (see *Visibility Levels*), never on `user.role`. So a Business Component that varies by permission receives a plain boolean or the already-suppressed data as a prop — it has no dependency on auth context, which keeps it self-contained and testable.

### ThemeContext (Application State) Scope

`ThemeContext` (`app/ThemeProvider.tsx`) provides the **theme preference** — `light | dark | system` — persisted to localStorage and applied as the `.dark` class on `<html>` (see *Styling*). Its scope mirrors AuthContext exactly: it is read only by application infrastructure — the TopNav user menu's theme radio, via the `useTheme` accessor hook — and never by Business Components. Components are theme-agnostic because their classes use semantic tokens that flip with the theme; no component reads the theme to decide anything.

### Notifications: Toasts and Page Messages

User-facing messages are split across three levels, each with one job:

- **Action outcomes** (success *or* failure of a save / workflow action) → a **toast**. Toasts are fired from orchestration hooks via `showSuccessToast()` / `showErrorToast()` and rendered by a portal mounted **outside** the Router, so a toast fired just before a navigation (e.g. "Order saved successfully." as the Edit page returns to the read-only view) survives the page change.
- **In-page state the user must act on** (e.g. a validation summary when a save is blocked) → a **`PageMessageBanner`**, owned by the page orchestration hook. A banner must persist *next to the form* while the user fixes the problem — which is exactly why it is a banner, not a toast.
- **Single-field problems** → field-level errors inside the Business Component.

The toast library (sonner) is confined to a single file — `app/Notifications.tsx` — which exports `showSuccessToast`, `showErrorToast`, and the `<NotificationsPortal/>` that `App` mounts. Nothing else imports it; swapping the toast library is a change to that one file (see *One Vendor, One Layer*). sonner earned its place: it provides accessible, navigation-surviving toasts that would otherwise be non-trivial to build, and confining it keeps the page layer free of the vendor. This is unchanged under the v11 stack: sonner is also shadcn's own toast choice, so it now sits comfortably alongside the vendor zone — but it remains confined to `app/Notifications.tsx`, which keeps its gateway role.

```tsx
// In a page orchestration hook, on a successful save — the toast survives the navigate():
showSuccessToast('Order saved successfully.')
navigate(`/orders/${orderId}`)
```

**Save → read-only navigation convention.** A full-page **create or edit** flow, on a successful save, navigates to the **read-only detail** of the entity and confirms with a toast — rather than staying in edit mode. This keeps the two form pages consistent (create-order and edit-order both do it) and matches the edit page's own Cancel, which also returns to the read-only view. (Modal and workflow-action flows are different: they act on an already-read-only page, so they just close/toast and refetch in place — no navigation.)

### Visibility Levels

Permission decisions live on the **server**. The frontend never compares the user's role to decide what to show; it renders on the **presence** of the data the server chose to send, and on the **`availableActions`** the server supplies. (`UserRole` therefore survives in the client only as the TopNav display badge.)

Four mechanisms, all presence- or server-driven:

**Data suppression** — the backend omits a field (or a whole object) from its response for users without permission. The frontend receives nothing and renders nothing; no frontend decision is involved. Because the data is never sent, it cannot leak in the browser's dev tools.

**Section visibility** — the orchestration hook derives a boolean from **server data** (e.g. `showApprovalSection = order.requiresApproval === true`) and conditionally renders an entire section.

**Field visibility** — a specific field is shown iff the server **sent** it (e.g. the margin row renders iff `financials.marginPercent` is present). The backend can send financials while suppressing just the margin.

**Action availability** — a control is shown iff the action is in `order.availableActions` (e.g. `canEdit = order.availableActions.includes('edit')`). Editing follows this exactly like every workflow action; role plays no part.

```tsx
// Orchestration hook — NO role comparison anywhere. It reads presence and availableActions.
export function useOrderInfoPage() {
  const { orderId = '' } = useParams()
  const { data: order } = useOrderQuery(orderId)

  // SECTION VISIBILITY — from server data.
  const showApprovalSection = order?.requiresApproval === true

  return { order, showApprovalSection }
}

// In the Page JSX — conditions are presence checks, not role checks.
export function OrderInfoPage() {
  const { order, showApprovalSection } = useOrderInfoPage()
  return (
    <>
      {showApprovalSection && <ApprovalSection />}

      {/* DATA SUPPRESSION → PRESENCE: render financials iff the server sent them. */}
      {order?.financials && <FinancialSummarySection financials={order.financials} />}
    </>
  )
}

// Inside FinancialSummarySection — no role, no boolean permission prop.
// Each field renders on the presence of its own data.
function FinancialSummarySection({ financials }) {
  return (
    <div>
      <p>Total: {financials.total}</p>
      {/* FIELD VISIBILITY → PRESENCE: margin shows iff the server sent marginPercent. */}
      {financials.marginPercent != null && <p>Margin: {financials.marginPercent}%</p>}
    </div>
  )
}
```

The stub backend performs the suppression a real backend would: it strips `financials` for operators and `marginPercent` for admins before returning an order, and strips allocation cost fields for operators. The frontend code above is unchanged whatever the role — it only ever sees, and renders, what the server sent.

---

## DTO and Type Guidance

Types may exist at either the feature level or the shared level.

DTOs exchanged between frontend and backend represent a contract between two systems.

Both sides must understand the contract.

Create shared types when:

- The type is used across multiple features.
- The type represents a common business concept.
- A single authoritative definition is desirable.

Prefer a single authoritative type wherever possible.

Rule of thumb:

```text
Create a new type when the shape is different.

Do not create a new type merely because the data is being used in a different place.
```

Avoid:

```text
Customer
CustomerDto
CustomerResponse
CustomerModel
CustomerViewModel
```

unless the structures are genuinely different.

### Read shapes vs write payloads

A **read** DTO and a **write** payload for the same concept are often *genuinely different shapes*, so they are different types — but defined once and composed, not duplicated. The reference example is the address:

```ts
// The address VALUES the user edits, and what a write payload carries.
export interface AddressFields {
  street: string; city: string; state: string; postcode: string; country: string
}

// A stored address as READ from the backend — the fields plus server-assigned identity.
export interface Address extends AddressFields {
  addressId: string
  label: string
}
```

Reads use `Address`; write payloads (and the `AddressSection` `getData()` result) use `AddressFields`. `Address extends AddressFields`, so the field set is defined exactly once.

### The write-payload rule

This is the application, at the DTO layer, of cc26's Business Logic Ownership: **a write payload carries only what the client legitimately authors** — references (ids), quantities, and values the user genuinely typed. It never sends:

- data the server **derives** (a customer's name from `customerId`, a product's name from `productId`), or
- data the server **must not trust** (a line item's `unitPrice` — the server prices the order from its own catalogue).

```ts
// A create/save order payload sends references + quantities + typed values — nothing derived.
export interface CreateOrderPayload {
  customerId: string                                        // reference — server derives the name
  deliveryAddress: AddressFields                            // values the user typed
  lineItems: Array<{ productId: string; quantity: number }> // reference + quantity; server prices it
  carrierId: string
  serviceLevel: string
  saturdayDelivery: boolean                                 // client-authored option
  notifyCustomer: boolean                                   // client-authored option
}
```

The two booleans (`saturdayDelivery`, `notifyCustomer`) are options the user genuinely sets — client-authored values, squarely inside the rule. The server returns the derived/priced values on the next read (see *Write Responses and Refresh*). Renaming a customer, by contrast, is a **different operation on a different endpoint** — the order write never carries a customer name to change.

### `SectionDataResult`

The result type every editing Business Component's `getData()` returns is the shared discriminated union `SectionDataResult<TData>` (see *Business Component Ref Contract*). It is a client-only type in `shared/types/`.

---

## Architectural Heuristics

### Slightly Clumsy but Completely Obvious

Architectural clarity is preferred over architectural cleverness.

### Prefer Explicit Ownership

Every responsibility should have a clear owner.

### Optimise for Comprehension and Debugging

The architecture should make it easy to answer:

- Where is this data loaded?
- Where is this data saved?
- Who owns this state?
- Who performs this validation?

### Introduce Abstractions Only When Justified

Do not introduce layers or frameworks without a demonstrated need.

### One Vendor, One Layer

Each third-party technology is imported by exactly one layer, and everything above it talks through the RA's own interface. This makes each vendor swappable — a change touches one place — and keeps the page layer free of vendor detail:

- `fetch` → only `app/apiFetch.ts`.
- TanStack Query → only the data hooks.
- TanStack Table → only `shared/technical-components/DataGrid.tsx` — callers see the RA's `GridColumn`, never a `ColumnDef`.
- The toast library → only `app/Notifications.tsx`.
- React Hook Form → only Business Components.
- `@base-ui/react` → only `components/ui/` (the vendor zone — see *The UI Stack*).

One recorded **exception**: Tailwind is deliberately pervasive — utility classes live in every JSX file by design (see *The UI Stack — Base UI, Tailwind, shadcn*). The semantic token layer is the part that stays portable.

### Prefer Single Authoritative Definitions

Shared definitions are preferred when concepts are clearly shared.

Local definitions are appropriate when ownership or reuse is uncertain.

### Backend First

The backend owns:

- Business rules
- Workflow rules
- Permission decisions
- Authoritative business state

### Consistency Over Cleverness

A consistent pattern used everywhere is preferred over multiple specialised patterns.

### High-School Programmer Test

The preferred architecture is one that can be explained quickly to a new developer and applied consistently.

---

## Styling

**Decided: Tailwind CSS 4, utility-first.** v10 left styling open; v11 settles it as part of the UI-stack adoption (see *The UI Stack — Base UI, Tailwind, shadcn*). The hand-rolled stylesheet of earlier versions is retired: `index.css` now contains only the Tailwind import, the Base UI portal setup, and the design tokens — about 160 lines in total. Utility classes are written directly in JSX.

**Under utility-first styling, the reuse mechanism is a React component — not a shared CSS class** (per official Tailwind guidance). When the same markup-plus-utilities reaches a second use, it graduates into a shared Technical Component, exactly like any other code. This is why `PageContent` (the standard page wrapper), `SectionCard` (the titled section card), `DetailGrid` / `DetailField` (read-only field display), `StateContainer` (loading/error/not-found block) and `FormRow` (the responsive form-field row) exist: each is a piece of layout that reached its second use.

**Design tokens.** All theme values are CSS variables in `index.css`: a `:root` block (light), a `.dark` block (dark), and Tailwind v4's `@theme inline` bridge that exposes them as utilities. The token set is the stock shadcn **base-vega** theme — rebranding later is a pure token override, with no component changes.

**Semantic intent tokens.** The stock shadcn set has no success/warning/info, so the RA adds **`--success` / `--warning` / `--info`** beside the shadcn tokens, exposed through `@theme inline` as colour utilities. Components use them with opacity modifiers — `bg-success/10`, `border-success/40`, `text-success`. No `dark:` variants are needed anywhere these appear, because the token itself flips with the theme.

**The data-driven class rule survives verbatim.** When a component chooses between visual variants from runtime data (a status colour, a hidden wizard panel), it selects a **class name** rather than computing inline styles — the data chooses the class; it never carries the style. `OrderStatusBadge` is the exemplar: a status maps to a label and a set of intent-token classes.

**Icons.** lucide-react (shadcn's default) is the RA's icon library — replacing the text glyphs (✓ ↕ ×) of earlier versions.

**Dark mode.** In scope, and shadcn-standard: a small `ThemeProvider` in `app/` holds the preference (`light | dark | system`) as Application State, persists it to localStorage, and applies the `.dark` class on `<html>`. The toggle lives in the TopNav user menu. The theme preference is the RA's **one piece of persisted client UI state** — a client-only preference, which is why localStorage is appropriate here where it never would be for business data.

---

## Error Handling

Two categories of error are handled differently.

**Expected errors** — API failures, validation errors, business-rule rejections — are handled by hooks and surfaced to the user via a **toast** (an action outcome), a **`PageMessageBanner`** (in-page state to act on), or field-level messages inside Business Components (see *Notifications*). `apiFetch` classifies transport/HTTP failures into an `ApiError` (see *The `ApiError` contract*) so hooks and pages can distinguish, e.g., a validation rejection from a server outage. These are part of normal operation.

**Unexpected errors** — component crashes, null dereferences, and other runtime faults — are caught by **route-level error boundaries**. The application does not hand-write an error-boundary class component: React Router — already this app's router — provides boundaries natively via **`errorElement`**. Every page route declares `errorElement: <PageErrorFallback />`, so if a page throws during render, only that route is replaced by the fallback; the rest of the application keeps working.

- Each **tab** route declares its own `errorElement`, so a crash inside one tab leaves the Order Details header and tab bar alive.
- The **login** route and a **catch-all** (`*`, the Not Found page) are covered too.
- The `ProtectedRoute` layout route has one as well, catching a crash in the shell itself (`TopNav`) or anything a child route did not catch first.

`PageErrorFallback` (in `shared/technical-components/`) is a plain function component that reads the caught error with `useRouteError()`. Because React Router supplies the boundary, **the application contains no class components at all** — the class-component error boundary of earlier versions is gone.

A component crash inside a portalled popup (a menu, a dialog) is also caught by the route boundary — with a deceptive symptom worth knowing; see *The UI Stack — Base UI, Tailwind, shadcn*.

---

## The UI Stack — Base UI, Tailwind, shadcn

**Status: adopted.** v10 recorded this topic as under consideration, framed around Radix. v11 adopts the stack that has since become the mainstream default: shadcn made **Base UI** its default primitive library in July 2026, ships every component for it, and documents Tailwind v4 + Vite as its standard installation. v10's fit analysis held — the adoption changed the presentation layer only; every ref contract, orchestration hook, and pull-pattern choreography survived untouched.

### The three technologies

- **Base UI** (`@base-ui/react` 1.6) — headless, accessible primitives: dialogs, menus, selects, combobox, checkbox, switch, radio group, tooltip, collapsible. Behaviour and accessibility, no styling.
- **Tailwind CSS 4** — utility-first styling, with design tokens in `index.css` (see *Styling*).
- **shadcn/ui** — **not a runtime dependency**: a CLI (4.x) that copies owned component code into the project. Each `shadcn add` generates a styled component (Base UI primitive + Tailwind classes) that the project then owns outright. Style: `base-vega`.

### The vendor zone

shadcn-generated code lives in **`src/components/ui/`** plus **`src/lib/utils.ts`** (the `cn()` class-merge helper), and `src/hooks/` if a registry component requires it. These are shadcn's default aliases, kept deliberately: the `shadcn` CLI's registry/diff/update tooling — and ecosystem familiarity — depend on them. **Nothing outside this zone imports `@base-ui/react`.** Vendor-zone files are lowercase and exempt from RA comment-header conventions (see *Naming Convention*): registry-owned code is kept diff-able and updatable, and the casing signals provenance.

### Direct use of ui/ primitives

Pages and Business Components import ui/ primitives (`Button`, `Input`, `Select`, …) **directly** — idiomatic shadcn; wrapping every primitive in an RA component would be ceremony. The RA's own Technical Components remain only where a real pattern is carried: `ConfirmationModal` composing `ui/alert-dialog`, `WizardChrome` (no wizard primitive exists), `PageTabs` (router-owned tabs — shadcn Tabs manage their own active-tab state and are the wrong tool for routed tabs), `DataGrid`, and the layout components of *Styling*.

### DataGrid — TanStack Table behind the RA's API

The grid engine is now **TanStack Table** rendered with `ui/table` — replacing the hand-rolled sort/pagination logic, which existed only because no third-party components had been adopted yet. The RA's **`GridColumn` public API is unchanged**: callers never see a `ColumnDef` — the `GridColumn` → `ColumnDef` mapping is private to `DataGrid.tsx`, and Business Components that use the grid were untouched by the engine swap. Sorting, pagination, and the reset-to-page-1-on-data-change behaviour now come from the library. The grid remains **client-side-sorted**, as before — the engine swap does not change that architectural position. `@tanstack/react-table` is imported **only** by `DataGrid.tsx` (see *One Vendor, One Layer*).

### Swappability, honestly, per library

- **Base UI — swappable.** Only the vendor zone imports `@base-ui/react`. shadcn's own Radix→Base UI rebuild (same component APIs, swapped internals) proves the abstraction holds.
- **shadcn — nothing to swap.** It is not a runtime dependency; it generates code the project owns.
- **Tailwind — deliberately not swappable.** Utility classes live in every JSX file by design. This is a conscious, documented **exception to One Vendor, One Layer**; the semantic token layer (CSS variables) is the part that stays portable.

### The `render` prop — the composition idiom

Base UI parts compose through a **`render` prop** — the replacement for Radix's `asChild`. The part renders *as* the element you hand it, merging its behaviour and accessibility onto your markup. Two live examples:

```tsx
// TopNav user menu: the Trigger renders AS the ghost Button.
<DropdownMenuTrigger render={<Button variant="ghost" />}>…</DropdownMenuTrigger>

// PageErrorFallback: the Button renders AS a real link.
<Button render={<a href="/orders" />}>Return to home</Button>
```

### Required app setup

Two global rules in `index.css`, per the Base UI quick start: `#root { isolation: isolate }` (a stacking context so portalled popups always render above app content) and `body { position: relative }` (an iOS Safari 26+ backdrop fix).

### The dividing line (kept)

The governing rule is about **kind of state**, not kind of component — unchanged from v10:

- **Editing state** (business data being saved) → lives in a **Business Component** → read via the pull pattern. Any Base UI *input* that captures saved data (Select, Combobox, Checkbox, Switch, RadioGroup) goes **inside a Business Component**, connected to the form through `Controller` (see *Non-Native Controls*), exactly as a native `<input>` does through `register`.
- **UI state** (open, expanded, active tab, hover) → a **Technical Component** or the hook → event model. Base UI *containers and overlays* (Collapsible, Dialog, Menu, Tooltip) live here.

A ui/ component may own UI state — just as `DataGrid` owns its sort/page state — but never editing state. Base UI components have no `getData()`; they only ever use the event model (`value`/`onValueChange`, `open`/`onOpenChange`), so a ui/ primitive is never the thing a page pulls from, and the pull-pattern convention is never involved.

### The container-TC hierarchy — now realised

The usual `Page → Business Component → Technical Component` chain gains a distinction:

```text
Page → (hook) → [container TC]        → Business Component → [leaf/control TC]
                 CollapsibleSection,     (owns editing state)   Select, Combobox,
                 Dialog shell                                   Checkbox, Switch
```

A **container** Technical Component may sit *above* Business Components; a **leaf** Technical Component sits *below*. The invariants hold because container TCs carry no business logic and own only UI state — the same status the RA already grants `DataGrid`. v10 discussed this case hypothetically; it is now working code: **`CollapsibleSection`** (in `shared/technical-components/`) wraps Base UI's Collapsible behind a plain props API, and the edit-order page places the Line Items editing section inside it.

**The rule (kept — now implemented and verified):** an editing Business Component placed inside a collapsible or tabbed container **must stay mounted**. `CollapsibleSection` sets **`keepMounted`** on its panel, so collapsed content is hidden, never unmounted — if it unmounted, the Business Component's ref would become null and the page's save would silently skip its data. Verified in the running app: with Line Items collapsed, Save still pulls the section and succeeds. Read-only content has no such constraint.

### No DatePicker — deliberate non-adoption

Base UI has no date-picker component. The RA keeps native `type="date"` inputs (connected with `register` — they are native form fields) and records this as the decision until Base UI ships one, at which point it should be revisited.

### Popup crashes and the route boundary

A component crash inside a portalled popup (a menu, a dialog) is caught by the route-level error boundary (*Error Handling*), which resets the popup as it replaces the route element. The visible symptom is deceptive: a "dead" trigger — a menu that simply won't open — with no surviving console error. The lesson that found this: Base UI's `DropdownMenuLabel` is a *GroupLabel* — a group part that throws the moment the popup mounts if placed directly in Content. The rule: **menu group labels sit inside their `Group`/`RadioGroup`**, never directly in Content. When a trigger goes dead with a clean console, suspect a popup-mount crash eaten by the boundary.
