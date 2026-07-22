# FreightOS — React Reference Architecture

A runnable reference application for the freight/logistics business system.
This codebase demonstrates every architectural pattern in cc26 and cc27
with real, working code. Open in VS Code, run it, and read alongside the docs.

**v11:** the RA adopts **Base UI** (`@base-ui/react`), **Tailwind CSS v4** and
**shadcn/ui** — see cc27 v11 and `DECISIONS-LOG.md` for every decision behind
the adoption.

---

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 and sign in with one of the demo accounts:

| Email | Password | Role |
|---|---|---|
| manager@freightos.com | password | Manager — sees financials, margin, cost fields |
| operator@freightos.com | password | Operator — standard access |
| admin@freightos.com | password | Admin — sees financials, limited workflow |

---

## What This Is

This is a reference architecture — not a production application. Every pattern
decision in cc27 is implemented here in working code with heavy inline comments
that explain what is happening and why. If you need to know how a pattern works,
find the relevant file and read the code and its comments together.

The data is fictional but coherent. The same orders that appear in search appear
in detail view. The warehouse in the allocation wizard matches the warehouse on
the details page. The application behaves as a real system would.

---

## The UI stack (v11)

Three technologies, adopted together (cc27 v11 / The UI Stack):

- **Base UI** (`@base-ui/react`) — headless, accessible primitives (dialogs,
  menus, selects, combobox, checkbox…). Imported ONLY inside the vendor zone.
- **shadcn/ui** — not a runtime dependency: a CLI that copies owned component
  code into `src/components/ui/` (the **vendor zone**). Style `base-vega`.
- **Tailwind CSS v4** — utility-first styling; design tokens in `src/index.css`
  (`:root` + `.dark` + `@theme inline`). Tailwind classes appear in every
  component by design — a documented exception to One Vendor, One Layer.

**The vendor zone:** `src/components/ui/` + `src/lib/utils.ts` (+ `src/hooks/`
if a registry component needs it). Registry-owned code, lowercase file names
(the documented exception to PascalCase), updatable via `shadcn` CLI. Nothing
outside the zone imports `@base-ui/react`. Everything home-grown lives in
`app/`, `pages/`, `shared/` under RA conventions.

---

## Folder Structure (page-first)

The codebase is organised **by page**. Each page owns a folder with a fixed anatomy:
`[Name]Page.tsx` (JSX only), `use[Name]Page.ts` (all logic), and — where needed —
`[Name]Components.tsx` (ALL page-local components, always bundled in this one file,
whether the page has one or several), `[name]DataHooks.ts` and `[name]Types.ts`.
Anything used by more than one page lives in `shared/` (where components get one
file each, because there will be many).

