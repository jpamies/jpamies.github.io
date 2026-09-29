import { createGame } from './engine/game.js';
import { createInput } from './engine/input.js';
import { buildIcon } from './engine/sprites.js';
import { buildLogo } from './engine/logos.js';
import { sfx, startMusic, stopMusic, setSound, unlockAudio } from './engine/audio.js';
import { buildings } from './engine/world.js';
import { places, placeById, cards, cardById, npcs } from './data.js';
import { cardHTML, placeHTML, binderHTML, trainerHTML, cvHTML } from './ui/templates.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ---------- Persistence (localStorage only, nothing leaves the browser) ----------
const SAVE_KEY = 'cloudquest.v1';
const state = {
  visited: new Set(),
  collected: new Set(),
  layla: false,
  shiny: false,
  pos: null,
  sound: true,
  night: 'auto',
  playSeconds: 0,
  started: false,
};

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (!raw || typeof raw !== 'object') return;
    const validPlace = (id) => typeof id === 'string' && placeById[id];
    const validCard = (id) => typeof id === 'string' && cardById[id];
    state.visited = new Set((raw.visited || []).filter(validPlace));
    state.collected = new Set((raw.collected || []).filter(validCard));
    state.layla = raw.layla === true;
    state.shiny = raw.shiny === true;
    state.sound = raw.sound !== false;
    state.night = ['auto', 'day', 'night'].includes(raw.night) ? raw.night : 'auto';
    state.playSeconds = Number.isFinite(raw.playSeconds) ? raw.playSeconds : 0;
    state.started = raw.started === true;
    if (raw.pos && Number.isInteger(raw.pos.x) && Number.isInteger(raw.pos.y)) state.pos = { x: raw.pos.x, y: raw.pos.y };
  } catch {
    /* corrupted or unavailable storage: start fresh */
  }
}

let resetting = false;

function save() {
  if (resetting) return;
  try {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        visited: [...state.visited],
        collected: [...state.collected],
        layla: state.layla,
        shiny: state.shiny,
        pos: state.pos,
        sound: state.sound,
        night: state.night,
        playSeconds: Math.round(state.playSeconds),
        started: state.started,
      }),
    );
  } catch {
    /* private mode or quota: progress simply isn't saved */
  }
}

load();

// ---------- Layers ----------
const layers = [];
const top = () => layers[layers.length - 1] || null;
let mode = 'boot';

function pushLayer(name, el, onClose) {
  el.hidden = false;
  layers.push({ name, el, onClose, lastFocus: document.activeElement });
  game.setPaused(true);
  requestAnimationFrame(() => {
    const f = el.querySelector('[autofocus], button, [tabindex="0"], a[href]');
    f?.focus({ preventScroll: true });
  });
}

function popLayer() {
  const l = layers.pop();
  if (!l) return;
  l.el.hidden = true;
  if (l.lastFocus && document.contains(l.lastFocus)) l.lastFocus.focus({ preventScroll: true });
  if (!layers.length && mode === 'play') {
    game.setPaused(false);
    $('#world').focus?.({ preventScroll: true });
  }
  l.onClose?.();
}

function closeAll() {
  while (layers.length) popLayer();
}

// ---------- Icons, cards, tilt ----------
function hydrateIcons(root) {
  $$('canvas[data-logo]', root).forEach((c) => {
    const img = buildLogo(c.dataset.logo);
    if (!img) return;
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0);
  });
  $$('canvas[data-icon]', root).forEach((c) => {
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 16, 16);
    ctx.drawImage(buildIcon(c.dataset.icon), 0, 0);
  });
}

function bindTilt(root) {
  $$('.card:not(.is-locked)', root).forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--rx', `${(0.5 - y) * 18}deg`);
      card.style.setProperty('--ry', `${(x - 0.5) * 22}deg`);
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
    });
    card.addEventListener('pointerleave', () => {
      ['--rx', '--ry'].forEach((p) => card.style.setProperty(p, '0deg'));
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '50%');
    });
  });
}

