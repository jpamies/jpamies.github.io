// Game loop: player movement, NPCs, camera and world rendering.
import { TILE, W, H, buildMap, buildings, props, SPAWN, isSolid, isWanderable, findPath, buildingAt, doorAt, signAt, DIRS, faceTowards, neighboursOf } from './world.js';
import { buildGround, WATER_FRAMES } from './tiles.js';
import { buildPerson, buildDog } from './sprites.js';
import { getBuildingSprite, drawBuildingAnim, getPropSprite, drawPropAnim, getSignSprite } from './buildings.js';
import { rect, P } from './pixel.js';
import { npcs as npcData, signs } from '../data.js';

const WALK_SPEED = 5;
const RUN_SPEED = 9;

export function createGame(canvas, input, hooks) {
  const ctx = canvas.getContext('2d');
  const map = buildMap();
  const ground = buildGround(map);
  let sprites = { player: buildPerson('player'), shiny: buildPerson('shiny'), dog: buildDog() };
  const npcSprites = {};

  const player = { x: SPAWN.x, y: SPAWN.y, fromX: SPAWN.x, fromY: SPAWN.y, dir: 'down', t: 1, moving: false, step: 0, look: 'player' };
  const trail = [];
  let follower = null;
  let autoPath = null;
  let autoGoal = null;
  let paused = true;
  let attract = true;
  let time = 0;
  let nightMode = 'auto';
  const visited = new Set();
  const particles = [];
  let view = { w: 320, h: 180, scale: 4 };
  const cam = { x: SPAWN.x * TILE, y: SPAWN.y * TILE };

  const npcs = npcData.map((n) => ({
    ...n,
    homeX: n.x,
    homeY: n.y,
    fromX: n.x,
    fromY: n.y,
    t: 1,
    dir: 'down',
    wait: 1 + Math.random() * 3,
    hidden: false,
  }));
  npcs.forEach((n) => {
    npcSprites[n.id] = n.look === 'dog' ? sprites.dog : buildPerson(n.look);
  });

  const occupiedByNpc = (x, y) => npcs.some((n) => !n.hidden && ((n.x === x && n.y === y) || (n.t < 1 && n.fromX === x && n.fromY === y)));
  const occupied = (x, y) => occupiedByNpc(x, y) || (player.x === x && player.y === y);

  function resize() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scale = Math.max(2, Math.min(6, Math.floor(Math.min(vw, vh) / 170)));
    view = { w: Math.ceil(vw / scale), h: Math.ceil(vh / scale), scale };
    canvas.width = view.w;
    canvas.height = view.h;
    canvas.style.width = `${view.w * scale}px`;
    canvas.style.height = `${view.h * scale}px`;
    ctx.imageSmoothingEnabled = false;
  }
  window.addEventListener('resize', resize);
  resize();

  const isNight = () => {
    if (nightMode === 'day') return false;
    if (nightMode === 'night') return true;
    const h = new Date().getHours();
    return h >= 20 || h < 7;
  };

  function tryStep(dir) {
    player.dir = dir;
    const d = DIRS[dir];
    const nx = player.x + d.x;
    const ny = player.y + d.y;
    const door = doorAt(nx, ny);
    if (door && dir === 'up') {
      autoPath = null;
      hooks.onEnter(door);
      return false;
    }
    if (isSolid(map, nx, ny) || occupiedByNpc(nx, ny)) {
      if (!autoPath) hooks.onBump?.();
      autoPath = null;
      return false;
    }
    trail.unshift({ x: player.x, y: player.y });
    trail.length = Math.min(trail.length, 4);
    player.fromX = player.x;
    player.fromY = player.y;
    player.x = nx;
    player.y = ny;
    player.t = 0;
    player.moving = true;
    if (follower && trail[0]) {
      follower.fromX = follower.x;
      follower.fromY = follower.y;
      follower.x = trail[0].x;
      follower.y = trail[0].y;
      follower.dir = faceTowards({ x: follower.fromX, y: follower.fromY }, follower);
      follower.t = 0;
    }
    return true;
  }

  function facingThing() {
    const d = DIRS[player.dir];
    const fx = player.x + d.x;
    const fy = player.y + d.y;
    const npc = npcs.find((n) => !n.hidden && n.x === fx && n.y === fy);
    if (npc) return { npc };
    const sign = signAt(fx, fy);
    if (sign) return { sign };
    const door = doorAt(fx, fy);
    if (door) return { door };
    if (follower && follower.x === fx && follower.y === fy) return { npc: follower.npc };
    return null;
  }

  function interact() {
    if (paused || player.t < 1) return;
    const thing = facingThing();
    if (!thing) return;
    if (thing.npc) {
      const n = thing.npc;
      if (n.look !== 'dog') n.dir = faceTowards(n, player);
      hooks.onTalk(n);
    } else if (thing.sign) hooks.onSign(thing.sign);
    else if (thing.door) hooks.onEnter(thing.door);
  }

  function arrive() {
    if (!autoGoal) return;
    const goal = autoGoal;
    autoGoal = null;
    player.dir = goal.face || player.dir;
    if (goal.building) hooks.onEnter(goal.building);
    else if (goal.npc) {
      if (goal.npc.look !== 'dog') goal.npc.dir = faceTowards(goal.npc, player);
      hooks.onTalk(goal.npc);
    } else if (goal.sign) hooks.onSign(goal.sign);
  }

  function walkTo(target, goal) {
    const path = findPath(map, player, target, occupiedByNpc);
    if (!path) {
      hooks.onBump?.();
      return;
    }
    autoPath = path;
    autoGoal = goal;
    if (!path.length) arrive();
  }

  function tapAt(clientX, clientY) {
    if (paused) return;
    const rectC = canvas.getBoundingClientRect();
    const wx = (clientX - rectC.left) / view.scale + cam.x;
    const wy = (clientY - rectC.top) / view.scale + cam.y;
    const tx = Math.floor(wx / TILE);
    const ty = Math.floor(wy / TILE);
    if (tx < 0 || ty < 0 || tx >= W || ty >= H) return;
    spawnRipple(tx * TILE + 8, ty * TILE + 8);
    const b = buildingAt(tx, ty);
    if (b) {
      walkTo({ x: b.doorX, y: b.doorY + 1 }, { building: b, face: 'up' });
      return;
    }
    const npc = npcs.find((n) => !n.hidden && n.x === tx && n.y === ty);
    const sign = signAt(tx, ty);
    const thing = npc || sign;
    if (thing) {
      if (Math.abs(thing.x - player.x) + Math.abs(thing.y - player.y) === 1) {
        player.dir = faceTowards(player, thing);
        autoGoal = { npc, sign, face: player.dir };
        arrive();
        return;
      }
      const spots = neighboursOf(map, thing.x, thing.y, player, occupiedByNpc);
      for (const s of spots) {
        const path = findPath(map, player, s, occupiedByNpc);
        if (path) {
          autoPath = path;
          autoGoal = { npc, sign, face: faceTowards(s, thing) };
          if (!path.length) arrive();
          return;
        }
      }
      return;
    }
    if (!isSolid(map, tx, ty)) walkTo({ x: tx, y: ty }, null);
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    tapAt(e.clientX, e.clientY);
  });

  function updatePlayer(dt) {
    const speed = input.running() ? RUN_SPEED : WALK_SPEED;
    if (player.t < 1) {
      player.t = Math.min(1, player.t + dt * speed);
      if (follower) follower.t = Math.min(1, follower.t + dt * speed);
      if (player.t >= 1) {
        player.step++;
        hooks.onStep?.(player);
      }
    }
    if (player.t < 1 || paused) return;
    const dir = input.direction();
    if (dir) {
      input.consumeTap();
      autoPath = null;
      autoGoal = null;
      if (!tryStep(dir)) player.moving = false;
      return;
    }
    if (autoPath && autoPath.length) {
      const next = autoPath.shift();
      const d = faceTowards(player, next);
      if (!tryStep(d)) {
        autoPath = null;
        autoGoal = null;
      }
      return;
    }
    if (autoPath && !autoPath.length) {
      autoPath = null;
      arrive();
    }
    player.moving = false;
  }

  function updateNpcs(dt) {
    npcs.forEach((n) => {
      if (n.hidden) return;
      if (n.t < 1) {
        n.t = Math.min(1, n.t + dt * 2.5);
        return;
      }
      if (!n.wander || paused) return;
      n.wait -= dt;
      if (n.wait > 0) return;
      n.wait = 1.5 + Math.random() * 3;
      const dirs = Object.keys(DIRS);
      const dir = dirs[Math.floor(Math.random() * 4)];
      const nx = n.x + DIRS[dir].x;
      const ny = n.y + DIRS[dir].y;
      n.dir = n.look === 'dog' ? (DIRS[dir].x < 0 ? 'left' : 'right') : dir;
      if (Math.abs(nx - n.homeX) + Math.abs(ny - n.homeY) > 3) return;
      if (!isWanderable(map, nx, ny) || occupied(nx, ny)) return;
      if (follower && follower.x === nx && follower.y === ny) return;
      n.fromX = n.x;
      n.fromY = n.y;
      n.x = nx;
      n.y = ny;
      n.t = 0;
    });
  }

  function updateAttract(dt) {
    const k = time * 0.05;
    const tx = (W * TILE) / 2 + Math.cos(k) * (W * TILE * 0.3) - view.w / 2;
    const ty = (H * TILE) / 2 + Math.sin(k * 1.3) * (H * TILE * 0.25) - view.h / 2;
    cam.x += (tx - cam.x) * Math.min(1, dt * 2);
    cam.y += (ty - cam.y) * Math.min(1, dt * 2);
  }

  const lerp = (a, b, t) => a + (b - a) * t;
  const entityPos = (e) => ({ x: lerp(e.fromX, e.x, e.t) * TILE, y: lerp(e.fromY, e.y, e.t) * TILE });

  function updateCamera(dt) {
    const p = entityPos(player);
    const tx = p.x + 8 - view.w / 2;
    const ty = p.y + 8 - view.h / 2;
    cam.x += (tx - cam.x) * Math.min(1, dt * 8);
    cam.y += (ty - cam.y) * Math.min(1, dt * 8);
  }

  function clampCamera() {
    const maxX = W * TILE - view.w;
    const maxY = H * TILE - view.h;
    cam.x = maxX < 0 ? maxX / 2 : Math.max(0, Math.min(maxX, cam.x));
    cam.y = maxY < 0 ? maxY / 2 : Math.max(0, Math.min(maxY, cam.y));
  }

  function spawnRipple(x, y) {
    particles.push({ kind: 'ripple', x, y, life: 0.4, max: 0.4 });
  }

  function fireworks() {
    const colors = [P.red, P.yellow, P.cyan, P.lime, P.orange, P.white, P.msBlue];
    for (let b = 0; b < 6; b++) {
      const cx = cam.x + view.w * (0.2 + Math.random() * 0.6);
      const cy = cam.y + view.h * (0.15 + Math.random() * 0.35);
      const c = colors[b % colors.length];
      for (let i = 0; i < 28; i++) {
        const a = (i / 28) * Math.PI * 2;
        const s = 30 + Math.random() * 30;
        particles.push({ kind: 'spark', x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1.4 + b * 0.25, max: 1.4 + b * 0.25, delay: b * 0.35, c });
      }
    }
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      if (p.delay > 0) {
        p.delay -= dt;
        continue;
      }
      p.life -= dt;
      if (p.kind === 'spark') {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 30 * dt;
      }
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  // ---------- Rendering ----------
  function drawEntity(frames, e, bob = true) {
    const p = entityPos(e);
    const moving = e.t < 1;
    const frameIdx = moving ? (e.t < 0.5 ? 1 + ((e.stepParity || 0) % 2) : 0) : 0;
    const set = frames[e.dir] || frames.down || frames.right;
    const img = set[Math.min(frameIdx, set.length - 1)];
    const x = Math.round(p.x - cam.x);
    const y = Math.round(p.y - cam.y) - (bob && moving && e.t < 0.5 ? 1 : 0);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 3, Math.round(p.y - cam.y) + 14, 10, 2);
    ctx.drawImage(img, x, y);
  }

  function inView(x, y, w, h) {
    return x + w >= cam.x && y + h >= cam.y && x <= cam.x + view.w && y <= cam.y + view.h;
  }

  function render() {
    const night = isNight();
    const lights = [];
    ctx.fillStyle = P.water;
    ctx.fillRect(0, 0, view.w, view.h);
    const frame = Math.floor(time * 2.5) % WATER_FRAMES;
    const cx = Math.round(cam.x);
    const cy = Math.round(cam.y);
    ctx.drawImage(ground[frame], -cx, -cy);

    for (const s of signs) {
      if (inView(s.x * TILE, s.y * TILE, 16, 16)) ctx.drawImage(getSignSprite(), s.x * TILE - cx, s.y * TILE - cy);
    }

    for (const b of buildings) {
      const bx = b.x * TILE;
      const by = b.y * TILE;
      if (!inView(bx - 16, by - 40, b.w * TILE + 32, b.h * TILE + 60)) continue;
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(bx - cx + 4, by - cy + b.h * TILE - 2, b.w * TILE, 4);
      ctx.drawImage(getBuildingSprite(b).canvas, bx - cx, by - cy);
      drawBuildingAnim(ctx, b, bx - cx, by - cy, time, night, lights);
    }
    for (const p of props) {
      const px = p.x * TILE;
      const py = p.y * TILE + (p.kind === 'boat' ? Math.round(Math.sin(time * 2 + p.x) * 1.5) : 0);
      if (!inView(px, py - 8, p.w * TILE, p.h * TILE + 8)) continue;
      ctx.drawImage(getPropSprite(p), px - cx, py - cy);
      drawPropAnim(ctx, p, px - cx, py - cy, time, night, lights);
    }

    // Bouncing markers over places not yet visited.
    if (!attract) {
      for (const b of buildings) {
        if (visited.has(b.id)) continue;
        const mx = b.doorX * TILE + 8 - cx;
        const my = b.doorY * TILE - 12 - cy + Math.round(Math.sin(time * 5) * 2);
        rect(ctx, P.ink, mx - 3, my - 1, 7, 6);
        rect(ctx, P.yellow, mx - 2, my, 5, 1);
        rect(ctx, P.yellow, mx - 1, my + 1, 3, 1);
        rect(ctx, P.yellow, mx, my + 2, 1, 1);
      }
    }

    const actors = [];
    npcs.forEach((n) => !n.hidden && actors.push({ y: entityPos(n).y, draw: () => drawEntity(npcSprites[n.id], n) }));
    if (follower) actors.push({ y: entityPos(follower).y, draw: () => drawEntity(sprites.dog, follower) });
    if (!attract) actors.push({ y: entityPos(player).y, draw: () => drawEntity(player.look === 'shiny' ? sprites.shiny : sprites.player, player) });
    actors.sort((a, b) => a.y - b.y).forEach((a) => a.draw());

    // Drifting cloud shadows.
    ctx.fillStyle = 'rgba(20,20,60,0.07)';
    for (let i = 0; i < 4; i++) {
      const x = ((time * 6 + i * 230) % (W * TILE + 200)) - 100 - cx;
      const y = ((i * 157) % (H * TILE)) - cy;
      ctx.beginPath();
      ctx.ellipse(x, y, 60, 22, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (night) {
      ctx.fillStyle = 'rgba(12,16,52,0.55)';
      ctx.fillRect(0, 0, view.w, view.h);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      lights.forEach((l) => {
        const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
        g.addColorStop(0, `rgba(${l.c},0.35)`);
        g.addColorStop(1, `rgba(${l.c},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2);
      });
      ctx.restore();
      for (let i = 0; i < 30; i++) {
        const sx = (i * 97) % view.w;
        const sy = (i * 53) % Math.max(1, Math.floor(view.h / 3));
        if (Math.sin(time * 2 + i) > 0.3) rect(ctx, 'rgba(255,255,255,0.6)', sx, sy, 1, 1);
      }
    }

    particles.forEach((p) => {
      if (p.delay > 0) return;
      const k = p.life / p.max;
      if (p.kind === 'ripple') {
        ctx.strokeStyle = `rgba(255,255,255,${k})`;
        ctx.strokeRect(Math.round(p.x - cx - (1 - k) * 8), Math.round(p.y - cy - (1 - k) * 8), Math.round((1 - k) * 16), Math.round((1 - k) * 16));
      } else {
        ctx.globalAlpha = Math.min(1, k * 2);
        rect(ctx, p.c, Math.round(p.x - cx), Math.round(p.y - cy), 2, 2);
        ctx.globalAlpha = 1;
      }
    });
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
    last = now;
    time += dt;
    if (attract) updateAttract(dt);
    else {
      updatePlayer(dt);
      updateCamera(dt);
    }
    updateNpcs(dt);
    updateParticles(dt);
    clampCamera();
    player.stepParity = player.step;
    render();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  return {
    map,
    player,
    setPaused(p) {
      paused = p;
      input.clear();
      if (p) autoPath = null;
    },
    isPaused: () => paused,
    startPlaying(pos) {
      attract = false;
      if (pos && !isSolid(map, pos.x, pos.y)) {
        player.x = player.fromX = pos.x;
        player.y = player.fromY = pos.y;
      }
      const p = entityPos(player);
      cam.x = p.x + 8 - view.w / 2;
      cam.y = p.y + 8 - view.h / 2;
      if (follower) {
        const spot = neighboursOf(map, player.x, player.y, player, occupiedByNpc)[0] || { x: player.x, y: player.y };
        Object.assign(follower, { x: spot.x, y: spot.y, fromX: spot.x, fromY: spot.y, t: 1 });
      }
    },
    interact,
    tapAt,
    setVisited(ids) {
      visited.clear();
      ids.forEach((id) => visited.add(id));
    },
    stepOutOfDoor() {
      player.dir = 'down';
    },
    adoptDog() {
      const dog = npcs.find((n) => n.look === 'dog');
      if (!dog || follower) return;
      dog.hidden = true;
      const spot = trail[0] || neighboursOf(map, player.x, player.y, player)[0] || { x: player.x, y: player.y + 1 };
      follower = { x: spot.x, y: spot.y, fromX: spot.x, fromY: spot.y, t: 1, dir: 'right', npc: dog };
    },
    setShiny(on) {
      player.look = on ? 'shiny' : 'player';
    },
    fireworks,
    setNightMode(m) {
      nightMode = m;
    },
    getNightMode: () => nightMode,
    isNight,
  };
}