```
src/
  components/ui/                VENDOR ZONE — shadcn-generated components (lowercase,
                                registry-owned; the only importers of @base-ui/react):
                                alert, alert-dialog, badge, button, card, checkbox,
                                collapsible, combobox, dialog, dropdown-menu, empty,
                                field, input, input-group, label, radio-group, select,
                                separator, spinner, switch, table, textarea, tooltip
  lib/
    utils.ts                    cn() — clsx + tailwind-merge class helper (vendor zone)

  app/                          Infrastructure — providers, routing, HTTP gateway
    App.tsx                     Provider hierarchy (Theme → Tooltip → Query → Auth → Router)
    ThemeProvider.tsx           Light/dark theme (Application State; localStorage; .dark on <html>)
    AuthProvider.tsx            AuthContext (Application State)
    QueryProvider.tsx           TanStack Query config
    Router.tsx                  ALL routes in one place
    ProtectedRoute.tsx          Auth guard (React Router layout route)
    TopNav.tsx                  Level 1 navigation + user menu (theme switcher, sign out)
    apiFetch.ts                 Single HTTP gateway — THE stub/real switch; throws ApiError (kind + status)
    tokenStore.ts               Bridges AuthProvider → apiFetch (the credential)
    sessionExpiry.ts            Bridges apiFetch → AuthProvider (401 → end session; dormant under stubs)
    Notifications.tsx           Notification gateway — the ONLY file that imports sonner

  pages/                        One folder per page
    login/
      LoginPage.tsx             Page (JSX only) — ui/card + Tailwind layout
      useLoginPage.ts           Page orchestration hook
      LoginComponents.tsx       LoginForm Business Component (onSubmit EVENT — not pull pattern)
      loginDataHooks.ts         useLoginMutation
      loginTypes.ts             Login-only types
    order-search/
      OrderSearchPage.tsx
      useOrderSearchPage.ts     filters vs appliedFilters pattern
      OrderSearchComponents.tsx OrderSearchFilterBar (controlled TC; plain-controlled
                                ui/select — NO Controller outside RHF forms) +
                                OrdersGrid (wraps DataGrid; OrderStatusBadge)
      orderSearchDataHooks.ts   useOrdersQuery (single-page)
      orderSearchTypes.ts       Page-owned request contract (OrderFilters)
    order-details/              MULTI-PAGE FEATURE FOLDER — a layout + one folder per tab-page
      OrderDetailsLayout.tsx    Layout route — header + tab bar + <Outlet/>
      useOrderDetailsLayout.ts  Header data + nav (fetches the order for the header)
      orderDetailTabPaths.ts    Tab route slugs — single source of truth
      info/                     "Info" tab — a real page with its own hook
        OrderInfoPage.tsx
        useOrderInfoPage.ts
        OrderInfoComponents.tsx   OrderInfoSection, ApprovalSection, FinancialSummarySection
                                  (SectionCard/DetailGrid/DetailField; margin Tooltip)
      line-items/               "Line Items" tab
        OrderLineItemsPage.tsx
        useOrderLineItemsPage.ts
        lineItemsDataHooks.ts   useOrderLineItemsQuery — its OWN endpoint (divergent per-tab data)
      workflow/                 "Workflow" tab
        OrderWorkflowPage.tsx
        useOrderWorkflowPage.ts
        workflowDataHooks.ts    approve / cancel / dispatch mutations (workflow-only)
    edit-order/
      EditOrderPage.tsx         THE PULL PATTERN page; CollapsibleSection (keepMounted) around Line Items
      useEditOrderPage.ts       getData on refs, useBlocker
      editOrderDataHooks.ts     useSaveOrderMutation
      editOrderTypes.ts         Page-owned request contract (SaveOrderPayload)
    create-order/
      CreateOrderPage.tsx       Page-level wizard — ALL steps mounted; inactive panels `hidden`
      useCreateOrderPage.ts     Wizard orchestration + dependent data loading
      CreateOrderComponents.tsx CarrierStep (Controller selects + Checkbox + Switch)
      createOrderDataHooks.ts   useCreateOrderMutation
      createOrderTypes.ts       Page-owned request contract (CreateOrderPayload, standalone)
    warehouse-details/
      WarehouseDetailsPage.tsx
      useWarehouseDetailsPage.ts Modal Type B, component wizard
      WarehouseDetailsComponents.tsx  WarehouseStatusBadge, AllocationsGrid,
                                PremiumStorageSection, AddAllocationModal (ui/dialog;
                                internal wizard; priority RadioGroup)
      warehouseDetailsDataHooks.ts warehouse query + allocation mutations
      warehouseDetailsTypes.ts
    not-found/
      NotFoundPage.tsx          The '*' catch-all — unmatched URLs, inside the shell
      useNotFoundPage.ts        Thin hook — the anatomy applies to every page

  shared/
    business-components/        Business Components used by MORE THAN ONE page
      AddressSection.tsx        (orders + warehousing) — Field markup, saved-address picker
      CustomerSection.tsx       (create order) — searchable ui/combobox via Controller
      OrderItemsSection.tsx     (edit + create + details) — useFieldArray on ui/table
      OrderStatusBadge.tsx      status → label + intent classes (display-only; graduated)
    technical-components/       Pure UI — no business logic (home-grown, PascalCase)
      DataGrid.tsx              TanStack Table engine behind the RA's GridColumn API
      ConfirmationModal.tsx     Type A — composes ui/alert-dialog
      PageMessageBanner.tsx     composes ui/alert (semantic intent tokens)
      PageTabs.tsx              routed tabs (NavLink — deliberately NOT ui/tabs)
      WizardChrome.tsx          wizard chrome (no wizard primitive exists)
      PageErrorFallback.tsx     router errorElement fallback
      PageContent.tsx           standard page wrapper (replaced .page-content)
      SectionCard.tsx           titled section card (composes ui/card)
      DetailGrid.tsx            read-only field grid
      DetailField.tsx           read-only label/value pair
      PageStatus.tsx            page/tab loading-error-notfound block
      FormRow.tsx               responsive form-field row
      CollapsibleSection.tsx    CONTAINER TC above Business Components (keepMounted)
    contracts/                  Server-mirrored DTOs — the frontend/backend contract
      orderContracts.ts         Order, OrderSummary, OrderLineItem, OrderFinancials, OrderStatus
      addressContracts.ts       AddressFields (write values) + Address (read shape, server-assigned id)
      selectorContracts.ts      Customer, Carrier, Product (domain-entity selectors — real shapes)
      authContracts.ts          AuthUser (login response; held in AuthContext)
    data/                       Multi-page transactional + selector data hooks (…Query / …Mutation)
      orderDataHooks.ts         useOrderQuery (details + edit)
      selectorDataHooks.ts      useCustomersQuery / useCarriersQuery / useProductsQuery / useCustomerAddressesQuery
    reference-data/             GENUINE reference data only (domain-neutral lookups)
      referenceDataTypes.ts     ReferenceItem base + ServiceLevel alias
      referenceDataHooks.ts     useServiceLevelsReferenceDataQuery
    utility-hooks/              Genuinely reusable non-data hooks
      useAuth.ts  useTheme.ts
    types/                      CLIENT-ONLY shared types (never cross the wire)
      uiTypes.ts                PageMessage, MessageType
      sectionDataResult.ts      SectionDataResult — discriminated union returned by every getData()
      userRole.ts               UserRole
    utils/
      formatDate.ts

  stubs/                        The fake backend (see "The Stub Switch")
    apiFetchStubs.ts            Path → stub dispatcher (the stub transport)
    stubsApi.ts                 Stub implementations + fake data

  index.css                     Tailwind import + Base UI portal setup + design tokens
                                (:root / .dark / @theme inline) — ~160 lines, no legacy CSS
```

