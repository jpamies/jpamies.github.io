// Procedural pixel-art sprites: people, Layla the dog and card icons. No external image assets.
import { makeCanvas, rect, outline, mirror, P } from './pixel.js';

export const LOOKS = {
  player: { hair: P.hair, shirt: P.sky, shade: P.blue, pants: P.navy, shoes: P.ink, skin: P.skin },
  shiny: { hair: '#c98a14', shirt: P.yellow, shade: '#e0a936', pants: P.orange, shoes: P.plum, skin: P.skin },
  guide: { hair: P.silver, shirt: P.green, shade: P.teal, pants: P.brown, shoes: P.ink, skin: P.skinShade },
  dev: { hair: P.orange, shirt: P.steel, shade: P.ink, pants: P.slate, shoes: P.white, skin: P.skin },
  recruiter: { hair: P.yellow, shirt: P.plum, shade: '#43203f', pants: P.ink, shoes: P.red, skin: P.skin },
  kid: { hair: P.red, shirt: P.red, shade: '#8c2f40', pants: P.blue, shoes: P.white, skin: P.skin, cap: true },
};

function personRight(ctx, l, frame) {
  rect(ctx, l.hair, 5, 1, 7, 2);
  rect(ctx, l.hair, 4, 3, 8, 2);
  rect(ctx, l.skin, 7, 5, 5, 3);
  rect(ctx, l.hair, 4, 5, 3, 2);
  rect(ctx, l.skin, 12, 6, 1, 1);
  rect(ctx, P.ink, 10, 6, 1, 1);
  if (l.cap) {
    rect(ctx, l.hair, 4, 1, 8, 3);
    rect(ctx, l.hair, 11, 3, 3, 1);
  }
  rect(ctx, l.shirt, 5, 8, 6, 4);
  const armX = frame === 0 ? 7 : 8;
  rect(ctx, l.shade, armX, 8, 2, 3);
  rect(ctx, l.skin, armX, 11, 2, 1);
  rect(ctx, l.pants, 5, 12, 6, 2);
  if (frame === 0) {
    rect(ctx, l.pants, 6, 14, 4, 1);
    rect(ctx, l.shoes, 6, 15, 5, 1);
  } else {
    rect(ctx, l.pants, 5, 14, 2, 1);
    rect(ctx, l.shoes, 4, 15, 2, 1);
    rect(ctx, l.pants, 9, 14, 2, 1);
    rect(ctx, l.shoes, 10, 15, 2, 1);
  }
}

function personFront(ctx, l, frame, back) {
  rect(ctx, l.hair, 4, 1, 8, 2);
  rect(ctx, l.hair, 3, 3, 10, 2);
  if (back) {
    rect(ctx, l.hair, 3, 5, 10, 2);
    rect(ctx, l.hair, 4, 7, 8, 1);
  } else {
    rect(ctx, l.skin, 4, 5, 8, 3);
    rect(ctx, l.hair, 3, 5, 1, 2);
    rect(ctx, l.hair, 12, 5, 1, 2);
    rect(ctx, P.ink, 6, 6, 1, 1);
    rect(ctx, P.ink, 9, 6, 1, 1);
    if (l.cap) rect(ctx, l.hair, 3, 4, 10, 1);
  }
  if (l.cap) rect(ctx, l.hair, 4, 0, 8, 1);
  rect(ctx, l.shirt, 4, 8, 8, 4);
  rect(ctx, l.shade, 4, 11, 8, 1);
  if (!back) rect(ctx, P.white, 7, 8, 2, 1);
  rect(ctx, l.shirt, 3, 8, 1, 3);
  rect(ctx, l.shirt, 12, 8, 1, 3);
  rect(ctx, l.skin, 3, 11, 1, 1);
  rect(ctx, l.skin, 12, 11, 1, 1);
  rect(ctx, l.pants, 4, 12, 8, 2);
  const leftUp = frame === 1;
  const rightUp = frame === 2;
  rect(ctx, l.pants, 5, 14, 2, leftUp ? 0 : 1);
  rect(ctx, l.shoes, 5, leftUp ? 14 : 15, 2, 1);
  rect(ctx, l.pants, 9, 14, 2, rightUp ? 0 : 1);
  rect(ctx, l.shoes, 9, rightUp ? 14 : 15, 2, 1);
}

// Returns { down: [f0,f1,f2], up: [...], left: [...], right: [...] } of 16x16 canvases.
export function buildPerson(lookName) {
  const l = LOOKS[lookName] || LOOKS.player;
  const frames = { down: [], up: [], left: [], right: [] };
  for (let f = 0; f < 3; f++) {
    const [d, dc] = makeCanvas(16, 16);
    personFront(dc, l, f, false);
    frames.down.push(outline(d));
    const [u, uc] = makeCanvas(16, 16);
    personFront(uc, l, f, true);
    frames.up.push(outline(u));
    const [r, rc] = makeCanvas(16, 16);
    personRight(rc, l, f === 0 ? 0 : 1);
    outline(r);
    frames.right.push(r);
    frames.left.push(mirror(r));
  }
  return frames;
}

