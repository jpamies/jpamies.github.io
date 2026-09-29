import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');

execFileSync(process.execPath, [path.join(root, 'scripts', 'build.mjs')], { cwd: root, stdio: 'pipe' });
const html = readFileSync(path.join(dist, 'index.html'), 'utf8');

test('build pre-renders the CV and JSON-LD', () => {
  assert.match(html, /<h1>Jordi Pàmies<\/h1>/);
  assert.match(html, /<script type="application\/ld\+json">\{"@context":"https:\/\/schema.org"/);
  assert.doesNotMatch(html, /<!-- JSONLD -->/);
});

test('CSP meta is present and strict', () => {
  const csp = html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/)[1];
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /script-src 'self'/);
  assert.match(csp, /object-src 'none'/);
  assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval/);
});

test('only inline script is the JSON-LD data block', () => {
  const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>/g)].map((m) => m[1]);
  assert.deepEqual(inline, [' type="application/ld+json"']);
});

test('dist contains the Pages essentials', () => {
  for (const f of ['index.html', '404.html', 'CNAME', '.nojekyll', 'robots.txt', 'sitemap.xml', 'assets/og-image.png', 'assets/fonts/OFL.txt']) {
    assert.ok(existsSync(path.join(dist, f)), f);
  }
  assert.equal(readFileSync(path.join(dist, 'CNAME'), 'utf8').trim(), 'jpamies.com');
});

test('every local asset referenced from index.html exists', () => {
  const refs = [...html.matchAll(/(?:href|src)="([^"#:]+)"/g)].map((m) => m[1]);
  for (const r of refs) assert.ok(existsSync(path.join(dist, r)), r);
});

test('no third-party requests are made by the page', () => {
  const files = [];
  const walk = (d) => readdirSync(d).forEach((n) => (statSync(path.join(d, n)).isDirectory() ? walk(path.join(d, n)) : files.push(path.join(d, n))));
  walk(path.join(dist, 'js'));
  walk(path.join(dist, 'css'));
  for (const f of files) {
    const src = readFileSync(f, 'utf8');
    assert.doesNotMatch(src, /\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|@import\s+url\(\s*['"]?https?:/, f);
  }
});
