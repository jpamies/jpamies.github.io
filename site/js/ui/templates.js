// Pure string templates (no DOM) so the Quick CV can also be pre-rendered at build time in Node.
import { profile, places, cards, cardById, badges, badgeById, types, rarities } from '../data.js';

export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const ext = (url, label, cls = '') =>
  `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;

export function cardHTML(card, { locked = false, isNew = false } = {}) {
  if (locked) {
    return `<button type="button" class="card is-locked" data-card="${esc(card.id)}" aria-label="Locked card">
  <span class="card-back"><span class="card-back-logo">?</span></span>
</button>`;
  }
  const type = types[card.type];
  const rarity = rarities[card.rarity];
  const links = [];
  if (card.links.live) links.push(ext(card.links.live, 'Live ↗', 'card-link'));
  if (card.links.repo) links.push(ext(card.links.repo, 'Code ↗', 'card-link'));
  return `<article class="card type-${esc(card.type)} rarity-${esc(card.rarity)}${isNew ? ' is-new' : ''}" data-card="${esc(card.id)}" tabindex="0" aria-label="${esc(card.name)} card">
  <div class="card-inner">
    <header class="card-head"><span class="card-name">${esc(card.name)}</span><span class="card-hp">HP<b>${esc(card.hp)}</b></span></header>
    <div class="card-art"><canvas width="16" height="16" data-icon="${esc(card.icon)}" aria-hidden="true"></canvas></div>
    <p class="card-type">${esc(type.label)} · ${esc(rarity.label)} <span aria-hidden="true">${esc(rarity.symbol)}</span></p>
    <ul class="card-moves">
      ${card.moves
        .map((m) => `<li><span class="move-name">${esc(m.name)}</span><span class="move-dmg">${esc(m.dmg)}</span><small>${esc(m.text)}</small></li>`)
        .join('')}
    </ul>
    <p class="card-stats"><span>Weakness: ${esc(card.weakness)}</span><span>Resistance: ${esc(card.resistance)}</span></p>
    <p class="card-flavor">${esc(card.flavor)}</p>
    ${links.length ? `<p class="card-links">${links.join('')}</p>` : ''}
  </div>
  <span class="card-shine" aria-hidden="true"></span>
