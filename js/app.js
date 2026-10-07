/* ===========================================================
   app.js — screen flow: standby, boot, main menu, loading screens, portfolio navigation, input, screensaver
   =========================================================== */
let booted = false, booting = false;
// ---------- idle screensaver (5 s without input) ----------
const SAVER = (() => {
  const box = document.getElementById("saver"), logo = document.getElementById("saverLogo");
  const cols = ["#6ff3ff", "#ff6fd1", "#ffd36b", "#86ff9e", "#c77dff", "#ff6f7d", "#5b8cff"];
  let on = false, raf = 0, x = 0, y = 0, vx = 0, vy = 0, ci = 0, lastT = 0, lastInput = performance.now(), swallow = false;
  function recolor() { ci = (ci + 1 + Math.floor(Math.random() * (cols.length - 1))) % cols.length; logo.style.color = cols[ci]; }
  function frame(t) {
    if (!on) return;
    raf = requestAnimationFrame(frame);
    const dt = lastT ? Math.min(.05, (t - lastT) / 1000) : 0; lastT = t;
    const W = box.clientWidth, H = box.clientHeight, lw = logo.offsetWidth, lh = logo.offsetHeight;
    x += vx * dt; y += vy * dt;
    let hit = 0;
    if (x <= 0) { x = 0; vx = Math.abs(vx); hit++; } else if (x >= W - lw) { x = W - lw; vx = -Math.abs(vx); hit++; }
    if (y <= 0) { y = 0; vy = Math.abs(vy); hit++; } else if (y >= H - lh) { y = H - lh; vy = -Math.abs(vy); hit++; }
    if (hit) { recolor(); if (hit === 2) SFX.chime(); }
    logo.style.transform = `translate(${x}px, ${y}px)`;
  }
  function show() {
    on = true; box.classList.add("on");
    const W = box.clientWidth, H = box.clientHeight, sp = Math.max(60, W * .2);
    x = Math.random() * Math.max(1, W - logo.offsetWidth); y = Math.random() * Math.max(1, H - logo.offsetHeight);
    vx = sp * (Math.random() < .5 ? -1 : 1); vy = sp * .75 * (Math.random() < .5 ? -1 : 1);
    lastT = 0; raf = requestAnimationFrame(frame);
  }
  function hide() { on = false; box.classList.remove("on"); cancelAnimationFrame(raf); }
  function activity(e) {
    lastInput = performance.now();
    if (!on) return;
    hide();
    if (e.type === "keydown" || e.type === "pointerdown" || e.type === "touchstart") {
      e.stopImmediatePropagation();
      if (e.type === "pointerdown") swallow = true;
    }
  }
  ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"].forEach(t => addEventListener(t, activity, { capture: true, passive: t !== "keydown" }));
  addEventListener("click", e => { if (swallow) { swallow = false; e.stopImmediatePropagation(); e.preventDefault(); } }, { capture: true });
  setInterval(() => {
    if (on || !booted || busy || !tvOn || !consoleOn) return;
    const ok = mode === "home" || mode === "portfolio" || (mode === "game" && GAME.idleOK());
    if (ok && performance.now() - lastInput > 15000) show();
  }, 400);
  return { hide };
})();

function kick(e) { SFX.start(); if (!tvOn || !consoleOn) return; if (e && e.target && e.target.closest && e.target.closest('[data-act="tvPower"],[data-act="consolePower"],[data-act="sound"]')) return; startBoot(); }
addEventListener("pointerdown", kick, { capture: true });
addEventListener("keydown", e => { if (e.key !== "m" && e.key !== "M") kick(e); }, { capture: true });

const $ = s => document.querySelector(s);
const view = $("#view"), screenEl = $("#screen"), hudL = $("#hudL"), hudT = $("#hudT"), langBtn = $("#langBtn"),
      dotsEl = $("#dots"), hint = $("#hint"), prevBtn = $("#prev"), nextBtn = $("#next"), lcd = $("#lcd"), noise = $("#noise");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
let cur = 0, lang = "en", sel = 0, busy = false, mode = "standby", homeSel = 0;
const homeBtn = $("#homeBtn"), homeLbl = $("#homeLbl");

function paintSel() { view.querySelectorAll(".opt").forEach((b, k) => b.classList.toggle("sel", k === sel)); }