function bindCardClicks(root) {
  $$('.card', root).forEach((card) => {
    const open = (e) => {
      if (e.target.closest('a')) return;
      openZoom(card.dataset.card);
    };
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => {
      if (e.target.closest('a')) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        open(e);
      }
    });
  });
}

function openZoom(id) {
  const card = cardById[id];
  if (!card) return;
  const stage = $('.zoom-stage');
  const locked = !state.collected.has(id);
  stage.innerHTML = locked
    ? `${cardHTML(card, { locked: true })}<p class="zoom-hint">Not found yet. Keep exploring!</p>`
    : cardHTML(card);
  hydrateIcons(stage);
  bindTilt(stage);
  sfx.select();
  pushLayer('zoom', $('#zoom'));
}

$('#zoom').addEventListener('click', (e) => {
  if (!e.target.closest('a')) popLayer();
});

// ---------- Panel ----------
function openPanel(html, onClose) {
  const body = $('.panel-body');
  body.innerHTML = html;
  body.scrollTop = 0;
  hydrateIcons(body);
  bindTilt(body);
  bindCardClicks(body);
  $$('meter', body).forEach((m, i) => m.style.setProperty('--delay', `${i * 80}ms`));
  pushLayer('panel', $('#panel'), onClose);
  $('#panel .panel-close').focus({ preventScroll: true });
}

function openBinder() {
  sfx.select();
  openPanel(binderHTML(state.collected));
}

function openTrainer() {
  sfx.select();
  openPanel(trainerHTML(state));
}

function openHelp() {
  sfx.select();
  openPanel(`<p class="eyebrow">How to play</p><h2 id="panel-title">Controls</h2>
<ul class="controls">
  <li><kbd>←↑↓→</kbd> / <kbd>WASD</kbd> Move · hold <kbd>Shift</kbd> to run</li>
  <li><kbd>Enter</kbd> / <kbd>Space</kbd> / <kbd>Z</kbd> Talk · read · confirm</li>
  <li><kbd>Esc</kbd> / <kbd>X</kbd> Back</li>
  <li><kbd>M</kbd> Menu · <kbd>B</kbd> Binder · <kbd>T</kbd> Trainer card · <kbd>C</kbd> Quick CV</li>
  <li>Mouse / touch: tap anywhere to walk there; tap a building to enter it.</li>
  <li>Walk up into a door to enter a building. Each place gives you cards.</li>
</ul>
<p class="panel-summary">Psst… old-school cheat codes still work around here.</p>`);
}

// ---------- Dialog ----------
const dialog = { lines: [], i: 0, typing: false, full: '', shown: 0, timer: null, done: null };

function openDialog(name, lines, done) {
  dialog.lines = lines;
  dialog.i = 0;
  dialog.done = done;
  $('#dialog-name').textContent = name;
  pushLayer('dialog', $('#dialog'));
  typeLine();
}

function typeLine() {
  const el = $('#dialog .dialog-text');
  dialog.full = dialog.lines[dialog.i];
  dialog.shown = 0;
  dialog.typing = true;
  el.textContent = '';
  clearInterval(dialog.timer);
  dialog.timer = setInterval(() => {
    dialog.shown += 1;
    el.textContent = dialog.full.slice(0, dialog.shown);
    if (dialog.shown % 3 === 0) sfx.blip();
    if (dialog.shown >= dialog.full.length) {
      clearInterval(dialog.timer);
      dialog.typing = false;
    }
  }, 22);
}

function advanceDialog() {
  if (dialog.typing) {
    clearInterval(dialog.timer);
    dialog.typing = false;
    $('#dialog .dialog-text').textContent = dialog.full;
    return;
  }
  dialog.i += 1;
  if (dialog.i < dialog.lines.length) {
    typeLine();
    return;
  }
  const done = dialog.done;
  dialog.done = null;
  popLayer();
  done?.();
}

$('#dialog').addEventListener('click', advanceDialog);

// ---------- Booster pack ----------
const pack = { queue: [], step: 0, done: null };

