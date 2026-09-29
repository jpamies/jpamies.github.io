// Building façades, props and signposts. Static parts are cached; animated bits are drawn per frame.
import { makeCanvas, rect, outline, hash2, P } from './pixel.js';
import { drawTextCentered, textWidth } from './font.js';
import { buildIcon } from './sprites.js';
import { drawLogo, drawLogoCentered } from './logos.js';
import { TILE } from './world.js';

const cache = new Map();
const AWS_FANS = [8, 30, 102, 124];

function signBoard(ctx, text, cx, y, bg = P.wood, fg = P.white) {
  const w = textWidth(text) + 6;
  const x = Math.round(cx - w / 2);
  rect(ctx, P.ink, x - 1, y - 1, w + 2, 9);
  rect(ctx, bg, x, y, w, 7);
  drawTextCentered(ctx, text, cx, y + 1, fg);
}

function door(ctx, b, color = P.brown) {
  const x = b.door * TILE + 3;
  const y = b.h * TILE - 14;
  rect(ctx, P.ink, x - 1, y - 1, 12, 15);
  rect(ctx, color, x, y, 10, 14);
  rect(ctx, 'rgba(0,0,0,0.25)', x, y, 10, 2);
  rect(ctx, P.yellow, x + 7, y + 7, 1, 2);
  rect(ctx, P.slate, x - 2, b.h * TILE - 1, 14, 1);
}

// Evenly spaced windows on every tile column except the door column.
function windowGrid(ctx, b, fromRow, opts = {}) {
  const wins = [];
  const { glass = P.sky, frame = P.white, skipCols = [] } = opts;
  for (let row = fromRow; row < b.h; row++) {
    for (let col = 0; col < b.w; col++) {
      if (col === b.door && row === b.h - 1) continue;
      if (skipCols.includes(col)) continue;
      const x = col * TILE + 3;
      const y = row * TILE + 3;
      rect(ctx, frame, x - 1, y - 1, 12, 11);
      rect(ctx, glass, x, y, 10, 9);
      rect(ctx, P.white, x + 1, y + 1, 3, 1);
      rect(ctx, frame, x + 4, y, 1, 9);
      wins.push({ x, y, w: 10, h: 9 });
    }
  }
  return wins;
}

function roof(ctx, b, color, shade, h) {
  const w = b.w * TILE;
  rect(ctx, color, 0, 0, w, h);
  for (let y = 3; y < h; y += 4) rect(ctx, shade, 0, y, w, 1);
  rect(ctx, P.ink, 0, h, w, 1);
}

