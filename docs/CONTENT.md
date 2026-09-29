# Editing content

Everything visitors read comes from **[`site/js/data.js`](../site/js/data.js)**. The game, the card
binder, the trainer card, the Quick CV and the build-time pre-render all use it. After editing, run
`npm test` — the tests catch broken references, unreachable cards, non-HTTPS links and accidental
e-mail/phone numbers.

## Update a job / chapter

`places` entries with `kind: 'career'` are the chapters (and buildings). Each has:

```js
{
  id: 'microsoft',            // must match a building in js/engine/world.js
  kind: 'career',
  chapter: 'Chapter VI',
  name: 'Microsoft Campus',   // building name in game
  period: '2026 – now',
  summary: '…',
  roles: [{ title, company, period, points: ['…'] }], // Quick CV timeline
  skills: [{ name: 'Azure', level: 85 }],               // XP bars (0–100)
  badges: ['aws-sa'],          // optional, ids from `badges`
  logos: ['microsoft'],        // optional, pixel logos from js/engine/logos.js (+ name in `logoNames`)
  cards: ['solutions-engineer'],
}
```

The UPC campus uses `kind: 'education'` (shown in game, not in the CV timeline; the CV lists
`profile.education`). To add the degree or years, edit its `roles[0]` (`title`, `period`).

## Add or change a logo

Logos are tiny procedural drawings in `site/js/engine/logos.js` (`LOGOS[id] = { w, h, draw(ctx) }`).
Add the accessible name to `logoNames` in `data.js`, reference the id from a place's `logos`, and place
it on the façade in the building's `STYLES[...]` drawer in `js/engine/buildings.js`.

Roles inside a place are listed newest first; places are listed oldest first (the CV reverses them).

## Add a project card

1. Add an entry to `cards` (use an existing `type`, `rarity` and `icon`; icons are in
   `js/engine/sprites.js`).
2. Reference its `id` from a project place (`harbor`, `stadium`, `library`) or create a new place.
3. Links must be `https://`.

## Add a new building

1. Add a `places` entry.
2. Add a building to `buildings` in `js/engine/world.js` with position, size, door column and `style`.
3. Add a road polyline from the door front (`doorY + 1`) to the network.
4. Add a `STYLES[style]` drawer in `js/engine/buildings.js` (or reuse one).
5. `npm test` verifies the door is reachable and nothing overlaps.

## Certifications

`badges` → shown on the Trainer Card and in the CV.

## Social preview

`site/assets/og-image.png` (1200×630) is a capture of the title screen. Replace it if the look changes.