function openPack(ids, done) {
  ids.forEach((id) => state.collected.add(id));
  save();
  updateHud();
  const stage = $('.pack-cards');
  stage.innerHTML = ids.map((id) => cardHTML(cardById[id], { isNew: true })).join('');
  hydrateIcons(stage);
  bindTilt(stage);
  $$('.card', stage).forEach((c, i) => c.style.setProperty('--i', i));
  const overlay = $('#pack');
  overlay.classList.remove('is-open', 'is-revealed');
  pack.queue = ids;
  pack.step = 0;
  pack.done = done;
  pushLayer('pack', overlay);
  sfx.door();
  requestAnimationFrame(() => overlay.classList.add('is-shaking'));
}

function advancePack() {
  const overlay = $('#pack');
  if (pack.step === 0) {
    overlay.classList.remove('is-shaking');
    overlay.classList.add('is-open');
    sfx.card();
    setTimeout(() => overlay.classList.add('is-revealed'), 450);
    pack.step = 1;
    return;
  }
  if (!overlay.classList.contains('is-revealed')) return;
  const done = pack.done;
  pack.done = null;
  popLayer();
  $('.pack-cards').innerHTML = '';
  done?.();
}

$('#pack').addEventListener('click', (e) => {
  if (e.target.closest('a')) return;
  advancePack();
});

// ---------- Toast ----------
let toastTimer = null;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  t.classList.remove('is-in');
  void t.offsetWidth;
  t.classList.add('is-in');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.hidden = true;
  }, 2600);
}

// ---------- HUD ----------
function updateHud() {
  $('[data-hud-cards]').textContent = `${state.collected.size}/${cards.length}`;
  $$('[data-sound-label]').forEach((el) => {
    el.textContent = state.sound ? 'on' : 'off';
  });
  $$('[data-night-label]').forEach((el) => {
    el.textContent = state.night;
  });
  $('[data-start-label]').textContent = state.started ? 'Continue' : 'New game';
}

function updateHudPlace(p) {
  let best = null;
  let bestD = 5;
  for (const b of buildings) {
    const d = Math.abs(b.doorX - p.x) + Math.abs(b.doorY + 1 - p.y);
    if (d < bestD) {
      bestD = d;
      best = b;
    }
  }
  $('[data-hud-place]').textContent = best ? placeById[best.id].name : 'Barcelona Tech Coast';
}

// ---------- CV ----------
function ensureCV() {
  const body = $('.cv-body');
  if (!body.querySelector('h1')) body.innerHTML = cvHTML();
}

function openCV(push = true) {
  ensureCV();
  closeAll();
  game.setPaused(true);
  document.body.classList.add('mode-cv');
  $('#cv').classList.add('is-open');
  $('#cv').focus({ preventScroll: true });
  window.scrollTo(0, 0);
  if (push && location.hash !== '#cv') history.pushState(null, '', '#cv');
}

function closeCV(push = true) {
  document.body.classList.remove('mode-cv');
  $('#cv').classList.remove('is-open');
  if (push && location.hash === '#cv') history.pushState(null, '', location.pathname);
  if (mode === 'play') game.setPaused(false);
  else if (mode === 'title') $('.title-menu button')?.focus({ preventScroll: true });
}

window.addEventListener('hashchange', () => {
  if (location.hash === '#cv') openCV(false);
  else closeCV(false);
});
window.addEventListener('popstate', () => {
  if (location.hash === '#cv') openCV(false);
  else closeCV(false);
});

// ---------- Game hooks ----------
function awardIfComplete() {
  const allVisited = places.every((p) => state.visited.has(p.id));
  if (!allVisited || state.collected.has('legend')) return;
  game.fireworks();
  sfx.fanfare();
  setTimeout(() => {
    openDialog('???', ['You visited every place in Barcelona Tech Coast!', 'A legendary card appears…'], () =>
      openPack(['legend'], () =>
        openDialog('Jordi', ['Thanks for playing! 🙌', 'If you liked the adventure, let’s connect on LinkedIn or GitHub.'], openTrainer),
      ),
    );
  }, 1400);
}