const STYLES = {
  university(ctx, b) {
    const w = b.w * TILE;
    const h = b.h * TILE;
    const stone = '#efe9dc';
    const cx = w / 2;
    for (let y = 2; y < 24; y++) {
      const half = Math.min(w / 2, Math.round((y - 2) * 2.6));
      rect(ctx, P.ink, cx - half - 1, y, half * 2 + 2, 1);
      if (half > 1) rect(ctx, y % 4 === 0 ? '#ddd5c4' : stone, cx - half, y, half * 2, 1);
    }
    rect(ctx, P.ink, 0, 24, w, 1);
    rect(ctx, stone, 0, 25, w, 7);
    rect(ctx, P.ink, 0, 32, w, 1);
    drawTextCentered(ctx, 'UPC BARCELONATECH', cx, 26, P.slate);
    rect(ctx, '#e9e4d8', 2, 33, w - 4, h - 39);
    const wins = [];
    [14, 32, 74, 92].forEach((x) => {
      rect(ctx, P.ink, x - 1, 39, 8, 26);
      rect(ctx, P.sky, x, 40, 6, 24);
      rect(ctx, P.white, x + 1, 41, 1, 8);
      wins.push({ x, y: 40, w: 6, h: 24 });
    });
    [6, 24, 42, 64, 82, 100].forEach((x) => {
      rect(ctx, P.ink, x - 1, 33, 8, h - 39);
      rect(ctx, P.white, x, 33, 6, h - 39);
      rect(ctx, '#d8d2c4', x + 4, 33, 2, h - 39);
      rect(ctx, stone, x - 1, 33, 8, 3);
    });
    rect(ctx, P.stoneShade, 0, h - 6, w, 3);
    rect(ctx, P.stone, 0, h - 3, w, 3);
    door(ctx, b, P.navy);
    drawLogoCentered(ctx, 'upc', cx, 9);
    return wins;
  },
  origins(ctx, b) {
    const w = b.w * TILE;
    const h = b.h * TILE;
    rect(ctx, '#e8dcc0', 1, 22, w - 2, h - 22);
    roof(ctx, b, P.navy, P.blue, 22);
    rect(ctx, P.slate, 98, 2, 2, 8);
    rect(ctx, P.silver, 94, 0, 12, 4);
    const wins = windowGrid(ctx, b, 2);
    rect(ctx, P.stoneShade, 1, h - 3, w - 2, 3);
    door(ctx, b);
    signBoard(ctx, 'IT CREW 2002', w / 2, 24);
    drawLogo(ctx, 'elisava', 3, 6);
    drawLogo(ctx, 'sabadell', 38, 5);
    drawLogo(ctx, 'tsystems', 53, 5);
    return wins;
  },
  admira(ctx, b) {
    const w = b.w * TILE;
    const h = b.h * TILE;
    rect(ctx, '#dfe6ee', 1, 8, w - 2, h - 8);
    rect(ctx, P.steel, 0, 0, w, 8);
    rect(ctx, P.ink, 0, 8, w, 1);
    rect(ctx, P.ink, 7, 13, w - 14, 36);
    const wins = windowGrid(ctx, b, 3);
    rect(ctx, P.stoneShade, 1, h - 3, w - 2, 3);
    door(ctx, b, P.slate);
    drawLogoCentered(ctx, 'admira', w / 2, 1);
    return wins;
  },
  costaisa(ctx, b) {
    const w = b.w * TILE;
    const h = b.h * TILE;
    rect(ctx, '#c8745a', 1, 20, w - 2, h - 20);
    for (let y = 22; y < h; y += 4) {
      for (let x = (y / 4) % 2 ? 1 : 5; x < w - 2; x += 8) rect(ctx, '#a95c45', x, y, 1, 3);
      rect(ctx, '#a95c45', 1, y + 3, w - 2, 1);
    }
    roof(ctx, b, P.red, '#8c2f40', 20);
    rect(ctx, P.slate, 72, 0, 8, 12);
    rect(ctx, P.ink, 72, 0, 8, 1);
    const wins = windowGrid(ctx, b, 2);
    door(ctx, b);
    drawLogoCentered(ctx, 'costaisa', w / 2, 21);
    return wins;
  },
  lighthouse(ctx, b) {
    const w = b.w * TILE;
    const h = b.h * TILE;
    const cx = w / 2;
    for (let y = 16; y < 84; y++) {
      const half = 10 + Math.floor((y - 16) / 10);
      rect(ctx, Math.floor((y - 16) / 10) % 2 ? P.white : P.red, cx - half, y, half * 2, 1);
      rect(ctx, P.ink, cx - half - 1, y, 1, 1);
      rect(ctx, P.ink, cx + half, y, 1, 1);
    }
    rect(ctx, P.ink, cx - 12, 14, 24, 2);
    rect(ctx, P.steel, cx - 8, 4, 16, 10);
    rect(ctx, P.ink, cx - 10, 2, 20, 2);
    rect(ctx, P.red, cx - 6, 0, 12, 2);
    rect(ctx, P.cyan, cx - 3, 40, 6, 8);
    rect(ctx, P.cyan, cx - 3, 60, 6, 8);
    rect(ctx, P.white, 2, 84, w - 4, h - 84);
    rect(ctx, P.red, 0, 80, w, 6);
    rect(ctx, P.ink, 0, 86, w, 1);
    door(ctx, b, P.navy);
    drawLogoCentered(ctx, 'madcollective', cx, 88);
    return [
      { x: cx - 3, y: 40, w: 6, h: 8 },
      { x: cx - 3, y: 60, w: 6, h: 8 },
    ];
  },
  aws(ctx, b) {
    const w = b.w * TILE;
    const h = b.h * TILE;
    rect(ctx, '#3a4556', 1, 16, w - 2, h - 16);
    rect(ctx, P.awsInk, 0, 0, w, 16);
    rect(ctx, P.ink, 0, 16, w, 1);
    for (const fx of AWS_FANS) {
      rect(ctx, P.slate, fx, 3, 12, 10);
      rect(ctx, P.ink, fx + 1, 4, 10, 8);
    }
    drawLogoCentered(ctx, 'aws', w / 2, 2);
    rect(ctx, P.awsOrange, 1, 17, w - 2, 3);
    const racks = [];
    for (let col = 0; col < b.w; col++) {
      if (col === b.door) continue;
      for (let row = 0; row < 2; row++) {
        const x = col * TILE + 3;
        const y = 26 + row * 24;
        rect(ctx, P.ink, x - 1, y - 1, 12, 20);
        rect(ctx, P.steel, x, y, 10, 18);
        for (let u = 0; u < 4; u++) rect(ctx, P.slate, x + 1, y + 1 + u * 4, 8, 3);
        racks.push({ x, y, w: 10, h: 18 });
      }
    }
    door(ctx, b, P.awsInk);
    signBoard(ctx, 'AWS EU-SOUTH-2', w / 2, 20, P.awsInk, P.awsOrange);
    return racks;
  },
  microsoft(ctx, b) {
    const w = b.w * TILE;
    const h = b.h * TILE;
    rect(ctx, '#9fd3f0', 1, 10, w - 2, h - 10);
    for (let x = 1; x < w; x += 12) rect(ctx, '#6fb3dc', x, 10, 1, h - 10);
    for (let y = 10; y < h; y += 10) rect(ctx, '#6fb3dc', 1, y, w - 2, 1);
    for (let i = 0; i < 5; i++) {
      for (let k = 0; k < 18; k++) {
        const x = 10 + i * 30 + k;
        const y = h - 8 - k * 4;
        if (x < w - 2 && y > 12) rect(ctx, 'rgba(255,255,255,0.45)', x, y, 1, 3);
      }
    }
    rect(ctx, P.slate, 0, 0, w, 10);
    rect(ctx, P.ink, 0, 10, w, 1);
    const cx = w / 2;
    rect(ctx, P.white, cx - 36, 14, 72, 16);
    rect(ctx, P.msRed, cx - 33, 16, 5, 5);
    rect(ctx, P.msGreen, cx - 27, 16, 5, 5);
    rect(ctx, P.msBlue, cx - 33, 22, 5, 5);
    rect(ctx, P.msYellow, cx - 27, 22, 5, 5);
    drawTextCentered(ctx, 'MICROSOFT', cx + 6, 19, P.slate);
    door(ctx, b, '#5d9ec6');
    return [];
  },
  stadium(ctx, b) {
    const w = b.w * TILE;
    const h = b.h * TILE;
    rect(ctx, P.ink, 4, 3, w - 8, h - 6);
    rect(ctx, '#9aa3ad', 5, 4, w - 10, h - 8);
    rect(ctx, P.ink, 0, 10, w, h - 20);
    rect(ctx, '#9aa3ad', 1, 11, w - 2, h - 22);
    for (let y = 6; y < h - 6; y += 3) rect(ctx, '#7d8791', 5, y, w - 10, 1);
    rect(ctx, P.ink, 17, 17, w - 34, h - 36);
    for (let i = 0; i < 8; i++) rect(ctx, i % 2 ? P.green : '#46c35a', 18 + i * 11.75, 18, 12, h - 38);
    rect(ctx, P.white, 20, 20, w - 40, 1);
    rect(ctx, P.white, 20, h - 21, w - 40, 1);
    rect(ctx, P.white, 20, 20, 1, h - 40);
    rect(ctx, P.white, w - 21, 20, 1, h - 40);
    rect(ctx, P.white, w / 2, 20, 1, h - 40);
    for (let a = 0; a < 24; a++) {
      const t = (a / 24) * Math.PI * 2;
      rect(ctx, P.white, Math.round(w / 2 + Math.cos(t) * 7), Math.round(h / 2 - 1 + Math.sin(t) * 7), 1, 1);
    }
    [[2, 0], [w - 6, 0], [2, h - 14], [w - 6, h - 14]].forEach(([x, y]) => {
      rect(ctx, P.slate, x + 1, y + 4, 2, 10);
      rect(ctx, P.ink, x - 1, y, 6, 5);
      rect(ctx, P.yellow, x, y + 1, 4, 3);
    });
    door(ctx, b, P.navy);
    signBoard(ctx, 'STADIUM', w / 2, h - 26, P.green);
    return [];
  },
  library(ctx, b) {
    const w = b.w * TILE;
    const h = b.h * TILE;
    rect(ctx, '#f7c6d9', 1, 18, w - 2, h - 18);
    roof(ctx, b, '#e0533d', P.red, 18);
    const wins = windowGrid(ctx, b, 2);
    door(ctx, b, P.plum);
    signBoard(ctx, 'KIDS LIBRARY', w / 2, 19, P.plum);
    ctx.drawImage(buildIcon('book'), w / 2 - 8, 1);
    return wins;
  },
  harbor(ctx, b) {
    const w = b.w * TILE;
    const h = b.h * TILE;
    rect(ctx, P.blue, 1, 16, w - 2, h - 16);
    for (let x = 3; x < w - 2; x += 4) rect(ctx, P.navy, x, 16, 1, h - 16);
    roof(ctx, b, P.teal, '#1c5a60', 16);
    const wins = windowGrid(ctx, b, 2, { skipCols: [0, 5] });
    door(ctx, b, P.navy);
    signBoard(ctx, 'KUBE HARBOR', w / 2, 18, P.white, P.navy);
    ctx.drawImage(buildIcon('helm'), 4, 0);
    return wins;
  },
};

