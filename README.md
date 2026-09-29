# ☁️ Cloud Quest — jpamies.com

[![Build & deploy](https://github.com/jpamies/jpamies.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/jpamies/jpamies.github.io/actions/workflows/deploy.yml)
[![Security](https://github.com/jpamies/jpamies.github.io/actions/workflows/security.yml/badge.svg)](https://github.com/jpamies/jpamies.github.io/actions/workflows/security.yml)

The personal site of **Jordi Pàmies** (Solutions Engineer @ Microsoft, ex Senior Solutions Architect @ AWS) —
built as a **retro pixel-art RPG**. Walk around *Barcelona Tech Coast*, enter the buildings of each career
chapter, open booster packs and collect holographic trading cards of roles and open-source projects.

> In a hurry? Every piece of content is also available as a plain, printable **Quick CV** at
> [`jpamies.com/#cv`](https://jpamies.com/#cv) (press <kbd>C</kbd> in-game).

## ✨ Features

| | |
|---|---|
| 🗺️ **Overworld** | Procedural pixel-art town (no image assets): 6 career buildings in chronological order along the *Career Road*, 3 project hubs, the Sagrada Família (under construction, obviously), a harbour, a beach and a stadium. |
| 🃏 **Card binder** | 21 collectible cards with 3D tilt + holo foil, booster-pack opening animation, rarities and secrets. |
| 🏅 **Trainer card** | Certifications shown as gym badges. |
| 🌙 **Day/night** | Follows the visitor's local clock: lit windows, a lighthouse beam, stadium floodlights. |
| 🎵 **Chiptune** | Original theme + SFX synthesised live with WebAudio (no audio files). |
| 📱 **Everywhere** | Keyboard, mouse, touch (tap-to-walk with path-finding + on-screen gamepad). |
| ♿ **Accessible** | Skip link, semantic Quick CV, no-JS fallback, `prefers-reduced-motion`, printable CV. |
| 🔒 **Private & safe** | Zero third-party requests, no cookies, no analytics. Strict CSP. Progress stays in `localStorage`. |
| 🥚 **Secrets** | A very good dog and an old-school cheat code. |

## 🧱 Tech

- **Vanilla ES modules, zero runtime/npm dependencies** → nothing to supply-chain-attack, nothing to update.
- `<canvas>` renderer with integer scaling, tile map, BFS path-finding and an auto-outlining sprite generator.
- All content lives in **one file**: [`site/js/data.js`](site/js/data.js).
- A tiny Node build ([`scripts/build.mjs`](scripts/build.mjs)) pre-renders the CV and JSON-LD into `index.html` for SEO and no-JS visitors.
- Tests with the built-in `node:test` runner.

```
site/                 ← everything that gets published
  index.html          ← shell + Quick CV placeholder
  js/data.js          ← ✏️ career, cards, NPCs, signs (single source of truth)
  js/engine/          ← world, sprites, tiles, buildings, input, audio, game loop
  js/ui/templates.js  ← pure HTML templates (shared with the build)
  css/                ← styles (+ nojs.css / 404.css)
scripts/              ← build.mjs, serve.mjs (zero-dependency)
tests/                ← node:test suites (world, data, templates/XSS, build/CSP)
docs/                 ← architecture, content editing, deployment & DNS
```

## 🚀 Run locally

Requires **Node.js ≥ 20** (no `npm install` needed — there are no dependencies).

```bash
npm run serve          # http://127.0.0.1:8080 (serves site/ as-is)
npm test               # all tests (also builds dist/)
npm run build          # production build into dist/
node scripts/serve.mjs dist 8080   # preview the production build
```

Any static server works too, e.g. `python -m http.server -d site 8080`.

## 🌍 Deployment

Every push to `master`/`main` runs tests, builds `dist/` and deploys it to **GitHub Pages** via
GitHub Actions (OIDC, no stored secrets). Pull requests only run the checks.
Custom domain and DNS setup: see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## 📚 Docs

- [docs/CONTENT.md](docs/CONTENT.md) — how to update jobs, projects and cards
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — how the engine works
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — GitHub Pages, custom domain, DNS, HTTPS
- [SECURITY.md](SECURITY.md) — security model and how to report issues

## 📄 License

- Code: [MIT](LICENSE).
- Personal content (texts, career data) © Jordi Pàmies — please don't reuse it as your own CV 🙂.
- Font: *Press Start 2P* by CodeMan38, [SIL Open Font License 1.1](site/assets/fonts/OFL.txt).
- Company and product names belong to their respective owners and are used only to describe work history.