function enterPlace(b) {
  const place = placeById[b.id];
  sfx.door();
  state.visited.add(place.id);
  game.setVisited(state.visited);
  const fresh = place.cards.filter((id) => !state.collected.has(id));
  save();
  const show = () =>
    openPanel(placeHTML(place, state.collected), () => {
      game.stepOutOfDoor();
      awardIfComplete();
    });
  if (fresh.length) openPack(fresh, show);
  else show();
}

function talkTo(npc) {
  sfx.select();
  if (npc.look === 'dog') sfx.bark();
  if (npc.card && !state.collected.has(npc.card)) {
    openDialog(npc.name, npc.lines, () => {
      state.layla = true;
      game.adoptDog();
      openPack([npc.card], () => toast('Layla is now following you! 🐶'));
    });
    return;
  }
  const lines = npc.look === 'dog' && state.layla ? ['Woof! 🐾', '(Layla is happy to be on the adventure.)'] : npc.lines;
  openDialog(npc.name, lines);
}

function readSign(sign) {
  sfx.select();
  openDialog('Sign', [sign.text]);
}

// ---------- Setup ----------
const canvas = $('#world');
let game;
const input = createInput({
  onAction: handleAction,
  onKonami: () => {
    if (mode !== 'play' || state.shiny) return;
    state.shiny = true;
    game.setShiny(true);
    sfx.fanfare();
    save();
    closeAll();
    openPack(['shiny'], () => toast('Shiny mode unlocked ✨'));
  },
});

game = createGame(canvas, input, {
  onEnter: enterPlace,
  onTalk: talkTo,
  onSign: readSign,
  onBump: () => sfx.bump(),
  onStep: (p) => {
    state.pos = { x: p.x, y: p.y };
    updateHudPlace(p);
    if (p.step % 8 === 0) save();
  },
});
game.setVisited(state.visited);
game.setNightMode(state.night);
if (state.shiny) game.setShiny(true);
if (state.layla) {
  const dog = npcs.find((n) => n.look === 'dog');
  if (dog) game.adoptDog();
}
setSound(state.sound);
updateHud();

setInterval(() => {
  if (mode === 'play' && !document.hidden) state.playSeconds += 1;
}, 1000);
window.addEventListener('pagehide', save);

const menuButtons = (el) => $$('button:not([hidden])', el);

function moveFocus(el, delta) {
  const btns = menuButtons(el);
  const i = btns.indexOf(document.activeElement);
  const next = btns[(i + delta + btns.length) % btns.length];
  next?.focus({ preventScroll: true });
  sfx.blip();
}

function handleAction(action, e) {
  if (document.body.classList.contains('mode-cv')) {
    if (action === 'b') {
      e?.preventDefault?.();
      closeCV();
    }
    return;
  }
  if (mode === 'boot') {
    if (action === 'a' || action === 'b') {
      e?.preventDefault?.();
      skipBoot();
    }
    return;
  }
  const layer = top();
  const nativeActivate = e instanceof KeyboardEvent && (e.code === 'Enter' || e.code === 'Space') && document.activeElement?.matches('button, a');

  if (mode === 'title' && !layer) {
    if (action === 'up' || action === 'down') {
      e?.preventDefault?.();
      moveFocus($('.title-menu'), action === 'up' ? -1 : 1);
    } else if (action === 'a' && !nativeActivate) {
      ($('.title-menu button:focus') || $('.title-menu [data-action="start"]')).click();
    } else if (action === 'cv') openCV();
    return;
  }

  if (layer) {
    const letNative = nativeActivate && (layer.name === 'menu' || layer.name === 'panel');
    if (!letNative) e?.preventDefault?.();
    switch (layer.name) {
      case 'dialog':
        if (action === 'a' || action === 'b') advanceDialog();
        break;
      case 'pack':
        if (action === 'a' || action === 'b') advancePack();
        break;
      case 'zoom':
        if (action === 'a' || action === 'b') popLayer();
        break;
      case 'menu':
        if (action === 'up' || action === 'down') moveFocus($('#menu .menu'), action === 'up' ? -1 : 1);
        else if (action === 'a' && !nativeActivate) document.activeElement?.click();
        else if (action === 'b' || action === 'menu') {
          sfx.back();
          popLayer();
        }
        break;
      case 'panel':
        if (action === 'b') {
          sfx.back();
          popLayer();
        } else if (action === 'a' && nativeActivate) {
          /* native button/link activation */
        } else if (action === 'up' || action === 'down') {
          $('.panel-body').scrollBy({ top: action === 'up' ? -60 : 60 });
        }
        break;
      default:
    }
    return;
  }

  if (mode !== 'play') return;
  if (['up', 'down', 'left', 'right', 'a'].includes(action)) e?.preventDefault?.();
  if (action === 'a') game.interact();
  else if (action === 'menu' || action === 'b') openMenu();
  else if (action === 'cv') openCV();
  else if (action === 'binder') openBinder();
  else if (action === 'trainer') openTrainer();
}

