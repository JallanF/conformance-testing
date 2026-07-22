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

- `design-specs/` — SFI Crossings design system staging area (playbook, master
  theme, shipped artifacts). See `design-specs/DESIGN-SYSTEM-PLAYBOOK.md`.
- `sfi-crossings/` — the working application (Vite + React + TypeScript).
  This is where changes happen. It follows the ref arch's conventions:
  page-first structure, vendor zone in `src/components/ui/`, `@` alias,
  suffix-based naming.
- `freight-ref-arch-v11/` — read-only reference architecture (see above).