### The naming convention

Names carry a **suffix that signals their kind**, so you can tell what something
is from its name alone:

| Suffix | Meaning | Example |
|---|---|---|
| `…Page` | Page orchestration hook | `useEditOrderPage` |
| `…Query` | Data read hook | `useOrderQuery` |
| `…Mutation` | Data write hook | `useApproveOrderMutation` |
| `…ReferenceDataQuery` | Genuine reference-data read (domain-neutral lookup) | `useServiceLevelsReferenceDataQuery` |
| `…Handle` | A component's ref contract | `AddressSectionHandle` |
| `…Props` | A component's props type | `CustomerSectionProps` |
| `…FormValues` | A React Hook Form value shape | `AddressFormValues` |
| `…Payload` | An API request body | `SaveOrderPayload` |
| `…Section` / `…Grid` / `…Modal` / `…Step` | Component roles | `ApprovalSection` |

Files are always named descriptively — there are no `index.ts` files.
**Vendor-zone exception:** files in `components/ui/` are lowercase
(`alert-dialog.tsx`) — registry-owned code keeps shadcn conventions, and the
casing itself signals provenance.

> `…ReferenceDataQuery` is reserved for **genuine** reference data (domain-neutral
> lookups like service levels). Reads that fetch a domain entity to fill a selector
> — customers, carriers, products — are ordinary `…Query` hooks in `shared/data/`.