function render() {
  mode = "portfolio"; GAME.stop();
  screenEl.classList.remove("pre", "nofoot");
  homeBtn.hidden = false; homeLbl.textContent = lang === "fr" ? "ACCUEIL" : "HOME";
  view.innerHTML = screens[cur]();
  view.className = "view" + (cur >= 5 ? " fit" : "");
  view.scrollTop = 0;
  const t = C[lang];
  hudL.textContent = cur === 0 ? "INSERT COIN" : `${t.stageLabel} ${cur}/${N - 1}`;
  hudT.textContent = t.screenTitles[cur];
  langBtn.hidden = cur === 0;
  langBtn.textContent = lang === "en" ? "FR" : "EN";
  langBtn.setAttribute("aria-label", lang === "en" ? "Passer en français" : "Switch to English");
  prevBtn.hidden = cur === 0;
  nextBtn.hidden = cur === N - 1;
  hint.textContent = cur === 0 ? "◀ ▶ · ENTER" : t.navigationHint;
  lcd.textContent = "CH " + String(cur).padStart(2, "0");
  document.documentElement.lang = lang;
  dotsEl.innerHTML = Array.from({ length: N }, (_, k) =>
    `<button class="dot${k === cur ? " on" : ""}" type="button" data-go="${k}" aria-label="${k === 0 ? "Language" : t.screenTitles[k]}"></button>`).join("");
  if (cur === 0) {
    paintSel();
    view.querySelectorAll(".ltile, .more").forEach(a => a.addEventListener("click", () => SFX.press()));
    view.querySelectorAll("[data-lang]").forEach((b, k) => {
      b.addEventListener("click", () => { sel = k; lang = b.dataset.lang; SFX.chime(); go(1); });
      b.addEventListener("mouseenter", () => { if (sel !== k) SFX.tick(); sel = k; paintSel(); });
    });
  }
  const copyBtn = $("#copyBtn");
  if (copyBtn) copyBtn.addEventListener("click", () => {
    const done = () => { copyBtn.textContent = C[lang].contact.copied; SFX.chime(); };
    const fallback = () => { const r = document.createRange(); r.selectNodeContents($("#mailTxt")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
    try { navigator.clipboard.writeText(DATA.meta.email).then(done, fallback); } catch (e) { fallback(); }
  });
  const again = $("#againBtn");
  if (again) again.addEventListener("click", () => go(0));
}

let noiseRAF = 0;
function drawNoise() {
  const ctx = noise.getContext("2d"), img = ctx.createImageData(noise.width, noise.height), d = img.data;
  for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255 | 0; d[i] = v; d[i + 1] = v; d[i + 2] = v + 20; d[i + 3] = 255; }
  ctx.putImageData(img, 0, 0);
  noiseRAF = requestAnimationFrame(drawNoise);
}
function channel(cb) {
  SFX.zap();
  if (reduce) { cb(); return; }
  busy = true;
  screenEl.classList.add("switching");
  setTimeout(cb, 130);
  setTimeout(() => { screenEl.classList.remove("switching"); busy = false; }, 290);
}
function go(i) {
  if (!tvOn || !consoleOn || !booted || mode !== "portfolio" || busy || i < 0 || i >= N || i === cur) return;
  if (cur === 0 && i > 0) lang = sel === 0 ? "en" : "fr";
  channel(() => { cur = i; render(); });
}

prevBtn.addEventListener("click", () => { SFX.blip(); go(cur - 1); });
nextBtn.addEventListener("click", () => { SFX.blip(); go(cur + 1); });
langBtn.addEventListener("click", () => { if (busy) return; SFX.press(); lang = lang === "en" ? "fr" : "en"; sel = lang === "en" ? 0 : 1; channel(render); });
dotsEl.addEventListener("click", e => { const b = e.target.closest("[data-go]"); if (b) { SFX.tick(); go(+b.dataset.go); } });

function act(name) {
  if (name === "tvPower") { toggleTV(); return; }
  if (name === "consolePower") { toggleConsole(); return; }
  if (!tvOn || !consoleOn) { if (name === "sound") { SFX.toggle(); paintSound(); } return; }
  if (name === "sound") { SFX.toggle(); paintSound(); if (!SFX.muted) SFX.tick(); return; }
  if (!booted) return;
  if (mode === "game") { if (name === "home") { SFX.press(); goHome(); } else GAME.input(name); return; }
  SFX.press();
  if (name === "home") { goHome(); return; }
  if (mode === "home") {
    if (name === "up" || name === "prev") moveHome(-1); else if (name === "down" || name === "next") moveHome(1); else if (name === "a") pickHome(homeSel);
    return;
  }
  if (mode !== "portfolio") return;
  if (name === "prev" || name === "b") go(cur - 1);
  else if (name === "next") go(cur + 1);
  else if (name === "a") { if (cur === 0) { lang = sel === 0 ? "en" : "fr"; } go(cur + 1); }
  else if ((name === "up" || name === "down") && cur === 0) { sel = 1 - sel; paintSel(); }
}
document.addEventListener("click", e => { const a = e.target.closest("[data-act]"); if (a) act(a.dataset.act); });
document.addEventListener("keydown", e => {
  if (!tvOn || !consoleOn) { if ((e.key === "m" || e.key === "M")) act("sound"); return; }
  const a = e.target.closest && e.target.closest("svg [data-act]");
  if (a && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); act(a.dataset.act); return; }
  if ((e.key === "m" || e.key === "M") && !e.target.closest("input,textarea")) { act("sound"); return; }
  if (!booted) return;
  if (mode === "game") { GAME.key(e); return; }
  if (mode === "home") {
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); SFX.tick(); moveHome(-1); }
    else if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); SFX.tick(); moveHome(1); }
    else if (e.key === "Enter" && !e.target.closest("button,a")) { pickHome(homeSel); }
    return;
  }
  if (mode !== "portfolio") return;
  if (e.key === "Escape") { goHome(); return; }
  if (e.key === "ArrowRight") { e.preventDefault(); SFX.blip(); go(cur + 1); }
  else if (e.key === "ArrowLeft") { e.preventDefault(); SFX.blip(); go(cur - 1); }
  else if (cur === 0 && (e.key === "ArrowUp" || e.key === "ArrowDown")) { e.preventDefault(); SFX.tick(); sel = 1 - sel; paintSel(); }
  else if (cur === 0 && e.key === "Enter" && !e.target.closest("button,a")) { SFX.chime(); go(1); }
  else if ((e.key === "m" || e.key === "M") && !e.target.closest("input,textarea")) { act("sound"); }
});

