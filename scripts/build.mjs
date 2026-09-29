// Zero-dependency build: copies site/ to dist/ and pre-renders the Quick CV + JSON-LD into index.html
// so crawlers, no-JS visitors and link previews get real content.
import { cp, readFile, writeFile, rm, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'site');
const out = path.join(root, 'dist');

const { cvHTML } = await import(new URL('../site/js/ui/templates.js', import.meta.url));
const { profile, places, badges } = await import(new URL('../site/js/data.js', import.meta.url));

await rm(out, { recursive: true, force: true });
await cp(src, out, { recursive: true });

const current = places.find((p) => p.id === 'microsoft');
const jsonld = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: profile.name,
  url: 'https://jpamies.com/',
  jobTitle: current.roles[0].title,
  worksFor: { '@type': 'Organization', name: current.roles[0].company },
  address: { '@type': 'PostalAddress', addressLocality: 'Barcelona', addressCountry: 'ES' },
  alumniOf: { '@type': 'CollegeOrUniversity', name: profile.education },
  knowsLanguage: profile.languages,
  hasCredential: badges.map((b) => ({ '@type': 'EducationalOccupationalCredential', name: b.name })),
  sameAs: profile.links.map((l) => l.url),
};
const jsonldTag = `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>`;

const indexPath = path.join(out, 'index.html');
let html = await readFile(indexPath, 'utf8');
const cvStart = '<!-- CV:START -->';
const cvEnd = '<!-- CV:END -->';
if (!html.includes(cvStart) || !html.includes(cvEnd) || !html.includes('<!-- JSONLD -->')) {
  throw new Error('index.html is missing build placeholders');
}
html = html.replace(/<!-- CV:START -->[\s\S]*<!-- CV:END -->/, () => `${cvStart}${cvHTML()}${cvEnd}`);
html = html.replace('<!-- JSONLD -->', () => jsonldTag);
await writeFile(indexPath, html);

// Safety net: never publish dotfiles (e.g. a stray .env) — only the markers GitHub Pages needs.
const allowedDotfiles = new Set(['.nojekyll', '.well-known']);
async function walk(dir) {
  for (const name of await readdir(dir)) {
    const full = path.join(dir, name);
    if (name.startsWith('.') && !allowedDotfiles.has(name)) {
      throw new Error(`Refusing to publish dotfile: ${path.relative(out, full)}`);
    }
    if ((await stat(full)).isDirectory()) await walk(full);
  }
}
await walk(out);

console.log(`Built ${path.relative(root, out)}/ with pre-rendered CV (${html.length} bytes index.html)`);
