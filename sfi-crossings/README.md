# SFI Crossings

The working freight/logistics application. All patterns, conventions, and
structure follow the reference architecture in `../freight-ref-arch-v11/`
(read-only — see the root `CLAUDE.md`). Read its `README.md` for the folder
anatomy, naming conventions, and pattern index.

## Quick start

```bash
npm install
npm run dev
```

## Structure

- `src/components/ui/` + `src/lib/utils.ts` — vendor zone (shadcn-generated,
  lowercase file names; the only importers of `@base-ui/react`)
- `src/app/` — infrastructure: providers, routing, HTTP gateway
- `src/pages/` — one folder per page (`[Name]Page.tsx`, `use[Name]Page.ts`, …)
- `src/shared/` — anything used by more than one page
- `src/index.css` — Tailwind v4 import + design tokens (`:root` / `.dark` /
  `@theme inline`)
