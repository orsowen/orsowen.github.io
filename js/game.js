/* ===========================================================
   game.js — BLOCK DROP, the falling-blocks game
   =========================================================== */
const GAME = (() => {
  const W = 10, H = 20;
  const MAT = { I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], O: [[1,1],[1,1]], T: [[0,1,0],[1,1,1],[0,0,0]], S: [[0,1,1],[1,1,0],[0,0,0]], Z: [[1,1,0],[0,1,1],[0,0,0]], J: [[1,0,0],[1,1,1],[0,0,0]], L: [[0,0,1],[1,1,1],[0,0,0]] };
  const COL = { I: "#6ff3ff", O: "#ffd36b", T: "#c77dff", S: "#86ff9e", Z: "#ff6f7d", J: "#5b8cff", L: "#ffa24c" };
  let board, piece, nextT, bag = [], score, lines, level, over, running = false, paused = false, acc = 0, last = 0, raf = 0;
  let gc, gx, gn, gnx, cell = 14, best = 0;
  try { best = +localStorage.getItem("obBlockBest") || 0; } catch (e) {}
  const T = () => lang === "fr"
    ? { score: "SCORE", lines: "LIGNES", level: "NIVEAU", best: "RECORD", next: "SUIVANT", over: "PARTIE TERMINÉE", retry: "REJOUER", home: "ACCUEIL", paused: "PAUSE", help: "← → bouger · ↑ tourner · ↓ descendre · Espace lâcher · P pause" }
    : { score: "SCORE", lines: "LINES", level: "LEVEL", best: "BEST", next: "NEXT", over: "GAME OVER", retry: "RETRY", home: "HOME", paused: "PAUSED", help: "← → move · ↑ rotate · ↓ soft drop · Space hard drop · P pause" };
  const rot = m => m[0].map((_, i) => m.map(r => r[i]).reverse());
  function take() {
    if (!bag.length) { bag = Object.keys(MAT); for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; } }
    return bag.pop();
  }
  function collide(m, x, y) {
    for (let r = 0; r < m.length; r++) for (let c = 0; c < m[r].length; c++) {
      if (!m[r][c]) continue;
      const X = x + c, Y = y + r;
      if (X < 0 || X >= W || Y >= H) return true;
      if (Y >= 0 && board[Y][X]) return true;
    }
    return false;
  }
  function spawn() {
    const t = nextT || take(); nextT = take();
    const m = MAT[t].map(r => r.slice());
    piece = { t, m, x: Math.floor((W - m.length) / 2), y: t === "I" ? -1 : 0 };
    if (collide(piece.m, piece.x, piece.y)) { end(); return; }
    drawNext();
  }
  function lock() {
    let top = false;
    piece.m.forEach((row, r) => row.forEach((v, c) => { if (v) { const Y = piece.y + r; if (Y < 0) top = true; else board[Y][piece.x + c] = piece.t; } }));
    if (top) { end(); return; }
    SFX.tick();
    let n = 0;
    for (let y = H - 1; y >= 0; y--) if (board[y].every(Boolean)) { board.splice(y, 1); board.unshift(Array(W).fill(null)); n++; y++; }
    if (n) {
      lines += n; score += [0, 100, 300, 500, 800][n] * level;
      const lv = Math.floor(lines / 10) + 1;
      if (lv > level) { level = lv; SFX.level(); } else { SFX.chime(); if (n === 4) setTimeout(() => SFX.chime(), 160); }
    }
    spawn(); hud();
  }
  function move(dx) { if (!over && !paused && !collide(piece.m, piece.x + dx, piece.y)) { piece.x += dx; SFX.tick(); } }
  function turn() {
    if (over || paused) return;
    const m = rot(piece.m);
    for (const k of [0, -1, 1, -2, 2]) if (!collide(m, piece.x + k, piece.y)) { piece.m = m; piece.x += k; SFX.blip(); return; }
  }
  function soft() { if (over || paused) return; if (!collide(piece.m, piece.x, piece.y + 1)) { piece.y++; score += 1; acc = 0; hud(); } else lock(); }
  function hard() {
    if (over || paused) return;
    let d = 0; while (!collide(piece.m, piece.x, piece.y + 1)) { piece.y++; d++; }
    score += d * 2; SFX.press(); lock();
  }
  const speed = () => Math.max(90, 800 - (level - 1) * 70);
  function loop(t) {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    const dt = last ? t - last : 0; last = t;
    if (!paused && !over) {
      acc += dt;
      if (acc >= speed()) { acc = 0; if (!collide(piece.m, piece.x, piece.y + 1)) piece.y++; else lock(); }
    }
    draw();
  }
  function block(ctx, x, y, s, col, a) {
    ctx.globalAlpha = a == null ? 1 : a;
    ctx.fillStyle = col; ctx.fillRect(x, y, s, s);
    const b = Math.max(2, Math.round(s * .16));
    ctx.fillStyle = "rgba(255,255,255,.45)"; ctx.fillRect(x, y, s, b); ctx.fillRect(x, y, b, s);
    ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fillRect(x, y + s - b, s, b); ctx.fillRect(x + s - b, y, b, s);
    ctx.fillStyle = "rgba(255,255,255,.18)"; ctx.fillRect(x + b + 1, y + b + 1, Math.max(1, s * .22), Math.max(1, s * .22));
    ctx.globalAlpha = 1;
  }
  function draw() {
    const dpr = window.devicePixelRatio || 1, s = cell * dpr;
    gx.clearRect(0, 0, gc.width, gc.height);
    gx.strokeStyle = "rgba(77,99,160,.18)"; gx.lineWidth = 1;
    for (let x = 1; x < W; x++) { gx.beginPath(); gx.moveTo(x * s + .5, 0); gx.lineTo(x * s + .5, H * s); gx.stroke(); }
    for (let y = 1; y < H; y++) { gx.beginPath(); gx.moveTo(0, y * s + .5); gx.lineTo(W * s, y * s + .5); gx.stroke(); }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (board[y][x]) block(gx, x * s, y * s, s, COL[board[y][x]]);
    if (piece && !over) {
      let gy = piece.y; while (!collide(piece.m, piece.x, gy + 1)) gy++;
      piece.m.forEach((row, r) => row.forEach((v, c) => { if (v && gy + r >= 0) { gx.strokeStyle = COL[piece.t]; gx.globalAlpha = .45; gx.lineWidth = Math.max(1, dpr); gx.strokeRect((piece.x + c) * s + 2, (gy + r) * s + 2, s - 4, s - 4); gx.globalAlpha = 1; } }));
      piece.m.forEach((row, r) => row.forEach((v, c) => { if (v && piece.y + r >= 0) block(gx, (piece.x + c) * s, (piece.y + r) * s, s, COL[piece.t]); }));
    }
    if (paused && !over) {
      gx.fillStyle = "rgba(4,8,26,.7)"; gx.fillRect(0, 0, gc.width, gc.height);
      gx.fillStyle = "#ffd36b"; gx.font = `${Math.round(s * .7)}px "Press Start 2P", monospace`; gx.textAlign = "center"; gx.fillText(T().paused, gc.width / 2, gc.height / 2);
    }
  }
  function drawNext() {
    if (!gnx) return;
    const dpr = window.devicePixelRatio || 1, s = Math.round(cell * .8) * dpr, m = MAT[nextT];
    gnx.clearRect(0, 0, gn.width, gn.height);
    const w = m[0].length, rows = m.filter(r => r.some(Boolean)), ox = (gn.width - w * s) / 2, oy = (gn.height - rows.length * s) / 2;
    rows.forEach((row, r) => row.forEach((v, c) => { if (v) block(gnx, ox + c * s, oy + r * s, s, COL[nextT]); }));
  }
  function hud() {
    const q = id => document.getElementById(id);
    if (!q("gS")) return;
    q("gS").textContent = score; q("gL").textContent = lines; q("gV").textContent = level; q("gB").textContent = Math.max(best, score);
  }
  function end() {
    over = true; SFX.over();
    if (score > best) { best = score; try { localStorage.setItem("obBlockBest", String(best)); } catch (e) {} }
    const t = T(), g = document.querySelector(".game");
    if (!g) return;
    const o = document.createElement("div"); o.className = "gover";
    o.innerHTML = `<h3>${t.over}</h3><p>${t.score}: ${score} · ${t.best}: ${best}</p><div class="row"><button class="again" type="button" id="gRetry">↺ ${t.retry}</button><button class="copy" type="button" id="gHome">⌂ ${t.home}</button></div>`;
    g.appendChild(o);
    o.querySelector("#gRetry").addEventListener("click", () => { SFX.press(); reset(); });
    o.querySelector("#gHome").addEventListener("click", () => { SFX.press(); goHome(); });
  }
  function size() {
    if (!gc) return;
    const side = document.querySelector(".gside");
    const avH = view.clientHeight - 24, avW = (view.clientWidth - 40) * .56;
    cell = Math.max(8, Math.floor(Math.min(avH / H, avW / W)));
    const dpr = window.devicePixelRatio || 1;
    gc.width = W * cell * dpr; gc.height = H * cell * dpr; gc.style.width = W * cell + "px"; gc.style.height = H * cell + "px";
    const nc = Math.round(cell * .8);
    gn.width = 4 * nc * dpr; gn.height = 2.6 * nc * dpr; gn.style.width = 4 * nc + "px"; gn.style.height = 2.6 * nc + "px";
    drawNext(); if (side) side.style.maxWidth = Math.max(110, view.clientWidth - W * cell - 60) + "px";
  }
  function reset() {
    board = Array.from({ length: H }, () => Array(W).fill(null));
    score = 0; lines = 0; level = 1; over = false; paused = false; acc = 0; last = 0; nextT = null; bag = [];
    const o = document.querySelector(".gover"); if (o) o.remove();
    spawn(); hud();
  }
  function start() {
    mode = "game";
    screenEl.classList.remove("pre"); screenEl.classList.add("nofoot");
    hudL.textContent = "BLOCK DROP"; hudT.textContent = "";
    langBtn.hidden = true; prevBtn.hidden = true; nextBtn.hidden = true;
    homeBtn.hidden = false; homeLbl.textContent = lang === "fr" ? "ACCUEIL" : "HOME";
    lcd.textContent = "GAME";
    const t = T();
    view.className = "view gamev";
    view.innerHTML = `<div class="game">
      <canvas id="gc" aria-label="Game board"></canvas>
      <div class="gside">
        <div class="gstat"><div><span>${t.score}</span><b id="gS">0</b></div><div><span>${t.best}</span><b id="gB">0</b></div><div><span>${t.lines}</span><b id="gL">0</b></div><div><span>${t.level}</span><b id="gV">1</b></div></div>
        <div class="gnext"><span>${t.next}</span><canvas id="gn"></canvas></div>
        <div class="gpad">
          <button type="button" data-g="left" aria-label="Left">◀</button><button type="button" data-g="rot" aria-label="Rotate">↻</button><button type="button" data-g="right" aria-label="Right">▶</button>
          <button type="button" data-g="down" aria-label="Down">▼</button><button type="button" class="wide" data-g="drop" aria-label="Drop">DROP</button>
        </div>
        <span class="ghelp">${t.help}</span>
      </div></div>`;
    gc = document.getElementById("gc"); gx = gc.getContext("2d"); gn = document.getElementById("gn"); gnx = gn.getContext("2d");
    view.querySelectorAll("[data-g]").forEach(b => b.addEventListener("click", () => ({ left: () => move(-1), right: () => move(1), rot: turn, down: soft, drop: hard })[b.dataset.g]()));
    reset(); size();
    running = true; last = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }
  function input(name) {
    if (name === "prev") move(-1); else if (name === "next") move(1);
    else if (name === "up" || name === "a") turn(); else if (name === "down") soft(); else if (name === "b") hard();
  }
  function key(e) {
    const k = e.key;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(k)) e.preventDefault();
    if (k === "Escape") { goHome(); return; }
    if (over) { if (k === "Enter") reset(); return; }
    if (k === "ArrowLeft") move(-1); else if (k === "ArrowRight") move(1);
    else if (k === "ArrowUp" || k === "x" || k === "X") turn(); else if (k === "ArrowDown") soft();
    else if (k === " ") hard(); else if (k === "p" || k === "P") { paused = !paused; SFX.tick(); }
  }
  function swipe(dx, dy) {
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) { turn(); return; }
    if (Math.abs(dx) > Math.abs(dy)) { const n = Math.min(5, Math.max(1, Math.round(Math.abs(dx) / 30))); for (let i = 0; i < n; i++) move(dx < 0 ? -1 : 1); }
    else if (dy > 50) hard();
  }
  addEventListener("resize", () => { if (running) size(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden && running && !over) paused = true; });
  return { start, stop, input, key, swipe, idleOK: () => !running || over || paused, pause: () => { if (running && !over) paused = true; } };
})();