</article>`;
}

function skillsHTML(skills = []) {
  return `<ul class="skills">${skills
    .map(
      (s) => `<li><span class="skill-name">${esc(s.name)}</span><meter min="0" max="100" value="${esc(s.level)}">${esc(s.level)}%</meter><span class="skill-lv">LV ${Math.round(s.level / 2)}</span></li>`,
    )
    .join('')}</ul>`;
}

function badgesHTML(ids) {
  return `<ul class="badges">${ids
    .map((id) => badgeById[id])
    .filter(Boolean)
    .map((b) => `<li class="badge badge-${esc(b.color)}" title="${esc(b.name)}"><span>${esc(b.short)}</span></li>`)
    .join('')}</ul>`;
}

export function placeHTML(place, collected) {
  const own = place.cards.map((id) => cardById[id]);
  const header =
    place.kind === 'career'
      ? `<p class="eyebrow">${esc(place.chapter)} · ${esc(place.period)}</p><h2 id="panel-title">${esc(place.name)}</h2>`
      : `<p class="eyebrow">Side quests</p><h2 id="panel-title">${esc(place.name)}</h2>`;
  const roles = (place.roles || [])
    .map(
      (r) => `<section class="role">
  <h3>${esc(r.title)} <span class="at">@ ${esc(r.company)}</span></h3>
  <p class="role-period">${esc(r.period)}</p>
  <ul class="quests">${r.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
</section>`,
    )
    .join('');
  return `${header}
<p class="panel-summary">${esc(place.summary)}</p>
${roles}
${place.skills ? `<h3 class="section-title">Skills gained</h3>${skillsHTML(place.skills)}` : ''}
${place.badges ? `<h3 class="section-title">Badges earned</h3>${badgesHTML(place.badges)}` : ''}
<h3 class="section-title">Cards found here</h3>
<div class="card-row">${own.map((c) => cardHTML(c, { locked: !collected.has(c.id) })).join('')}</div>`;
}

export function binderHTML(collected) {
  return `<p class="eyebrow">${collected.size} / ${cards.length} collected</p>
<h2 id="panel-title">Card Binder</h2>
<p class="panel-summary">Visit every place in town to complete the collection. Some cards are… secret.</p>
<div class="card-grid">${cards.map((c) => cardHTML(c, { locked: !collected.has(c.id) })).join('')}</div>`;
}

export function trainerHTML(state) {
  const minutes = Math.max(1, Math.round(state.playSeconds / 60));
  return `<p class="eyebrow">Trainer Card</p>
<div class="trainer">
  <canvas class="trainer-avatar" width="16" height="16" data-icon="${state.shiny ? 'star' : 'hero'}" aria-hidden="true"></canvas>
  <dl>
    <dt>Name</dt><dd>${esc(profile.name)}</dd>
    <dt>Class</dt><dd>${esc(profile.title)}</dd>
    <dt>Home</dt><dd>${esc(profile.location)}</dd>
    <dt>XP</dt><dd>${new Date().getFullYear() - profile.since} years</dd>
    <dt>Cards</dt><dd>${state.collected.size} / ${cards.length}</dd>
    <dt>Places</dt><dd>${state.visited.size} / ${places.length}</dd>
    <dt>Your time</dt><dd>${minutes} min</dd>
  </dl>
</div>
<h3 class="section-title">Badges</h3>
${badgesHTML(badges.map((b) => b.id))}
<ul class="badge-legend">${badges.map((b) => `<li><b>${esc(b.short)}</b> ${esc(b.name)}${b.year ? ` (${b.year})` : ''}</li>`).join('')}</ul>
<p class="links">${profile.links.map((l) => ext(l.url, `${l.label} ↗`, 'btn')).join(' ')}</p>`;
}

// Recruiter-friendly, printable CV. Same data as the game.
export function cvHTML() {
  const career = places.filter((p) => p.kind === 'career').slice().reverse();
  const projects = cards.filter((c) => c.links.repo);
  const allSkills = [...new Set(career.flatMap((p) => (p.skills || []).map((s) => s.name)))];
  return `<header class="cv-header">
  <h1>${esc(profile.name)}</h1>
  <p class="cv-title">${esc(profile.title)} · ${esc(profile.location)}</p>
  <p class="cv-links">${profile.links.map((l) => ext(l.url, l.label)).join(' · ')}</p>
</header>
<section aria-labelledby="cv-about">
  <h2 id="cv-about">About</h2>
  <p>${esc(profile.summary)}</p>
</section>
<section aria-labelledby="cv-exp">
  <h2 id="cv-exp">Experience</h2>
  ${career
    .flatMap((p) => p.roles)
    .map(
      (r) => `<article class="cv-role">
    <h3>${esc(r.title)} — ${esc(r.company)}</h3>
    <p class="cv-period">${esc(r.period)}</p>
    <ul>${r.points.map((pt) => `<li>${esc(pt)}</li>`).join('')}</ul>
  </article>`,
    )
    .join('')}
</section>
<section aria-labelledby="cv-certs">
  <h2 id="cv-certs">Certifications</h2>
  <ul>${badges.map((b) => `<li>${esc(b.name)}${b.year ? ` — ${b.year}` : ''}</li>`).join('')}</ul>
</section>
<section aria-labelledby="cv-projects">
  <h2 id="cv-projects">Selected open source &amp; side projects</h2>
  <ul class="cv-projects">${projects
    .map((c) => `<li><b>${ext(c.links.repo, c.name)}</b>${c.links.live ? ` (${ext(c.links.live, 'live')})` : ''} — ${esc(c.flavor)}</li>`)
    .join('')}</ul>
</section>
<section aria-labelledby="cv-skills">
  <h2 id="cv-skills">Skills</h2>
  <p>${allSkills.map(esc).join(' · ')}</p>
</section>
<section aria-labelledby="cv-edu">
  <h2 id="cv-edu">Education &amp; languages</h2>
  <p>${esc(profile.education)} · ${profile.languages.map(esc).join(', ')}</p>
</section>`;
}
