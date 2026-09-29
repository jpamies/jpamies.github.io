// World model: tile map, buildings, props, collision and pathfinding.
// Pure logic (no DOM) so it can be unit-tested with `node --test`.
import { npcs, signs } from '../data.js';

export const TILE = 16;
export const W = 48;
export const H = 36;

export const T = {
  GRASS: 0,
  FLOWERS: 1,
  PATH: 2,
  SAND: 3,
  WATER: 4,
  TREE: 5,
  PLAZA: 6,
  DOCK: 7,
  TALL: 8,
};

const SOLID_TILES = new Set([T.WATER, T.TREE]);

// Each building is a place from data.js. Door is on the bottom row at x + door.
export const buildings = [
  { id: 'origins', style: 'origins', x: 4, y: 21, w: 7, h: 5, door: 3 },
  { id: 'admira', style: 'admira', x: 3, y: 11, w: 7, h: 6, door: 3 },
  { id: 'costaisa', style: 'costaisa', x: 12, y: 3, w: 6, h: 5, door: 2 },
  { id: 'madcollective', style: 'lighthouse', x: 21, y: 2, w: 5, h: 7, door: 2 },
  { id: 'aws', style: 'aws', x: 29, y: 3, w: 9, h: 5, door: 4 },
  { id: 'microsoft', style: 'microsoft', x: 37, y: 12, w: 9, h: 7, door: 4 },
  { id: 'stadium', style: 'stadium', x: 12, y: 19, w: 8, h: 6, door: 4 },
  { id: 'library', style: 'library', x: 37, y: 22, w: 6, h: 4, door: 3 },
  { id: 'harbor', style: 'harbor', x: 29, y: 23, w: 6, h: 4, door: 2 },
].map((b) => ({ ...b, doorX: b.x + b.door, doorY: b.y + b.h - 1 }));

// Decorative solids.
export const props = [
  { kind: 'sagrada', x: 40, y: 2, w: 6, h: 7 },
  { kind: 'fountain', x: 23, y: 15, w: 2, h: 2 },
  { kind: 'lamp', x: 20, y: 13, w: 1, h: 1 },
  { kind: 'lamp', x: 27, y: 13, w: 1, h: 1 },
  { kind: 'lamp', x: 20, y: 20, w: 1, h: 1 },
  { kind: 'lamp', x: 27, y: 20, w: 1, h: 1 },
  { kind: 'containers', x: 30, y: 32, w: 1, h: 2 },
  { kind: 'containers', x: 32, y: 31, w: 1, h: 2 },
  { kind: 'crane', x: 33, y: 29, w: 1, h: 2 },
  { kind: 'boat', x: 37, y: 32, w: 3, h: 2 },
  { kind: 'boat', x: 12, y: 33, w: 3, h: 2 },
];

export const PLAZA = { x: 20, y: 13, w: 8, h: 8 };
export const SPAWN = { x: 23, y: 18 };

// Roads as polylines of tile coordinates (horizontal/vertical segments only).
const roads = [
  // Career road: Chapter I (south-west) up to the northern avenue.
  [[7, 26], [16, 26], [16, 27], [40, 27], [40, 26]],
  [[11, 26], [11, 17], [6, 17]],
  [[11, 18], [20, 18]],
  [[11, 17], [11, 10], [41, 10]],
  [[14, 8], [14, 10]],
  [[23, 9], [23, 10]],
  [[33, 8], [33, 10]],
  [[21, 10], [21, 13]],
  [[26, 10], [26, 13]],
  [[36, 10], [36, 20], [28, 20]],
  [[41, 19], [41, 20], [36, 20]],
  [[28, 20], [28, 27]],
  [[16, 25], [16, 26]],
  [[31, 27], [31, 29]],
];

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const inRect = (x, y, r, pad = 0) => x >= r.x - pad && x < r.x + r.w + pad && y >= r.y - pad && y < r.y + r.h + pad;

function carve(map, poly) {
  for (let i = 0; i < poly.length - 1; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[i + 1];
    const dx = Math.sign(x2 - x1);
    const dy = Math.sign(y2 - y1);
    let x = x1;
    let y = y1;
    map[y][x] = T.PATH;
    while (x !== x2 || y !== y2) {
      x += dx;
      y += dy;
      map[y][x] = T.PATH;
    }
  }
}

export function coastY(x) {
  return 29 + (Math.sin(x * 0.45) > 0.6 ? 1 : 0);
}

