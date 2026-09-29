// Ground layer: pre-rendered once per water animation frame.
import { makeCanvas, rect, hash2, outline, P } from './pixel.js';
import { T, W, H, TILE } from './world.js';

export const WATER_FRAMES = 4;

function grass(ctx, x, y, gx, gy) {
  rect(ctx, P.grass, x, y, TILE, TILE);
  for (let i = 0; i < 6; i++) {
    const px = Math.floor(hash2(gx, gy, i) * 15);
    const py = Math.floor(hash2(gy, gx, i + 9) * 15);
    rect(ctx, i % 2 ? P.grassDark : P.grassLight, x + px, y + py, 1, i % 3 === 0 ? 2 : 1);
  }
}

let treeSprites = null;

function buildTrees() {
  const make = (fruit) => {
    const [c, ctx] = makeCanvas(16, 16);
    rect(ctx, P.brown, 6, 10, 4, 5);
    const shape = [
      [5, 1, 6], [3, 2, 10], [2, 3, 12], [1, 4, 14], [1, 5, 14], [1, 6, 14], [1, 7, 14], [2, 8, 12], [3, 9, 10], [5, 10, 6],
    ];
    shape.forEach(([sx, sy, w]) => rect(ctx, sy > 6 ? P.leafDark : P.leaf, sx, sy, w, 1));
    rect(ctx, P.grassLight, 4, 3, 3, 2);
    rect(ctx, P.grassLight, 3, 5, 1, 1);
    if (fruit) {
      rect(ctx, P.orange, 9, 5, 2, 2);
      rect(ctx, P.orange, 5, 8, 2, 2);
      rect(ctx, P.orange, 11, 8, 1, 1);
    }
    return outline(c);
  };
  return [make(false), make(true)];
}

function tree(ctx, x, y, gx, gy) {
  grass(ctx, x, y, gx, gy);
  if (!treeSprites) treeSprites = buildTrees();
  rect(ctx, 'rgba(0,0,0,0.18)', x + 2, y + 13, 12, 3);
  ctx.drawImage(treeSprites[hash2(gx, gy, 77) > 0.85 ? 1 : 0], x, y);
}

function water(ctx, x, y, gx, gy, f, map) {
  rect(ctx, P.water, x, y, TILE, TILE);
  for (let i = 0; i < 3; i++) {
    const px = Math.floor(hash2(gx, gy, i) * 12);
    const py = (Math.floor(hash2(gx, gy, i + 3) * 14) + f) % 14;
    rect(ctx, P.waterLight, x + ((px + f * 2) % 13), y + py, 3, 1);
  }
  if (map[gy - 1]?.[gx] === T.SAND) {
    rect(ctx, P.white, x, y, TILE, 2);
    for (let i = 0; i < 4; i++) rect(ctx, P.white, x + ((i * 5 + f * 3) % 15), y + 2, 2, 1);
  }
}

function drawTile(ctx, map, gx, gy, f) {
  const t = map[gy][gx];
  const x = gx * TILE;
  const y = gy * TILE;
  switch (t) {
    case T.GRASS:
      grass(ctx, x, y, gx, gy);
      break;
    case T.FLOWERS: {
      grass(ctx, x, y, gx, gy);
      const colors = [P.white, P.yellow, P.red, P.cyan];
      for (let i = 0; i < 3; i++) {
        const px = 2 + Math.floor(hash2(gx, gy, i + 20) * 11);
        const py = 2 + Math.floor(hash2(gx, gy, i + 30) * 11);
        const c = colors[Math.floor(hash2(gx, gy, i + 40) * colors.length)];
        rect(ctx, c, x + px, y + py, 1, 1);
        rect(ctx, c, x + px - 1, y + py + 1, 3, 1);
        rect(ctx, c, x + px, y + py + 2, 1, 1);
        rect(ctx, P.yellow, x + px, y + py + 1, 1, 1);
      }
      break;
    }
    case T.TALL:
      grass(ctx, x, y, gx, gy);
      for (let i = 0; i < 4; i++) {
        const px = x + 1 + (i % 2) * 8;
        const py = y + 2 + Math.floor(i / 2) * 7;
        rect(ctx, P.leaf, px, py + 2, 1, 3);
        rect(ctx, P.leaf, px + 2, py, 1, 5);
        rect(ctx, P.leaf, px + 4, py + 2, 1, 3);
      }
      break;
    case T.PATH: {
      rect(ctx, P.path, x, y, TILE, TILE);
      for (let i = 0; i < 4; i++) {
        rect(ctx, P.pathShade, x + Math.floor(hash2(gx, gy, i) * 15), y + Math.floor(hash2(gy, gx, i) * 15), 1, 1);
      }
      const soft = (nx, ny) => {
        const n = map[ny]?.[nx];
        return n !== T.PATH && n !== T.PLAZA && n !== T.SAND && n !== T.DOCK;
      };
      if (soft(gx, gy - 1)) rect(ctx, P.pathShade, x, y, TILE, 1);
      if (soft(gx, gy + 1)) rect(ctx, P.pathShade, x, y + 15, TILE, 1);
      if (soft(gx - 1, gy)) rect(ctx, P.pathShade, x, y, 1, TILE);
      if (soft(gx + 1, gy)) rect(ctx, P.pathShade, x + 15, y, 1, TILE);
      break;
    }
    case T.SAND:
      rect(ctx, P.sand, x, y, TILE, TILE);
      for (let i = 0; i < 5; i++) {
        rect(ctx, P.sandShade, x + Math.floor(hash2(gx, gy, i) * 15), y + Math.floor(hash2(gy, gx, i + 5) * 15), 1, 1);
      }
      if (hash2(gx, gy, 99) > 0.93) {
        rect(ctx, P.orange, x + 6, y + 7, 3, 2);
        rect(ctx, P.red, x + 7, y + 6, 1, 1);
      }
      break;
    case T.WATER:
      water(ctx, x, y, gx, gy, f, map);
      break;
    case T.TREE:
      tree(ctx, x, y, gx, gy);
      break;
    case T.PLAZA:
      rect(ctx, P.stone, x, y, TILE, TILE);
      rect(ctx, P.stoneShade, x, y + 7, TILE, 1);
      rect(ctx, P.stoneShade, x + ((gy % 2) * 8 + 3), y, 1, 7);
      rect(ctx, P.stoneShade, x + ((gy % 2) * 8 + 11) % 16, y + 8, 1, 8);
      // Barcelona "panot" flower tile hint.
      if ((gx + gy) % 2 === 0) rect(ctx, P.stoneShade, x + 7, y + 3, 2, 2);
      break;
    case T.DOCK:
      water(ctx, x, y, gx, gy, f, map);
      rect(ctx, P.wood, x, y, TILE, TILE);
      for (let i = 0; i < 4; i++) rect(ctx, P.brown, x, y + i * 4 + 3, TILE, 1);
      rect(ctx, P.brown, x + ((gx * 5) % 12) + 2, y, 1, 3);
      break;
    default:
      grass(ctx, x, y, gx, gy);
  }
}

export function buildGround(map) {
  const frames = [];
  for (let f = 0; f < WATER_FRAMES; f++) {
    const [c, ctx] = makeCanvas(W * TILE, H * TILE);
    for (let gy = 0; gy < H; gy++) for (let gx = 0; gx < W; gx++) drawTile(ctx, map, gx, gy, f);
    frames.push(c);
  }
  return frames;
}
