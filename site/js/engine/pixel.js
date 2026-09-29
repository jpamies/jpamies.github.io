// Low-level pixel helpers shared by sprites, tiles and buildings.

export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return [c, ctx];
}

export function rect(ctx, color, x, y, w = 1, h = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// Adds a 1px outline around every opaque pixel, the classic handheld sprite look.
export function outline(canvas, color = '#1a1c2c') {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const img = ctx.getImageData(0, 0, w, h);
  const a = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : img.data[(y * w + x) * 4 + 3]);
  const edge = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (a(x, y)) continue;
      if (a(x + 1, y) || a(x - 1, y) || a(x, y + 1) || a(x, y - 1)) edge.push([x, y]);
    }
  }
  ctx.fillStyle = color;
  edge.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
  return canvas;
}

export function mirror(canvas) {
  const [c, ctx] = makeCanvas(canvas.width, canvas.height);
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(canvas, 0, 0);
  return c;
}

export function hash2(x, y, seed = 0) {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// PICO-8-ish palette used across the whole game.
export const P = {
  ink: '#1a1c2c',
  plum: '#5d275d',
  red: '#b13e53',
  orange: '#ef7d57',
  yellow: '#ffcd75',
  lime: '#a7f070',
  green: '#38b764',
  teal: '#257179',
  navy: '#29366f',
  blue: '#3b5dc9',
  sky: '#41a6f6',
  cyan: '#73eff7',
  white: '#f4f4f4',
  silver: '#94b0c2',
  slate: '#566c86',
  steel: '#333c57',
  skin: '#f6c7a1',
  skinShade: '#d9a07a',
  hair: '#3b2a26',
  brown: '#8a5a3b',
  wood: '#b07a4f',
  sand: '#f2d99c',
  sandShade: '#dcbd7c',
  grass: '#5fb34f',
  grassDark: '#4a9a42',
  grassLight: '#7fcf5f',
  leaf: '#2f7d3b',
  leafDark: '#1f5a2e',
  water: '#2f7fd8',
  waterLight: '#63b3f5',
  path: '#d7b98a',
  pathShade: '#c29f6c',
  stone: '#c9c3b8',
  stoneShade: '#aaa295',
  msRed: '#f25022',
  msGreen: '#7fba00',
  msBlue: '#00a4ef',
  msYellow: '#ffb900',
  awsOrange: '#ff9900',
  awsInk: '#232f3e',
};
