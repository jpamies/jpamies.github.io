import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esc, cardHTML, placeHTML, binderHTML, cvHTML } from '../site/js/ui/templates.js';
import { cards, places } from '../site/js/data.js';

test('esc neutralises HTML metacharacters', () => {
  assert.equal(esc(`<img src=x onerror="alert('x')">&`), '&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;');
  assert.equal(esc(null), '');
});

test('cardHTML escapes untrusted content', () => {
  const evil = { ...cards[0], name: '<script>alert(1)</script>', flavor: '"><b>x</b>', links: { repo: 'https://e.com/"onmouseover="x' } };
  const html = cardHTML(evil);
  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /"><b>/);
  assert.doesNotMatch(html, /"onmouseover=/);
});

test('external links open safely', () => {
  const html = cvHTML() + cards.map((c) => cardHTML(c)).join('');
  const anchors = html.match(/<a [^>]*target="_blank"[^>]*>/g) || [];
  assert.ok(anchors.length > 5);
  anchors.forEach((a) => assert.match(a, /rel="noopener noreferrer"/));
});

test('templates never emit inline styles or scripts (CSP: style-src/script-src self)', () => {
  const collected = new Set(cards.map((c) => c.id));
  const html = [cvHTML(), binderHTML(collected), ...places.map((p) => placeHTML(p, collected))].join('');
  assert.doesNotMatch(html, /\sstyle=/i);
  assert.doesNotMatch(html, /<script/i);
  assert.doesNotMatch(html, /\son[a-z]+=/i);
});

test('locked cards do not leak their content', () => {
  const html = cardHTML(cards[0], { locked: true });
  assert.doesNotMatch(html, new RegExp(cards[0].name));
});

test('CV lists every role', () => {
  const html = cvHTML();
  for (const p of places.filter((x) => x.kind === 'career')) {
    for (const r of p.roles) assert.ok(html.includes(esc(r.company)), r.company);
  }
});
