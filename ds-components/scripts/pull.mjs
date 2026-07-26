// Refresh this library's src/ from the app's vendor zone.
// The app (sfi-crossings) is the single source of truth; everything copied
// here is overwritten wholesale on each run — never hand-edit the copies.
import { cpSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const app = join(here, '..', '..', 'sfi-crossings', 'src');
const src = join(here, '..', 'src');

const mirrored = [
  'components/ui',
  'hooks/use-mobile.ts',
  'lib/utils.ts',
  'index.css',
  'fonts.css',
  'fonts',
];

for (const path of mirrored) {
  rmSync(join(src, path), { recursive: true, force: true });
  cpSync(join(app, path), join(src, path), { recursive: true });
}

// The design authority is mirrored in as a guidelines doc so the /design-sync
// pipeline ships it to the Claude Design agent (default guidelinesGlob picks
// up docs/guides/**/*.md). Source of truth: design-specs/master/DESIGN.md.
const authority = join(here, '..', '..', 'design-specs', 'master', 'DESIGN.md');
const guide = join(here, '..', 'docs', 'guides', 'design-authority.md');
rmSync(guide, { force: true });
cpSync(authority, guide);

console.log(`Pulled ${mirrored.length} paths from sfi-crossings/src + design authority.`);