export function getBuildingSprite(b) {
  if (cache.has(b.id)) return cache.get(b.id);
  const [c, ctx] = makeCanvas(b.w * TILE, b.h * TILE);
  const windows = STYLES[b.style](ctx, b);
  const entry = { canvas: c, windows };
  cache.set(b.id, entry);
  return entry;
}

// Per-frame animated details. `lights` collects glow sources for the night pass.
export function drawBuildingAnim(ctx, b, ox, oy, t, night, lights) {
  const { windows } = getBuildingSprite(b);
  const w = b.w * TILE;
  const h = b.h * TILE;
  if (night) {
    windows.forEach((win, i) => {
      if (hash2(i, b.x) > 0.25) {
        rect(ctx, 'rgba(255,205,117,0.85)', ox + win.x, oy + win.y, win.w, win.h);
        lights.push({ x: ox + win.x + win.w / 2, y: oy + win.y + win.h / 2, r: 14, c: '255,205,117' });
      }
    });
  }
  switch (b.style) {
    case 'admira': {
      const colors = [P.red, P.orange, P.yellow, P.green, P.sky, P.blue, P.plum];
      const sx = ox + 8;
      const sy = oy + 14;
      const sw = w - 16;
      const phase = Math.floor(t / 1.6) % 3;
      if (phase === 0) {
        colors.forEach((c, i) => rect(ctx, c, sx + i * (sw / colors.length), sy, Math.ceil(sw / colors.length), 34));
      } else if (phase === 1) {
        rect(ctx, P.navy, sx, sy, sw, 34);
        const text = 'ADMIRA DIGITAL SIGNAGE    ';
        const off = Math.floor(t * 30) % (text.length * 4);
        ctx.save();
        ctx.beginPath();
        ctx.rect(sx, sy, sw, 34);
        ctx.clip();
        drawTextCentered(ctx, text + text, sx + sw - off + textWidth(text), sy + 14, P.yellow);
        ctx.restore();
      } else {
        rect(ctx, P.ink, sx, sy, sw, 34);
        for (let i = 0; i < 30; i++) {
          const px = Math.floor(hash2(i, Math.floor(t * 4)) * sw);
          const py = Math.floor(hash2(Math.floor(t * 4), i) * 34);
          rect(ctx, P.cyan, sx + px, sy + py, 2, 2);
        }
        drawTextCentered(ctx, 'SMART CITY', sx + sw / 2, sy + 14, P.white);
      }
      lights.push({ x: sx + sw / 2, y: sy + 17, r: 40, c: '115,239,247' });
      break;
    }
    case 'costaisa': {
      for (let i = 0; i < 4; i++) {
        const k = (t * 0.6 + i / 4) % 1;
        const r = 2 + k * 4;
        ctx.fillStyle = `rgba(230,230,230,${0.7 - k * 0.7})`;
        ctx.fillRect(ox + 74 + Math.sin(k * 6 + i) * 3, oy - k * 22, r, r);
      }
      break;
    }
    case 'lighthouse': {
      const on = Math.sin(t * 3) > -0.3;
      rect(ctx, on ? P.yellow : P.orange, ox + w / 2 - 6, oy + 6, 12, 7);
      if (night || on) lights.push({ x: ox + w / 2, y: oy + 9, r: night ? 60 : 18, c: '255,220,120' });
      if (night) {
        const a = t * 1.2;
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#fff4b0';
        ctx.beginPath();
        ctx.moveTo(ox + w / 2, oy + 9);
        ctx.lineTo(ox + w / 2 + Math.cos(a - 0.12) * 160, oy + 9 + Math.sin(a - 0.12) * 60);
        ctx.lineTo(ox + w / 2 + Math.cos(a + 0.12) * 160, oy + 9 + Math.sin(a + 0.12) * 60);
        ctx.fill();
        ctx.restore();
      }
      break;
    }
    case 'aws': {
      windows.forEach((r, i) => {
        for (let u = 0; u < 4; u++) {
          const blink = hash2(i * 4 + u, Math.floor(t * 5)) > 0.35;
          rect(ctx, blink ? P.lime : P.teal, ox + r.x + 2, oy + r.y + 2 + u * 4, 1, 1);
          rect(ctx, blink ? P.awsOrange : P.steel, ox + r.x + 4, oy + r.y + 2 + u * 4, 1, 1);
        }
      });
      AWS_FANS.forEach((x, i) => {
        const fx = ox + x + 6;
        const fy = oy + 8;
        const a = t * 8 + i;
        rect(ctx, P.silver, fx + Math.round(Math.cos(a) * 3) - 1, fy + Math.round(Math.sin(a) * 3) - 1, 2, 2);
        rect(ctx, P.silver, fx - Math.round(Math.cos(a) * 3) - 1, fy - Math.round(Math.sin(a) * 3) - 1, 2, 2);
      });
      if (night) lights.push({ x: ox + w / 2, y: oy + h / 2, r: 50, c: '255,153,0' });
      break;
    }
    case 'microsoft': {
      if (night) {
        for (let i = 0; i < 20; i++) {
          if (hash2(i, 7) > 0.4) {
            const x = ox + 2 + (i % 12) * 12;
            const y = oy + 32 + Math.floor(i / 12) * 30 + (i % 3) * 10;
            rect(ctx, 'rgba(255,230,160,0.8)', x, y, 11, 9);
          }
        }
        lights.push({ x: ox + w / 2, y: oy + 22, r: 50, c: '160,220,255' });
      }
      const sweep = (t * 40) % (w + 60);
      ctx.save();
      ctx.beginPath();
      ctx.rect(ox + 1, oy + 32, w - 2, h - 32);
      ctx.clip();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      for (let k = 0; k < 6; k++) ctx.fillRect(ox + sweep - 30 + k, oy + 32 + k * 14, 4, 14);
      ctx.restore();
      break;
    }
    case 'stadium': {
      const crowd = [P.red, P.yellow, P.blue, P.white, P.orange, P.navy];
      for (let i = 0; i < 70; i++) {
        const ring = i % 2;
        const k = i / 70;
        let x;
        let y;
        if (k < 0.5) {
          x = 8 + (k * 2) * (w - 16);
          y = ring ? 7 : h - 9;
        } else {
          x = ring ? 7 : w - 9;
          y = 14 + ((k - 0.5) * 2) * (h - 30);
        }
        const jump = hash2(i, Math.floor(t * 3)) > 0.8 ? -1 : 0;
        rect(ctx, crowd[i % crowd.length], ox + Math.floor(x), oy + Math.floor(y) + jump, 2, 2);
      }
      const bx = ox + w / 2 + Math.round(Math.sin(t * 1.3) * 30);
      const by = oy + h / 2 + Math.round(Math.sin(t * 2.1) * 10);
      rect(ctx, P.white, bx - 1, by - 1, 3, 3);
      if (night) {
        [[4, 3], [w - 4, 3], [4, h - 11], [w - 4, h - 11]].forEach(([x, y]) =>
          lights.push({ x: ox + x, y: oy + y, r: 50, c: '255,255,220' }),
        );
      }
      break;
    }
    default:
  }
}