### Where hooks live (the placement rule)

| Hook kind | Home |
|---|---|
| Page orchestration (`use…Page`) | the page folder |
| Single-page data hook | the page folder, grouped in `[page]DataHooks.ts` |
| Multi-page transactional / selector data (`…Query` / `…Mutation`) | `shared/data/` |
| Genuine reference data (`…ReferenceDataQuery`) | `shared/reference-data/` |

Rule of thumb: **used by one page → page folder; used by more than one → shared.**

---

## The Stub Switch (how the fake backend works)

The whole application talks to the backend through **one function**: `apiFetch()`.
Data hooks call it with a REST path, exactly as they would in production:

```ts
apiFetch<Order>(`/orders/${orderId}`)                              // a read
apiFetch<void>(`/orders/${orderId}/approve`, { method: 'POST' })  // a write
```

`apiFetch.ts` contains a **single flag** — the only place in the whole codebase
that knows stubs exist:

```ts
const USE_STUBS = import.meta.env.VITE_USE_STUBS !== 'false'
// ...
if (USE_STUBS) return apiFetchStubs<T>(path, options)   // ← the one seam
// ...real fetch() below
```

- **Nothing else** references stubs. Pages, hooks, and components only ever call
  `apiFetch()`. The word "stub" appears nowhere above the transport layer.
- **To go to production:** set `VITE_USE_STUBS=false`. That single flag routes
  every call through the real `fetch()`. **No other file changes.**
- The stub files (`stubs/apiFetchStubs.ts`, `stubs/stubsApi.ts`) stay in the
  codebase, dormant when the flag is off.

This is the answer to "how hard is it to move from stubs to a real API?": flip
one boolean.

---

## Suggested Reading Order

### 1. Infrastructure

| File | What to notice |
|---|---|
| `src/app/App.tsx` | Provider hierarchy — Theme → Tooltip → Query → Auth → Router |
| `src/app/ThemeProvider.tsx` | Light/dark theme — Application State, `.dark` on `<html>` |
| `src/app/AuthProvider.tsx` | Application State pattern — AuthContext |
| `src/app/QueryProvider.tsx` | TanStack Query config — staleTime, no optimistic updates |
| `src/app/apiFetch.ts` | Single HTTP gateway — **the one stub/real switch** |
| `src/stubs/apiFetchStubs.ts` | The stub transport (path → stub dispatcher) |
| `src/app/Router.tsx` | All routes in one place — including nested-route tabs |
| `src/app/TopNav.tsx` | ui/dropdown-menu — Base UI `render` prop composition |
| `src/index.css` | Tailwind v4 import, Base UI portal setup, the design tokens |

### 2. The vendor zone + shared layer

| File | What to notice |
|---|---|
| `src/components/ui/button.tsx` | A vendor-zone component — imports `@base-ui/react`, cva variants |
| `src/shared/technical-components/DataGrid.tsx` | TanStack Table confined behind the RA's own GridColumn API |
| `src/shared/technical-components/ConfirmationModal.tsx` | Modal Type A — ui/alert-dialog satisfies the RA modal rules natively |
| `src/shared/technical-components/SectionCard.tsx` | The reuse mechanism under utility-first styling is a COMPONENT |
| `src/shared/technical-components/CollapsibleSection.tsx` | Container TC above Business Components — **keepMounted** |
| `src/shared/business-components/AddressSection.tsx` | **Shared Business Component** — pull pattern, Field markup |
| `src/shared/contracts/orderContracts.ts` | Server-mirrored DTOs — the frontend/backend contract |
| `src/shared/types/sectionDataResult.ts` | The discriminated union every getData() returns |

### 3. Login — Simplest Page