let tx = 0, ty = 0;
screenEl.addEventListener("touchstart", e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
screenEl.addEventListener("touchend", e => {
  if (!tvOn || !consoleOn) return;
  const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
  if (mode === "game") { if (!e.target.closest("button")) GAME.swipe(dx, dy); return; }
  if (mode !== "portfolio") return;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) go(cur + (dx < 0 ? 1 : -1));
}, { passive: true });

// ---------- loading bar used by every loading screen ----------
function runBar(D) {
  const fill = document.getElementById("barFill"), pct = document.getElementById("pct"), t0 = performance.now();
  (function step(now) {
    const p = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - p, 2);
    if (fill) fill.style.width = (e * 100).toFixed(1) + "%"; if (pct) pct.textContent = Math.round(e * 100) + "%";
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}
// ---------- main menu ----------
function renderHome() {
  mode = "home"; GAME.stop();
  screenEl.classList.remove("pre"); screenEl.classList.add("nofoot");
  hudL.textContent = "1P READY"; hudT.textContent = lang === "fr" ? "MENU PRINCIPAL" : "MAIN MENU";
  langBtn.hidden = true; homeBtn.hidden = true; prevBtn.hidden = true; nextBtn.hidden = true;
  lcd.textContent = "MENU";
  view.className = "view";
  view.innerHTML = `<div class="lang home">
      <div class="oblogo sm">OB</div>
      <h2>MAIN MENU<small>MENU PRINCIPAL</small></h2>
      <div class="menu" role="group" aria-label="Main menu">
        <button class="opt" type="button" data-pick="0">PORTFOLIO</button>
        <button class="opt" type="button" data-pick="1">PLAY · BLOCK DROP</button>
      </div>
      <span class="press">▲ ▼ · ENTER</span>
    </div>`;
  paintHome();
  view.querySelectorAll("[data-pick]").forEach(b => {
    const k = +b.dataset.pick;
    b.addEventListener("click", () => pickHome(k));
    b.addEventListener("mouseenter", () => { if (homeSel !== k) SFX.tick(); homeSel = k; paintHome(); });
  });
}
function paintHome() { view.querySelectorAll("[data-pick]").forEach(b => b.classList.toggle("sel", +b.dataset.pick === homeSel)); }
function moveHome(d) { homeSel = (homeSel + d + 2) % 2; paintHome(); }
function pickHome(k) {
  if (mode !== "home" || busy) return;
  homeSel = k; SFX.chime();
  if (k === 0) loadScreen("portfolio", () => { cur = 0; render(); });
  else loadScreen("game", () => GAME.start());
}
function goHome() {
  if (!booted || mode === "loading" || mode === "home" || busy) return;
  GAME.stop(); channel(renderHome);
}
const OB_MAP = [
  ".###...####.",
  "#...#..#...#",
  "#...#..#...#",
  "#...#..####.",
  "#...#..#...#",
  "#...#..#...#",
  ".###...####."
];
const OB_CELLS = [];
OB_MAP.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === "#") OB_CELLS.push([c, r]); }));
function ldCanvas(wf, hf) {
  const cv = document.getElementById("ldc"), dpr = window.devicePixelRatio || 1;
  const w = Math.max(160, view.clientWidth * wf), h = Math.max(100, view.clientHeight * hf);
  cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + "px"; cv.style.height = h + "px";
  const x = cv.getContext("2d"); x.scale(dpr, dpr);
  return { x, w, h };
}
// Portfolio: dots fly together and link up into the OB logo
function runConstellation(done) {
  const { x, w, h } = ldCanvas(.82, .6);
  const g = Math.min(w / 14, h / 9), ox = (w - 12 * g) / 2 + g / 2, oy = (h - 7 * g) / 2 + g / 2;
  const P = OB_CELLS.map(([c, r], i) => {
    const a = Math.random() * Math.PI * 2, d = Math.max(w, h) * (.6 + Math.random() * .5);
    return { sx: w / 2 + Math.cos(a) * d, sy: h / 2 + Math.sin(a) * d, tx: ox + c * g, ty: oy + r * g, c, r, delay: Math.random() * 450 };
  });
  const links = [];
  P.forEach((a, i) => P.forEach((b, j) => { if (j > i && Math.abs(a.c - b.c) <= 1 && Math.abs(a.r - b.r) <= 1) links.push([i, j]); }));
  const t0 = performance.now(), ease = t => 1 - Math.pow(1 - t, 3);
  SFX.shimmer();
  setTimeout(() => { const t = document.getElementById("ldt"); if (t) t.classList.add("on"); }, 1400);
  (function frame(now) {
    const t = now - t0;
    if (!document.getElementById("ldc")) return;
    x.clearRect(0, 0, w, h);
    const pos = P.map(p => { const k = ease(Math.min(1, Math.max(0, (t - p.delay) / 1000))); return { x: p.sx + (p.tx - p.sx) * k, y: p.sy + (p.ty - p.sy) * k, k }; });
    links.forEach(([i, j]) => {
      const a = pos[i], b = pos[j], al = Math.min(a.k, b.k);
      if (al < .6) return;
      x.strokeStyle = `rgba(111,243,255,${(al - .6) * 1.6})`; x.lineWidth = 1.2;
      x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke();
    });
    pos.forEach((p, i) => {
      const hue = P[i].c / 11, col = `rgb(${Math.round(111 + hue * 144)},${Math.round(243 - hue * 132)},${Math.round(255 - hue * 46)})`;
      const pulse = t > 1500 ? 1 + .25 * Math.sin((t - 1500) / 120 + i) : 1;
      x.shadowColor = col; x.shadowBlur = 10; x.fillStyle = col;
      x.beginPath(); x.arc(p.x, p.y, Math.max(2, g * .16) * pulse, 0, Math.PI * 2); x.fill();
      x.shadowBlur = 0;
    });
    if (t < 2700) requestAnimationFrame(frame);
  })(t0);
  setTimeout(done, 2700);
}
// Game: blocks rain down to spell OB, a full line clears, then GET READY
function runBlockRain(done) {
  const { x, w, h } = ldCanvas(.82, .62);
  const COLS = 14, ROWS = 9, g = Math.floor(Math.min(w / COLS, h / ROWS)), ox = (w - COLS * g) / 2, oy = (h - ROWS * g) / 2;
  const pal = ["#6ff3ff", "#ffd36b", "#c77dff", "#86ff9e", "#ff6f7d", "#5b8cff", "#ffa24c"];
  const cells = [];
  for (let c = 0; c < COLS; c++) cells.push({ c, r: 8 });
  OB_CELLS.slice().sort((a, b) => b[1] - a[1] || a[0] - b[0]).forEach(([c, r]) => cells.push({ c: c + 1, r: r + 1 }));
  cells.forEach((cl, i) => { cl.t = i * 32; cl.col = pal[(cl.c + cl.r) % pal.length]; cl.landed = false; });
  const landEnd = cells[cells.length - 1].t + 180, flashAt = landEnd + 80, dropAt = flashAt + 320, readyAt = dropAt + 180;
  function blk(px, py, col, a) {
    x.globalAlpha = a; x.fillStyle = col; x.fillRect(px, py, g, g);
    const b = Math.max(2, Math.round(g * .16));
    x.fillStyle = "rgba(255,255,255,.45)"; x.fillRect(px, py, g, b); x.fillRect(px, py, b, g);
    x.fillStyle = "rgba(0,0,0,.35)"; x.fillRect(px, py + g - b, g, b); x.fillRect(px + g - b, py, b, g);
    x.globalAlpha = 1;
  }
  const t0 = performance.now(); let cleared = false, readied = false;
  (function frame(now) {
    const t = now - t0;
    if (!document.getElementById("ldc")) return;
    x.clearRect(0, 0, w, h);
    x.strokeStyle = "rgba(77,99,160,.25)"; x.strokeRect(ox - 2, oy - 2, COLS * g + 4, ROWS * g + 4);
    const shift = t > dropAt ? Math.min(1, (t - dropAt) / 150) : 0;
    cells.forEach(cl => {
      if (t < cl.t) return;
      if (cl.r === 8 && t > dropAt) return;
      const k = Math.min(1, (t - cl.t) / 180), fy = -g + (oy + cl.r * g + g) * (k * k);
      if (k >= 1 && !cl.landed) { cl.landed = true; if (cells.indexOf(cl) % 2 === 0) SFX.tock(); }
      let y = k < 1 ? fy : oy + cl.r * g;
      if (cl.r < 8) y += shift * g;
      let col = cl.col;
      if (cl.r === 8 && t > flashAt && t < dropAt) col = Math.floor((t - flashAt) / 80) % 2 ? "#ffffff" : cl.col;
      blk(ox + cl.c * g, y, col, 1);
    });
    if (t > flashAt && !cleared) { cleared = true; SFX.clear(); }
    if (t > readyAt && !readied) { readied = true; SFX.ready(); const r = document.getElementById("ldt"); if (r) r.classList.add("on"); }
    if (t < readyAt + 700) requestAnimationFrame(frame);
  })(t0);
  setTimeout(done, readyAt + 750);
}
function loadScreen(kind, cb) {
  mode = "loading";
  channel(() => {
    screenEl.classList.add("pre");
    view.className = "view loadv";
    view.innerHTML = kind === "portfolio"
      ? `<div class="ld"><canvas id="ldc"></canvas><span class="ldtxt" id="ldt">${DATA.meta.name.toUpperCase()}</span></div>`
      : `<div class="ld"><canvas id="ldc"></canvas><span class="ldtxt ready" id="ldt">GET READY!</span></div>`;
    lcd.textContent = "LOAD";
    const ep = powerEpoch;
    const finish = () => { if (ep !== powerEpoch) return; screenEl.classList.remove("pre"); channel(cb); };
    if (kind === "portfolio") runConstellation(finish); else runBlockRain(finish);
  });
}