// ---------- Props ----------
function sagrada(ctx, p) {
  const w = p.w * TILE;
  const h = p.h * TILE;
  const stone = '#d8b98a';
  const shade = '#b8966a';
  rect(ctx, stone, 8, 62, w - 20, h - 62);
  for (let y = 66; y < h; y += 6) rect(ctx, shade, 8, y, w - 20, 1);
  const spires = [
    [18, 14],
    [32, 2],
    [50, 2],
    [64, 14],
  ];
  spires.forEach(([sx, top]) => {
    for (let y = top; y < 66; y++) {
      const half = 1 + Math.floor((y - top) / 9);
      rect(ctx, stone, sx - half, y, half * 2 + 1, 1);
      if (y % 5 === 0) rect(ctx, shade, sx, y, 1, 2);
    }
    rect(ctx, P.red, sx - 1, top - 3, 3, 3);
    rect(ctx, P.yellow, sx, top - 4, 1, 1);
  });
  for (let a = 0; a < 40; a++) {
    const t = (a / 40) * Math.PI * 2;
    rect(ctx, P.plum, Math.round(41 + Math.cos(t) * 6), Math.round(78 + Math.sin(t) * 6), 1, 1);
  }
  rect(ctx, P.cyan, 39, 76, 5, 5);
  rect(ctx, P.ink, 34, h - 20, 14, 20);
  rect(ctx, P.brown, 35, h - 19, 12, 19);
  // Construction crane — it has been under construction since 1882.
  rect(ctx, P.yellow, 86, 4, 3, h - 4);
  for (let y = 6; y < h; y += 6) rect(ctx, '#c9a227', 86, y, 3, 1);
  rect(ctx, P.yellow, 40, 4, 54, 3);
  rect(ctx, P.slate, 88, 8, 6, 4);
  rect(ctx, P.slate, 52, 7, 1, 20);
  rect(ctx, P.brown, 49, 27, 7, 4);
}