| File | What to notice |
|---|---|
| `src/pages/login/loginDataHooks.ts` | `useLoginMutation` — standard interface |
| `src/pages/login/useLoginPage.ts` | Page orchestration hook — even simple pages have one |
| `src/pages/login/LoginComponents.tsx` | Business Component — onSubmit event; Field + register (native inputs) |
| `src/pages/login/LoginPage.tsx` | Page — JSX only; ui/card |

### 4. Order Search — Filter Form + Grid

| File | What to notice |
|---|---|
| `src/pages/order-search/orderSearchDataHooks.ts` | `useOrdersQuery` — standard `{ data, isPending, isError }` |
| `src/pages/order-search/useOrderSearchPage.ts` | **filters vs appliedFilters** — useState, not React Hook Form |
| `src/pages/order-search/OrderSearchComponents.tsx` | Filter bar: plain-CONTROLLED ui/select (no Controller — no RHF form) + OrdersGrid |
| `src/pages/order-search/OrderSearchPage.tsx` | Page reads as a composition: filter bar + grid |

### 5. Order Details — Tabs as Nested Routes (a multi-page feature folder)

Order Details is not one page — it is **three pages (tabs) sharing one layout**, so
its folder is a *multi-page feature folder*: the layout at the root, plus one child
folder per tab-page (`info/`, `line-items/`, `workflow/`).

- **The layout** (`OrderDetailsLayout.tsx`) renders the persistent shell — header and
  tab bar — with an `<Outlet/>`. `PageTabs` renders `<NavLink>`s, so React Router
  owns which tab is active (deliberately NOT ui/tabs, which owns its own tab state).
- **Each tab is a real page** with its own orchestration hook.
- **Each tab fetches only what it needs** — the Line Items tab has its OWN endpoint.

| File | What to notice |
|---|---|
| `src/app/Router.tsx` | The layout route + its three tab children (nested routes) |
| `src/pages/order-details/OrderDetailsLayout.tsx` | Layout route — shell doesn't re-mount |
| `src/pages/order-details/info/useOrderInfoPage.ts` | Presence-driven + conditional section visibility |
| `src/pages/order-details/info/OrderInfoComponents.tsx` | SectionCard/DetailGrid/DetailField; margin Tooltip; token-driven emphasis |
| `src/pages/order-details/line-items/lineItemsDataHooks.ts` | **Divergent per-tab data** — its own endpoint |
| `src/pages/order-details/workflow/useOrderWorkflowPage.ts` | availableActions, confirmation modal, workflow-only mutations |

### 6. Edit Order — **The Pull Pattern** (read carefully)

| File | What to notice |
|---|---|
| `src/pages/edit-order/useEditOrderPage.ts` | **Core pull pattern** — getData() on refs, cross-component validation, useBlocker |
| `src/shared/business-components/CustomerSection.tsx` | **useImperativeHandle** + searchable ui/combobox via Controller |
| `src/shared/business-components/OrderItemsSection.tsx` | **useFieldArray** on ui/table — a FORM table, deliberately not DataGrid |
| `src/shared/business-components/AddressSection.tsx` | Field markup; saved-address picker (plain uncontrolled ui/select) |
| `src/pages/edit-order/EditOrderPage.tsx` | Refs to Business Components; **CollapsibleSection + keepMounted**; customer `canEdit={false}` |

### 7. Create Order — Page-Level Wizard

| File | What to notice |
|---|---|
| `src/pages/create-order/useCreateOrderPage.ts` | Wizard orchestration; **dependent data loading** (customer → addresses) |
| `src/pages/create-order/CreateOrderComponents.tsx` | CarrierStep — Controller selects, **Checkbox + Switch via Controller** |
| `src/pages/create-order/CreateOrderPage.tsx` | ALL steps mounted; inactive panels get Tailwind `hidden` — never unmounted |

### 8. Warehouse Details — Advanced Patterns

| File | What to notice |
|---|---|
| `src/pages/warehouse-details/useWarehouseDetailsPage.ts` | Modal Type B pull, component wizard |
| `src/pages/warehouse-details/WarehouseDetailsComponents.tsx` | **AddAllocationModal** — ui/dialog, `disablePointerDismissal`, internal wizard, priority RadioGroup |