export function buildDog() {
  const fur = '#c8894d';
  const shade = '#9c6534';
  const frames = { right: [], left: [] };
  for (let f = 0; f < 3; f++) {
    const [c, ctx] = makeCanvas(16, 16);
    rect(ctx, fur, 3, 8, 8, 4);
    rect(ctx, shade, 3, 11, 8, 1);
    rect(ctx, fur, 10, 5, 4, 4);
    rect(ctx, fur, 14, 7, 1, 2);
    rect(ctx, shade, 10, 4, 2, 3);
    rect(ctx, P.ink, 12, 6, 1, 1);
    rect(ctx, P.ink, 14, 7, 1, 1);
    rect(ctx, P.red, 10, 9, 2, 1);
    const wag = f === 1 ? 0 : 1;
    rect(ctx, fur, 2, 6 + wag, 1, 3);
    rect(ctx, fur, 1, 5 + wag, 1, 2);
    const legs = f === 0 ? [4, 6, 8, 10] : f === 1 ? [3, 6, 9, 10] : [5, 6, 8, 11];
    legs.forEach((x) => rect(ctx, shade, x, 12, 1, 3));
    outline(c);
    frames.right.push(c);
    frames.left.push(mirror(c));
  }
  frames.down = frames.right;
  frames.up = frames.left;
  return frames;
}

function circ(ctx, color, cx, cy, r, inner = -1) {
  ctx.fillStyle = color;
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (d <= r && d > inner) ctx.fillRect(x, y, 1, 1);
    }
  }
}