export function buildMap(seed = 1882) {
  const rnd = mulberry32(seed);
  const map = Array.from({ length: H }, () => new Array(W).fill(T.GRASS));

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const c = coastY(x);
      if (y >= c + 2) map[y][x] = T.WATER;
      else if (y >= c) map[y][x] = T.SAND;
      else if (x <= 1 || x >= W - 2 || y <= 1) map[y][x] = T.TREE;
    }
  }

  for (let y = PLAZA.y; y < PLAZA.y + PLAZA.h; y++) {
    for (let x = PLAZA.x; x < PLAZA.x + PLAZA.w; x++) map[y][x] = T.PLAZA;
  }

  roads.forEach((r) => carve(map, r));

  // Docks over the water.
  for (let y = 30; y < H - 1; y++) for (let x = 30; x <= 32; x++) map[y][x] = T.DOCK;

  const keepClear = (x, y) =>
    buildings.some((b) => inRect(x, y, b, 1)) ||
    props.some((p) => inRect(x, y, p, 1)) ||
    inRect(x, y, PLAZA, 1) ||
    npcs.some((n) => Math.abs(n.x - x) + Math.abs(n.y - y) <= 2) ||
    signs.some((s) => Math.abs(s.x - x) + Math.abs(s.y - y) <= 1) ||
    (x === SPAWN.x && y === SPAWN.y);

  for (let y = 2; y < H; y++) {
    for (let x = 2; x < W - 2; x++) {
      if (map[y][x] !== T.GRASS) continue;
      const nearPath = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].some(([dx, dy]) => map[y + dy]?.[x + dx] === T.PATH);
      const r = rnd();
      if (!keepClear(x, y) && !nearPath && y < coastY(x) - 1 && r < 0.13) map[y][x] = T.TREE;
      else if (r > 0.9) map[y][x] = T.FLOWERS;
      else if (r > 0.84) map[y][x] = T.TALL;
    }
  }
  return map;
}

export function buildingAt(x, y) {
  return buildings.find((b) => inRect(x, y, b)) || null;
}

export function propAt(x, y) {
  return props.find((p) => inRect(x, y, p)) || null;
}

export function signAt(x, y) {
  return signs.find((s) => s.x === x && s.y === y) || null;
}

export function doorAt(x, y) {
  return buildings.find((b) => b.doorX === x && b.doorY === y) || null;
}

// Static solidity: map tiles, buildings (doors included — entering is an action), props and signs.
export function isSolid(map, x, y) {
  if (x < 0 || y < 0 || x >= W || y >= H) return true;
  if (SOLID_TILES.has(map[y][x])) return true;
  if (buildingAt(x, y)) return true;
  if (propAt(x, y)) return true;
  if (signAt(x, y)) return true;
  return false;
}

// Tiles where wandering NPCs are allowed: never on roads, so they can never block the way.
export function isWanderable(map, x, y) {
  if (isSolid(map, x, y)) return false;
  const t = map[y][x];
  return t === T.GRASS || t === T.FLOWERS || t === T.TALL || t === T.PLAZA;
}

// Breadth-first search on the tile grid. `blocked(x, y)` adds dynamic obstacles.
export function findPath(map, from, to, blocked = () => false) {
  if (from.x === to.x && from.y === to.y) return [];
  const key = (x, y) => y * W + x;
  const prev = new Map([[key(from.x, from.y), null]]);
  const queue = [[from.x, from.y]];
  const dirs = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ];
  while (queue.length) {
    const [cx, cy] = queue.shift();
    if (cx === to.x && cy === to.y) {
      const path = [];
      let k = key(cx, cy);
      while (k !== key(from.x, from.y)) {
        path.unshift({ x: k % W, y: Math.floor(k / W) });
        k = prev.get(k);
      }
      return path;
    }
    for (const [dx, dy] of dirs) {
      const nx = cx + dx;
      const ny = cy + dy;
      const k = key(nx, ny);
      if (prev.has(k)) continue;
      if (isSolid(map, nx, ny) || blocked(nx, ny)) continue;
      prev.set(k, key(cx, cy));
      queue.push([nx, ny]);
    }
  }
  return null;
}

export const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function faceTowards(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

// Walkable tiles next to (x, y), closest to `near` first.
export function neighboursOf(map, x, y, near, blocked = () => false) {
  return Object.values(DIRS)
    .map((d) => ({ x: x + d.x, y: y + d.y }))
    .filter((p) => !isSolid(map, p.x, p.y) && !blocked(p.x, p.y))
    .sort((a, b) => Math.abs(a.x - near.x) + Math.abs(a.y - near.y) - (Math.abs(b.x - near.x) + Math.abs(b.y - near.y)));
}
