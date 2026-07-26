# ConformanceTesting

## freight-ref-arch-v11/ is a READ-ONLY reference architecture

`freight-ref-arch-v11/` is a classic reference architecture: an example
application that demonstrates the required patterns, conventions, and
structure. It is **not** a real application and **not** the application being
worked on here.

- **Never edit, add, delete, or refactor anything under `freight-ref-arch-v11/`.**
  This is enforced by deny rules in `.claude/settings.json`; do not work around
  them via shell commands either.
- Use it as the authority for patterns and conventions: read it, cite it,
  imitate it in the real application.
- If something in it looks wrong or outdated, report it to the user — do not
  fix it.

## Layout

- `architecture/` — the cc26 (principles) and cc27 (implementation decisions)
  architecture documents that `freight-ref-arch-v11/` cites throughout. cc27
  v11 is authoritative where versions differ.
- `design-specs/` — SFI Crossings design system staging area (playbook, master
  theme, shipped artifacts). See `design-specs/DESIGN-SYSTEM-PLAYBOOK.md`.
- `ds-components/` — the component library package the `/design-sync` pipeline
  consumes. A wholesale mirror of the app's vendor zone (`npm run pull`);
  never hand-edit its `src/` copies.
- `sfi-crossings/` — the working application (Vite + React + TypeScript).
  This is where changes happen. It follows the ref arch's conventions:
  page-first structure, vendor zone in `src/components/ui/`, `@` alias,
  suffix-based naming.
- `freight-ref-arch-v11/` — read-only reference architecture (see above).