const ICONS = {
  desk(c) {
    rect(c, P.steel, 3, 2, 10, 8);
    rect(c, P.sky, 4, 3, 8, 6);
    rect(c, P.white, 5, 4, 3, 1);
    rect(c, P.slate, 7, 10, 2, 2);
    rect(c, P.wood, 1, 12, 14, 2);
    rect(c, P.silver, 4, 11, 8, 1);
  },
  tv(c) {
    rect(c, P.ink, 1, 1, 14, 10);
    const bars = [P.red, P.orange, P.yellow, P.green, P.sky, P.blue];
    bars.forEach((b, i) => rect(c, b, 2 + i * 2, 2, 2, 8));
    rect(c, P.slate, 7, 11, 2, 4);
  },
  busstop(c) {
    rect(c, P.navy, 1, 2, 14, 2);
    rect(c, P.slate, 2, 4, 1, 11);
    rect(c, P.slate, 13, 4, 1, 11);
    rect(c, P.cyan, 4, 5, 7, 6);
    rect(c, P.white, 5, 6, 3, 1);
    rect(c, P.wood, 3, 12, 10, 1);
  },
  chip(c) {
    rect(c, P.green, 2, 3, 12, 10);
    for (let i = 0; i < 5; i++) rect(c, P.yellow, 3 + i * 2, 4, 1, 1);
    rect(c, P.ink, 6, 7, 4, 4);
    rect(c, P.silver, 11, 9, 3, 3);
    rect(c, P.red, 4, 9, 1, 1);
  },
  server(c) {
    rect(c, P.steel, 3, 1, 10, 14);
    for (let i = 0; i < 4; i++) {
      rect(c, P.slate, 4, 2 + i * 3, 8, 2);
      rect(c, i % 2 ? P.lime : P.cyan, 5, 3 + i * 3, 1, 1);
    }
  },
  lighthouse(c) {
    rect(c, P.yellow, 6, 1, 4, 3);
    rect(c, P.ink, 5, 4, 6, 1);
    for (let y = 5; y < 14; y++) {
      const w = 4 + Math.floor((y - 5) / 3);
      rect(c, Math.floor((y - 5) / 2) % 2 ? P.white : P.red, 8 - Math.ceil(w / 2), y, w, 1);
    }
    rect(c, P.slate, 3, 14, 10, 2);
  },
  cloud(c) {
    rect(c, P.white, 3, 7, 10, 5);
    rect(c, P.white, 5, 5, 5, 2);
    rect(c, P.white, 10, 6, 2, 1);
    rect(c, P.silver, 3, 11, 10, 1);
    rect(c, P.orange, 5, 13, 6, 1);
    rect(c, P.orange, 11, 12, 1, 1);
  },
  helm(c) {
    circ(c, P.blue, 8, 8, 6, 4);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      rect(c, P.blue, Math.round(8 + Math.cos(a) * 6.5) - 1, Math.round(8 + Math.sin(a) * 6.5) - 1, 2, 2);
      for (let r = 1; r < 5; r++) rect(c, P.white, Math.floor(8 + Math.cos(a) * r), Math.floor(8 + Math.sin(a) * r), 1, 1);
    }
    circ(c, P.white, 8, 8, 1.6);
  },
  gear(c) {
    circ(c, P.silver, 8, 8, 5);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      rect(c, P.silver, Math.round(8 + Math.cos(a) * 6) - 1, Math.round(8 + Math.sin(a) * 6) - 1, 2, 2);
    }
    circ(c, P.orange, 8, 8, 2.5);
  },
  windows(c) {
    rect(c, P.msRed, 1, 1, 6, 6);
    rect(c, P.msGreen, 9, 1, 6, 6);
    rect(c, P.msBlue, 1, 9, 6, 6);
    rect(c, P.msYellow, 9, 9, 6, 6);
  },
  robot(c) {
    rect(c, P.red, 7, 0, 2, 2);
    rect(c, P.slate, 7, 2, 2, 2);
    rect(c, P.silver, 3, 4, 10, 9);
    rect(c, P.cyan, 5, 7, 2, 2);
    rect(c, P.cyan, 9, 7, 2, 2);
    rect(c, P.ink, 6, 11, 4, 1);
    rect(c, P.slate, 2, 7, 1, 3);
    rect(c, P.slate, 13, 7, 1, 3);
  },
  shield(c) {
    rect(c, P.blue, 3, 2, 10, 7);
    rect(c, P.blue, 4, 9, 8, 2);
    rect(c, P.blue, 5, 11, 6, 2);
    rect(c, P.blue, 7, 13, 2, 1);
    rect(c, P.yellow, 7, 3, 2, 9);
    rect(c, P.yellow, 4, 6, 8, 2);
  },
  lock(c) {
    rect(c, P.silver, 5, 2, 6, 1);
    rect(c, P.silver, 4, 3, 1, 4);
    rect(c, P.silver, 11, 3, 1, 4);
    rect(c, P.yellow, 3, 7, 10, 8);
    rect(c, P.ink, 7, 9, 2, 2);
    rect(c, P.ink, 7, 11, 2, 2);
  },
  trophy(c) {
    rect(c, P.yellow, 4, 2, 8, 6);
    rect(c, P.yellow, 5, 8, 6, 1);
    rect(c, P.yellow, 7, 9, 2, 2);
    rect(c, P.brown, 5, 11, 6, 3);
    rect(c, P.yellow, 2, 3, 2, 1);
    rect(c, P.yellow, 2, 4, 1, 2);
    rect(c, P.yellow, 12, 3, 2, 1);
    rect(c, P.yellow, 13, 4, 1, 2);
    rect(c, P.white, 5, 3, 1, 3);
  },
  album(c) {
    rect(c, P.red, 2, 1, 12, 14);
    rect(c, P.plum, 2, 1, 2, 14);
    rect(c, P.white, 6, 3, 3, 4);
    rect(c, P.white, 10, 3, 3, 4);
    rect(c, P.white, 6, 9, 3, 4);
    rect(c, P.yellow, 10, 9, 3, 4);
  },
  party(c) {
    circ(c, P.white, 8, 9, 5.5);
    rect(c, P.ink, 7, 6, 2, 2);
    rect(c, P.ink, 4, 9, 2, 2);
    rect(c, P.ink, 10, 9, 2, 2);
    rect(c, P.ink, 7, 12, 2, 1);
    rect(c, P.red, 2, 1, 1, 1);
    rect(c, P.yellow, 13, 2, 1, 1);
    rect(c, P.cyan, 11, 0, 1, 1);
  },
  book(c) {
    rect(c, P.red, 2, 2, 12, 12);
    rect(c, P.white, 2, 8, 12, 1);
    circ(c, P.white, 8, 8.5, 3);
    circ(c, P.ink, 8, 8.5, 1.4);
    rect(c, P.white, 12, 3, 2, 10);
  },
  story(c) {
    rect(c, P.white, 1, 5, 7, 9);
    rect(c, P.white, 8, 5, 7, 9);
    rect(c, P.silver, 7, 5, 2, 9);
    for (let i = 0; i < 3; i++) {
      rect(c, P.slate, 2, 7 + i * 2, 4, 1);
      rect(c, P.slate, 10, 7 + i * 2, 4, 1);
    }
    rect(c, P.yellow, 3, 1, 1, 2);
    rect(c, P.yellow, 12, 2, 1, 1);
    rect(c, P.cyan, 8, 0, 1, 2);
  },
  star(c) {
    const rows = ['.......##.......', '......####......', '......####......', '.##############.', '..############..', '...##########...', '....########....', '....###..###....', '...###....###...', '...##......##...'];
    rows.forEach((r, y) => [...r].forEach((ch, x) => ch === '#' && rect(c, P.yellow, x, y + 3, 1, 1)));
  },
};

const iconCache = new Map();

export function buildIcon(name) {
  if (iconCache.has(name)) return iconCache.get(name);
  let canvas;
  if (name === 'dog') canvas = buildDog().right[0];
  else if (name === 'hero') canvas = buildPerson('player').down[0];
  else {
    const [c, ctx] = makeCanvas(16, 16);
    (ICONS[name] || ICONS.star)(ctx);
    canvas = outline(c);
  }
  iconCache.set(name, canvas);
  return canvas;
}

export const iconNames = [...Object.keys(ICONS), 'dog', 'hero'];
