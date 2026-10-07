/* ===========================================================
   content.js — loads data/content.json and builds every
   portfolio screen from it. To change any text, edit the JSON.
   =========================================================== */
let DATA = null;          // whole content.json
let C = null;             // { en: {...}, fr: {...} }
const TAGC = { VR: "var(--pink)", AR: "var(--amber)", AI: "var(--cyan)", WEB: "var(--green)" };

function loadContent() {
  return fetch("data/content.json", { cache: "no-store" })
    .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(j => { DATA = j; C = { en: j.en, fr: j.fr }; return j; });
}

const chips = a => `<div class="chips">${(a || []).map(t => `<span class="chip">${t}</span>`).join("")}</div>`;
const ICON_SWIM = `<svg viewBox="0 0 16 16" aria-hidden="true"><g fill="#ffd36b"><rect x="10" y="3" width="3" height="3"/><rect x="3" y="5" width="6" height="1"/><rect x="2" y="6" width="1" height="2"/><rect x="7" y="6" width="5" height="2"/></g><g fill="#6ff3ff"><rect x="0" y="9" width="3" height="1"/><rect x="3" y="10" width="3" height="1"/><rect x="6" y="9" width="3" height="1"/><rect x="9" y="10" width="3" height="1"/><rect x="12" y="9" width="4" height="1"/><rect x="1" y="13" width="3" height="1"/><rect x="4" y="12" width="3" height="1"/><rect x="7" y="13" width="3" height="1"/><rect x="10" y="12" width="3" height="1"/><rect x="13" y="13" width="3" height="1"/></g></svg>`;
const ICON_FILM = `<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="7" width="12" height="7" fill="#e7eeff"/><rect x="3" y="8" width="10" height="5" fill="#16244f"/><g fill="#ff6fd1"><rect x="2" y="3" width="12" height="3"/></g><g fill="#e7eeff"><rect x="4" y="3" width="2" height="3"/><rect x="8" y="3" width="2" height="3"/><rect x="12" y="3" width="2" height="3"/></g><rect x="2" y="6" width="1" height="1" fill="#e7eeff"/><g fill="#ffd36b"><rect x="5" y="10" width="1" height="1"/><rect x="7" y="9" width="1" height="3"/><rect x="9" y="10" width="2" height="1"/></g></svg>`;
const ICON_IN = `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="2" y="2" width="44" height="44" fill="none" stroke="#6ff3ff" stroke-width="3"/><rect x="11" y="20" width="5" height="17" fill="#6ff3ff"/><rect x="11" y="11" width="5" height="5" fill="#6ff3ff"/><path d="M21 20 H 26 V 23 Q 29 19 33 20 Q 37 21 37 27 V 37 H 32 V 28 Q 32 25 29.5 25 Q 26 25 26 29 V 37 H 21 Z" fill="#6ff3ff"/></svg>`;
const ICON_MAIL = `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="10" width="40" height="28" fill="none" stroke="#ff6fd1" stroke-width="3"/><path d="M5 12 L 24 27 L 43 12" fill="none" stroke="#ff6fd1" stroke-width="3"/></svg>`;
const ICON_GIT = `<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="#86ff9e" stroke-width="3"><circle cx="14" cy="10" r="4"/><circle cx="14" cy="38" r="4"/><circle cx="34" cy="16" r="4"/><path d="M14 14 V 34 M34 20 Q 34 28 18 32"/></g></svg>`;
const ICON_GAME = `<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1" y="5" width="14" height="7" fill="#c7ccd6"/><rect x="0" y="7" width="2" height="5" fill="#c7ccd6"/><rect x="14" y="7" width="2" height="5" fill="#c7ccd6"/><g fill="#16244f"><rect x="3" y="8" width="3" height="1"/><rect x="4" y="7" width="1" height="3"/></g><rect x="11" y="7" width="1.5" height="1.5" fill="#ff6fd1"/><rect x="12.5" y="8.5" width="1.5" height="1.5" fill="#6ff3ff"/></svg>`;
const ICON_MUSIC = `<svg viewBox="0 0 16 16" aria-hidden="true"><g fill="#6ff3ff"><rect x="5" y="2" width="9" height="2"/><rect x="5" y="2" width="2" height="10"/><rect x="12" y="2" width="2" height="8"/></g><g fill="#ff6fd1"><rect x="2" y="11" width="5" height="3"/><rect x="9" y="9" width="5" height="3"/></g></svg>`;
const ICON_BOOK = `<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="3" width="6" height="10" fill="#ffd36b"/><rect x="8" y="3" width="6" height="10" fill="#e7eeff"/><rect x="7" y="3" width="2" height="10" fill="#16244f"/><g fill="#8ea2cf"><rect x="10" y="5" width="3" height="1"/><rect x="10" y="7" width="3" height="1"/><rect x="10" y="9" width="2" height="1"/></g></svg>`;
const ICON_CODE = `<svg viewBox="0 0 16 16" aria-hidden="true"><g fill="#86ff9e"><rect x="1" y="7" width="2" height="2"/><rect x="3" y="5" width="2" height="2"/><rect x="3" y="9" width="2" height="2"/><rect x="13" y="7" width="2" height="2"/><rect x="11" y="5" width="2" height="2"/><rect x="11" y="9" width="2" height="2"/></g><g fill="#ffd36b"><rect x="9" y="2" width="2" height="3"/><rect x="8" y="5" width="2" height="3"/><rect x="7" y="8" width="2" height="3"/><rect x="6" y="11" width="2" height="3"/></g></svg>`;
const ICON_STAR = `<svg viewBox="0 0 16 16" aria-hidden="true"><g fill="#ffd36b"><rect x="7" y="1" width="2" height="4"/><rect x="1" y="6" width="14" height="2"/><rect x="5" y="5" width="6" height="5"/><rect x="3" y="10" width="3" height="3"/><rect x="10" y="10" width="3" height="3"/></g></svg>`;
const HOBBY_ICONS = { swim: ICON_SWIM, film: ICON_FILM, game: ICON_GAME, music: ICON_MUSIC, book: ICON_BOOK, code: ICON_CODE, star: ICON_STAR };
const typeLabel = t => (t === "AI" && lang === "fr") ? "IA" : t;