function renderStandby() {
  screenEl.classList.add("pre");
  view.className = "view";
  view.innerHTML = `<div class="boot"><div class="oblogo dim">OB</div><span class="press">PRESS START</span><span class="sub2">${matchMedia("(pointer: coarse)").matches ? "Tap the screen to turn on<br>Touchez l'écran pour allumer" : "Click or press any key to turn on<br>Cliquez ou appuyez sur une touche"}</span></div>`;
  lcd.textContent = "-- --";
}
function startBoot() {
  if (booting || booted || contentError || !DATA) return;
  if (!tvOn || !consoleOn) return;
  const ep = powerEpoch;
  booting = true;
  lcd.textContent = "BOOT";
  view.className = "view";
  view.innerHTML = `<div class="term" id="term"></div>`;
  const term = document.getElementById("term");
  const lines = (DATA && DATA.bootLines ? DATA.bootLines : [{ text: "OB SYSTEM v1.0", status: "" }]).map(l => [l.text, l.status]);
  let li = 0, ci = 0;
  function typeNext() {
    if (ep !== powerEpoch) return;
    if (li >= lines.length) { setTimeout(showLogo, 260); return; }
    const [txt, ok] = lines[li];
    let line = term.querySelector(`[data-l="${li}"]`);
    if (!line) { line = document.createElement("div"); line.dataset.l = li; if (li === 0) line.className = "first"; term.appendChild(line); }
    if (ci < txt.length) {
      ci++; line.innerHTML = txt.slice(0, ci) + '<i class="cur"></i>';
      if (ci % 2) SFX.key();
      setTimeout(typeNext, 16);
    } else {
      line.innerHTML = txt + (ok ? `<b>${ok}</b>` : "");
      if (ok) SFX.tick();
      li++; ci = 0; setTimeout(typeNext, 150);
    }
  }
  function showLogo() {
    view.innerHTML = `<div class="boot"><div class="oblogo on">OB</div><span class="bname">${DATA ? DATA.meta.name.toUpperCase() : ""}</span></div>`;
    SFX.logo();
    setTimeout(() => {
      if (ep !== powerEpoch) return;
      booted = true; booting = false;
      screenEl.classList.remove("pre");
      channel(renderHome);
      setTimeout(() => SFX.music(), 600);
    }, 1300);
  }
  typeNext();
}