---

## Pattern Index

| Pattern | Primary file |
|---|---|
| Vendor zone (shadcn/Base UI confinement) | `components/ui/` + `lib/utils.ts` |
| Pull pattern — getData/reset/isDirty | `shared/business-components/CustomerSection.tsx` |
| useImperativeHandle + React 19 ref | `shared/business-components/CustomerSection.tsx` |
| Page orchestration hook | `pages/edit-order/useEditOrderPage.ts` |
| Presence-driven section visibility | `pages/order-details/info/useOrderInfoPage.ts` |
| Presence-driven field visibility | `pages/order-details/info/OrderInfoComponents.tsx` |
| Presence-driven column visibility | `pages/warehouse-details/WarehouseDetailsComponents.tsx` |
| Conditional section + null ref check | `pages/edit-order/useEditOrderPage.ts` |
| Cross-component validation | `pages/edit-order/useEditOrderPage.ts` |
| Dependent data loading | `pages/create-order/useCreateOrderPage.ts` |
| Filter form (useState, not RHF) | `pages/order-search/useOrderSearchPage.ts` |
| filters vs appliedFilters | `pages/order-search/useOrderSearchPage.ts` |
| Select in an RHF form — Controller + ui/select | `pages/create-order/CreateOrderComponents.tsx` |
| Select OUTSIDE a form — plain controlled | `pages/order-search/OrderSearchComponents.tsx` |
| Select as picker — plain uncontrolled | `shared/business-components/AddressSection.tsx` (saved addresses) |
| Searchable select — ui/combobox via Controller | `shared/business-components/CustomerSection.tsx` |
| Checkbox + Switch via Controller | `pages/create-order/CreateOrderComponents.tsx` |
| RadioGroup via Controller | `pages/warehouse-details/WarehouseDetailsComponents.tsx` |
| useFieldArray (dynamic line items) | `shared/business-components/OrderItemsSection.tsx` |
| availableActions from backend | `pages/order-details/workflow/useOrderWorkflowPage.ts` |
| URL params + re-fetch | `shared/data/orderDataHooks.ts` |
| Tabs as nested routes (router-owned, not ui/tabs) | `pages/order-details/OrderDetailsLayout.tsx` + `app/Router.tsx` |
| Unsaved changes — useBlocker | `pages/edit-order/useEditOrderPage.ts` |
| Confirmation modal (Type A) — ui/alert-dialog | `shared/technical-components/ConfirmationModal.tsx` |
| Data entry modal (Type B) — ui/dialog | `pages/warehouse-details/WarehouseDetailsComponents.tsx` |
| Container TC above Business Components + keepMounted | `shared/technical-components/CollapsibleSection.tsx` + `pages/edit-order/EditOrderPage.tsx` |
| Page-level wizard (steps hidden, not unmounted) | `pages/create-order/CreateOrderPage.tsx` |
| Modal-level wizard | `pages/warehouse-details/WarehouseDetailsComponents.tsx` |
| Level 1 navigation + user menu (render prop) | `app/TopNav.tsx` |
| Level 2 navigation (nested-route tabs) | `shared/technical-components/PageTabs.tsx` |
| Dark mode (Application State + tokens) | `app/ThemeProvider.tsx` + `src/index.css` |
| Semantic intent tokens (success/warning/info) | `src/index.css` + `shared/technical-components/PageMessageBanner.tsx` |
| Data-driven class selection | `shared/business-components/OrderStatusBadge.tsx` |
| Tooltip | `pages/order-details/info/OrderInfoComponents.tsx` |
| Shared Business Component | `shared/business-components/AddressSection.tsx` |
| DataGrid — TanStack Table behind the RA's API | `shared/technical-components/DataGrid.tsx` |
| Error fallback (router errorElement) | `shared/technical-components/PageErrorFallback.tsx` + `app/Router.tsx` |
| Single HTTP gateway + stub switch | `app/apiFetch.ts` |
| Cache invalidation after mutation | `pages/order-details/workflow/workflowDataHooks.ts` |
| Standard query/mutation interfaces | `shared/data/orderDataHooks.ts` |
| Divergent per-tab data (own endpoint) | `pages/order-details/line-items/lineItemsDataHooks.ts` |
| BC communication — event/callback (vs pull) | `pages/login/LoginComponents.tsx` |
| Immutable fields on edit (customer read-only) | `pages/edit-order/EditOrderPage.tsx` |
| Contract types (DTOs) | `shared/contracts/orderContracts.ts` |
| The write-payload rule | `pages/create-order/createOrderTypes.ts` |
| Genuine reference data (`ReferenceItem`) | `shared/reference-data/referenceDataTypes.ts` |