const screens = [
  // 0 · language
  () => `<div class="lang">
      <span class="kicker">${DATA.meta.name.toUpperCase()} · PORTFOLIO</span>
      <h2>CHOOSE YOUR LANGUAGE<small>CHOISISSEZ LA LANGUE</small></h2>
      <div class="menu" role="group" aria-label="Language">
        <button class="opt" type="button" data-lang="en">ENGLISH</button>
        <button class="opt" type="button" data-lang="fr">FRANÇAIS</button>
      </div>
      <span class="press">PRESS START ▶</span>
    </div>`,
  // 1 · profile
  () => { const p = C[lang].profile, m = DATA.meta; return `
    <div class="profile">
      <div class="avatar"><img src="${m.photo}" alt="Portrait of ${m.name}"></div>
      <div class="who">
        <span class="p1">${p.playerTag} · ${p.location.toUpperCase()}</span>
        <h1>${m.firstName}<br>${m.lastName}</h1>
        <p class="role">${p.role}</p>
        <p class="spec">${p.specialties}</p>
      </div>
    </div>
    <p class="desc">${p.description}</p>
    <div class="sub">${p.skillsTitle}</div>
    ${chips(DATA.skills)}`; },
  // 2 · education
  () => { const t = C[lang]; return `
    <h2>${t.screenTitles[2]}</h2>
    <ol class="tl">${t.education.map(e => `<li><span class="yr">${e.years}</span><b>${e.title}</b><span class="pl">${e.place}</span>${e.note ? `<span class="nt">${e.note}</span>` : ""}</li>`).join("")}</ol>
    <div class="sub">${t.certificationsTitle}</div>${chips(DATA.certifications)}`; },
  // 3 · experience
  () => { const t = C[lang]; return `
    <h2>${t.screenTitles[3]}</h2>
    <div class="cards">${t.experience.map(e => `<article class="card">
      <div class="top"><span class="co">${e.company}</span><span class="when">${e.dates} · ${e.place}</span></div>
      <p class="what">${e.role}</p>
      <ul>${e.bullets.map(x => `<li>${x}</li>`).join("")}</ul>${chips(e.tools)}</article>`).join("")}</div>`; },
  // 4 · projects
  () => { const t = C[lang]; return `
    <h2>${t.screenTitles[4]}</h2>
    <div class="grid">${t.projects.map(p => `<article class="cart">
      <div class="band"><span class="type" style="background:${TAGC[p.type] || "var(--dim)"}">${typeLabel(p.type)}</span><span class="when">${p.year}</span></div>
      <div class="body"><b>${p.title}</b><p>${p.description}</p>${chips(p.tools)}</div></article>`).join("")}</div>
    <a class="more" href="${DATA.meta.github}" target="_blank" rel="noopener">${t.moreProjectsLink}</a>`; },
  // 5 · hobbies
  () => { const t = C[lang]; return `
    <h2>${t.screenTitles[5]}</h2>
    <p>${t.hobbiesIntro}</p>
    <div class="hob">${t.hobbies.map(h => `<div class="htile">${HOBBY_ICONS[h.icon] || ICON_STAR}<b>${h.title}</b><span>${h.text}</span></div>`).join("")}</div>`; },
  // 6 · contact
  () => { const c = C[lang].contact, m = DATA.meta; return `
    <h2>${c.title}</h2>
    <p>${c.subtitle}</p>
    <div class="links">
      <a class="ltile" href="${m.linkedin}" target="_blank" rel="noopener">${ICON_IN}<b>LinkedIn</b><span>${lang === "fr" ? "Profil" : "Profile"}</span></a>
      <a class="ltile" href="mailto:${m.email}">${ICON_MAIL}<b>Gmail</b><span>${lang === "fr" ? "E-mail" : "Email"}</span></a>
      <a class="ltile" href="${m.github}" target="_blank" rel="noopener">${ICON_GIT}<b>GitHub</b><span>${m.githubHandle}</span></a>
    </div>
    <div class="mail"><code id="mailTxt">${m.email}</code><button class="copy" id="copyBtn" type="button">${c.copy}</button></div>
    <div class="end"><span class="gg">${c.thanks}</span><button class="again" id="againBtn" type="button">${c.playAgain}</button></div>`; }
];
const N = screens.length;
