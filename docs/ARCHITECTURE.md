# Architecture

```
index.html ──► js/main.js (UI state machine, overlays, save/load)
                 │
                 ├─ js/engine/game.js      loop · player · NPCs · camera · rendering
                 │    ├─ world.js          map generation, buildings, collision, BFS path-finding  (pure)
                 │    ├─ tiles.js          ground layer, pre-rendered once per water frame
                 │    ├─ buildings.js      façades, props, signs (+ per-frame animations & night lights)
                 │    ├─ sprites.js        people, dog, card icons (procedural + auto-outline)
                 │    ├─ logos.js          pixel-art company / university logo homages
                 │    ├─ pixel.js / font.js palette, helpers, 3×5 bitmap font
                 │    └─ input.js          keyboard, touch pad, konami code
                 ├─ js/engine/audio.js     WebAudio chiptune
                 ├─ js/ui/templates.js     HTML string templates (pure, escaped)
                 └─ js/data.js             all content (pure)
```

## Rendering

- The canvas has a small internal resolution (≈320×180 on desktop) and is scaled by an integer factor
  with `image-rendering: pixelated`, so every pixel stays crisp.
- The static ground (48×36 tiles of 16 px) is pre-rendered into 4 canvases (one per water animation
  frame). Buildings and props are cached as sprites; only animated details are drawn per frame.
- Sprites are drawn with rectangles and then **auto-outlined** (every transparent pixel next to an
  opaque one becomes ink) — no image files, no copyrighted assets.
- Night mode multiplies the scene with a dark overlay and adds `lighter` radial gradients for lights.

## Game logic

- Tile-based movement with interpolation; tap/click uses BFS over the tile grid, with NPCs as dynamic
  obstacles. NPCs only wander on grass/plaza, never on roads, so they can't block a path.
- Entering a door (walking up into it) opens the place panel. First visits open a booster pack with that
  place's cards. Visiting every place awards the Legendary card.
- UI overlays are a stack of layers (`dialog`, `pack`, `panel`, `menu`, `zoom`); the top layer receives
  input and the world is paused while any is open.

## Build

`scripts/build.mjs` copies `site/` → `dist/`, injects the Quick CV (from `cvHTML()`) and a schema.org
`Person` JSON-LD block, and aborts if any dotfile other than `.nojekyll` would be published.

## Tests

| Suite | Checks |
|---|---|
| `world.test.js` | map determinism, no overlaps, every door/NPC/sign reachable, path contiguity |
| `data.test.js` | ids, references, every card obtainable, HTTPS links, font coverage, no PII |
| `templates.test.js` | XSS escaping, safe external links, no inline styles/scripts/handlers (CSP) |
| `build.test.js` | pre-render, strict CSP, assets exist, no third-party network calls |
