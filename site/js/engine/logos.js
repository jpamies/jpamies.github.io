// Small pixel-art renditions of company/university logos, drawn procedurally (no image files).
// Used on building façades and in the place panels. Simplified on purpose: they're 8-bit homages.
import { makeCanvas, rect, P } from './pixel.js';
import { drawText, textWidth } from './font.js';

const plate = (ctx, w, h, bg, border = P.ink) => {
  rect(ctx, border, 0, 0, w, h);
  rect(ctx, bg, 1, 1, w - 2, h - 2);
};

const textPlate = (text, bg, fg, accent) => ({
  w: textWidth(text) + 6,
  h: accent ? 10 : 9,
  draw(ctx) {
    plate(ctx, this.w, this.h, bg);
    drawText(ctx, text, 3, 2, fg);
    if (accent) rect(ctx, accent, 3, 8, this.w - 6, 1);
  },
});

const LOGOS = {
  microsoft: {
    w: 13,
    h: 13,
    draw(ctx) {
      plate(ctx, 13, 13, P.white);
      rect(ctx, P.msRed, 1, 1, 5, 5);
      rect(ctx, P.msGreen, 7, 1, 5, 5);
      rect(ctx, P.msBlue, 1, 7, 5, 5);
      rect(ctx, P.msYellow, 7, 7, 5, 5);
    },
  },
  aws: {
    w: 19,
    h: 12,
    draw(ctx) {
      plate(ctx, 19, 12, P.awsInk);
      drawText(ctx, 'AWS', 4, 1, P.white);
      [[3, 7], [4, 8], [5, 8], [6, 8], [7, 9], [8, 9], [9, 9], [10, 9], [11, 8], [12, 8], [13, 8], [14, 7]].forEach(([x, y]) => rect(ctx, P.awsOrange, x, y, 1, 1));
      rect(ctx, P.awsOrange, 15, 6, 1, 3);
      rect(ctx, P.awsOrange, 13, 6, 2, 1);
    },
  },
  tsystems: {
    w: 23,
    h: 12,
    draw(ctx) {
      const magenta = '#e20074';
      plate(ctx, 23, 12, P.white);
      rect(ctx, magenta, 8, 2, 7, 2);
      rect(ctx, magenta, 10, 4, 3, 6);
      [2, 5, 16, 19].forEach((x) => rect(ctx, magenta, x, 6, 2, 2));
    },
  },
  sabadell: {
    w: 11,
    h: 11,
    draw(ctx) {
      plate(ctx, 11, 11, '#0070d2');
      ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'].forEach((row, y) =>
        [...row].forEach((c, x) => c === '#' && rect(ctx, P.white, 3 + x, 2 + y, 1, 1)),
      );
    },
  },
  elisava: textPlate('ELISAVA', P.ink, P.white),
  admira: textPlate('ADMIRA', P.white, '#d7182a', '#d7182a'),
  costaisa: textPlate('COSTAISA', P.white, '#005b99', '#00a2ea'),
  madcollective: {
    w: 61,
    h: 10,
    draw(ctx) {
      plate(ctx, 61, 10, P.ink);
      drawText(ctx, 'MAD', 3, 2, '#ff4f9a');
      drawText(ctx, 'COLLECTIVE', 19, 2, P.white);
      rect(ctx, '#ff4f9a', 3, 8, 11, 1);
    },
  },
  upc: {
    w: 23,
    h: 14,
    draw(ctx) {
      const blue = '#0075bf';
      plate(ctx, 23, 14, blue);
      drawText(ctx, 'UPC', 6, 2, P.white);
      rect(ctx, P.white, 3, 8, 17, 1);
      for (let x = 4; x < 20; x += 3) rect(ctx, P.white, x, 10, 1, 2);
    },
  },
};

export const logoIds = Object.keys(LOGOS);

export function logoSize(id) {
  const l = LOGOS[id];
  return l ? { w: l.w, h: l.h } : { w: 0, h: 0 };
}

const cache = new Map();
export function buildLogo(id) {
  if (cache.has(id)) return cache.get(id);
  const l = LOGOS[id];
  if (!l) return null;
  const [c, ctx] = makeCanvas(l.w, l.h);
  l.draw(ctx);
  cache.set(id, c);
  return c;
}

export function drawLogo(ctx, id, x, y) {
  const c = buildLogo(id);
  if (c) ctx.drawImage(c, Math.round(x), Math.round(y));
}

export function drawLogoCentered(ctx, id, cx, y) {
  drawLogo(ctx, id, cx - logoSize(id).w / 2, y);
}
