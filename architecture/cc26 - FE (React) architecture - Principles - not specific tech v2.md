# React Application Architecture Discovery Summary

## Purpose of This Document

This document captures the architectural discovery phase for the React application — the characteristics, constraints, principles and requirements established before implementation decisions were made.

The goals of the discovery phase were to identify and agree:

- React architecture
- Frontend organisation
- State management technology
- API style
- Supporting technologies

The discovery phase is complete. Implementation decisions made as a result of this process are documented in cc27.

---

# Target System

The target application is a long-lived commercial business system.

Characteristics:

- Shipping
- Tracking
- Warehousing
- Reporting
- Customer-facing authenticated portal
- Mobile responsive
- Supports modern browsers
- Approximately 50-150 concurrent users
- Small development team (2-4 developers)
- Strategic long-term investment

Likely backend:

- C#
- PostgreSQL
- REST APIs (not yet finalised)

---

# Core Architectural Principles

## Simplicity

Software should be easy for developers to understand.

Avoid unnecessary complexity, abstraction, layers, frameworks, patterns and ceremony.

## Consistency

Strong consistency is desired across:

- Structure
- Naming
- Responsibilities
- Organisation
- Development patterns

Minimise special cases.

## Separation of Concerns

Each part of the solution should have a single, clear responsibility.

## Encapsulation

Implementation details should be hidden.

## Loose Coupling

Changes in one area should have minimal impact on other areas.

## Debuggability

The architecture must support easy troubleshooting and understanding of behaviour.

## Reusability

Reusable components are highly valued.

## Maintainability

Long-term maintainability is a primary goal.

## Testability

Components should be easy to test in isolation.

## Extensibility

New functionality should be added without major architectural changes.

## Security

Security, permissions and business controls are important and must be enforced correctly.

---

# Overall System Architecture

```text
System
├── React SPA
├── Business Services
└── Database
```

The React SPA is part of the business application.

However, the majority of business behaviour, business rules, workflow logic and authority reside within the backend business services.

The React SPA primarily acts as the user interface to the business application.

---

# Frontend vs Backend Responsibilities

## Frontend Responsibilities

- Rendering
- Navigation
- User interaction
- Layout
- Client-side validation
- Wizard navigation/orchestration
- Component composition

## Backend Responsibilities

- Business rules
- Workflow rules
- Permissions
- Security decisions
- State transitions
- Transactions
- Integrations
- Authoritative business state

---

# Business Logic Ownership

Unless there is a compelling reason to locate functionality client-side, it should be located server-side.

The frontend should remain as thin as practical.

The frontend should not implement business rules.

Instead, the backend determines these decisions and supplies information to the frontend.

Adopted patterns include:

- Capability flags
- Action lists (e.g. availableActions)
- Data suppression
- Hybrid approaches

Final API contract design remains open.

The frontend should generally not need to know why a business rule evaluated the way it did.

---

# Workflow Philosophy

The application is not primarily CRUD-oriented.

It is primarily workflow-oriented.

Examples:

- Create Shipment
- Validate Inventory
- Allocate Warehouse
- Assign Carrier
- Generate Labels
- Submit Approval
- Dispatch
- Track
- Close

Workflow authority belongs to the backend.

Workflow presentation belongs to the frontend.

The frontend may manage wizard navigation and user interaction.

The backend remains the authoritative owner of workflow state and business transitions.

---

# State Management Philosophy

The architectural direction for state management is largely established.

Authoritative state resides on the server.

The frontend should contain minimal business state.

Frontend state should primarily be limited to UI concerns:

- Current page
- Current tab
- Current wizard step
- Form contents prior to save
- Expanded/collapsed sections
- Local UI behaviour

The frontend should avoid becoming:

- A business-state engine
- A workflow engine
- A permissions engine
- A business rules engine

State-management technology decisions have since been made and are documented in cc27.

---

# Recovery Philosophy

The preferred approach is server-authoritative recovery.

When conflicts occur:

- Reload authoritative state from the server
- Minimise complex client-side recovery logic
- Keep frontend behaviour simple

The server remains the source of truth.

---

# Security and Permissions

The application is expected to have:

- Complex business rules
- Fine-grained permissions
- Role-based controls
- Approval thresholds
- Visibility restrictions

Examples:

- Only managers can view invoice totals
- Only senior managers can approve invoices above a threshold

The preferred model is a hybrid approach where:

- The backend enforces permissions
- The backend may suppress data
- The backend may return capability information
- The frontend renders behaviour based on information supplied by the backend

---

# User Experience Goals

The application is primarily a traditional business application.

Typical UI behaviour includes:

- Forms
- Grids
- Filters
- Sorting
- Exporting
- Multi-step wizards
- Dynamic sections
- Modal dialogs
- Hover interactions

The architecture should also allow richer interactions where genuinely justified.

Examples:

- Drag-and-drop
- More advanced visual interactions
- Richer workflow experiences

However, the system is not intended to become a highly interactive rich-client platform.

Generally simple UX is preferred. Simplicity remains the priority.

---

# Forms

Some forms will be complex.

The preferred approach is composite forms built from smaller reusable components.

Example:

ShipmentPage
├── CustomerSection
├── InventorySection
├── CarrierSection
├── ApprovalSection

rather than large monolithic page implementations.

---

# Component Strategy

Reusable components are considered critical.

Goals include:

- Small components
- Reusable components
- Parameterised components
- Fix-once-use-everywhere behaviour

Examples:

- Breadcrumbs
- Navigation components
- Customer selectors
- Shipment lists
- Approval panels
- Address editors

The preference is for traditional page construction using reusable components rather than highly abstract page-generation frameworks.

---

# Navigation

Current preference:

Screen-oriented navigation.

Examples:

- Shipment Search
- Shipment Details
- Warehouse Search
- Warehouse Details

rather than purely workflow-oriented navigation.

---

# Reporting

Reporting requirements are relatively traditional:

- Grids
- Sorting
- Filtering
- Exporting

No significant requirement currently exists for:

- Real-time dashboards
- Data warehouse style analytics
- Drill-through reporting
- Heavy visualisation

---

# Real-Time Requirements

Currently:

- No real-time updates
- No push notifications
- No collaborative editing

Page refresh is acceptable.

---

# Offline Requirements

None currently identified.

---

# Third-Party Integration Philosophy

The frontend should generally not call business-related third-party services directly.

External integrations should typically occur through backend services.

The backend remains the integration boundary.

---

# Technology Independence Philosophy

The architecture should not become tightly coupled to React-specific concepts.

The desired architecture should be understandable as a business application architecture first, and a React implementation second.

However, technology neutrality should not be pursued to the point of creating unnecessary abstraction, complexity or indirection.

Pragmatism is preferred.

---

# Architectural Leanings Already Established

The following are considered strong architectural leanings arising from the discussion:

- Thin frontend
- Server-authoritative business logic
- Server-authoritative workflow logic
- Server-authoritative permissions
- Composite pages built from reusable components
- High component reuse
- Parameterised components where practical
- Screen-oriented navigation
- Hybrid entity/process business model
- Hybrid API style likely (resource + action)
- Minimal client-side business state
- Backend integration boundary
- Pragmatic rather than framework-centric architecture
- React as presentation technology rather than business platform

These are confirmed architectural decisions. Implementation detail is documented in cc27.

---

# Areas Resolved Since Discovery

The following topics have been decided and are documented in cc27:

- Frontend organisation
- React architectural pattern selection
- Folder structure
- Component hierarchy strategy
- Module boundaries
- Feature organisation strategy
- Specific React technologies
- Specific state-management technologies

---

# Areas Still Open

The following topics remain intentionally unresolved:

- Metadata-driven approaches
- Code generation approaches
- AI-assisted development approaches
- API design style

These topics will be explored in subsequent discussions.
