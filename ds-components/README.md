# sfi-crossings-ds

The local React component library that Anthropic's `/design-sync` pipeline
consumes to sync components into the SFI Crossings Claude Design project.
See `design-specs/DESIGN-SYSTEM-PLAYBOOK.md` §6 for the verified pipeline
details.

## Doctrine: this package is a mirror, not a fork

`src/components/ui/`, `src/hooks/`, `src/lib/`, `src/index.css`, `src/fonts*`
are wholesale copies of `sfi-crossings/src/` — the app's vendor zone is the
single source of truth. Never hand-edit the copies; change the app (or its
masters) and re-run:

```bash
npm run pull
```

Owned by this package (not mirrored): `package.json`, `tsconfig.json`,
`scripts/pull.mjs`, `src/index.ts` (the barrel — regenerate its list when the
vendor inventory changes), `src/ds-provider.tsx` (the dark-canonical preview
wrapper), the `.design-sync/` durable files (config, NOTES, conventions,
previews), and this README. `docs/guides/design-authority.md` is mirrored from
`design-specs/master/DESIGN.md` by the pull script.

## Verify

```bash
npm run typecheck
```

Strict tsc over the whole surface; must be clean before any sync.

## Known pre-sync caveats (v2 session findings)

- The Claude Design preview runs **React 18**; these components are React 19
  ref-as-prop style. Sealed floating overlays will mis-position inside Design
  Components until forwardRef-compatible — expect the sync render-check to
  surface this; fix here at source if it does.
- Compiled Tailwind output carries `--tw-*` internals that the design-system
  token scan flags. Keep the compiled CSS unreachable from `tokens.css`.
- `src/components/ui/sonner.tsx` imports `next-themes`; the design host has no
  next-themes provider — the sync render-check will tell us whether the
  fallback default is acceptable.
