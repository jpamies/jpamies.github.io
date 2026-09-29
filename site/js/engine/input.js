// Keyboard, on-screen gamepad and konami-code detection.
const KEYMAP = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  Enter: 'a',
  Space: 'a',
  KeyZ: 'a',
  Escape: 'b',
  KeyX: 'b',
  Backspace: 'b',
  KeyM: 'menu',
  KeyC: 'cv',
  KeyB: 'binder',
  KeyT: 'trainer',
};

const KONAMI = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'];
const KONAMI_KEYS = { KeyB: 'b', KeyA: 'a' };

export function createInput({ onAction, onKonami }) {
  const held = new Set();
  const order = [];
  let konami = [];
  let run = false;
  let tapped = null;

  const press = (dir) => {
    if (!held.has(dir)) {
      order.push(dir);
      tapped = dir;
    }
    held.add(dir);
  };
  const release = (dir) => {
    held.delete(dir);
    const i = order.indexOf(dir);
    if (i >= 0) order.splice(i, 1);
  };

  const trackKonami = (token) => {
    konami.push(token);
    if (konami.length > KONAMI.length) konami.shift();
    if (konami.join() === KONAMI.join()) {
      konami = [];
      onKonami();
    }
  };

  window.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLElement && e.target.closest('input, textarea, [contenteditable]')) return;
    const action = KEYMAP[e.code];
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') run = true;
    if (!e.repeat) {
      const token = KONAMI_KEYS[e.code] || (['up', 'down', 'left', 'right'].includes(action) ? action : null);
      if (token) trackKonami(token);
    }
    if (!action) return;
    if (['up', 'down', 'left', 'right'].includes(action)) {
      press(action);
      onAction(action, e);
    } else if (!e.repeat) {
      onAction(action, e);
    }
  });
  window.addEventListener('keyup', (e) => {
    const action = KEYMAP[e.code];
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') run = false;
    if (action) release(action);
  });
  window.addEventListener('blur', () => {
    held.clear();
    order.length = 0;
  });

  // On-screen gamepad (shown on touch devices).
  document.querySelectorAll('[data-pad]').forEach((btn) => {
    const action = btn.dataset.pad;
    const down = (e) => {
      e.preventDefault();
      btn.classList.add('is-down');
      if (['up', 'down', 'left', 'right'].includes(action)) {
        press(action);
        trackKonami(action);
      } else {
        trackKonami(action);
      }
      onAction(action, e);
    };
    const up = (e) => {
      e.preventDefault();
      btn.classList.remove('is-down');
      release(action);
    };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointerleave', up);
    btn.addEventListener('pointercancel', up);
  });

  return {
    // Held direction, or a buffered tap that was released before the next frame.
    direction: () => (order.length ? order[order.length - 1] : tapped),
    consumeTap: () => {
      tapped = null;
    },
    running: () => run,
    clear: () => {
      held.clear();
      order.length = 0;
      tapped = null;
    },
  };
}
