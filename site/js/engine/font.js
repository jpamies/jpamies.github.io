// Tiny 3x5 pixel font for in-world signs (crisp at 1x, unlike vector fonts on canvas).
const GLYPHS = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110',
  E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
  I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
  M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100',
  Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111', 0: '111101101101111', 1: '010110010010111',
  2: '110001010100111', 3: '110001010001110', 4: '101101111001001', 5: '111100110001110',
  6: '011100110101010', 7: '111001010010010', 8: '010101010101010', 9: '010101011001110',
  '-': '000000111000000', '.': '000000000000010', ' ': '000000000000000', '/': '001001010100100',
};

export function textWidth(text) {
  return text.length * 4 - 1;
}

export function drawText(ctx, text, x, y, color) {
  ctx.fillStyle = color;
  [...text.toUpperCase()].forEach((ch, i) => {
    const g = GLYPHS[ch] || GLYPHS[' '];
    for (let p = 0; p < 15; p++) {
      if (g[p] === '1') ctx.fillRect(x + i * 4 + (p % 3), y + Math.floor(p / 3), 1, 1);
    }
  });
}

export function drawTextCentered(ctx, text, cx, y, color) {
  drawText(ctx, text, Math.round(cx - textWidth(text) / 2), y, color);
}

export const glyphNames = Object.keys(GLYPHS);