---

## Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19.2 | UI — ref as plain prop (no forwardRef) |
| TypeScript | 5.9 | Type safety throughout |
| Vite | 7.3 | Build tool — `@` alias for `src/` |
| React Router | 7.18 | Routing, nested-route tabs, ProtectedRoute, useBlocker, errorElement |
| TanStack Query | 5.101 | Server state — cache, loading, error |
| TanStack Table | 8.21 | Grid engine — imported ONLY by DataGrid.tsx |
| React Hook Form | 7.82 | Business Component editing state |
| Tailwind CSS | 4.3 | Utility-first styling; CSS-first tokens (`@theme`) |
| @base-ui/react | 1.6 | Headless primitives — imported ONLY by `components/ui/` |
| shadcn/ui | CLI 4.x | Generates the vendor zone (style `base-vega`); not a runtime dep |
| lucide-react | 1.x | Icons (shadcn default) |
| cva / clsx / tailwind-merge | — | Variants + `cn()` class merging (vendor-zone utilities) |
| sonner | 2.x | Toast notifications (confined to `app/Notifications.tsx`) |

---

## Verifying the Patterns

Step through these in the running app to confirm the code does what you read.

**Pull pattern + unsaved changes guard.** Open Edit Order on any pending order.
Edit the delivery address or a line item (the customer is read-only — fixed after
creation). Click Back or the Orders nav link — a "Leave without saving?"
confirmation intercepts. Accept, re-open, and Save normally.

**keepMounted under collapse.** On Edit Order, collapse the "Line Items"
section, then Save — the save still collects the collapsed section's data,
because the panel is hidden, not unmounted.

**Role-based visibility.** Sign in as `manager@freightos.com` — the Financial
Summary (with margin) shows on Order Info. Sign out, in as `operator@freightos.com`
— it is absent. On Warehouse Details, Cost/Value columns appear for manager only.

**Searchable customer + dependent data loading.** Start a New Order. Type "pac"
in the customer combobox — the list filters; pick the customer, and at step 2
the "select saved address" dropdown holds that customer's addresses.

**Divergent per-tab data.** Open an order and switch to the Line Items tab. In the
browser's network panel it issues its own `/orders/:id/line-items` request.

**availableActions + nested-route tabs.** Open a pending order; the URL is
`/orders/…/info`. Click the Workflow tab — the URL changes, the shell does not
reload. Approve — the confirmation dialog refuses backdrop clicks (try it);
after confirming, the status and action list update.

**Wizard — step validation.** Start a new order. Click Next on an empty step — it
refuses and shows field errors. Complete each step (note the Saturday-delivery
checkbox and notify switch on the Carrier step) and submit.

**Modal Type B wizard.** Melbourne Distribution Centre → Add Allocation. A 2-step
dialog wizard (priority is a radio group). Submitting step 1 without a category
stays on step 1 with an error. The backdrop never dismisses it; Escape cancels.

**Dark mode.** Open the user menu (top right) → Theme → Dark. The whole app
flips (tokens, not per-component styles) and the choice survives a reload.
