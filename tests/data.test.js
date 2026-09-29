import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profile, places, cards, cardById, npcs, signs, badges, types, rarities, logoNames } from '../site/js/data.js';
import { iconNames } from '../site/js/engine/sprites.js';
import { glyphNames } from '../site/js/engine/font.js';
import { logoIds } from '../site/js/engine/logos.js';

const isHttps = (u) => {
  const url = new URL(u);
  return url.protocol === 'https:';
};

test('ids are unique', () => {
  for (const list of [places, cards, npcs, signs, badges]) {
    const ids = list.map((x) => x.id);
    assert.equal(new Set(ids).size, ids.length);
  }
});

test('every card referenced by a place or NPC exists', () => {
  for (const p of places) p.cards.forEach((id) => assert.ok(cardById[id], `${p.id} → ${id}`));
  for (const n of npcs) if (n.card) assert.ok(cardById[n.card], `${n.id} → ${n.card}`);
});

test('every card is obtainable', () => {
  const obtainable = new Set([...places.flatMap((p) => p.cards), ...npcs.filter((n) => n.card).map((n) => n.card), 'shiny', 'legend']);
  for (const c of cards) assert.ok(obtainable.has(c.id), `${c.id} can never be collected`);
});

test('cards are well-formed', () => {
  for (const c of cards) {
    assert.ok(types[c.type], `${c.id} type`);
    assert.ok(rarities[c.rarity], `${c.id} rarity`);
    assert.ok(iconNames.includes(c.icon), `${c.id} icon ${c.icon}`);
    assert.equal(c.moves.length, 2, `${c.id} moves`);
    assert.ok(Number.isInteger(c.hp) && c.hp > 0);
    for (const url of Object.values(c.links)) assert.ok(isHttps(url), `${c.id} link must be https: ${url}`);
  }
});

test('career places have roles and skills in range', () => {
  for (const p of places.filter((x) => x.kind === 'career')) {
    assert.ok(p.roles.length > 0, p.id);
    for (const s of p.skills) assert.ok(s.level > 0 && s.level <= 100, `${p.id} ${s.name}`);
    for (const b of p.badges || []) assert.ok(badges.some((x) => x.id === b), `${p.id} badge ${b}`);
  }
});

test('profile links are https', () => {
  profile.links.forEach((l) => assert.ok(isHttps(l.url)));
});

test('in-world sign font covers every building sign character', () => {
  const texts = ['IT CREW 2002', 'COSTAISA', 'MAD COLLECTIVE', 'AWS EU-SOUTH-2', 'MICROSOFT', 'STADIUM', 'KIDS LIBRARY', 'KUBE HARBOR', 'ADMIRA DIGITAL SIGNAGE', 'SMART CITY', 'UPC BARCELONATECH', 'ELISAVA'];
  for (const t of texts) for (const ch of t) assert.ok(glyphNames.includes(ch), `missing glyph ${ch}`);
});

test('every logo used by a place exists and has an accessible name', () => {
  for (const p of places) {
    for (const id of p.logos || []) {
      assert.ok(logoIds.includes(id), `${p.id} logo ${id}`);
      assert.ok(logoNames[id], `${id} needs a name`);
    }
  }
  assert.deepEqual(Object.keys(logoNames).sort(), [...logoIds].sort());
});

test('no personal contact data (emails/phones) is published', () => {
  const blob = JSON.stringify({ profile, places, cards, npcs, signs });
  assert.doesNotMatch(blob, /[\w.+-]+@[\w-]+\.[\w.]+/);
  assert.doesNotMatch(blob, /\+?\d[\d\s-]{8,}\d/);
});