function fountain(ctx) {
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const d = Math.hypot(x + 0.5 - 16, (y + 0.5 - 17) * 1.15);
      if (d < 15) rect(ctx, d > 12 ? P.stoneShade : d > 11 ? P.ink : P.water, x, y, 1, 1);
    }
  }
  rect(ctx, P.stone, 13, 8, 6, 12);
  rect(ctx, P.ink, 12, 8, 1, 12);
  rect(ctx, P.ink, 19, 8, 1, 12);
}

function lamp(ctx) {
  rect(ctx, P.steel, 7, 5, 2, 10);
  rect(ctx, P.ink, 5, 14, 6, 2);
  rect(ctx, P.ink, 5, 0, 6, 5);
  rect(ctx, P.yellow, 6, 1, 4, 3);
}

function containers(ctx, p) {
  const cols = [P.red, P.blue, P.green, P.orange];
  for (let i = 0; i < 2; i++) {
    const c = cols[(i + p.x + p.y) % 4];
    rect(ctx, P.ink, 0, i * 16, 16, 16);
    rect(ctx, c, 1, i * 16 + 1, 14, 14);
    for (let x = 3; x < 14; x += 3) rect(ctx, 'rgba(0,0,0,0.25)', x, i * 16 + 2, 1, 12);
  }
}