function openMenu() {
  sfx.select();
  updateHud();
  pushLayer('menu', $('#menu'));
}

function toggleSound() {
  state.sound = !state.sound;
  setSound(state.sound);
  if (state.sound) {
    unlockAudio();
    if (mode === 'play') startMusic();
    sfx.select();
  } else stopMusic();
  updateHud();
  save();
}

function cycleNight() {
  const order = ['auto', 'day', 'night'];
  state.night = order[(order.indexOf(state.night) + 1) % order.length];
  game.setNightMode(state.night);
  updateHud();
  save();
}

function startGame() {
  unlockAudio();
  sfx.chime();
  if (state.sound) startMusic();
  mode = 'play';
  $('#title').hidden = true;
  $('#hud').hidden = false;
  if (window.matchMedia('(pointer: coarse)').matches) $('#pad').hidden = false;
  game.startPlaying(state.pos);
  game.setPaused(false);
  canvas.focus?.({ preventScroll: true });
  if (!state.started) {
    state.started = true;
    save();
    const guide = npcs.find((n) => n.id === 'guide');
    setTimeout(() => openDialog(guide.name, guide.lines), 500);
  }
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  switch (action) {
    case 'start':
      startGame();
      break;
    case 'binder':
      if (top()?.name === 'menu') popLayer();
      openBinder();
      break;
    case 'trainer':
      if (top()?.name === 'menu') popLayer();
      openTrainer();
      break;
    case 'help':
      if (top()?.name === 'menu') popLayer();
      openHelp();
      break;
    case 'cv':
      openCV();
      break;
    case 'close-cv':
      closeCV();
      break;
    case 'print':
      window.print();
      break;
    case 'menu':
      openMenu();
      break;
    case 'sound':
      toggleSound();
      break;
    case 'night':
      cycleNight();
      break;
    case 'close':
      sfx.back();
      popLayer();
      break;
    case 'reset':
      if (window.confirm('Reset all progress and cards?')) {
        resetting = true;
        try {
          localStorage.removeItem(SAVE_KEY);
        } catch {
          /* ignore */
        }
        location.reload();
      }
      break;
    default:
  }
});

$$('.overlay').forEach((o) =>
  o.addEventListener('click', (e) => {
    if (e.target === o && (top()?.name === 'panel' || top()?.name === 'menu')) popLayer();
  }),
);

// ---------- Boot sequence ----------
let bootTimer = null;
function skipBoot() {
  if (mode !== 'boot') return;
  clearTimeout(bootTimer);
  mode = 'title';
  $('#boot').hidden = true;
  $('#title').hidden = false;
  $('.title-menu button').focus({ preventScroll: true });
}

document.fonts?.load('8px "Press Start 2P"').catch(() => {});
$('#boot').addEventListener('click', skipBoot);
bootTimer = setTimeout(skipBoot, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 300 : 2300);

if (location.hash === '#cv') {
  skipBoot();
  openCV(false);
}