// ---------- power: TV button and console button ----------
let tvOn = true, consoleOn = true, powerEpoch = 0, needsDisc = false, staticRun = false;
const sceneEl = document.getElementById("scene"), tvLed = document.getElementById("tvLed"), conLed = document.getElementById("conLed"), conGlow = document.getElementById("conLedGlow");
function staticLoop(on) { if (on && !staticRun) { staticRun = true; drawNoise(); } else if (!on && staticRun) { staticRun = false; cancelAnimationFrame(noiseRAF); } }
function paintPower() {
  tvLed.classList.toggle("off", !tvOn);
  document.querySelectorAll('[data-act="tvPower"]').forEach(b => { b.classList.toggle("off", !tvOn); b.setAttribute("aria-pressed", String(tvOn)); });
  document.querySelectorAll('.rbtn[data-act="consolePower"]').forEach(b => b.classList.toggle("off", !consoleOn));
  const c = consoleOn ? "#7dff8a" : "#ff4a3d"; conLed.setAttribute("fill", c); conGlow.setAttribute("fill", c);
  sceneEl.classList.toggle("con-off", !consoleOn);
  screenEl.classList.toggle("tv-off", !tvOn);
  screenEl.classList.toggle("nosignal", tvOn && !consoleOn);
  staticLoop(tvOn && !consoleOn);
  SFX.gate(tvOn, consoleOn);
  if (!tvOn) { if (!lcd.classList.contains("off")) lcd.dataset.prev = lcd.textContent; lcd.classList.add("off"); lcd.textContent = "OFF"; }
  else if (lcd.classList.contains("off")) { lcd.classList.remove("off"); lcd.textContent = lcd.dataset.prev || "CH 00"; }
}
function toggleTV() {
  SFX.start();
  tvOn = !tvOn;
  SFX.click();
  SAVER.hide();
  if (!tvOn) { GAME.pause(); screenEl.classList.add("anim"); SFX.crtOff(); setTimeout(() => screenEl.classList.remove("anim"), 600); }
  else { SFX.power(); screenEl.classList.add("tv-on"); setTimeout(() => screenEl.classList.remove("tv-on"), 500); }
  paintPower();
  if (tvOn && consoleOn && needsDisc) { needsDisc = false; discLoad(); }
}
function toggleConsole() {
  SFX.start();
  consoleOn = !consoleOn;
  SFX.click();
  SAVER.hide();
  powerEpoch++;
  if (!consoleOn) { GAME.stop(); SFX.discDown(); busy = false; screenEl.classList.remove("switching"); }
  else {
    SFX.discUp();
    if (booting) { booting = false; booted = true; }
    if (!booted) { renderStandby(); }
    else if (tvOn) discLoad();
    else needsDisc = true;
  }
  paintPower();
}
// console back on: the disc spins up and gets read before the menu returns
function discLoad() {
  const ep = powerEpoch;
  mode = "loading";
  screenEl.classList.add("pre"); screenEl.classList.remove("nofoot");
  view.className = "view loadv";
  view.innerHTML = `<div class="ld"><canvas id="ldc"></canvas><span class="ldtxt on" id="ldt">READING DISC…</span></div>`;
  lcd.textContent = "DISC";
  const { x, w, h } = ldCanvas(.82, .66);
  const R = Math.min(w, h) * .44, cx = w / 2, cy = h / 2, label = "ORSOWEN · PORTFOLIO · ";
  let ang = 0, last = performance.now(), ok = false;
  const t0 = last;
  (function frame(now) {
    if (ep !== powerEpoch || !document.getElementById("ldc")) return;
    const t = now - t0, dt = (now - last) / 1000; last = now;
    const spd = Math.min(1, t / 1500) * 16; ang += spd * dt;
    x.clearRect(0, 0, w, h);
    x.save(); x.translate(cx, cy); x.rotate(ang);
    const gr = x.createRadialGradient(0, 0, R * .1, 0, 0, R);
    gr.addColorStop(0, "#eef1f5"); gr.addColorStop(.5, "#b9c0cc"); gr.addColorStop(.8, "#e2d6f2"); gr.addColorStop(1, "#8e95a2");
    x.fillStyle = gr; x.beginPath(); x.arc(0, 0, R, 0, Math.PI * 2); x.fill();
    [["rgba(255,111,209,.35)", 0], ["rgba(111,243,255,.35)", Math.PI * .66], ["rgba(255,211,107,.3)", Math.PI * 1.33]].forEach(([col, a]) => {
      x.fillStyle = col; x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, R, a, a + .7); x.closePath(); x.fill();
    });
    x.fillStyle = "#1f6fb2"; x.beginPath(); x.arc(0, 0, R * .6, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#13355e"; x.beginPath(); x.arc(0, 0, R * .36, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#ffd36b"; x.font = `${Math.max(8, R * .1)}px "Press Start 2P", monospace`; x.textAlign = "center"; x.textBaseline = "middle";
    const step = (Math.PI * 2) / label.length;
    for (let i = 0; i < label.length; i++) { x.save(); x.rotate(i * step); x.translate(0, -R * .48); x.fillText(label[i], 0, 0); x.restore(); }
    x.fillStyle = "#c7ccd6"; x.beginPath(); x.arc(0, 0, R * .15, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#05070d"; x.beginPath(); x.arc(0, 0, R * .07, 0, Math.PI * 2); x.fill();
    x.restore();
    const sled = R * (.65 + .3 * Math.abs(Math.sin(t / 260)));
    const lx = cx + sled * Math.cos(-.5), ly = cy + sled * Math.sin(-.5);
    x.strokeStyle = ok ? "rgba(134,255,158,.55)" : "rgba(255,90,80,.55)"; x.lineWidth = 2;
    x.beginPath(); x.moveTo(cx + R * 1.2 * Math.cos(-.5), cy + R * 1.2 * Math.sin(-.5)); x.lineTo(lx, ly); x.stroke();
    x.fillStyle = ok ? "#86ff9e" : "#ff5a4a"; x.shadowColor = x.fillStyle; x.shadowBlur = 14;
    x.beginPath(); x.arc(lx, ly, 3.5, 0, Math.PI * 2); x.fill(); x.shadowBlur = 0;
    if (!ok && t > 1950) { ok = true; const l = document.getElementById("ldt"); if (l) { l.textContent = "DISC OK · ORSOWEN PORTFOLIO"; l.style.color = "#86ff9e"; } }
    if (t < 3000) requestAnimationFrame(frame);
  })(t0);
  setTimeout(() => { if (ep !== powerEpoch || !consoleOn) return; screenEl.classList.remove("pre"); channel(renderHome); }, 3000);
}
let contentError = false;
renderStandby();
paintSound();
loadContent().catch(err => {
  contentError = true;
  view.innerHTML = `<div class="boot"><div class="oblogo dim">OB</div><span class="sub2">Could not load data/content.json (${err.message}).<br>Open this folder through a web server, not by double-clicking index.html. See README.md.</span></div>`;
});