function crane(ctx) {
  rect(ctx, P.yellow, 6, 0, 4, 32);
  for (let y = 2; y < 32; y += 4) rect(ctx, '#c9a227', 6, y, 4, 1);
  rect(ctx, P.yellow, 0, 0, 16, 3);
  rect(ctx, P.slate, 2, 3, 1, 8);
}

function boat(ctx) {
  rect(ctx, P.ink, 2, 20, 44, 9);
  rect(ctx, P.white, 3, 21, 42, 4);
  rect(ctx, P.red, 5, 25, 38, 3);
  rect(ctx, P.brown, 23, 2, 2, 18);
  for (let y = 3; y < 19; y++) rect(ctx, P.white, 25, y, Math.floor((y - 2) * 1.1), 1);
  rect(ctx, P.red, 18, 3, 5, 3);
}

const PROP_DRAW = { sagrada, fountain, lamp, containers, crane, boat };

export function getPropSprite(p) {
  const key = `${p.kind}:${p.x}:${p.y}`;
  if (cache.has(key)) return cache.get(key);
  const [c, ctx] = makeCanvas(p.w * TILE, p.h * TILE);
  PROP_DRAW[p.kind](ctx, p);
  if (p.kind !== 'fountain') outline(c);
  cache.set(key, c);
  return c;
}

