import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  W,
  H,
  T,
  buildMap,
  buildings,
  props,
  SPAWN,
  isSolid,
  isWanderable,
  findPath,
  buildingAt,
  doorAt,
  neighboursOf,
} from '../site/js/engine/world.js';
import { places, npcs, signs } from '../site/js/data.js';

const map = buildMap();

test('map has the expected size', () => {
  assert.equal(map.length, H);
  map.forEach((row) => assert.equal(row.length, W));
});

test('map generation is deterministic', () => {
  assert.deepEqual(buildMap(), map);
});

test('every place has exactly one building and vice versa', () => {
  assert.deepEqual(buildings.map((b) => b.id).sort(), places.map((p) => p.id).sort());
});

test('buildings and props do not overlap each other', () => {
  const owners = new Map();
  for (const r of [...buildings, ...props]) {
    for (let y = r.y; y < r.y + r.h; y++) {
      for (let x = r.x; x < r.x + r.w; x++) {
        const k = `${x},${y}`;
        assert.ok(!owners.has(k), `${r.id || r.kind} overlaps ${owners.get(k)} at ${k}`);
        owners.set(k, r.id || r.kind);
      }
    }
  }
});

test('spawn is walkable', () => {
  assert.equal(isSolid(map, SPAWN.x, SPAWN.y), false);
});

test('every door is reachable from spawn', () => {
  for (const b of buildings) {
    assert.equal(doorAt(b.doorX, b.doorY), b);
    const front = { x: b.doorX, y: b.doorY + 1 };
    assert.equal(isSolid(map, front.x, front.y), false, `${b.id} door front is blocked`);
    assert.ok(findPath(map, SPAWN, front), `${b.id} unreachable`);
  }
});

test('every sign and NPC can be reached', () => {
  for (const s of [...signs, ...npcs]) {
    const spots = neighboursOf(map, s.x, s.y, SPAWN);
    assert.ok(spots.some((p) => findPath(map, SPAWN, p)), `${s.id} unreachable`);
  }
});

test('NPCs start on wanderable tiles, never on roads', () => {
  for (const n of npcs) {
    assert.ok(isWanderable(map, n.x, n.y), `${n.id} starts on a blocked tile`);
    assert.notEqual(map[n.y][n.x], T.PATH);
  }
});

test('signs are not inside buildings', () => {
  for (const s of signs) assert.equal(buildingAt(s.x, s.y), null);
});

test('findPath returns contiguous steps', () => {
  const b = buildings[0];
  const path = findPath(map, SPAWN, { x: b.doorX, y: b.doorY + 1 });
  let prev = SPAWN;
  for (const step of path) {
    assert.equal(Math.abs(step.x - prev.x) + Math.abs(step.y - prev.y), 1);
    assert.equal(isSolid(map, step.x, step.y), false);
    prev = step;
  }
});