export function drawPropAnim(ctx, p, ox, oy, t, night, lights) {
  if (p.kind === 'fountain') {
    for (let i = 0; i < 10; i++) {
      const k = (t * 0.9 + i / 10) % 1;
      const a = (i / 10) * Math.PI * 2;
      const x = ox + 16 + Math.cos(a) * k * 10;
      const y = oy + 8 - Math.sin(k * Math.PI) * 8 + k * 8;
      rect(ctx, P.waterLight, Math.round(x), Math.round(y), 1, 2);
    }
    rect(ctx, P.white, ox + 15, oy + 5 + Math.round(Math.sin(t * 6)), 2, 3);
  }
  if (p.kind === 'lamp' && night) lights.push({ x: ox + 8, y: oy + 3, r: 30, c: '255,220,140' });
  if (p.kind === 'sagrada' && night) lights.push({ x: ox + 41, y: oy + 60, r: 44, c: '255,190,120' });
}

let signSprite = null;
export function getSignSprite() {
  if (signSprite) return signSprite;
  const [c, ctx] = makeCanvas(16, 16);
  rect(ctx, P.brown, 7, 9, 2, 7);
  rect(ctx, P.wood, 1, 2, 14, 8);
  rect(ctx, P.brown, 3, 4, 10, 1);
  rect(ctx, P.brown, 3, 6, 8, 1);
  signSprite = outline(c);
  return signSprite;
}
